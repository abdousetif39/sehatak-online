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
  specialtyId?: string;
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

export interface SupportConversation {
  id: string;
  doctorId: string;
  doctorName?: string;
  doctorPhoto?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadForAdmin: boolean;
  unreadForDoctor: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  broadcastId?: string;
  senderId: string;
  senderRole: 'doctor' | 'admin';
  text: string;
  createdAt: string;
  deliveredAt?: string | null;
  readAt: string | null;
  deletedForAdmin?: boolean;
  deletedForDoctor?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface BroadcastMessage {
  id: string;
  adminId: string;
  title: string;
  text: string;
  recipientCount: number;
  readCount: number;
  replyCount: number;
  sentAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface BroadcastRecipient {
  id: string;
  broadcastId: string;
  doctorId: string;
  deliveredAt: string;
  readAt: string | null;
  repliedAt: string | null;
}

