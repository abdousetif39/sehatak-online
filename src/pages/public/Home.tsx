import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../lib/constants';
import { Doctor } from '../../types';
import { MapPin, Stethoscope, Search, Phone, Facebook, MessageCircle, Send, Twitter, Linkedin, Mail, Link as LinkIcon, CheckCircle2, Calendar, Users, Globe, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStates, getCitiesForState } from '../../data/algeria';
import DoctorCard from './DoctorCard';
import { getDoctorFullName, getDoctorSpecialty } from '../../utils/doctorUtils';
import { getStateName, getCityName } from '../../utils/locationUtils';
import { WILAYAS, COMMUNES } from '../../data/algeria-data';

export default function Home() {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    document.title = t('app_title') || 'صحتك أونلاين';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t('meta_home_desc'));
    }
  }, [t, i18n.language]);
const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Search states
  const [searchName, setSearchName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const ALGERIA_STATES = getStates(i18n.language);
  

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, COLLECTIONS.DOCTORS), where('isActive', '==', true));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as Doctor));
        setDoctors(docs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [selectedState, selectedCity]);

  useEffect(() => {
    let result = doctors;
    if (searchName) {
      result = result.filter(d => {
        const arName = getDoctorFullName(d, 'ar').toLowerCase();
        const frName = getDoctorFullName(d, 'fr').toLowerCase();
        const search = searchName.toLowerCase().replace(/\s+/g, '');
        
        const arNoSpace = arName.replace(/\s+/g, '');
        const frNoSpace = frName.replace(/\s+/g, '');
        const origNoSpace = (d.name || '').toLowerCase().replace(/\s+/g, '');

        return arNoSpace.includes(search) || frNoSpace.includes(search) || origNoSpace.includes(search);
      });
    }
    if (selectedState) {
      result = result.filter(d => {
        const stateNameAr = getStateName(d.state, 'ar');
        const stateNameFr = getStateName(d.state, 'fr');
        return d.state === selectedState || String(d.state) === selectedState || stateNameAr === selectedState || stateNameFr === selectedState;
      });
    }
    if (selectedCity) {
      result = result.filter(d => {
        const cityNameAr = getCityName(d.state, d.city, 'ar');
        const cityNameFr = getCityName(d.state, d.city, 'fr');
        return d.city === selectedCity || cityNameAr === selectedCity || cityNameFr === selectedCity;
      });
    }
    setFilteredDoctors(result);
  }, [searchName, selectedState, selectedCity, doctors]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setSelectedCity(''); // Reset city when state changes
  };


  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareTitleText = t('share_msg_title');
  const shareText = `${t('share_msg_title')}
${t('share_msg_desc')}

${t('share_msg_features')}:
${t('share_msg_doctors')}:
- ${t('share_feature_d1')}
- ${t('share_feature_d2')}
- ${t('share_feature_d3')}
- ${t('share_feature_d4')}
- ${t('share_feature_d5')}
- ${t('share_feature_d6')}
- ${t('share_feature_d7')}

${t('share_msg_patients')}:
- ${t('share_feature_p1')}
- ${t('share_feature_p2')}
- ${t('share_feature_p3')}
- ${t('share_feature_p4')}
- ${t('share_feature_p5')}

${shareUrl}`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(shareTitleText);

  const shareLinks = [
    { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: `https://api.whatsapp.com/send?text=${encodedText}`, color: 'bg-green-800 hover:bg-green-900 text-white' },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'bg-[#0b5cba] hover:bg-[#08468f] text-white' },
    { name: 'Telegram', icon: <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, color: 'bg-[#006090] hover:bg-[#00476b] text-white' },
    { name: 'X', icon: <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, color: 'bg-black hover:bg-gray-800 text-white' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: 'bg-[#0A66C2] hover:bg-[#074c92] text-white' },
    { name: 'Email', icon: <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />, url: `mailto:?subject=${encodedTitle}&body=${encodedText}`, color: 'bg-slate-600 hover:bg-slate-700 text-white' }
  ];
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (

    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
          {t('search_doctor')}
        </h1>
        <Link 
          to="/pricing" 
          className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-xl transition-colors mt-2"
        >
          {t('subscription_plans')}
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-12 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('patient_name')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex-1">
          <select aria-label={t('wilaya')} value={selectedState} onChange={handleStateChange} className="w-full px-4 py-2.5 border-slate-200 rounded-xl bg-slate-50">
            <option value="">{t('all_states')}</option>
            {ALGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <select aria-label={t('commune')} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState} className="w-full px-4 py-2.5 border-slate-200 rounded-xl bg-slate-50 disabled:opacity-50">
            <option value="">{t('all_cities')}</option>
            {selectedState && getCitiesForState(selectedState, i18n.language).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <h2 className="sr-only">{t("menu_doctors")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-slate-200 p-6 flex flex-col group">
              <div className="flex items-start gap-4 mb-4">
                {doctor.photoUrl ? (
                  <img src={doctor.photoUrl} alt={getDoctorFullName(doctor, i18n.language)} className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
                    {getDoctorFullName(doctor, i18n.language).charAt(0) || doctor.name?.charAt(0) || 'D'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{getDoctorFullName(doctor, i18n.language)}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                    <Stethoscope className="w-4 h-4 text-blue-500" />
                    <span>{getDoctorSpecialty(doctor, i18n.language)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mb-6 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{getStateName(doctor.state, i18n.language)} - {getCityName(doctor.state, doctor.city, i18n.language)} - {doctor.address}</span>
                </div>
                {doctor.showPhoneInCard && doctor.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium" dir="ltr">
                    <Phone className="w-4 h-4 shrink-0 text-blue-500" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
              </div>
              
              <Link 
                to={`/doctors/${doctor.slug || doctor.id}`}
                aria-label={`${t('book_appointment')} - ${getDoctorFullName(doctor, i18n.language)}`}
                className="mt-auto w-full py-2.5 px-4 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all"
              >
                {t('book_appointment')}
                
              </Link>
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-600 text-lg">{t('no_doctors_found')}</p>
            </div>
          )}
        </div>
        </>
      )}


      <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col items-center">
        <Link to="/" className="mb-6" aria-label={t('app_title')}>
          <img src="/logo.webp" alt="Sehatak Online Logo" width="224" height="64" className="h-16 object-contain hover:opacity-90 transition-opacity" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">{t('share_title')}</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 text-center">{t('share_desc')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12 text-start">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-900 text-lg mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              {t('share_msg_doctors')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d1')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d2')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Globe className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d3')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Users className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d4')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Search className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d5')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /><span>{t('share_feature_d6')}</span></li>
            </ul>
          </div>
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('share_msg_patients')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Search className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p1')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Calendar className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p2')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p3')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p4')}</span></li>
              <li className="flex items-start gap-2.5 text-slate-700 text-sm"><Stethoscope className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{t('share_feature_p5')}</span></li>
            </ul>
          </div>
        </div>

        <p className="text-slate-800 font-bold mb-6 text-center">{t('share_call_to_action')}</p>
        
        <div className="flex flex-wrap justify-center gap-4 relative">
          {shareLinks.map((link, idx) => (
            <a 
              key={idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={link.name}
              className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${link.color}`}
            >
              {link.icon}
              <span className="hidden sm:inline">{link.name}</span>
            </a>
          ))}
          
          <button 
            onClick={handleCopyLink}
            className="group flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
          >
            <LinkIcon className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-600" />
            <span className="hidden sm:inline">{t('copy_link')}</span>
          </button>
        </div>

        {copied && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4">
            <span className="text-sm font-medium">{t('link_copied_success')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
