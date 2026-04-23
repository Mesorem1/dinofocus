import { create } from 'zustand';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

interface ParentState {
  pin: string | null;
  sessionDurationMinutes: 10 | 5 | 15;
  notificationsEnabled: boolean;
  isUnlocked: boolean;
  dinoName: string;
  musicEnabled: boolean;
  soundEnabled: boolean;
  bedtimeHour: number | null;

  setPin: (pin: string) => void;
  unlock: (pin: string) => boolean;
  lock: () => void;
  setSessionDuration: (minutes: 5 | 10 | 15) => void;
  toggleNotifications: () => void;
  setDinoName: (name: string) => void;
  toggleMusic: () => void;
  toggleSound: () => void;
  setBedtimeHour: (hour: number | null) => void;
  loadFromStorage: () => Promise<void>;
}

export const useParentStore = create<ParentState>((set, get) => ({
  pin: null,
  sessionDurationMinutes: 10,
  notificationsEnabled: true,
  isUnlocked: false,
  dinoName: 'Rex',
  musicEnabled: true,
  soundEnabled: true,
  bedtimeHour: null,

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

  setDinoName: (name) => {
    set({ dinoName: name });
    saveData(STORAGE_KEYS.PARENT, { ...get(), dinoName: name });
  },

  toggleMusic: () => {
    const musicEnabled = !get().musicEnabled;
    set({ musicEnabled });
    saveData(STORAGE_KEYS.PARENT, { ...get(), musicEnabled });
  },

  toggleSound: () => {
    const soundEnabled = !get().soundEnabled;
    set({ soundEnabled });
    saveData(STORAGE_KEYS.PARENT, { ...get(), soundEnabled });
  },

  setBedtimeHour: (hour) => {
    set({ bedtimeHour: hour });
    saveData(STORAGE_KEYS.PARENT, { ...get(), bedtimeHour: hour });
  },

  loadFromStorage: async () => {
    const saved = await loadData<Partial<ParentState>>(STORAGE_KEYS.PARENT, {});
    if (saved) set({ ...saved, isUnlocked: false } as Partial<ParentState>);
  },
}));
