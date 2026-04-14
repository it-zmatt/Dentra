import { useMemo } from 'react';
import { usePatientsStore } from '../store/patientsStore';
import { useAppointmentsStore } from '../store/appointmentsStore';
import { isMissed, daysSinceAppointment, minutesToDate } from '../utils/dates';
import { getPaymentStatus, getBalance } from '../utils/currency';
import type { Patient, Appointment, PaymentStatus } from '../types';

export function usePatients() {
  return usePatientsStore();
}

export function usePatientPaymentSummary(patientId: string) {
  const { appointments } = useAppointmentsStore();

  return useMemo(() => {
    const patientDoneAppointments = appointments.filter(
      (a) => a.patientID === patientId && a.isDone && !a.archived
    );
    const totalPrice = patientDoneAppointments.reduce((sum, a) => sum + a.price, 0);
    const totalPaid = patientDoneAppointments.reduce((sum, a) => sum + a.paid, 0);
    const balance = getBalance(totalPrice, totalPaid);
    const status = getPaymentStatus(totalPrice, totalPaid);
    return { totalPrice, totalPaid, balance, status };
  }, [appointments, patientId]);
}

export function usePatientLastAppointment(patientId: string): Appointment | null {
  const { appointments } = useAppointmentsStore();

  return useMemo(() => {
    const patientAppointments = appointments
      .filter((a) => a.patientID === patientId && !a.archived)
      .sort((a, b) => b.date - a.date);
    return patientAppointments[0] ?? null;
  }, [appointments, patientId]);
}

export function usePatientPhotos(patientId: string): string[] {
  const { appointments } = useAppointmentsStore();

  return useMemo(() => {
    return appointments
      .filter((a) => a.patientID === patientId)
      .flatMap((a) => a.imgs);
  }, [appointments, patientId]);
}
