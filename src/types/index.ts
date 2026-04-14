// All domain types for Dentra dental clinic app.
// Never redefine these inline — always import from here.

export interface Patient {
  id: string;
  title: string;
  archived: boolean;
  birth: number; // birth year
  gender: 0 | 1; // 0=female, 1=male
  phone: string;
  email: string;
  address: string;
  tags: string[];
  notes: string;
  teeth: Record<string, string>; // tooth number → status
}

export interface Appointment {
  id: string;
  archived: boolean;
  operatorsIDs: string[];
  patientID: string | null;
  preOpNotes: string;
  postOpNotes: string;
  prescriptions: string[];
  price: number;
  paid: number;
  paymentMethod: PaymentMethod;
  imgs: string[]; // relative paths: "{appointmentId}/photo1.jpg"
  date: number; // minutes since epoch
  isDone: boolean;
}

export interface Doctor {
  id: string;
  title: string;
  archived: boolean;
  dutyDays: string[]; // 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
  email: string;
  lockToUserIDs: string[];
}

export interface Labwork {
  id: string;
  title: string;
  archived: boolean;
  operatorsIDs: string[];
  patientID: string | null;
  note: string;
  paid: boolean;
  price: number;
  date: number; // minutes since epoch
  lab: string;
  phoneNumber: string;
}

export interface Expense {
  id: string;
  title: string;
  archived: boolean;
  note: string;
  amount: number;
  paid: boolean;
  date: number; // minutes since epoch
  issuer: string;
  phoneNumber: string;
  items: string[];
  tags: string[];
  operatorsIDs: string[];
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  name: string;
  createdAt: number;
}

export interface GlobalSettings {
  currency: string;
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  doctorSpeciality: string;
  prescriptionFooter: string;
  startDayOfWk: string;
  permissions: boolean[]; // 6 flags: [doctors, patients, appointments, labworks, expenses, stats]
}

export interface LocalSettings {
  selectedLocale: Locale;
  dateFormat: string;
  selectedTheme: Theme;
  licenseKey: string;
  licenseMachineId: string;
  licenseValid: boolean;
  installDate: string;
}

export type PaymentMethod = 'cash' | 'ccp' | 'baridimob';
export type Locale = 'ar' | 'fr' | 'en';
export type Theme = 'light' | 'dark';

export type PaymentStatus = 'underpaid' | 'paid' | 'overpaid';

export interface AppointmentPaymentSummary {
  totalPrice: number;
  totalPaid: number;
  balance: number;
  status: PaymentStatus;
}
