import SpecialtySelect from "../../components/SpecialtySelect";
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Doctor } from '../../types';
import { Plus, Edit2, Trash2, X, User as UserIcon, Building2 } from 'lucide-react';
import { WILAYAS } from '../../data/algeria-data';
import { getStateName, getCities, getCityName, getStateByName, getCityArabicName } from '../../utils/locationUtils';
import { useTranslation } from 'react-i18next';
import { getDoctorFullName, getDoctorSpecialty, generateDoctorSlug } from '../../utils/doctorUtils';
import { COLLECTIONS, ROLES } from '../../lib/constants';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import MessageModal from '../../components/MessageModal';
export default function DoctorsManager() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [messageModal, setMessageModal] = useState({
  open: false,
  type: "info" as "success" | "error" | "warning" | "info",
  title: "",
  message: "",
});
  useEffect(() => {
    setLoading(true);
    let docsData: any[] = [];
    let usersData: any[] = [];
    let loaded = 0;

    const combineData = () => {
      if (loaded < 2) return;
      const combined = usersData.filter((u: any) => u.role === ROLES.DOCTOR).map((u: any) => {
        const docData = docsData.find((doc: any) => doc.id === u.id);
        return { ...u, ...docData, userType: 'doctor' };
      });
      setUsers(combined);
      setLoading(false);
    };

    const unsubDoctors = onSnapshot(collection(db, COLLECTIONS.DOCTORS), (docsSnap) => {
      docsData = docsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Doctor));
      if (loaded < 2) loaded++;
      combineData();
    }, (err) => {
       console.error("Doctors listener error:", err);
       setLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, COLLECTIONS.USERS), (usersSnap) => {
      usersData = usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      if (loaded < 2) loaded++;
      combineData();
    }, (err) => {
       console.error("Users listener error:", err);
       setLoading(false);
    });

    return () => {
      unsubDoctors();
      unsubUsers();
    };
  }, []);

  const fetchData = () => {};


  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    setIsDeleting(true);
    try {
      console.log("Secure Delete Doctor ID:", id);
      
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch('/api/delete-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ doctorId: id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete doctor');
      }

      // await 
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch(e: any) {
      console.error("Delete Error:", { id, collection: 'users/doctors', errorCode: e.code, message: e.message });
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

  const handleToggleActive = async (user: any) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.DOCTORS, user.id), { isActive: !user.isActive });
      
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('menu_doctors')}</h1>
              
    </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-8 text-slate-500">{t('loading')}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shrink-0 max-h-[600px]">
          <div className="hidden md:flex bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex-1">{t('name')}</div>
            <div className="w-48">{t('contact')}</div>
            <div className="w-24 text-center">{t('status')}</div>
            <div className="w-24 text-center">{t('actions')}</div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 md:p-0">
            {users.map((u) => (
              <div key={u.id} className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors gap-4">
                <div className="flex-1 flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {u.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{getDoctorFullName(u as any, i18n.language)}</div>
                    <div className="text-[11px] text-slate-500">{u.specialty} • {getStateName(u.state, i18n.language)}</div>
                  </div>
                </div>
                
                <div className="w-48 text-sm text-slate-600">
                  <div className="truncate" dir="ltr">{u.email}</div>
                  <div className="text-xs mt-1" dir="ltr">{u.phone}</div>
                </div>
                
                <div className="w-24 flex justify-center">
                  <button 
                    onClick={() => handleToggleActive(u)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {u.isActive ? t('active') : t('inactive')}
                  </button>
                </div>
                
                <div className="w-24 flex items-center justify-center gap-2">
                  <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirmDelete(u.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                {t('no_users_found')}
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false);  }} 
        />
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
  title={t('confirm_delete_doctor_title')}
  message={t('confirm_delete_doctor_desc')}
/>

    </div>
  );
}

