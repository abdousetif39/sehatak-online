import React, { useState, useEffect } from 'react';
import { Doctor } from '../../types';
import { MapPin, Stethoscope, Calendar as CalendarIcon, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDoctorFullName, getDoctorDisplayName, getDoctorSpecialty, getDoctorClinicName, formatWorkingDays } from '../../utils/doctorUtils';
import { addDays, getDay, parse, addMinutes, format, isBefore, isSameDay } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../lib/constants';
import { getStateName, getCityName } from '../../utils/locationUtils';
import { WILAYAS, COMMUNES } from '../../data/algeria-data';
interface Props {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: Props) {
  const { t, i18n } = useTranslation();
  const isBreakTime = (
  doctor: Doctor,
  day: number,
  time: string
) => {
  if (!doctor.breakEnabled) return false;

  const breaks = [
    doctor.morningBreak,
    doctor.lunchBreak,
    doctor.eveningBreak,
  ];

  for (const b of breaks) {
    if (!b) continue;
    if (!b.enabled) continue;
    if (!b.days.includes(day)) continue;

    if (time >= b.start && time < b.end) {
      return true;
    }
  }

  return false;
};
  
  const [nextSlot, setNextSlot] = useState<{ date: Date, time: string } | null>(null);
  const [loadingSlot, setLoadingSlot] = useState(true);

  useEffect(() => {
    const fetchNextSlot = async () => {
      setLoadingSlot(true);
      try {
        const today = new Date();
        const dateOptions = [];
        for (let i = 0; i < 14; i++) {
          dateOptions.push(addDays(today, i));
        }

        // Fetch all booked slots for the next 14 days
        const q = query(
          collection(db, COLLECTIONS.PUBLIC_SLOTS),
          where('doctorId', '==', doctor.id),
          where('date', '>=', format(today, 'yyyy-MM-dd'))
        );
        const snap = await getDocs(q);
        const bookedSlots = snap.docs.map(d => d.data());

        for (const date of dateOptions) {
          if (!doctor.workingDays?.includes(getDay(date))) continue;

          const dateStr = format(date, 'yyyy-MM-dd');
          const isToday = isSameDay(date, today);
          const slots: string[] = [];
          const baseDate = new Date();
          let current = parse(doctor.startTime, 'HH:mm', baseDate);
          const end = parse(doctor.endTime, 'HH:mm', baseDate);

          while (current < end) {
            const timeStr = format(current, 'HH:mm');

if (!isBreakTime(doctor, getDay(date), timeStr)) {
  slots.push(timeStr);
}

current = addMinutes(current, doctor.appointmentDuration || 15);
            
          }

          const dayBookedSlots = bookedSlots.filter(s => s.date === dateStr).map(s => s.time);
          const availableSlots = slots.filter(time => {
            if (dayBookedSlots.includes(time)) return false;
            if (isToday) {
              const slotTime = parse(time, 'HH:mm', new Date());
              if (isBefore(slotTime, new Date())) return false;
            }
            return true;
          });

          if (availableSlots.length > 0) {
            setNextSlot({ date, time: availableSlots[0] });
            setLoadingSlot(false);
            return;
          }
        }
        
        setNextSlot(null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSlot(false);
      }
    };

    fetchNextSlot();
  }, [doctor]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '';
    // Let it fallback via CSS or hide, but the user wants to show default.
    // We can do this by setting a state or just hiding it and showing the initials.
    e.currentTarget.style.display = 'none';
    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
    if (nextSibling) {
        nextSibling.style.display = 'flex';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-slate-200 p-6 flex flex-col group">
      <div className="flex items-start gap-4 mb-4">
        {doctor.photoUrl ? (
          <>
            <img src={doctor.photoUrl} alt={getDoctorFullName(doctor, i18n.language)} onError={handleImageError} className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0" referrerPolicy="no-referrer" />
            <div className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center text-blue-600 font-bold text-xl shrink-0" style={{ display: 'none' }}>
              {getDoctorFullName(doctor, i18n.language).charAt(0) || doctor.name?.charAt(0) || 'D'}
            </div>
          </>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
            {getDoctorFullName(doctor, i18n.language).charAt(0) || doctor.name?.charAt(0) || 'D'}
          </div>
        )}
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{getDoctorDisplayName(doctor, i18n.language)}</h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
            <Stethoscope className="w-4 h-4 text-blue-500" />
            <span>{getDoctorSpecialty(doctor, i18n.language)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-3 rounded-xl">
        {/* Address */}
        {doctor.address && (
          <div className="flex items-start gap-1.5 text-sm text-slate-500">
            <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <span className="break-words">{doctor.address}</span>
          </div>
        )}
        
        {/* City and State */}
        {(doctor.city || doctor.state) && (
          <div className="flex items-start gap-1.5 text-sm text-slate-500">
            <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${doctor.address ? 'text-transparent' : 'text-slate-400'}`} />
            <span className="break-words">
              {[getCityName(doctor.state, doctor.city, i18n.language), getStateName(doctor.state, i18n.language)].filter(Boolean).join(' - ')}
            </span>
          </div>
        )}
        
        {/* Phone */}
        {doctor.showPhoneInCard && doctor.phone && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
            <Phone className="w-4 h-4 shrink-0 text-blue-500" />
            <span dir="ltr" className="text-left whitespace-nowrap">{doctor.phone}</span>
          </div>
        )}

        {/* Working Days & Hours */}
        {(doctor.workingDays?.length > 0 || (doctor.startTime && doctor.endTime)) && (
          <div className="flex items-start gap-1.5 text-sm text-slate-500">
            <CalendarIcon className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <div className="flex flex-col items-start">
              {doctor.workingDays?.length > 0 && (
                <span>{formatWorkingDays(doctor.workingDays, t)}</span>
              )}
              {doctor.startTime && doctor.endTime && (
                <span className="text-slate-400 text-xs" dir="ltr">{doctor.startTime} - {doctor.endTime}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-2">
        {loadingSlot ? (
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
          </div>
        ) : nextSlot ? (
          <>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CalendarIcon className="w-4 h-4" />
              <span>{t(`day_${getDay(nextSlot.date)}`)} {format(nextSlot.date, 'yyyy/MM/dd')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <Clock className="w-4 h-4" />
              <span dir="ltr">{nextSlot.time}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-rose-500 font-medium">
            <CalendarIcon className="w-4 h-4" />
            <span>{t('no_appointments_available')}</span>
          </div>
        )}
      </div>
      
      {nextSlot ? (
        <Link 
          to={`/doctors/${doctor.slug || doctor.id}`}
          className="mt-auto w-full py-2.5 px-4 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all"
        >
          {t('book_appointment')}
          
        </Link>
      ) : (
        <div className="mt-auto w-full py-2.5 px-4 bg-slate-50 text-slate-400 rounded-xl text-sm font-bold flex justify-center items-center gap-2">
          {t('no_appointments_available')}
        </div>
      )}
    </div>
  );
}
