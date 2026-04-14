import { create } from 'zustand';
import { getAppointments, saveAppointment, deleteAppointment } from '../services/db';
import type { Appointment } from '../types';

interface AppointmentsStore {
  appointments: Appointment[];
  loading: boolean;
  load: () => Promise<void>;
  save: (appointment: Appointment) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAppointmentsStore = create<AppointmentsStore>((set) => ({
  appointments: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const appointments = await getAppointments();
    set({ appointments, loading: false });
  },

  save: async (appointment) => {
    await saveAppointment(appointment);
    const appointments = await getAppointments();
    set({ appointments });
  },

  remove: async (id) => {
    await deleteAppointment(id);
    const appointments = await getAppointments();
    set({ appointments });
  },
}));
