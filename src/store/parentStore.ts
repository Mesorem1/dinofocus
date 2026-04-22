import { create } from 'zustand';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

interface ParentState {
  pin: string | null;
  sessionDurationMinutes: 10 | 5 | 15;
  notificationsEnabled: boolean;
  isUnlocked: boolean;
  setPin: (pin: string) => void;
  unlock: (pin: string) => boolean;
  lock: () => void;
  setSessionDuration: (minutes: 5 | 10 | 15) => void;
  toggleNotifications: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useParentStore = create<ParentState>((set, get) => ({
  pin: null,
  sessionDurationMinutes: 10,
  notificationsEnabled: true,
  isUnlocked: false,

  setPin: (pin) => {
    set({ pin });
    saveData(STORAGE_KEYS.PARENT, { ...get(), pin, isUnlocked: false });
  },

  unlock: (pin) => {
    if (get().pin === pin) {
      set({ isUnlocked: true });
      return true;
    }
    return false;
  },

  lock: () => set({ isUnlocked: false }),

  setSessionDuration: (minutes) => {
    set({ sessionDurationMinutes: minutes });
    saveData(STORAGE_KEYS.PARENT, { ...get(), sessionDurationMinutes: minutes });
  },

  toggleNotifications: () => {
    const enabled = !get().notificationsEnabled;
    set({ notificationsEnabled: enabled });
    saveData(STORAGE_KEYS.PARENT, { ...get(), notificationsEnabled: enabled });
  },

  loadFromStorage: async () => {
    const saved = await loadData<Partial<ParentState>>(STORAGE_KEYS.PARENT, {});
    if (saved) set({ ...saved, isUnlocked: false } as Partial<ParentState>);
  },
}));
