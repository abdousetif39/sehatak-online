import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import { COLLECTIONS, ROLES, WEEKDAYS } from '../../lib/constants';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X, Check } from 'lucide-react';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import MessageModal from '../../components/MessageModal';

export default function StaffManager() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageModal, setMessageModal] = useState({
  open: false,
  type: "info" as "success" | "error" | "warning" | "info",
  title: "",
  message: "",
});

  const fetchStaff = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where('doctorId', '==', currentUser.id), where('role', '==', 'receptionist'));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as User));
      setStaff(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [currentUser]);

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
      await fetchStaff();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e: any) {
      console.error("Delete Error:", { id, collection: COLLECTIONS.USERS, errorCode: e.code, message: e.message });
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('staff_manager_title')}</h1>
          <p className="text-slate-500 text-sm">{t('staff_manager_desc')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('add_receptionist')}
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center">{t('loading')}</div>
      ) : staff.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">{t('no_staff')}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex-1">{t('name')}</div>
            <div className="flex-1">{t('email')}</div>
            <div className="w-24 text-center">{t('actions')}</div>
          </div>
          
          <div className="flex-col divide-y divide-slate-100">
            {staff.map(member => (
              <div key={member.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex-1 font-bold text-slate-900">
                  {member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : member.receptionistName || member.email}
                </div>
                <div className="flex-1 text-sm text-slate-500" dir="ltr">{member.email}</div>
                <div className="w-24 flex justify-center">
                  <button 
                    onClick={() => confirmDelete(member.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <StaffModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchStaff();
          }}
          doctorId={currentUser!.id}
        />
      )}
      <MessageModal
  isOpen={messageModal.open}
  type={messageModal.type}
  title={messageModal.title}
  message={messageModal.message}
  onClose={() =>
    setMessageModal(prev => ({
      ...prev,
      open: false
    }))
  }
/>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t('confirm_delete_staff_title')}
        message={t('confirm_delete_staff_desc')}
      />
    </div>
  );
}

function StaffModal({ onClose, onSuccess, doctorId }: { onClose: () => void, onSuccess: () => void, doctorId: string }) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;
      
      const newUser: User = {
        id: uid,
        email,
        role: 'receptionist',
        doctorId,
        firstName,
        lastName,
        receptionistName: `${firstName} ${lastName}`.trim()
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, uid), newUser);
      await secondaryAuth.signOut();
      
      onSuccess();
    } catch (e: any) {
      if (e.code !== 'auth/email-already-in-use') {
        console.error(e);
      }
      if (e.code === 'auth/email-already-in-use') {
        setError(t('email_in_use'));
      } else {
        setError(e.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{t('add_receptionist')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 mb-6 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-slate-700 mb-1.5">{t('first_name')}</label>
                <input name="firstname" id="firstname" required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"  autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-slate-700 mb-1.5">{t('last_name')}</label>
                <input name="lastname" id="lastname" required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"  autoComplete="family-name" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">{t('email')}</label>
              <input name="email" id="email" required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr"  autoComplete="email" />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">{t('password')}</label>
              <input name="password" id="password" required type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr"  autoComplete="current-password" />
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Check className="w-5 h-5" />}
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
