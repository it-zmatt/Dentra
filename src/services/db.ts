import { invoke } from '@tauri-apps/api/core';
import type {
  Patient,
  Appointment,
  Doctor,
  Labwork,
  Expense,
  User,
  GlobalSettings,
  LocalSettings,
} from '../types';

// ─── Patients ────────────────────────────────────────────────────────────────

export async function getPatients(): Promise<Patient[]> {
  return await invoke('get_patients');
}

export async function savePatient(patient: Patient): Promise<void> {
  return await invoke('save_patient', { patient });
}

export async function deletePatient(id: string): Promise<void> {
  return await invoke('delete_patient', { id });
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  return await invoke('get_appointments');
}

export async function saveAppointment(appointment: Appointment): Promise<void> {
  return await invoke('save_appointment', { appointment });
}

export async function deleteAppointment(id: string): Promise<void> {
  return await invoke('delete_appointment', { id });
}

export async function saveAppointmentPhoto(
  appointmentId: string,
  sourcePath: string
): Promise<string> {
  return await invoke('save_appointment_photo', { appointmentId, sourcePath });
}

export async function deleteAppointmentPhoto(relativePath: string): Promise<void> {
  return await invoke('delete_appointment_photo', { relativePath });
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export async function getDoctors(): Promise<Doctor[]> {
  return await invoke('get_doctors');
}

export async function saveDoctor(doctor: Doctor): Promise<void> {
  return await invoke('save_doctor', { doctor });
}

export async function deleteDoctor(id: string): Promise<void> {
  return await invoke('delete_doctor', { id });
}

// ─── Lab work ────────────────────────────────────────────────────────────────

export async function getLabworks(): Promise<Labwork[]> {
  return await invoke('get_labworks');
}

export async function saveLabwork(labwork: Labwork): Promise<void> {
  return await invoke('save_labwork', { labwork });
}

export async function deleteLabwork(id: string): Promise<void> {
  return await invoke('delete_labwork', { id });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpenses(): Promise<Expense[]> {
  return await invoke('get_expenses');
}

export async function saveExpense(expense: Expense): Promise<void> {
  return await invoke('save_expense', { expense });
}

export async function deleteExpense(id: string): Promise<void> {
  return await invoke('delete_expense', { id });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getGlobalSettings(): Promise<GlobalSettings> {
  return await invoke('get_global_settings');
}

export async function saveGlobalSettings(settings: GlobalSettings): Promise<void> {
  return await invoke('save_global_settings', { settings });
}

export async function getLocalSettings(): Promise<LocalSettings> {
  return await invoke('get_local_settings');
}

export async function saveLocalSettings(settings: LocalSettings): Promise<void> {
  return await invoke('save_local_settings', { settings });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  return await invoke('get_users');
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  isAdmin: boolean
): Promise<User> {
  return await invoke('create_user', { email, password, name, isAdmin });
}

export async function updateUser(user: User): Promise<void> {
  return await invoke('update_user', { user });
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  return await invoke('reset_user_password', { userId, newPassword });
}

export async function deleteUser(id: string): Promise<void> {
  return await invoke('delete_user', { id });
}

export async function login(email: string, password: string): Promise<User> {
  return await invoke('login', { email, password });
}

// ─── Backup ───────────────────────────────────────────────────────────────────

export async function exportBackup(destFolder: string): Promise<string> {
  return await invoke('export_backup', { destFolder });
}

export async function importBackup(zipPath: string): Promise<void> {
  return await invoke('import_backup', { zipPath });
}

// ─── License ──────────────────────────────────────────────────────────────────

export async function getMachineId(): Promise<string> {
  return await invoke('get_machine_id');
}

export async function validateLicenseKey(key: string): Promise<boolean> {
  return await invoke('validate_license_key', { key });
}
