import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { COLLECTIONS } from '../../lib/constants';
import { Doctor, Appointment } from '../../types';
import { MapPin, Stethoscope, Calendar as CalendarIcon, Clock, CheckCircle2, Map as MapIcon, Navigation, Users, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const isVacationDay = (
  doctor: Doctor,
  date: Date
) => {
  if (!doctor.vacations?.length) return false;

  const selected = format(date, "yyyy-MM-dd");

  return doctor.vacations.some((vacation) => {
    return (
      selected >= vacation.startDate &&
      selected <= vacation.endDate
    );
  });
};

const getVacationReason = (
  doctor: Doctor,
  date: Date,
  lang: string
) => {
  if (!doctor.vacations?.length) return null;
  const selected = format(date, "yyyy-MM-dd");
  const vacation = doctor.vacations.find(
    (v) => selected >= v.startDate && selected <= v.endDate
  );
  if (!vacation) return null;
  
  const reason = lang === 'ar' ? vacation.descriptionAr : vacation.descriptionFr;
  return reason || null;
};

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import { format, parse, addMinutes, isBefore, addDays, getDay, isSameDay, startOfDay, startOfWeek } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getDoctorFullName, getDoctorSpecialty, getDoctorClinicName, formatWorkingDays } from '../../utils/doctorUtils';
import { getStateName, getCityName } from '../../utils/locationUtils';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import MessageModal from '../../components/MessageModal';

