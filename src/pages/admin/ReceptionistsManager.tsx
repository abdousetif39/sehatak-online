import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../../lib/firebase';
import { Doctor } from '../../types';
import { Plus, Edit2, Trash2, X, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDoctorFullName } from '../../utils/doctorUtils';
import { COLLECTIONS, ROLES } from '../../lib/constants';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

export default function ReceptionistsManager() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const docsSnap = await getDocs(collection(db, COLLECTIONS.DOCTORS));
      const d = docsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Doctor));
      setDoctorsList(d);
      
      const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
      const allUsers = usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      
      const combined = allUsers.filter(u => u.role === ROLES.RECEPTIONIST).map(u => {
        return { ...u, userType: 'receptionist' };
      });
      setUsers(combined);
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
      console.log("Firestore path:", COLLECTIONS.USERS, id);
      await deleteDoc(doc(db, COLLECTIONS.USERS, id));
      await fetchData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch(e: any) {
      console.error("Delete Error:", { id, collection: COLLECTIONS.USERS, errorCode: e.code, message: e.message });
      alert(`${t('delete_failed')}: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('receptionists_manager')}</h1>
        </div>
        <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          {t('add_receptionist')}
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-8 text-slate-500">{t('loading')}</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shrink-0 max-h-[600px]">
          <div className="hidden md:flex bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex-1">{t('name')}</div>
            <div className="w-48">{t('contact')}</div>
            <div className="w-24 text-center">{t('actions')}</div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 md:p-0">
            {users.map((u) => (
              <div key={u.id} className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors gap-4">
                <div className="flex-1 flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                    {u.receptionistName?.charAt(0) || u.email?.charAt(0) || 'R'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{u.receptionistName || 'N/A'}</div>
                    <div className="text-[11px] text-slate-500">{t('receptionist_for')} {doctorsList.find(d => d.id === u.doctorId) ? getDoctorFullName(doctorsList.find(d => d.id === u.doctorId) as any, i18n.language) : 'N/A'}</div>
                  </div>
                </div>
                
                <div className="w-48 text-sm text-slate-600">
                  <div className="truncate" dir="ltr">{u.email}</div>
                  <div className="text-xs mt-1" dir="ltr">{u.phone || ''}</div>
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
          doctors={doctorsList}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
        />
      )}
    </div>
  );
}

function UserModal({ user, doctors, onClose, onSuccess }: { user: any, doctors: Doctor[], onClose: () => void, onSuccess: () => void }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.receptionistName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [doctorId, setDoctorId] = useState(user?.doctorId || (doctors[0]?.id || ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!user) {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const uid = cred.user.uid;
        await secondaryAuth.signOut();
        
        await setDoc(doc(db, COLLECTIONS.USERS, uid), {
          id: uid,
          email,
          role: ROLES.RECEPTIONIST,
          receptionistName: name,
          phone,
          doctorId
        });
      } else {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          receptionistName: name,
          phone,
          doctorId
        });
      }
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
          <h3 className="font-bold text-lg text-slate-900">{user ? t('edit_receptionist') : t('add_receptionist')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 rounded-full p-1.5 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</div>}
          
          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('login_email')}</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
            <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" dir="ltr" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('select_doctor')}</label>
            <select required value={doctorId} onChange={e => setDoctorId(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-600 outline-none">
              {doctors.map((d: any) => <option key={d.id} value={d.id}>{getDoctorFullName(d, i18n.language)}</option>)}
            </select>
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
