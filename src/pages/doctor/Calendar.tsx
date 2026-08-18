import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import AppointmentCard from "../../components/doctor/AppointmentCard";
import EditAppointmentModal from "../../components/doctor/EditAppointmentModal";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths} from 'date-fns';
import { ar, fr } from 'date-fns/locale';
import { useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../lib/constants";
import { useAuth } from "../../hooks/useAuth";
import { Appointment } from "../../types";
import { Doctor } from "../../types";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { getAvailableSlots } from "../../utils/appointmentSlots";
import { setDoc } from "firebase/firestore";
export default function DoctorCalendar() {
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { user } = useAuth();
  const [appointmentsCount, setAppointmentsCount] = useState<Record<string, number>>({});
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const isAr = (i18n.language || '').startsWith('ar');
  const locale = isAr ? ar : fr;
  const days = eachDayOfInterval({
  start: startOfMonth(currentMonth),
  end: endOfMonth(currentMonth),
});

const isWorkingDay = (day: Date) => {
  if (!doctor) return true;
  const weekDay = day.getDay();
  if (!doctor.workingDays?.includes(weekDay)) {
    return false;
  }
  return true;
};
const getVacationForDay = (day: Date) => {
  if (!doctor || !doctor.vacations) return null;
  const dayStr = format(day, "yyyy-MM-dd");
  return doctor.vacations.find(v => dayStr >= v.startDate && dayStr <= v.endDate) || null;
};

    const targetDoctorId =
    user?.role === "receptionist"
    ? user.doctorId
    : user?.id;

      useEffect(() => {
  if (!targetDoctorId) return;

  const loadDoctor = async () => {
    const { doc, getDoc } = await import("firebase/firestore");

    const snap = await getDoc(
      doc(db, COLLECTIONS.DOCTORS, targetDoctorId)
    );

    if (snap.exists()) {
      setDoctor({
        id: snap.id,
        ...(snap.data() as Doctor),
      });
    }
  };

  loadDoctor();
}, [targetDoctorId]);

      const loadAppointments = async () => {
  if (!targetDoctorId) return;

  const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where("doctorId", "==", targetDoctorId),
    where("date", ">=", monthStart),
    where("date", "<=", monthEnd)
  );

  const snap = await getDocs(q);

  const counts: Record<string, number> = {};

  snap.forEach((doc) => {
    const data = doc.data();
    counts[data.date] = (counts[data.date] || 0) + 1;
  });

  setAppointmentsCount(counts);
};

const loadDayAppointments = async () => {
  if (!selectedDay || !targetDoctorId) return;

  const date = format(selectedDay, "yyyy-MM-dd");

  const q = query(
  collection(db, COLLECTIONS.APPOINTMENTS),
  where("doctorId", "==", targetDoctorId),
  where("date", "==", date),
  orderBy("time", "asc")
);

  const snap = await getDocs(q);

  setDayAppointments(
    snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Appointment),
    }))
  );
};

const updateAppointmentStatus = async (
  appointmentId: string,
  status: "booked" | "examined" | "cancelled" | "no_show"
) => {
  const { doc, updateDoc } = await import("firebase/firestore");

  await updateDoc(
    doc(db, COLLECTIONS.APPOINTMENTS, appointmentId),
    {
      status,
    }
  );

  await loadAppointments();
  await loadDayAppointments();

  setDayAppointments((prev) =>
    prev.map((appointment) =>
      appointment.id === appointmentId
        ? { ...appointment, status }
        : appointment
    )
  );
};

const confirmDelete = (id: string) => {
  setItemToDelete(id);
  setDeleteModalOpen(true);
};