export default function DoctorProfile() {
  const { t, i18n } = useTranslation();
  

const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  useEffect(() => {
    if (doctor) {
      document.title = `${getDoctorFullName(doctor, i18n.language)} | ${t('app_title')}`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', t('meta_doctor_desc', {
          name: getDoctorFullName(doctor, i18n.language),
          specialty: getDoctorSpecialty(doctor, i18n.language),
          city: doctor.city || ''
        }));
      }
    }
  }, [doctor, t, i18n.language]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const selectedDayRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate, loading]);
  const [viewStartDate, setViewStartDate] = useState<Date>(startOfDay(new Date()));
  const [weeklyBookedSlots, setWeeklyBookedSlots] = useState<Record<string, string[]>>({});
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    fileNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refreshSlots, setRefreshSlots] = useState(0);

  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [messageModal, setMessageModal] = useState({
  open: false,
  type: "info" as "success" | "error" | "warning" | "info",
  title: "",
  message: "",
});
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        let d = await getDoc(doc(db, COLLECTIONS.DOCTORS, id));
        let docData: Doctor | null = null;
        
        if (d.exists()) {
          docData = d.data() as Doctor;
        } else {
          // Fallback to query by slug
          const q = query(collection(db, COLLECTIONS.DOCTORS), where("slug", "==", id));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            docData = snapshot.docs[0].data() as Doctor;
          }
        }
        
        if (docData) {
          setDoctor(docData);
          
          // If today is not a working day, find next working day
          let initialDate = new Date();
          let iterations = 0;
          while (!docData.workingDays?.includes(getDay(initialDate)) && iterations < 7) {
            initialDate = addDays(initialDate, 1);
            iterations++;
          }
          setSelectedDate(initialDate);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchWeeklySlots = async () => {
      if (!doctor || !id) return;
      
      const dates = Array.from({length: 7}).map((_, i) => format(addDays(viewStartDate, i), 'yyyy-MM-dd'));
      
      try {
        const promises = dates.map(dateStr => getDocs(query(
          collection(db, COLLECTIONS.PUBLIC_SLOTS),
          where('doctorId', '==', doctor.id),
          where('date', '==', dateStr)
        )));
        
        const snaps = await Promise.all(promises);
        const booked: Record<string, string[]> = {};
        
        snaps.forEach((snap, i) => {
          booked[dates[i]] = snap.docs.map(d => d.data().time);
        });
        
        setWeeklyBookedSlots(booked);
      } catch (error) {
        console.error("Error fetching weekly slots", error);
      }
    };
    
    fetchWeeklySlots();
  }, [viewStartDate, doctor, id, refreshSlots]);

  const getAvailableSlotsCount = (date: Date) => {
    if (!doctor) return 0;

    if (isVacationDay(doctor, date)) return 0;

    if (!doctor.workingDays?.includes(getDay(date))) return 0;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const booked = weeklyBookedSlots[dateStr] || [];
    
    let available = 0;
    const baseDate = new Date();
    let current = parse(doctor.startTime, 'HH:mm', baseDate);
    const end = parse(doctor.endTime, 'HH:mm', baseDate);
    
    const now = new Date();
    const isToday = isSameDay(date, now);

    while (current < end) {
      const timeStr = format(current, 'HH:mm');
      if (isBreakTime(doctor, getDay(date), timeStr)) {
      current = addMinutes(current, doctor.appointmentDuration || 15);
      continue;
      }
      let isAvailable = !booked.includes(timeStr);
      
      if (isAvailable && isToday) {
        const slotTime = parse(timeStr, 'HH:mm', now);
        if (isBefore(slotTime, now)) isAvailable = false;
      }
      
      if (isAvailable) available++;
      current = addMinutes(current, doctor.appointmentDuration || 15);
    }
    
    return available;
  };

  type SlotDisplay = {
    time: string;
    status: 'available' | 'booked' | 'past' | 'last';
  };

  const daySlots = React.useMemo(() => {
    if (!doctor) return [];

    if (isVacationDay(doctor, selectedDate)) {
    return [];
    }

if (!doctor.workingDays?.includes(getDay(selectedDate))) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const booked = weeklyBookedSlots[dateStr] || [];
    
    const slots: SlotDisplay[] = [];
    const baseDate = new Date();
    let current = parse(doctor.startTime, 'HH:mm', baseDate);
    const end = parse(doctor.endTime, 'HH:mm', baseDate);
    
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);

    while (current < end) {
      const timeStr = format(current, 'HH:mm');
      if (isBreakTime(doctor, getDay(selectedDate), timeStr)) {
      current = addMinutes(current, doctor.appointmentDuration || 15);
      continue;
      }
      let status: SlotDisplay['status'] = 'available';
      
      if (booked.includes(timeStr)) {
        status = 'booked';
      } else if (isToday) {
        const slotTime = parse(timeStr, 'HH:mm', now);
        if (isBefore(slotTime, now)) {
          status = 'past';
        }
      }
      
      slots.push({ time: timeStr, status });
      current = addMinutes(current, doctor.appointmentDuration || 15);
    }
    
    const validSlots = slots.filter(s => s.status !== 'past');
    const availableSlots = validSlots.filter(s => s.status === 'available');
    
    if (availableSlots.length === 1) {
      availableSlots[0].status = 'last';
    }
    
    return validSlots;
  }, [selectedDate, doctor, weeklyBookedSlots]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !id) return;
    if (isVacationDay(doctor, selectedDate)) {
    setMessageModal({
    open: true,
    type: "warning",
    title: t("warning"),
    message: t("doctor_on_vacation"),
    });
  return;
}
    if (!selectedTime) {
      setMessageModal({
      open: true,
      type: "warning",
      title: t("warning"),
      message: t("error_no_time"),
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const appointmentId = `${doctor.id}_${formattedDate}_${selectedTime}`;
      
      const appointment: any = {
        id: appointmentId,
        doctorId: doctor.id,
        doctorName: getDoctorFullName(doctor, i18n.language) || doctor.name,
        patientName: formData.firstName,
        patientLastName: formData.lastName,
        patientPhone: formData.phone,
        date: formattedDate,
        time: selectedTime,
        status: 'booked',
        createdAt: new Date().toISOString()
      };
      if (formData.fileNumber) {
        appointment.patientFileNumber = formData.fileNumber;
      }
      
      const batch = writeBatch(db);
      batch.set(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), appointment);
      batch.set(doc(db, COLLECTIONS.PUBLIC_SLOTS, appointmentId), {
        doctorId: doctor.id,
        date: formattedDate,
        time: selectedTime
      });
      await batch.commit();
      
      setSuccess(true);
      setRefreshSlots(prev => prev + 1);
      setFormData({ firstName: '', lastName: '', phone: '', fileNumber: '' });
      setSelectedTime('');
    } catch (error) {
      console.error(error);
      setMessageModal({
      open: true,
      type: "error",
      title: t("error"),
      message: `${t('booking_error')} : ${(error as any).message}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-slate-600">{t('loading')}</div>;
  if (!doctor) return <div className="text-center p-12 text-slate-600">{t('doctor_not_found')}</div>;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('booking_confirmed_title')}</h2>
          <p className="text-slate-600 text-lg mb-8">
            {t('booking_details', {
              doctorName: getDoctorFullName(doctor, i18n.language) || doctor.name,
              date: format(selectedDate, 'yyyy-MM-dd'),
              time: selectedTime
            })}
          </p>
                    <button 
            onClick={() => setSuccess(false)}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            {t('book_another')}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-transparent text-slate-600 hover:text-slate-900 font-bold transition-colors mt-4 block mx-auto"
          >
            {t('back_to_home')}
          </button>
        </div>
      </div>
    );
  }

  const handlePrevWeek = () => {
    const newDate = addDays(viewStartDate, -7);
    if (isBefore(newDate, startOfDay(new Date()))) {
      setViewStartDate(startOfDay(new Date()));
    } else {
      setViewStartDate(newDate);
    }
  };

  const handleNextWeek = () => {
    setViewStartDate(addDays(viewStartDate, 7));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Check text direction for RTL support
    const isRtl = document.dir === 'rtl' || i18n.language === 'ar';

    if (isLeftSwipe) {
      if (isRtl) handlePrevWeek();
      else handleNextWeek();
    }
    
    if (isRightSwipe) {
      if (isRtl) handleNextWeek();
      else handlePrevWeek();
    }
  };

  const dateOptions = Array.from({length: 7}).map((_, i) => addDays(viewStartDate, i));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-medium transition-colors">
        
        {t('go_back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Doctor Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex flex-col items-center text-center mb-6">
              {doctor.photoUrl ? (
                <img src={doctor.photoUrl} alt={getDoctorFullName(doctor, i18n.language)} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%233b82f6"><circle cx="50" cy="50" r="50" fill="%23eff6ff"/><text x="50" y="50" font-family="Arial" font-size="40" fill="%232563eb" text-anchor="middle" dy=".3em">' + getDoctorFullName(doctor, i18n.language).charAt(0) || doctor.name?.charAt(0) || 'D' + '</text></svg>'; }} className="w-32 h-32 rounded-full object-cover mb-4 bg-slate-100 ring-4 ring-slate-50" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-4xl font-bold mb-4 ring-4 ring-blue-50/50">
                  {getDoctorFullName(doctor, i18n.language).charAt(0) || doctor.name?.charAt(0) || 'D'}
                </div>
              )}
              <h1 className="text-xl font-bold text-slate-900 mb-2">{t('dr_prefix')}{getDoctorFullName(doctor, i18n.language)}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                <Stethoscope className="w-4 h-4" />
                {getDoctorSpecialty(doctor, i18n.language)}
              </span>
              {doctor.receptionistName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium ml-2">
                  <Users className="w-4 h-4" />
                  {t('receptionist_name_label')}: {doctor.receptionistName}
                </span>
              )}
            </div>
            
            
            <div className="space-y-4 pt-6 border-t border-slate-100 text-sm">
              {doctor.address && (
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className="w-5 h-5 shrink-0 text-slate-400 mt-0.5" />
                  <span className="break-words">{doctor.address}</span>
                </div>
              )}
              
              {(doctor.city || doctor.state) && (
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${doctor.address ? 'text-transparent' : 'text-slate-400'}`} />
                  <span className="break-words">
                    {[getCityName(doctor.state, doctor.city, i18n.language), getStateName(doctor.state, i18n.language)].filter(Boolean).join(' - ')}
                  </span>
                </div>
              )}
              
              {doctor.showPhoneInCard && doctor.phone && (
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <Phone className="w-5 h-5 shrink-0 text-blue-500" />
                  <span dir="ltr" className="text-left whitespace-nowrap">{doctor.phone}</span>
                </div>
              )}
              
              {(doctor.workingDays?.length > 0 || (doctor.startTime && doctor.endTime)) && (
                <div className="flex items-start gap-3 text-slate-600">
                  <CalendarIcon className="w-5 h-5 shrink-0 text-slate-400 mt-0.5" />
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
              
              {doctor.latitude && doctor.longitude && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapIcon className="w-4 h-4 text-slate-400" />
                      {t('clinic_location')}
                    </span>
                  </div>
                  <div className="h-[200px] w-full z-0 relative">
                    <MapContainer 
                      center={[doctor.latitude, doctor.longitude]} 
                      zoom={15} 
                      className="w-full h-full"
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[doctor.latitude, doctor.longitude]} />
                    </MapContainer>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${doctor.latitude},${doctor.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-white hover:bg-slate-50 text-blue-600 text-sm font-bold flex justify-center items-center gap-2 transition-colors border-t border-slate-200"
                  >
                    <Navigation className="w-4 h-4" />
                    {t('open_in_google_maps')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                {t('choose_appointment')}
              </h2>
            </div>
            
            <div className="p-6 md:p-8">
              {/* Date Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-700">{t('step_1_day')}</h3>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <button 
                      onClick={handlePrevWeek} 
                      disabled={isSameDay(viewStartDate, startOfDay(new Date()))} 
                      className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed min-w-[120px] font-medium"
                    >
                      {t('prev_week')}
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm font-medium h-full min-w-[140px]"
                      >
                        <CalendarIcon className="w-5 h-5" />
                        <span>{format(viewStartDate, 'MMM yyyy')}</span>
                      </button>

                      {isCalendarOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setIsCalendarOpen(false)}
                          />
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
                            <DayPicker 
                              mode="single"
                              selected={selectedDate}
                              onSelect={(d) => {
                                if (d) {
                                  if (!isBefore(startOfDay(d), startOfDay(new Date()))) {
                                    setViewStartDate(startOfDay(d));
                                    setSelectedDate(startOfDay(d));
                                    setIsCalendarOpen(false);
                                  }
                                }
                              }}
                              startMonth={new Date()}
                              disabled={(date) => {
                                 const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
                                 const isWorking = doctor.workingDays?.includes(getDay(date));
                                 const isVacation = isVacationDay(doctor, date);
                                 return isPast || !isWorking || isVacation;
                              }}
                              showOutsideDays
                              fixedWeeks
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <button 
                      onClick={handleNextWeek} 
                      className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed min-w-[120px] font-medium"
                    >
                      {t('next_week')}
                    </button>
                  </div>
                </div>

                <div 
                  className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar" 
                  style={{ scrollbarWidth: 'none' }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {dateOptions.map((date, i) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const isWorkingDay = doctor.workingDays?.includes(getDay(date));
                    const isVacation = isVacationDay(doctor, date);
                    const availableCount = getAvailableSlotsCount(date);
                    const isFullyBooked =
                    isWorkingDay &&
                    !isVacation &&
                    availableCount === 0;
                    
                    return (
                      <button
                        key={i}
                        ref={isSelected ? selectedDayRef : null}
                        disabled={!isWorkingDay || isVacation || isFullyBooked}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 snap-start w-24 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
                        isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                        : isVacation
                        ? "bg-orange-50 border-orange-300 text-orange-700 cursor-not-allowed"
                        : !isWorkingDay || isFullyBooked
                        ? "bg-slate-50 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                        : isToday
                        ? "bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400"
                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                        }`}
                              
                      >
                        <span className="text-xs font-medium opacity-80">{isSameDay(date, new Date()) ? t('today') : t(`day_${getDay(date)}`)}</span>
                        <span className="text-xl font-bold my-0.5">{format(date, 'dd')}</span>
                        <span className="text-[10px] font-medium opacity-80">{format(date, 'MMM yyyy')}</span>
                        {isVacation ? (
                        <>
                          <span className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-50 px-2 py-0.5 rounded-full">
                          {t("doctor_on_vacation")}
                          </span>
                          {getVacationReason(doctor, date, i18n.language) && (
                            <span className="text-[9px] text-orange-500 text-center mt-1 truncate w-full px-1">
                              {getVacationReason(doctor, date, i18n.language)}
                            </span>
                          )}
                        </>
                        ) : isFullyBooked ? (
                        <span className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 px-2 py-0.5 rounded-full">
                        {t("fully_booked")}
                        </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex justify-between items-center">
                  <span>{t('step_2_time')}</span>
                  {selectedDate && <span className="text-slate-600 font-normal" dir="ltr">{format(selectedDate, 'yyyy/MM/dd')}</span>}
                </h3>
                
                {daySlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {daySlots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={slot.status === 'booked'}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-3 px-2 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                          selectedTime === slot.time 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                            : slot.status === 'booked'
                              ? 'bg-red-50 border-red-100 text-red-400 opacity-60 cursor-not-allowed'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
                        }`}
                        dir="ltr"
                      >
                        <div className="flex items-center gap-2">
                          {slot.status === 'available' && <span className="text-green-500 text-xs">🟢</span>}
                          {slot.status === 'booked' && <span className="text-red-500 text-xs">🔴</span>}
                          {slot.status === 'last' && <span className="text-orange-500 text-xs">🟠</span>}
                          <span className="text-base">{slot.time}</span>
                        </div>
                        {slot.status === 'booked' && <span className="text-[10px] text-red-500 font-medium">{t('booked')}</span>}
                        {slot.status === 'last' && <span className="text-[10px] text-orange-500 font-medium">{t('last_spot')}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <div className="text-slate-600 font-medium">
                    {isVacationDay(doctor, selectedDate) ? (
                      getVacationReason(doctor, selectedDate, i18n.language) ? (
                        <>
                          <p>🚫 {t("doctor_on_vacation")}</p>
                          <p className="mt-2 text-sm">
                            {t('reason_label')} 
                            {getVacationReason(doctor, selectedDate, i18n.language)}
                          </p>
                        </>
                      ) : (
                        <p>{t("doctor_on_vacation")}</p>
                      )
                    ) : (
                      <p>{t("no_appointments_available")}</p>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Form */}
              {selectedTime && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-t border-slate-100 pt-8 mt-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-4">{t('step_3_patient')}</h3>
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">{t('patient_name')} *</label>
                          <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">{t('patient_last_name')} *</label>
                          <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">{t('phone')} *</label>
                          <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all" dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">{t('file_number')}</label>
                          <input type="text" value={formData.fileNumber} onChange={e => setFormData({...formData, fileNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all" dir="ltr" />
                        </div>
                      </div>
                      
                      <div className="pt-6">
                        <button 
                          type="submit" 
                          disabled={submitting}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                        >
                          {submitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            <>
                              {t('confirm_booking')}
                              {selectedTime && <span className="font-normal opacity-80 text-sm" dir="ltr">({selectedTime})</span>}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>

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
    </div>
  );
}
