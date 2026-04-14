import { create } from 'zustand';
import { getPatients, savePatient, deletePatient } from '../services/db';
import type { Patient } from '../types';

interface PatientsStore {
  patients: Patient[];
  loading: boolean;
  load: () => Promise<void>;
  save: (patient: Patient) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const usePatientsStore = create<PatientsStore>((set) => ({
  patients: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const patients = await getPatients();
    set({ patients, loading: false });
  },

  save: async (patient) => {
    await savePatient(patient);
    const patients = await getPatients();
    set({ patients });
  },

  remove: async (id) => {
    await deletePatient(id);
    const patients = await getPatients();
    set({ patients });
  },
}));