function UserModal({ user, onClose, onSuccess }: { user: any, onClose: () => void, onSuccess: () => void }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [firstNameAr, setFirstNameAr] = useState(user?.firstNameAr || user?.name?.split(' ')[0] || '');
  const [lastNameAr, setLastNameAr] = useState(user?.lastNameAr || user?.name?.split(' ').slice(1).join(' ') || '');
  const [firstNameFr, setFirstNameFr] = useState(user?.firstNameFr || user?.name?.split(' ')[0] || '');
  const [lastNameFr, setLastNameFr] = useState(user?.lastNameFr || user?.name?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  
  const [specialtyId, setSpecialtyId] = useState(user?.specialtyId || '');
  const [specialtyAr, setSpecialtyAr] = useState(user?.specialtyAr || user?.specialty || '');
  const [specialtyFr, setSpecialtyFr] = useState(user?.specialtyFr || user?.specialty || '');
  const [clinicNameAr, setClinicNameAr] = useState(user?.clinicNameAr || user?.clinicName || '');
  const [clinicNameFr, setClinicNameFr] = useState(user?.clinicNameFr || user?.clinicName || '');
  const [stateName, setStateName] = useState(user?.state || '16');
  const [city, setCity] = useState(user?.city || '');

  useEffect(() => {
    if (!user || stateName !== user?.state) {
      setCity('');
    }
  }, [stateName, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const arabicRegex = /^[\u0600-\u06FF\s'-]+$/;
    const latinRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

    if (firstNameAr && !arabicRegex.test(firstNameAr)) {
      setError(t('arabic_only_first_name'));
      setLoading(false);
      return;
    }
    if (lastNameAr && !arabicRegex.test(lastNameAr)) {
      setError(t('arabic_only_last_name'));
      setLoading(false);
      return;
    }
    if (firstNameFr && !latinRegex.test(firstNameFr)) {
      setError(t('latin_only_first_name'));
      setLoading(false);
      return;
    }
    if (lastNameFr && !latinRegex.test(lastNameFr)) {
      setError(t('latin_only_last_name'));
      setLoading(false);
      return;
    }

    try {
      if (!user) throw new Error("User required for editing");
      const updates: any = {
        firstNameAr, lastNameAr, firstNameFr, lastNameFr,
        specialtyId, specialtyAr, specialtyFr,
        clinicNameAr, clinicNameFr,
        state: getStateByName(String(stateName))?.id || stateName,
        city,
        phone
      };
      updates.slug = generateDoctorSlug(firstNameFr, lastNameFr, specialtyFr, city, user.id);
      await updateDoc(doc(db, COLLECTIONS.DOCTORS, user.id), updates);
      onSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/email-already-in-use') {
        console.error(err);
      }
      if (err.code === 'auth/email-already-in-use') {
        setError(t('email_in_use'));
      } else {
        setError(err.message || t('unknown_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <h3 className="font-bold text-lg text-slate-900">
  {t('edit_doctor')}
</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 rounded-full p-1.5 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstnamear" className="block text-sm font-medium text-slate-700 mb-1">{t('first_name_ar')}</label>
              <input name="firstnamear" id="firstnamear" required type="text" value={firstNameAr} onChange={e => setFirstNameAr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="rtl"  autoComplete="given-name" />
            </div>
            <div>
              <label htmlFor="lastnamear" className="block text-sm font-medium text-slate-700 mb-1">{t('last_name_ar')}</label>
              <input name="lastnamear" id="lastnamear" required type="text" value={lastNameAr} onChange={e => setLastNameAr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="rtl"  autoComplete="family-name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstnamefr" className="block text-sm font-medium text-slate-700 mb-1">{t('first_name_fr')}</label>
              <input name="firstnamefr" id="firstnamefr" required type="text" value={firstNameFr} onChange={e => setFirstNameFr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr"  autoComplete="given-name" />
            </div>
            <div>
              <label htmlFor="lastnamefr" className="block text-sm font-medium text-slate-700 mb-1">{t('last_name_fr')}</label>
              <input name="lastnamefr" id="lastnamefr" required type="text" value={lastNameFr} onChange={e => setLastNameFr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr"  autoComplete="family-name" />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
            <input name="phone" id="phone" required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr"  autoComplete="tel" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('specialty') || 'Specialty'}</label>
              <SpecialtySelect 
                value={specialtyId || specialtyAr || specialtyFr || ''}
                onChange={(id, ar, fr) => { setSpecialtyId(id); setSpecialtyAr(ar); setSpecialtyFr(fr); }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="clinicnamear" className="block text-sm font-medium text-slate-700 mb-1">{t('clinic_name_ar')}</label>
              <input name="clinicnamear" id="clinicnamear" type="text" value={clinicNameAr} onChange={e => setClinicNameAr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="rtl" />
            </div>
            <div>
              <label htmlFor="clinicnamefr" className="block text-sm font-medium text-slate-700 mb-1">{t('clinic_name_fr')}</label>
              <input name="clinicnamefr" id="clinicnamefr" type="text" value={clinicNameFr} onChange={e => setClinicNameFr(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="getstatebynames" className="block text-sm font-medium text-slate-700 mb-1">{t('wilaya')}</label>
              <select name="getstatebynames" id="getstatebynames" required value={getStateByName(String(stateName))?.id || ''} onChange={e => setStateName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-600 outline-none" autoComplete="address-level1">
                <option value="">{t('select_state')}</option>
                {WILAYAS.map(w => (
                  <option key={w.id} value={w.id}>
                    {getStateName(w.id, i18n.language)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="getcityarabicna" className="block text-sm font-medium text-slate-700 mb-1">{t('commune')}</label>
              <select name="getcityarabicna" id="getcityarabicna" required value={getCityArabicName(city, stateName)} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-600 outline-none" disabled={!stateName} autoComplete="address-level2">
                <option value="">{t('select_city')}</option>
                {stateName && getCities(stateName).map((c, index) => (
                    <option key={index} value={c.ar}>
                      {getCityName(stateName, c.ar, i18n.language)}
                    </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors">{t('cancel')}</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 transition-colors">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}
