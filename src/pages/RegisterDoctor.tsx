import SpecialtySelect from "../components/SpecialtySelect";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { COLLECTIONS } from '../lib/constants';
import { generateDoctorSlug } from '../utils/doctorUtils';
import { WILAYAS } from '../data/algeria-data';
import { getCities } from '../utils/locationUtils';
import { 
  User, Mail, Lock, Phone, MapPin, Building2, 
  Clock, CheckCircle2, ChevronRight, ChevronLeft, 
  AlertCircle, Loader2, Map as MapIcon, ShieldCheck
} from 'lucide-react';
import MessageModal from '../components/MessageModal';

const STEPS = [
  'reg_step_account',
  'reg_step_personal',
  'reg_step_specialty',
  'reg_step_location',
  'reg_step_schedule',
  'reg_step_review'
];

const DAYS = [6, 0, 1, 2, 3, 4, 5]; // Sat -> Fri

export default function RegisterDoctor() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstNameAr: '',
    lastNameAr: '',
    firstNameFr: '',
    lastNameFr: '',
    phone: '',
    showPhone: true,
    specialtyId: '',
    specialtyAr: '',
    specialtyFr: '',
    clinicNameAr: '',
    clinicNameFr: '',
    state: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    workingDays: [6, 0, 1, 2, 3, 4], // Default: Sat-Thu
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 15
  });

  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    if (formData.state) {
      setCities(getCities(formData.state));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: days };
    });
  };

  const handleNext = () => {
    setError('');
    
    // Validation per step
    if (step === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError(t('error_all_fields_required') || 'All fields required');
        return;
      }
      if (formData.password.length < 8) {
        setError(t('reg_password_too_short'));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t('reg_passwords_not_match'));
        return;
      }
    }
    
    if (step === 1) {
      if (!formData.firstNameAr || !formData.lastNameAr || !formData.firstNameFr || !formData.lastNameFr || !formData.phone) {
        setError(t('error_all_fields_required') || 'All fields required');
        return;
      }
    }

    if (step === 2) {
      if (!formData.specialtyId || !formData.state || !formData.city) {
        if (!formData.specialtyId) setError(t('error_specialty_required') || 'Specialty required');
        else setError(t('error_all_fields_required') || 'All fields required');
        return;
      }
      if (false) {
        setError(t('error_all_fields_required') || 'All fields required');
        return;
      }
    }

    if (step === 4) {
      if (formData.workingDays.length === 0) {
        setError(t('error_all_fields_required') || 'Select at least one day');
        return;
      }
    }

    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };

  const handleBack = () => {
    setError('');
    setStep(s => Math.max(0, s - 1));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: String(position.coords.latitude),
            longitude: String(position.coords.longitude)
          }));
        },
        (err) => {
          console.error(err);
          setError(t('error') || 'Could not get location');
        }
      );
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    let createdUid: string | null = null;
    
    try {
      // 1. Create Auth Account
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      createdUid = userCred.user.uid;

      // 2. Create User Document
      await setDoc(doc(db, COLLECTIONS.USERS, createdUid), {
        id: createdUid,
        email: formData.email,
        role: "doctor",
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // 3. Generate Slug
      const slug = generateDoctorSlug(
        formData.firstNameFr, 
        formData.lastNameFr, 
        formData.specialtyFr, 
        formData.city, 
        createdUid
      );

      // 4. Create Doctor Document
      await setDoc(doc(db, COLLECTIONS.DOCTORS, createdUid), {
        id: createdUid,
        slug,
        firstNameAr: formData.firstNameAr,
        lastNameAr: formData.lastNameAr,
        firstNameFr: formData.firstNameFr,
        lastNameFr: formData.lastNameFr,
        specialtyId: formData.specialtyId,
        specialtyAr: formData.specialtyAr,
        specialtyFr: formData.specialtyFr,
        clinicNameAr: formData.clinicNameAr,
        clinicNameFr: formData.clinicNameFr,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        phone: formData.phone,
        showPhoneInCard: formData.showPhone,
        photoUrl: '',
        isActive: true,
        workingDays: formData.workingDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        appointmentDuration: parseInt(String(formData.appointmentDuration)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setModal({
        isOpen: true,
        type: 'success',
        title: t('success') || 'Success',
        message: t('reg_success_msg')
      });

    } catch (err: any) {
      console.error(err);
      
      // Cleanup if created auth but failed to write to Firestore
      if (createdUid && auth.currentUser?.uid === createdUid) {
        try {
          await auth.currentUser.delete();
        } catch (cleanupErr) {
          console.error("Failed to cleanup incomplete user account", cleanupErr);
        }
      }

      let errMsg = t('reg_error_msg');
      if (err.code === 'auth/email-already-in-use') errMsg = t('reg_error_email_in_use');
      if (err.code === 'auth/weak-password') errMsg = t('reg_error_weak_password');
      
      setModal({
        isOpen: true,
        type: 'error',
        title: t('error') || 'Error',
        message: errMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const pStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-10 px-4">
      
      <div className="max-w-4xl w-full mx-auto mb-8 flex justify-between items-center">
        <Link to="/">
          <img src="/logo.webp" width="160" height="50" alt="Sehatek Logo" className="h-12 w-auto object-contain" />
        </Link>
        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors">
          {t('already_have_account')}
        </Link>
      </div>

      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Progress Header */}
        <div className="bg-slate-900 text-white p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('reg_title')}</h1>
          <p className="text-slate-300 text-sm md:text-base">{t('reg_subtitle')}</p>
          
          <div className="flex items-center mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s}>
                <div className={`flex flex-col items-center shrink-0 w-24 ${step >= idx ? 'text-blue-400' : 'text-slate-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${step >= idx ? 'bg-blue-500 text-white' : 'bg-slate-800'}`}>
                    {step > idx ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-xs font-medium text-center whitespace-nowrap">{t(s)}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full min-w-[30px] transition-colors ${step > idx ? 'bg-blue-500' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10">
          
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl flex items-center gap-3 mb-8">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="min-h-[300px]">
            {/* Step 0: Account */}
            {step === 0 && (
              <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('email')}</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 ltr:left-3 ltr:right-auto" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-10 rtl:pr-10 rtl:pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('password')}</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 ltr:left-3 ltr:right-auto" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-10 rtl:pr-10 rtl:pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left" dir="ltr" />
                  </div>
                  {formData.password && (
                    <div className="mt-3 flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${pStrength >= 1 ? 'bg-rose-500 w-1/4' : 'w-0'}`} />
                      <div className={`h-full transition-all duration-300 ${pStrength >= 2 ? 'bg-orange-500 w-1/4' : 'w-0'}`} />
                      <div className={`h-full transition-all duration-300 ${pStrength >= 3 ? 'bg-green-500 w-1/4' : 'w-0'}`} />
                      <div className={`h-full transition-all duration-300 ${pStrength >= 4 ? 'bg-emerald-500 w-1/4' : 'w-0'}`} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_confirm_password')}</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 ltr:left-3 ltr:right-auto" />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-10 rtl:pr-10 rtl:pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left" dir="ltr" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Personal */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 border-b pb-2">{t('arabic')}</h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_first_name_ar')}</label>
                      <input type="text" name="firstNameAr" value={formData.firstNameAr} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" dir="rtl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_last_name_ar')}</label>
                      <input type="text" name="lastNameAr" value={formData.lastNameAr} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" dir="rtl" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 border-b pb-2">{t('french')}</h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_first_name_fr')}</label>
                      <input type="text" name="firstNameFr" value={formData.firstNameFr} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_last_name_fr')}</label>
                      <input type="text" name="lastNameFr" value={formData.lastNameFr} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" dir="ltr" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_phone')}</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 ltr:left-3 ltr:right-auto" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-10 rtl:pr-10 rtl:pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left" dir="ltr" />
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input type="checkbox" name="showPhone" checked={formData.showPhone} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-slate-600">{t('reg_show_phone')}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Specialty & Clinic */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('specialty') || 'Specialty'}</label>
                    <SpecialtySelect 
                      value={formData.specialtyId}
                      onChange={(id, ar, fr) => setFormData(prev => ({...prev, specialtyId: id, specialtyAr: ar, specialtyFr: fr}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_clinic_ar')}</label>
                    <input type="text" name="clinicNameAr" value={formData.clinicNameAr} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_clinic_fr')}</label>
                    <input type="text" name="clinicNameFr" value={formData.clinicNameFr} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_state')}</label>
                    <select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">{t('select')}</option>
                      {WILAYAS.map(w => (
                        <option key={w.id} value={w.id}>{w.id} - {isAr ? w.ar : w.fr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_city')}</label>
                    <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
                      <option value="">{t('select')}</option>
                      {cities.map((c: any, idx) => (
                        <option key={c.ar || idx} value={isAr ? c.ar : c.fr}>{isAr ? c.ar : c.fr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_address')}</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800">{t('reg_get_location')}</h3>
                  <button type="button" onClick={getLocation} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-colors">
                    <MapIcon className="w-5 h-5" />
                    {t('reg_get_location')}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t('reg_latitude')}</label>
                      <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="36.XXXX" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-center" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t('reg_longitude')}</label>
                      <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="3.XXXX" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-center" dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
              <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">{t('reg_working_days')}</label>
                  <div className="flex flex-wrap gap-3">
                    {DAYS.map(day => {
                      const selected = formData.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                            selected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          {t(`day_${day}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_start_time')}</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_end_time')}</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('reg_app_duration')}</label>
                    <select name="appointmentDuration" value={formData.appointmentDuration} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      {[10, 15, 20, 30, 45, 60].map(m => (
                        <option key={m} value={m}>{t(`min_${m}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                    {t('reg_review_title')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('email')}</div>
                      <div className="font-medium text-slate-900">{formData.email}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('reg_phone')}</div>
                      <div className="font-medium text-slate-900" dir="ltr">{formData.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('reg_first_name_ar')} / {t('reg_last_name_ar')}</div>
                      <div className="font-medium text-slate-900">{formData.firstNameAr} {formData.lastNameAr}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('reg_first_name_fr')} / {t('reg_last_name_fr')}</div>
                      <div className="font-medium text-slate-900">{formData.firstNameFr} {formData.lastNameFr}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('reg_specialty_ar')}</div>
                      <div className="font-medium text-slate-900">{isAr ? formData.specialtyAr : formData.specialtyFr}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('reg_clinic_ar')}</div>
                      <div className="font-medium text-slate-900">{isAr ? formData.clinicNameAr : formData.clinicNameFr}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('reg_state')} & {t('reg_city')}</div>
                      <div className="font-medium text-slate-900">{formData.state} - {formData.city}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
          {step > 0 ? (
            <button type="button" onClick={handleBack} disabled={loading} className="px-6 py-3 text-slate-600 font-bold hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
              {t('reg_back')}
            </button>
          ) : <div></div>}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              {t('reg_next')}
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {t('reg_create_account')}
            </button>
          )}
        </div>
      </div>

      <MessageModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => {
          setModal(m => ({ ...m, isOpen: false }));
          if (modal.type === 'success') {
            navigate('/doctor');
          }
        }}
      />
    </div>
  );
}
