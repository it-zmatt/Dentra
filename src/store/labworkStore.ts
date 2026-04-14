import { create } from 'zustand';
import { getLabworks, saveLabwork, deleteLabwork } from '../services/db';
import type { Labwork } from '../types';

interface LabworkStore {
  labworks: Labwork[];
  loading: boolean;
  load: () => Promise<void>;
  save: (labwork: Labwork) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useLabworkStore = create<LabworkStore>((set) => ({
  labworks: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const labworks = await getLabworks();
    set({ labworks, loading: false });
  },

  save: async (labwork) => {
    await saveLabwork(labwork);
    const labworks = await getLabworks();
    set({ labworks });
  },

  remove: async (id) => {
    await deleteLabwork(id);
    const labworks = await getLabworks();
    set({ labworks });
  },
}));