const handleDelete = async () => {
  if (!itemToDelete) return;

  setIsDeleting(true);

  try {
    const appointment = dayAppointments.find(
  (a) => a.id === itemToDelete
);

if (!appointment) return;
    const batch = writeBatch(db);

    batch.delete(
      doc(db, COLLECTIONS.APPOINTMENTS, itemToDelete)
    );

    const slotQuery = query(
  collection(db, COLLECTIONS.PUBLIC_SLOTS),
  where("doctorId", "==", appointment.doctorId),
  where("date", "==", appointment.date),
  where("time", "==", appointment.time)
);

const slotSnap = await getDocs(slotQuery);

slotSnap.forEach((slotDoc) => {
  batch.delete(slotDoc.ref);
});

    await batch.commit();

    await loadAppointments();
    await loadDayAppointments();

    setDeleteModalOpen(false);
    setItemToDelete(null);

  } finally {
    setIsDeleting(false);
  }
};


  const handleAddAppointment = async (data: any) => {
    if (!doctor || !targetDoctorId || !selectedDay) return;
    const formattedDate = format(selectedDay, 'yyyy-MM-dd');
    const appointmentId = `${targetDoctorId}_${formattedDate}_${data.time}`;
    
    const appointment: any = {
      id: appointmentId,
      doctorId: targetDoctorId,
      doctorName: doctor.name || (doctor.firstNameAr ? doctor.firstNameAr + ' ' + doctor.lastNameAr : t('unknown_doctor')),
      patientName: data.firstName,
      patientLastName: data.lastName,
      patientPhone: data.phone,
      date: formattedDate,
      time: data.time,
      status: 'booked',
      createdAt: new Date().toISOString()
    };
    if (data.fileNumber) {
      appointment.patientFileNumber = data.fileNumber;
    }
    
    const batch = writeBatch(db);
    batch.set(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), appointment);
    batch.set(doc(db, COLLECTIONS.PUBLIC_SLOTS, appointmentId), {
      doctorId: targetDoctorId,
      date: formattedDate,
      time: data.time
    });
    await batch.commit();
    
    await loadAppointments();
    await loadDayAppointments();
    setAddModalOpen(false);
  };

