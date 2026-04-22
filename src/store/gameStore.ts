import { create } from 'zustand';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

export type DinoMood = 'happy' | 'energetic' | 'tired' | 'sad';

interface GameState {
  totalXP: number;
  activeDinoId: string;
  dinoMood: DinoMood;
  streak: number;
  gamesWon: number;
  lastOpenedAt: string | null;
  sessionStartedAt: string | null;
  addXP: (amount: number) => number;
  setDinoMood: (mood: DinoMood) => void;
  recordGameWin: () => void;
  recordAppOpen: () => void;
  startSession: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  totalXP: 0,
  activeDinoId: 'rex',
  dinoMood: 'happy',
  streak: 0,
  gamesWon: 0,
  lastOpenedAt: null,
  sessionStartedAt: null,

  addXP: (amount) => {
    const newTotal = get().totalXP + amount;
    set({ totalXP: newTotal });
    saveData(STORAGE_KEYS.GAME, { ...get(), totalXP: newTotal });
    return newTotal;
  },

  setDinoMood: (mood) => {
    set({ dinoMood: mood });
    saveData(STORAGE_KEYS.GAME, { ...get(), dinoMood: mood });
  },

  recordGameWin: () => {
    const gamesWon = get().gamesWon + 1;
    set({ gamesWon });
    saveData(STORAGE_KEYS.GAME, { ...get(), gamesWon });
  },

  recordAppOpen: () => {
    const now = new Date().toISOString();
    const last = get().lastOpenedAt;
    let streak = get().streak;

    if (last) {
      const diffHours = (Date.now() - new Date(last).getTime()) / 3600000;
      if (diffHours >= 20 && diffHours < 48) streak += 1;
      else if (diffHours >= 48) streak = 1;
    } else {
      streak = 1;
    }

    set({ lastOpenedAt: now, streak });
    saveData(STORAGE_KEYS.GAME, { ...get(), lastOpenedAt: now, streak });
  },

  startSession: () => {
    set({ sessionStartedAt: new Date().toISOString() });
  },

  loadFromStorage: async () => {
    const saved = await loadData(STORAGE_KEYS.GAME, null);
    if (saved) set(saved as Partial<GameState>);
  },
}));
