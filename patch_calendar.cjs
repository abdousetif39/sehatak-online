const fs = require('fs');

let content = fs.readFileSync('src/pages/doctor/Calendar.tsx', 'utf8');

// 1. Add getAvailableSlots import
if (!content.includes('getAvailableSlots')) {
  content = content.replace(
    'import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";',
    'import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";\nimport { getAvailableSlots } from "../../utils/appointmentSlots";\nimport { setDoc } from "firebase/firestore";'
  );
}

// 2. Add state for addModalOpen
if (!content.includes('addModalOpen')) {
  content = content.replace(
    'const [editModalOpen, setEditModalOpen] = useState(false);',
    'const [editModalOpen, setEditModalOpen] = useState(false);\n  const [addModalOpen, setAddModalOpen] = useState(false);'
  );
}

// 3. Add handleAddAppointment function
const handleAddFunc = `
  const handleAddAppointment = async (data: any) => {
    if (!doctor || !targetDoctorId || !selectedDay) return;
    const formattedDate = format(selectedDay, 'yyyy-MM-dd');
    const appointmentId = \`\${targetDoctorId}_\${formattedDate}_\${data.time}\`;
    
    const appointment: any = {
      id: appointmentId,
      doctorId: targetDoctorId,
      doctorName: doctor.name || doctor.firstNameAr + ' ' + doctor.lastNameAr || "الطبيب",
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
`;
if (!content.includes('handleAddAppointment')) {
  content = content.replace(
    'const saveAppointment = async (',
    handleAddFunc + '\nconst saveAppointment = async ('
  );
}

// 4. Add the button
const buttonHtml = `
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
`;
content = content.replace(
  '<h3 className="text-lg font-bold mb-4">\n      {t("appointments")} - {format(selectedDay, "yyyy-MM-dd")}\n    </h3>',
  buttonHtml
);

// 5. Add the AddAppointmentModal component definition
const modalComponent = `
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
            <label className="block text-sm font-medium mb-1">{t('first_name')}</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('last_name')}</label>
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
            <label className="block text-sm font-medium mb-1">{t('file_number')} ({t('optional', 'اختياري')})</label>
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
`;
if (!content.includes('function AddAppointmentModal')) {
  content += '\n' + modalComponent;
}

// 6. Add modal instance
const modalInstance = `
<AddAppointmentModal
  open={addModalOpen}
  doctor={doctor}
  selectedDay={selectedDay}
  dayAppointments={dayAppointments}
  onClose={() => setAddModalOpen(false)}
  onSave={handleAddAppointment}
  t={t}
/>
`;
if (!content.includes('<AddAppointmentModal')) {
  content = content.replace(
    '<EditAppointmentModal',
    modalInstance + '\n<EditAppointmentModal'
  );
}

// Remove previously added duplicate setDoc if any
content = content.replace(/import \{ setDoc \} from "firebase\/firestore";\nimport \{ setDoc \} from "firebase\/firestore";/g, 'import { setDoc } from "firebase/firestore";');
// the original import had it:
// import { collection, getDocs, query, where, orderBy, doc, writeBatch, deleteDoc } from "firebase/firestore";
// So let's just make sure setDoc is imported. We appended it as a new import earlier. 

fs.writeFileSync('src/pages/doctor/Calendar.tsx', content);
