import { create } from 'zustand';
import { login, getUsers, getLocalSettings, saveLocalSettings } from '../services/db';
import type { User, LocalSettings } from '../types';

interface AuthStore {
  currentUser: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  autoLogin: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  isAdmin: false,

  login: async (email: string, password: string) => {
    // Call the Rust login command via db service
    // If it fails, the error will be thrown and caught by the UI layer
    const user = await login(email, password);

    // Set the current user and isAdmin in state
    set({ currentUser: user, isAdmin: user.isAdmin });

    // Persist the user ID to local_settings
    const localSettings = await getLocalSettings();
    const updated: LocalSettings = {
      ...localSettings,
      loggedInUserId: user.id,
    };
    await saveLocalSettings(updated);
  },

  logout: async () => {
    // Clear the current user from state
    set({ currentUser: null, isAdmin: false });

    // Remove the logged_in_user_id from local_settings by clearing it
    const localSettings = await getLocalSettings();
    const updated: LocalSettings = {
      ...localSettings,
      loggedInUserId: '',
    };
    await saveLocalSettings(updated);
  },

  autoLogin: async (): Promise<boolean> => {
    // Read local_settings to find the stored user ID
    const localSettings = await getLocalSettings();
    const storedUserId = localSettings.loggedInUserId;

    // If no stored ID, return false
    if (!storedUserId) {
      return false;
    }

    // Fetch all users and find the one matching the stored ID
    const users = await getUsers();
    const user = users.find((u) => u.id === storedUserId);

    // If user not found, return false
    if (!user) {
      return false;
    }

    // Restore the session
    set({ currentUser: user, isAdmin: user.isAdmin });
    return true;
  },
}));
