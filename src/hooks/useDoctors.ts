import { useMemo } from 'react';
import { useDoctorsStore } from '../store/doctorsStore';
import { useAppointmentsStore } from '../store/appointmentsStore';
import { isMissed, minutesToDate } from '../utils/dates';

export function useDoctors() {
  return useDoctorsStore();
}

export function useDoctorAppointmentCounts(doctorId: string) {
  const { appointments } = useAppointmentsStore();

  return useMemo(() => {
    const doctorAppointments = appointments.filter(
      (a) => !a.archived && a.operatorsIDs.includes(doctorId)
    );
    const now = new Date();
    const upcoming = doctorAppointments.filter(
      (a) => !a.isDone && minutesToDate(a.date) >= now
    ).length;
    const done = doctorAppointments.filter((a) => a.isDone).length;
    const missed = doctorAppointments.filter((a) => isMissed(a)).length;
    return { upcoming, done, missed, total: doctorAppointments.length };
  }, [appointments, doctorId]);
}
