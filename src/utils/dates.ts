import { format, differenceInDays, differenceInYears } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';
import type { Locale } from '../types';

const localeMap = { ar, fr, en: enUS };

export function minutesToDate(minutes: number): Date {
  return new Date(minutes * 60 * 1000);
}

export function dateToMinutes(date: Date): number {
  return Math.floor(date.getTime() / 60 / 1000);
}

export function formatDate(minutes: number, dateFormat: string, locale: Locale): string {
  return format(minutesToDate(minutes), dateFormat, { locale: localeMap[locale] });
}

export function computeAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

export function daysSinceAppointment(appointmentMinutes: number): number {
  return differenceInDays(new Date(), minutesToDate(appointmentMinutes));
}

export function isToday(minutes: number): boolean {
  const d = minutesToDate(minutes);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isMissed(appointment: { date: number; isDone: boolean }): boolean {
  return !appointment.isDone && minutesToDate(appointment.date) < new Date();
}
