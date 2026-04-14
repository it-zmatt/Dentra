import { useMemo } from 'react';
import { useAppointmentsStore } from '../store/appointmentsStore';
import { isMissed, minutesToDate } from '../utils/dates';
import type { Appointment } from '../types';

export function useAppointments() {
  return useAppointmentsStore();
}

export function useAppointmentsByWeek(weekStartDate: Date) {
  const { appointments } = useAppointmentsStore();

  return useMemo(() => {
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return appointments.filter((a) => {
      if (a.archived) return false;
      const d = minutesToDate(a.date);
      return d >= weekStartDate && d < weekEnd;
    });
  }, [appointments, weekStartDate]);
}

export function useAppointmentsByDoctor(doctorId: string | null) {
  const { appointments } = useAppointmentsStore();

  return useMemo(() => {
    if (!doctorId) return appointments.filter((a) => !a.archived);
    return appointments.filter(
      (a) => !a.archived && a.operatorsIDs.includes(doctorId)
    );
  }, [appointments, doctorId]);
}

export function useAppointmentStatus(appointment: Appointment): 'done' | 'missed' | 'upcoming' {
  if (appointment.isDone) return 'done';
  if (isMissed(appointment)) return 'missed';
  return 'upcoming';
}
