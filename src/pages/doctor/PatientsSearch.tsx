import React, { useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';
import { Appointment } from '../../types';
import { Search, Calendar, FileText, Phone, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export default function PatientsSearch() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    const targetDoctorId = user.role === 'receptionist' ? user.doctorId : user.id;

    try {
      // In Firestore, searching by a substring is complex without external tools like Algolia.
      // We will fetch all appointments for this doctor and filter on the client, OR if data is huge, this is not ideal.
      // Assuming a simple MVP, we fetch all for the doctor, or we can use exact match if we indexed phone numbers.
      // But for small-scale clinic apps, client side filtering on a subset or fetching recent is okay.
      // To prevent huge reads, we can't fetch ALL. Let's try exact matches for Phone or FileNumber first.
      
      let finalResults: Appointment[] = [];
      const term = searchTerm.trim().toLowerCase();

      // Check if it's a phone number
      if (/^[0-9+ ]+$/.test(term)) {
        const phoneQ = query(
          collection(db, COLLECTIONS.APPOINTMENTS),
          where('doctorId', '==', targetDoctorId),
          where('patientPhone', '==', term),
          orderBy('date', 'desc'),
          limit(20)
        );
        const snap = await getDocs(phoneQ);
        finalResults = snap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment));
      }
      
      // We can also query by FileNumber if they typed a number but maybe it's not a phone
      const fileQ = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where('doctorId', '==', targetDoctorId),
        where('patientFileNumber', '==', term),
        orderBy('date', 'desc'),
        limit(20)
      );
      const fileSnap = await getDocs(fileQ);
      fileSnap.docs.forEach(d => {
        if (!finalResults.find(a => a.id === d.id)) {
          finalResults.push((d.data() as Appointment));
        }
      });
      
      // Let's do a general fallback by fetching the last 100 appointments and client-side filtering by name
      if (finalResults.length === 0) {
        const recentQ = query(
          collection(db, COLLECTIONS.APPOINTMENTS),
          where('doctorId', '==', targetDoctorId),
          orderBy('date', 'desc'),
          limit(100)
        );
        const recentSnap = await getDocs(recentQ);
        const recentDocs = recentSnap.docs.map(d => ({ ...d.data(), id: d.id } as Appointment));
        
        const filtered = recentDocs.filter(app => 
          `${app.patientName} ${app.patientLastName}`.toLowerCase().includes(term) ||
          (app.patientFileNumber && app.patientFileNumber.toLowerCase() === term)
        );
        finalResults = filtered;
      }
      
      setAppointments(finalResults);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('patients_search_title')}</h1>
        <p className="text-slate-500 text-sm">
  {t('patients_search_desc')}
</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input name="searchterm" id="searchterm" 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('search_placeholder_patients')}
              className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors text-lg"
             autoComplete="off" />
          </div>
          <button 
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : t('search')}
          </button>
        </form>
      </div>
      
      {hasSearched && !loading && appointments.length === 0 && (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">{t('no_patients_found')}</p>
        </div>
      )}

      {appointments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="hidden md:flex bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-1/3">{t('patient_name')}</div>
            <div className="w-1/4">{t('contact')}</div>
            <div className="w-1/4">{t('last_appointment')}</div>
            <div className="flex-1 text-center">{t('status')}</div>
          </div>
          
          <div className="flex-col divide-y divide-slate-100">
            {appointments.map(app => (
              <div key={app.id} className="p-4 md:px-4 md:py-3 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-full md:w-1/3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                    {app.patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{app.patientName} {app.patientLastName}</div>
                    {app.patientFileNumber && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <FileText className="w-3 h-3" />
                        {t('file_number')}: {app.patientFileNumber}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full md:w-1/4 flex items-center gap-2 text-sm text-slate-600" dir="ltr">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {app.patientPhone}
                </div>
                
                <div className="w-full md:w-1/4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span dir="ltr">{app.date}</span>
                  </div>
                  <div className="text-xs text-slate-500 ltr:ml-6 rtl:mr-6" dir="ltr">{app.time}</div>
                </div>
                
                <div className="flex-1 flex md:justify-center">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    app.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'examined' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {t(`status_${app.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
