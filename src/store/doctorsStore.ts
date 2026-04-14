import { create } from 'zustand';
import { getDoctors, saveDoctor, deleteDoctor } from '../services/db';
import type { Doctor } from '../types';

interface DoctorsStore {
  doctors: Doctor[];
  loading: boolean;
  load: () => Promise<void>;
  save: (doctor: Doctor) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useDoctorsStore = create<DoctorsStore>((set) => ({
  doctors: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const doctors = await getDoctors();
    set({ doctors, loading: false });
  },

  save: async (doctor) => {
    await saveDoctor(doctor);
    const doctors = await getDoctors();
    set({ doctors });
  },

  remove: async (id) => {
    await deleteDoctor(id);
    const doctors = await getDoctors();
    set({ doctors });
  },
}));
