import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, writeBatch } from 'firebase/firestore';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import MessageModal from '../../components/MessageModal';
import { COLLECTIONS, ROLES, WEEKDAYS } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';
import { Appointment } from '../../types';
import { Search, CheckCircle, Clock, Trash2, Calendar, FileText, Phone, User as UserIcon, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function DoctorDashboardHome() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
const [messageModal, setMessageModal] = useState({
  open: false,
  type: "info" as "success" | "error" | "warning" | "info",
  title: "",
  message: "",
});
  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    const targetDoctorId = user.role === 'receptionist' ? user.doctorId : user.id;
    try {
      const q = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where('doctorId', '==', targetDoctorId),
        where('date', '==', selectedDate),
        orderBy('time', 'asc')
      );
      const snap = await getDocs(q);
      setAppointments(snap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, selectedDate]);

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    try {
              console.log("Delete ID:", id);
        console.log("Firestore path:", COLLECTIONS.APPOINTMENTS, id);
const batch = writeBatch(db);
      batch.update(doc(db, COLLECTIONS.APPOINTMENTS, id), { status });
      if (status === 'cancelled') {
        batch.delete(doc(db, COLLECTIONS.PUBLIC_SLOTS, id));
      }
      await batch.commit();
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      setMessageModal({
  open: true,
  type: "success",
  title: t("success"),
  message: t("status_updated"),
});
    } catch (e: any) {
      console.error("Update Error:", { id, collection: COLLECTIONS.APPOINTMENTS, errorCode: e.code, message: e.message });
      setMessageModal({
  open: true,
  type: "error",
  title: t("error"),
  message: `${t('update_failed')}: ${e.message}`,
});
    }
  };

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
      await fetchAppointments();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e: any) {
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

  const filteredAppointments = appointments.filter(app => 
    `${app.patientName} ${app.patientLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.patientFileNumber && app.patientFileNumber.includes(searchTerm)) ||
    app.patientPhone.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('today_appointments')}</h1>
          <p className="text-slate-500 text-sm">{t('manage_appointments_desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/p/${user?.role === 'receptionist' ? user.doctorId : user?.id}`} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition-colors text-sm shadow-sm">
            {t('create_new_appointment')}
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={t('search_patient')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 w-full md:w-64 transition-colors"
            />
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
            dir="ltr"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500">{t('loading')}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shrink-0">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="w-24 text-center">{t('time')}</div>
            <div className="flex-1">{t('patient')}</div>
            <div className="w-32 text-center">{t('status')}</div>
            <div className="w-24 text-center">{t('actions')}</div>
          </div>
          
          <div className="flex-col divide-y divide-slate-100">
            {filteredAppointments.map(app => (
              <div key={app.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                <div className="w-24 text-sm font-bold text-slate-900 text-center" dir="ltr">
                  {app.time}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {app.patientName} {app.patientLastName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3" /> {app.patientPhone}
                    {app.patientFileNumber && (
                      <>
                        <span className="mx-1">•</span>
                        <FileText className="w-3 h-3" /> {t('file_number_prefix')}{app.patientFileNumber}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="w-32 flex justify-center">
                  <StatusBadge status={app.status} t={t} />
                </div>
                
                <div className="w-24 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {app.status === 'booked' && (
                    <>
                      <button onClick={() => handleStatusChange(app.id, 'examined')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title={t('mark_examined')}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusChange(app.id, 'no_show')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title={t('mark_no_show')}>
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStatusChange(app.id, 'cancelled')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors" title={t('cancel_appointment')}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                      </button>
                    </>
                  )}
                  <button onClick={() => confirmDelete(app.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title={t('delete_appointment')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredAppointments.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center text-slate-500 text-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                {t('no_appointments_today')}
              </div>
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
  if (status === 'cancelled') {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
      {t('status_cancelled')}
    </span>
  );
}
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{t('status_unknown')}</span>;
}