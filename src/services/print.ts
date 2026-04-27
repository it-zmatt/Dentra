// Print service — triggers native Windows print dialog via @react-pdf/renderer
// All PDFs render in French regardless of UI locale.

import { pdf } from '@react-pdf/renderer';
import type { Patient, Appointment, GlobalSettings } from '../types';

// Dynamically import PDF components to avoid loading them at startup
export async function printPrescription(
  patient: Patient,
  appointment: Appointment,
  settings: GlobalSettings,
  doctorName: string
): Promise<void> {
  // TODO: PrescriptionDocument component not yet implemented
  // const { PrescriptionDocument } = await import('../components/common/PrescriptionDocument');
  // const blob = await pdf(
  //   PrescriptionDocument({ patient, appointment, settings, doctorName })
  // ).toBlob();
  // const url = URL.createObjectURL(blob);
  // const win = window.open(url);
  // if (win) {
  //   win.addEventListener('load', () => {
  //     win.print();
  //   });
  // }
  console.warn('printPrescription: PrescriptionDocument not yet implemented');
}

export async function printPatientRecord(
  patient: Patient,
  appointments: Appointment[],
  settings: GlobalSettings
): Promise<void> {
  // TODO: PatientRecordDocument component not yet implemented
  // const { PatientRecordDocument } = await import('../components/common/PatientRecordDocument');
  // const blob = await pdf(
  //   PatientRecordDocument({ patient, appointments, settings })
  // ).toBlob();
  // const url = URL.createObjectURL(blob);
  // const win = window.open(url);
  // if (win) {
  //   win.addEventListener('load', () => {
  //     win.print();
  //   });
  // }
  console.warn('printPatientRecord: PatientRecordDocument not yet implemented');
}