const saveAppointment = async (
  appointmentId: string,
  data: Partial<Appointment>
) => {
  const { doc, updateDoc } = await import("firebase/firestore");

  await updateDoc(
  doc(db, COLLECTIONS.APPOINTMENTS, appointmentId),
  {
    ...data,
    status: "booked",
  }
);
      await loadAppointments();
      await loadDayAppointments();
      setDayAppointments((prev) =>
      prev.map((appointment) =>
      appointment.id === appointmentId
        ? {
  ...appointment,
  ...data,
  status: "booked",
}
        : appointment
    )
  );
  
  setEditModalOpen(false);
  setEditingAppointment(null);
};


    useEffect(() => {
  loadAppointments();
}, [currentMonth, user]);
useEffect(() => {
  loadDayAppointments();
}, [selectedDay, user]);
  return (
    <div className="w-full">
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {t('calendar')}
            </h1>
            <p className="text-sm text-slate-500">
              {t('calendar_description')}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 md:p-8 rounded-2xl border border-slate-200 w-full flex flex-col">
          {/* Calendar Header / Navigation */}
          

          {/* Calendar Body */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8">

  <div className="flex items-center justify-between">

    <button
      onClick={handlePrevMonth}
      className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
    >
      {t('prev')}
    </button>

    <h2 className="text-xl font-bold text-slate-800">
      {format(currentMonth, 'MMMM yyyy', { locale })}
    </h2>

    <button
      onClick={handleNextMonth}
      className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
    >
      {t('next')}
    </button>

  </div>

  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">

  {days.map((day) => {
    const vacation = getVacationForDay(day);
    return (
    <button
  key={day.toISOString()}
  onClick={() => {
    if (!vacation) setSelectedDay(day);
  }}
  title={vacation ? (isAr ? vacation.titleAr : vacation.titleFr) : undefined}
  disabled={!!vacation}
  className={`border rounded-xl p-4 text-center transition-colors relative group ${
  vacation 
    ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-80"
    : selectedDay &&
  format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    ? "bg-blue-600 text-white border-blue-600"
    : !isWorkingDay(day)
    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
    : appointmentsCount[format(day, "yyyy-MM-dd")] > 0
    ? "bg-green-50 hover:bg-green-100 border-green-300"
    : "bg-slate-50 hover:bg-blue-50 border-slate-200"}`}>
      <div
  className={`font-bold ${
    vacation ? "text-red-500" :
    selectedDay &&
    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ? "text-white"
      : "text-slate-800"
  }`}>
        {format(day, "dd")}
      </div>
      <div
  className={`text-sm mt-1 ${
    vacation ? "text-red-400" :
    selectedDay &&
    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ? "text-blue-100"
      : "text-slate-500"
  }`}>
  {format(day, "EEEE", { locale })}</div>
  
  {vacation ? (
    <div className="mt-2 text-xs font-medium text-red-500 flex items-center justify-center gap-1">
      <span>🏖️</span>
      <span>{t('doctor_on_vacation')}</span>
    </div>
  ) : (
<div
  className={`mt-2 text-xs font-medium ${
    selectedDay &&
    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ? "text-blue-100"
      : "text-blue-600"
  }`}>
  👥 {appointmentsCount[format(day, "yyyy-MM-dd")] || 0} {t("appointments")}</div>
  )}
    </button>
  )
})}</div></div>
          
        </div>
      </div>
      {selectedDay && (
  <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

    
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold">
        {t("appointments")} - {format(selectedDay, "yyyy-MM-dd")}
      </h3>
      <button
        onClick={() => setAddModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
      >
        {t("create_new_appointment")}
      </button>
    </div>


    

            {dayAppointments.length === 0 ? (

      <div className="text-slate-500">
        {t("no_appointments")}
      </div>

    ) : (

      <div className="space-y-3">

        {dayAppointments.map((appointment) => (

          <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          updateAppointmentStatus={updateAppointmentStatus}
          onEdit={() => {
          setEditingAppointment(appointment);
          setEditModalOpen(true);
          }}
          onDelete={() => confirmDelete(appointment.id)}
          />

        ))}

      </div>

    )}

  </div>
)}


<AddAppointmentModal
  open={addModalOpen}
  doctor={doctor}
  selectedDay={selectedDay}
  dayAppointments={dayAppointments}
  onClose={() => setAddModalOpen(false)}
  onSave={handleAddAppointment}
  t={t}
/>

<EditAppointmentModal
  open={editModalOpen}
  appointment={editingAppointment}
  doctor={doctor}
  onClose={() => setEditModalOpen(false)}
  onSave={saveAppointment}
/>

<ConfirmDeleteModal
  isOpen={deleteModalOpen}
  onClose={() => setDeleteModalOpen(false)}
  onConfirm={handleDelete}
  loading={isDeleting}
  title={t("confirm_delete_appointment_title")}
  message={t(
    "confirm_delete_appointment_desc"
  )}
/>




</div>

);
}

function AddAppointmentModal({
  open,
  doctor,
  selectedDay,
  dayAppointments,
  onClose,
  onSave,
  t
}: {
  open: boolean;
  doctor: Doctor | null;
  selectedDay: Date;
  dayAppointments: Appointment[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  t: any;
}) {
  const [time, setTime] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [fileNumber, setFileNumber] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTime("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setFileNumber("");
    }
  }, [open]);

  if (!open || !doctor) return null;

  const bookedSlots = dayAppointments.map(a => a.time);
  const availableSlots = getAvailableSlots(doctor, selectedDay, bookedSlots);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave({ time, firstName, lastName, phone, fileNumber });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">{t('create_new_appointment')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('time')}</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            >
              <option value="">{t('select_time')}</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('patient_name')}</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('patient_last_name')}</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('file_number')}</label>
            <input
              type="text"
              value={fileNumber}
              onChange={e => setFileNumber(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border"
              disabled={submitting}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? '...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
