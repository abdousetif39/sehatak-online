import React, { useState, useEffect } from "react";
import { Appointment, Doctor } from "../../types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../lib/constants";
import { getAvailableSlots } from "../../utils/appointmentSlots";
import { useTranslation } from "react-i18next";
interface Props {
  appointment: Appointment | null;
  doctor: Doctor | null;
  open: boolean;
  onClose: () => void;
  onSave: (appointmentId: string, data: Partial<Appointment>) => Promise<void>;
}

export default function EditAppointmentModal({
  appointment,
  doctor,
  open,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  useEffect(() => {
    if (appointment) {
      setDate(appointment.date);
      setTime(appointment.time);
    }
  }, [appointment]);

  useEffect(() => {
  if (!doctor || !date || !appointment) return;

  const loadSlots = async () => {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("doctorId", "==", doctor.id),
      where("date", "==", date)
    );

    const snap = await getDocs(q);

    const booked = snap.docs
    .filter((doc) => doc.id !== appointment.id)
    .map((doc) => doc.data().time);

    const slots = getAvailableSlots(
      doctor,
      new Date(date),
      booked
    );

    setAvailableSlots(slots);
  };

  loadSlots();
}, [doctor, date, appointment]);

  if (!open || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">

        <h2 className="text-xl font-bold mb-6">
  {t("edit_appointment")}
</h2>

        <div className="space-y-4">

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded-xl p-3"
          >
          <option value="">{t("select_time")}</option>

          {availableSlots.map((slot) => (
          <option key={slot} value={slot}>
          {slot}
          </option>
          ))}
          </select>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border"
          >
           {t("cancel")}
          </button>

          <button
            onClick={() =>
              onSave(appointment.id, {
                date,
                time,
              })
            }
            className="px-5 py-2 rounded-xl bg-blue-600 text-white"
          >
            {t("save")}
          </button>

        </div>

      </div>

    </div>
  );
}