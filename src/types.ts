export type Role = 'admin' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  email: string;
  role: Role;
  doctorId?: string;
  firstName?: string;
  lastName?: string;
  receptionistName?: string;
  phone?: string;
}

export interface DoctorVacation {
  id: string;

  titleAr: string;
  titleFr: string;

  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd

  descriptionAr?: string;
  descriptionFr?: string;
}

export interface Doctor {
  slug?: string;
  id: string;

  // =========================
  // Personal Information
  // =========================
  name?: string; // Backward compatibility

  firstNameAr?: string;
  lastNameAr?: string;

  firstNameFr?: string;
  lastNameFr?: string;

  specialty?: string; // Backward compatibility
  specialtyAr?: string;
  specialtyFr?: string;

  clinicName?: string; // Backward compatibility
  clinicNameAr?: string;
  clinicNameFr?: string;

  state: string;
  city: string;
  address: string;

  latitude?: number;
  longitude?: number;

  phone: string;
  showPhoneInCard?: boolean;
  photoUrl: string;

  isActive: boolean;

  // =========================
  // Working Schedule
  // =========================
  workingDays: number[];

  startTime: string;
  endTime: string;

  appointmentDuration: number;

  // =========================
  // Receptionist
  // =========================
  receptionistName?: string;
  receptionistId?: string;

  // =========================
  // Break Settings
  // =========================
  breakEnabled?: boolean;

  morningBreak?: {
    enabled: boolean;
    start: string;
    end: string;
    days: number[];
  };

  lunchBreak?: {
    enabled: boolean;
    start: string;
    end: string;
    days: number[];
  };

  eveningBreak?: {
    enabled: boolean;
    start: string;
    end: string;
    days: number[];
  };
  vacations?: DoctorVacation[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName?: string; // Denormalized for easier rendering in admin
  patientName: string;
  patientLastName: string;
  patientPhone: string;
  patientFileNumber?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'booked' | 'examined' | 'cancelled' | 'no_show';
  createdAt: string; // ISO
}
