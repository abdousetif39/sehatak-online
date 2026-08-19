import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import MessageModal from '../../components/MessageModal';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import { COLLECTIONS, ROLES, WEEKDAYS } from '../../lib/constants';
import { Appointment, Doctor } from '../../types';
import { Calendar as CalIcon, User as UserIcon, Phone, FileText, Trash2, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getDoctorFullName } from '../../utils/doctorUtils';

export default function AppointmentsViewer() {
  const { t, i18n } = useTranslation();
  
  const [appointments, setAppointments] = useState<(Appointment & { doctorName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageModal, setMessageModal] = useState({
  open: false,
  type: "info" as "success" | "error" | "warning" | "info",
  title: "",
  message: "",
});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appSnap, docSnap] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.APPOINTMENTS), orderBy('date', 'desc'), orderBy('time', 'asc'))),
        getDocs(collection(db, COLLECTIONS.DOCTORS))
      ]);

      const doctorsMap = new Map();
      docSnap.docs.forEach(d => doctorsMap.set(d.id, getDoctorFullName(d.data() as any, i18n.language)));

      const apps = appSnap.docs.map(d => {
        const data = ({ ...d.data(), id: d.id } as Appointment);
        return {
          ...data,
          doctorName: doctorsMap.get(data.doctorId) || t('unknown_doctor')
        };
      });

      setAppointments(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setIsDeleting(true);
    try {
      console.log("Delete ID:", id);
      console.log("Firestore path:", COLLECTIONS.APPOINTMENTS, id);
      const batch = writeBatch(db);
      batch.delete(doc(db, COLLECTIONS.APPOINTMENTS, id));
      batch.delete(doc(db, COLLECTIONS.PUBLIC_SLOTS, id));
      await batch.commit();
      await fetchData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch(e: any) {
      console.error("Delete Error:", { id, collection: 'appointments/public_slots', errorCode: e.code, message: e.message });
      setMessageModal({
      open: true,
      type: "error",
      title: t("error"),
      message: `${t('delete_failed')}: ${e.message}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('menu_appointments')}</h1>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500">{t('loading')}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shrink-0">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex-1">{t('patient')}</div>
            <div className="w-48">{t('doctor_name')}</div>
            <div className="w-32">{t('date_time')}</div>
            <div className="w-32 text-center">{t('status')}</div>
            <div className="w-24 text-center">{t('actions')}</div>
          </div>
          
          <div className="flex-col divide-y divide-slate-100">
            {appointments.map(app => (
              <div key={app.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                <div className="flex-1 flex flex-col">
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {(app.patientName + ' ' + (app.patientLastName || '')).trim()}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3" /> <span dir="ltr">{app.patientPhone}</span>
                    {app.patientFileNumber && (
                      <>
                        <span className="mx-1">•</span>
                        <FileText className="w-3 h-3" /> {t('file_number_prefix')}{app.patientFileNumber}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="w-48 text-sm font-medium text-slate-600">
                  {app.doctorName}
                </div>
                
                <div className="w-32">
                  <div className="text-sm font-bold text-slate-900">
                    {app.date}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {app.time}
                  </div>
                </div>
                
                <div className="w-32 flex justify-center">
                  <StatusBadge status={app.status} t={t} />
                </div>
                
                <div className="w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => confirmDelete(app.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title={t('delete_appointment')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">{t('no_appointments_today')}</div>
            )}
          </div>
        </div>
      )}
      <MessageModal
      isOpen={messageModal.open}
      type={messageModal.type}
      title={messageModal.title}
      message={messageModal.message}
      onClose={() =>
      setMessageModal({
      open: false,
      type: "info",
      title: "",
      message: "",
    })
  }
/>
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('confirm_delete_appointment_title')}

        message={t('confirm_delete_appointment_desc')}
      />
    </div>
  );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
  if (status === 'examined') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="w-3.5 h-3.5" /> {t('mark_examined')}</span>;
  }
  if (status === 'booked') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3.5 h-3.5" /> {t('status_booked')}</span>;
  }
  if (status === 'no_show') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{t('mark_no_show')}</span>;
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">{t('status_canceled')}</span>;
}