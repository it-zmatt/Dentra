import { open } from '@tauri-apps/plugin-shell';
import { format } from 'date-fns';

interface ReminderParams {
  patientName: string;
  appointmentDate: number; // minutes since epoch
  doctorName: string;
  clinicName: string;
}

export function buildReminderUrl(params: ReminderParams, phone: string): string {
  const date = new Date(params.appointmentDate * 60 * 1000);
  const dateStr = format(date, 'dd/MM/yyyy');
  const timeStr = format(date, 'HH:mm');

  const message = `Bonjour ${params.patientName}, rappel de votre rendez-vous le ${dateStr} à ${timeStr}. Cabinet Dr. ${params.doctorName}.`;

  const cleaned = phone.replace(/\D/g, '');
  const e164 = cleaned.startsWith('0') ? `213${cleaned.slice(1)}` : cleaned;

  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
}

export async function openWhatsAppReminder(
  params: ReminderParams,
  phone: string
): Promise<void> {
  const url = buildReminderUrl(params, phone);
  await open(url);
}

export async function openPhoneDialer(phone: string): Promise<void> {
  await open(`tel:${phone}`);
}
