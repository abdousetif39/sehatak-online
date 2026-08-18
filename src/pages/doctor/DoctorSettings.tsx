import SpecialtySelect from "../../components/SpecialtySelect";
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { db, auth, secondaryAuth } from '../../lib/firebase';
import { COLLECTIONS, ROLES, WEEKDAYS } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Save, User as UserIcon, Clock, MapPin, Upload, X, Map as MapIcon, Navigation, Users } from 'lucide-react';
import { Doctor } from '../../types';
import {
  getStateName,
  getCities,
  getCityName,
  getStateByName,
  getCityArabicName
} from "../../utils/locationUtils";
import LocationPicker from '../../components/LocationPicker';
import BreakSettings from "../../components/doctor/BreakSettings";
import { WILAYAS, COMMUNES } from '../../data/algeria-data';
import { generateDoctorSlug } from '../../utils/doctorUtils';
import SuccessModal from "../../components/SuccessModal";
import MessageModal from "../../components/MessageModal";
import VacationSettings from "../../components/doctor/VacationSettings";

export default function DoctorSettings() {
  const { t, i18n } = useTranslation();
  
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receptionists, setReceptionists] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [messageModal, setMessageModal] = useState({
  open: false,
  type: "info" as "success" | "error" | "warning" | "info",
  title: "",
  message: "",
});

  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    specialty: '',
    state: '',
    city: '',
    address: '',
    clinicName: '',
    phone: '',
    photoUrl: '',
    isActive: true,
    workingDays: [0, 1, 2, 3, 4],
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 15,
    receptionistName: '',
    breakEnabled: false,

          morningBreak: {
          enabled: false,
          start: '',
          end: '',
          days: [],
          },

          lunchBreak: {
          enabled: false,
          start: '',
          end: '',
          days: [],
          },

          eveningBreak: {
          enabled: false,
          start: '',
          end: '',
          days: [],
          },
          receptionistId: '',
        });

    useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const d = await getDoc(doc(db, COLLECTIONS.DOCTORS, user.id));
        if (d.exists()) {
          const data = (d.data() as Doctor);
          setFormData(data);
          if (data.photoUrl) {
            setPhotoPreview(data.photoUrl);
          }
        }
        
        const q = query(collection(db, COLLECTIONS.USERS), where('doctorId', '==', user.id), where('role', '==', 'receptionist'));
        const snap = await getDocs(q);
        setReceptionists(snap.docs.map(doc => ({id: doc.id, ...(doc.data())})));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const sigRes = await fetch('/api/cloudinary-signature');
      if (!sigRes.ok) throw new Error('Failed to get signature');
      const { timestamp, signature, apiKey, cloudName } = await sigRes.json();

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', apiKey);
      uploadData.append('timestamp', timestamp);
      uploadData.append('signature', signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setPhotoPreview(data.secure_url);
        setFormData(prev => ({ ...prev, photoUrl: data.secure_url }));
      } else {
        throw new Error(data.error?.message || 'Failed to upload image');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setFormData(prev => {
      const days = prev.workingDays || [];
      if (days.includes(dayId)) {
        return { ...prev, workingDays: days.filter(d => d !== dayId) };
      }
      return { ...prev, workingDays: [...days, dayId] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Sync backward compatibility fields
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');

    const arabicRegex = /^[\u0600-\u06FF\s'-]+$/;
    const latinRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

    if (formData.firstNameAr && !arabicRegex.test(formData.firstNameAr)) {
      setError(t('arabic_only_first_name'));
      setSaving(false);
      return;
    }
    if (formData.lastNameAr && !arabicRegex.test(formData.lastNameAr)) {
      setError(t('arabic_only_last_name'));
      setSaving(false);
      return;
    }
    if (formData.firstNameFr && !latinRegex.test(formData.firstNameFr)) {
      setError(t('latin_only_first_name'));
      setSaving(false);
      return;
    }
    if (formData.lastNameFr && !latinRegex.test(formData.lastNameFr)) {
      setError(t('latin_only_last_name'));
      setSaving(false);
      return;
    }

    if (!formData.slug) {
      formData.slug = generateDoctorSlug(formData.firstNameFr, formData.lastNameFr, formData.specialtyFr, formData.city, user.id);
    }

    try {
      await setDoc(doc(db, COLLECTIONS.DOCTORS, user.id), formData, { merge: true });
      setSuccessOpen(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

 
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('all_fields_required'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwords_do_not_match'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('password_too_short'));
      return;
    }

    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        setPasswordSuccess(t('password_changed_successfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setPasswordError(t('current_password_incorrect'));
      } else {
        setPasswordError(err.message);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessageModal({
      open: true,
      type: "warning",
      title: t("warning"),
      message: t("geolocation_not_supported"),
      });
      return;
    }
    setIsLocating(true);

    const onSuccess = (position: GeolocationPosition) => {
      setFormData(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }));
      setIsLocating(false);
    };

    const onError = (err: GeolocationPositionError) => {
      setIsLocating(false);
      let msg = t('geolocation_error');
      if (err.code === 1) {
        msg = t('geolocation_denied');
      } else if (err.code === 3) {
        msg = t('geolocation_timeout');
      }
      setMessageModal({
      open: true,
      type: "warning",
      title: t("warning"),
      message: msg,
      });
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

 if (loading)
  return (
    <div className="p-8 text-center text-slate-500">
      {t("loading")}
    </div>
  );
  const days = WEEKDAYS.map(id => ({ id, label: t(`day_${id}`) }));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('menu_clinic_settings')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Personal Info */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><UserIcon className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">{t('personal_info')}</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="shrink-0">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt={t("profile")} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100" referrerPolicy="no-referrer" />
                  <button type="button" onClick={() => { setPhotoPreview(''); setFormData(prev => ({...prev, photoUrl: ''})) }} className="absolute -top-2 -right-2 p-1.5 bg-white text-rose-500 rounded-full shadow-sm hover:bg-rose-50 border border-slate-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md">
                  <UserIcon className="w-10 h-10 text-slate-300" />
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('photo_url')}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className={`cursor-pointer px-4 py-2 ${uploadingImage ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'} rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2`}>
                    {uploadingImage ? (
                      <><span className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></span> {i18n.language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</>
                    ) : (
                      <><Upload className="w-4 h-4" /> {i18n.language === 'ar' ? 'رفع صورة' : 'Upload Image'}</>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('first_name_ar')}</label>
              <input required type="text" name="firstNameAr"
title={t("arabic_letters_only")}
 value={formData.firstNameAr || formData.name?.split(' ')[0] || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('last_name_ar')}</label>
              <input required type="text" name="lastNameAr"
title={t("arabic_letters_only")}
 value={formData.lastNameAr || formData.name?.split(' ').slice(1).join(' ') || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('first_name_fr')}</label>
              <input required type="text" name="firstNameFr"
title={t("latin_letters_only")}
 value={formData.firstNameFr || formData.name?.split(' ')[0] || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('last_name_fr')}</label>
              <input required type="text" name="lastNameFr"
title={t("latin_letters_only")}
 value={formData.lastNameFr || formData.name?.split(' ').slice(1).join(' ') || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('specialty') || 'Specialty'}</label>
              <SpecialtySelect 
                value={formData.specialtyId || formData.specialtyAr || formData.specialtyFr || formData.specialty || ''}
                onChange={(id, ar, fr) => setFormData(prev => ({...prev, specialtyId: id, specialtyAr: ar, specialtyFr: fr}))}
              />
            </div>
          </div>
        </div>

        {/* Receptionist Info */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">{t('receptionist_info')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {receptionists.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('select_receptionist')}</label>
                <select 
                  value={formData.receptionistId || ''} 
                  onChange={e => {
                    const recId = e.target.value;
                    const rec = receptionists.find(r => r.id === recId);
                    setFormData(prev => ({ 
                      ...prev, 
                      receptionistId: recId, 
                      receptionistName: rec ? (rec.firstName && rec.lastName ? `${rec.firstName} ${rec.lastName}` : rec.receptionistName || '') : '' 
                    }));
                  }} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                >
                  <option value="">{t('none')}</option>
                  {receptionists.map(r => (
                    <option key={r.id} value={r.id}>{r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.receptionistName || r.email}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('receptionist_name')}</label>
                <input 
                  type="text" 
                  value={formData.receptionistName || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, receptionistName: e.target.value }))} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" 
                  placeholder={t('enter_receptionist_name')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Clinic Info */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">{t('clinic_info')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('clinic_name_ar')}</label>
              <input type="text" name="clinicNameAr" value={formData.clinicNameAr || formData.clinicName || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('clinic_name_fr')}</label>
              <input type="text" name="clinicNameFr" value={formData.clinicNameFr || formData.clinicName || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('state')}</label>
              <select 
                name="state" 
                value={getStateByName(String(formData.state))?.id || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" 
                required
              >
                <option value="">{t('select_state')}</option>
                {WILAYAS.map(w => (
                  <option key={w.id} value={w.id}>
                    {getStateName(w.id, i18n.language)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('city')}</label>
              <select 
                name="city" 
                value={getCityArabicName(formData.city, formData.state)} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" 
                required 
                disabled={!formData.state}
              >
                <option value="">{t('select_city')}</option>
                {formData.state &&
                  getCities(formData.state).map((c, index) => (
                    <option key={index} value={c.ar}>
                      {getCityName(formData.state, c.ar, i18n.language)}
                    </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('address')}</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('clinic_location')}</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={handleCurrentLocation} 
                  disabled={isLocating}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{isLocating ? t('locating') : t('use_current_location')}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsMapOpen(true)} 
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <MapIcon className="w-5 h-5" />
                  <span>{t('choose_from_map')}</span>
                </button>
              </div>
              {formData.latitude && formData.longitude && (
                <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t('location_selected')}</span>
                </div>
              )}

              {isMapOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">{t('choose_from_map')}</h3>
                      <button type="button" onClick={() => setIsMapOpen(false)} className="text-slate-500 hover:text-slate-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <LocationPicker 
                      latitude={formData.latitude} 
                      longitude={formData.longitude} 
                      onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                    <div className="mt-6 flex justify-end">
                      <button type="button" onClick={() => setIsMapOpen(false)} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-medium">
                        {t('confirm')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone')}</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" dir="ltr" />
              <label className="mt-3 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="showPhoneInCard"
                  checked={formData.showPhoneInCard || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-slate-700 font-medium">{t('show_phone_in_card')}</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Working Hours */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">{t('working_hours')}</h2>
          </div>
          

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">{t('working_days')}</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.workingDays?.includes(day.id)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('start_time')}</label>
              <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('end_time')}</label>
              <input required type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('appointment_duration')}</label>
              <select name="appointmentDuration" value={formData.appointmentDuration} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors">
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </select>
            </div>
          </div>
        </div>

        <BreakSettings
        formData={formData}
        setFormData={setFormData}
        />

        <VacationSettings
        formData={formData}
        setFormData={setFormData}
        />

        <div className="flex justify-end pb-8 mt-8">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save className="w-4 h-4" />}
            {t('save_changes')}
          </button>
        </div>
      </form>

      {/* Security Settings */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800">{t('security')}</h2>
        </div>

        {passwordError && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-xl text-sm">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('current_password')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('new_password')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('confirm_new_password')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {changingPassword && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {t('change_password')}
            </button>
          </div>
        </form>
      </div>
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
        <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={t("saved_successfully")}
        message={t("doctor_settings_saved")}
        />
        </div>
        );
  
}
