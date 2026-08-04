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
