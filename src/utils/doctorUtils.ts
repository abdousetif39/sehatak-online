import { Doctor } from '../types';

export const getDoctorFullName = (doctor: Doctor, lang: string): string => {
  if (lang === 'ar') {
    if (doctor.firstNameAr || doctor.lastNameAr) {
      return `${doctor.firstNameAr || ''} ${doctor.lastNameAr || ''}`.trim();
    }
  } else {
    if (doctor.firstNameFr || doctor.lastNameFr) {
      return `${doctor.firstNameFr || ''} ${doctor.lastNameFr || ''}`.trim();
    }
  }
  return doctor.name || '';
};

export const getDoctorSpecialty = (doctor: Doctor, lang: string): string => {
  if (lang === 'ar' && doctor.specialtyAr) return doctor.specialtyAr;
  if (lang === 'fr' && doctor.specialtyFr) return doctor.specialtyFr;
  return doctor.specialty || '';
};

export const getDoctorClinicName = (doctor: Doctor, lang: string): string => {
  if (lang === 'ar' && doctor.clinicNameAr) return doctor.clinicNameAr;
  if (lang === 'fr' && doctor.clinicNameFr) return doctor.clinicNameFr;
  return doctor.clinicName || '';
};


export const generateDoctorSlug = (firstNameFr: string = '', lastNameFr: string = '', specialtyFr: string = '', city: string = '', id: string = ''): string => {
  const normalize = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const parts = [firstNameFr, lastNameFr, specialtyFr, city].map(normalize).filter(Boolean);
  if (id) {
    const idSuffix = id.slice(-6).toLowerCase();
    parts.push(idSuffix);
  }
  return parts.join('-');
};

export const formatWorkingDays = (days: number[], t: any): string => {
  if (!days || days.length === 0) return '';
  if (days.length === 1) return t(`day_${days[0]}`);
  if (days.length === 7) return t('everyday');

  // Map JS days (0=Sun, ..., 6=Sat) to Algerian week order (0=Sat, ..., 6=Fri)
  const toAlgerianWeek = (day: number) => (day === 6 ? 0 : day + 1);
  const fromAlgerianWeek = (algDay: number) => (algDay === 0 ? 6 : algDay - 1);

  const sortedDays = [...days].sort((a, b) => toAlgerianWeek(a) - toAlgerianWeek(b));
  
  let isConsecutive = true;
  for (let i = 1; i < sortedDays.length; i++) {
    if (toAlgerianWeek(sortedDays[i]) !== toAlgerianWeek(sortedDays[i - 1]) + 1) {
      isConsecutive = false;
      break;
    }
  }

  if (isConsecutive) {
    return `${t('from')} ${t(`day_${sortedDays[0]}`)} ${t('to')} ${t(`day_${sortedDays[sortedDays.length - 1]}`)}`;
  }

  const algDays = sortedDays.map(toAlgerianWeek);
  let gaps = 0;
  let gapIndex = -1;
  for (let i = 0; i < algDays.length; i++) {
    const next = (i + 1) % algDays.length;
    let diff = algDays[next] - algDays[i];
    if (diff < 0) diff += 7;
    if (diff > 1) {
      gaps++;
      gapIndex = i;
    }
  }

  if (gaps === 1) {
    const startDayAlg = algDays[(gapIndex + 1) % algDays.length];
    const endDayAlg = algDays[gapIndex];
    return `${t('from')} ${t(`day_${fromAlgerianWeek(startDayAlg)}`)} ${t('to')} ${t(`day_${fromAlgerianWeek(endDayAlg)}`)}`;
  }

  return sortedDays.map(d => t(`day_${d}`)).join(t('comma_separator'));
};
