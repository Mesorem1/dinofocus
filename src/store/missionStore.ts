import { create } from 'zustand';
import { Mission, DEFAULT_MISSIONS } from '../data/missions';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

interface MissionState {
  dailyMissions: Mission[];
  currentIndex: number;
  completedToday: number;
  lastResetDate: string | null;
  completeMission: () => void;
  resetDailyMissions: () => void;
  addCustomMission: (mission: Mission) => void;
  loadFromStorage: () => Promise<void>;
}

function shuffleMissions(): Mission[] {
  return [...DEFAULT_MISSIONS].sort(() => Math.random() - 0.5).slice(0, 5);
}

export const useMissionStore = create<MissionState>((set, get) => ({
  dailyMissions: [],
  currentIndex: 0,
  completedToday: 0,
  lastResetDate: null,

  completeMission: () => {
    const { currentIndex, completedToday } = get();
    const next = currentIndex + 1;
    set({ currentIndex: next, completedToday: completedToday + 1 });
    saveData(STORAGE_KEYS.MISSIONS, { ...get(), currentIndex: next, completedToday: completedToday + 1 });
  },

  resetDailyMissions: () => {
    const today = new Date().toDateString();
    const missions = shuffleMissions();
    set({ dailyMissions: missions, currentIndex: 0, completedToday: 0, lastResetDate: today });
    saveData(STORAGE_KEYS.MISSIONS, { dailyMissions: missions, currentIndex: 0, completedToday: 0, lastResetDate: today });
  },

  addCustomMission: (mission) => {
    const missions = [...get().dailyMissions, mission];
    set({ dailyMissions: missions });
    saveData(STORAGE_KEYS.MISSIONS, { ...get(), dailyMissions: missions });
  },

  loadFromStorage: async () => {
    const saved = await loadData<Partial<MissionState>>(STORAGE_KEYS.MISSIONS, {});
    const today = new Date().toDateString();
    if (saved.lastResetDate !== today) {
      get().resetDailyMissions();
    } else if (saved.dailyMissions) {
      set(saved as Partial<MissionState>);
    } else {
      get().resetDailyMissions();
    }
  },
}));
