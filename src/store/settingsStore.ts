import { create } from 'zustand';
import { getGlobalSettings, saveGlobalSettings, getLocalSettings, saveLocalSettings } from '../services/db';
import type { GlobalSettings, LocalSettings } from '../types';

interface SettingsStore {
  global: GlobalSettings | null;
  local: LocalSettings | null;
  loading: boolean;
  loadAll: () => Promise<void>;
  saveGlobal: (settings: GlobalSettings) => Promise<void>;
  saveLocal: (settings: LocalSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  global: null,
  local: null,
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    const [global, local] = await Promise.all([getGlobalSettings(), getLocalSettings()]);
    set({ global, local, loading: false });
  },

  saveGlobal: async (settings) => {
    await saveGlobalSettings(settings);
    set({ global: settings });
  },

  saveLocal: async (settings) => {
    await saveLocalSettings(settings);
    set({ local: settings });
  },
}));
