import { create } from 'zustand';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

export type DinoMood = 'happy' | 'energetic' | 'tired' | 'sad';

// Tamagotchi stat decay rates per hour
const DECAY = {
  hunger: 12,     // -12 hunger per hour (full → empty in ~8h)
  happiness: 8,   // -8 happiness per hour
  energy: 10,     // -10 energy per hour
};

function clamp(val: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

interface TamagotchiStats {
  hunger: number;     // 0-100 (100 = full, 0 = starving)
  happiness: number;  // 0-100
  energy: number;     // 0-100
  health: number;     // 0-100 (computed from other stats)
  lastUpdatedAt: string | null;
}

interface GameState {
  totalXP: number;
  activeDinoId: string;
  dinoMood: DinoMood;
  streak: number;
  gamesWon: number;
  lastOpenedAt: string | null;
  sessionStartedAt: string | null;

  // Progression & Rewards
  totalMissionsCompleted: number;
  chestCount: number;

  // Weekly report tracking
  weeklyXP: number;
  weeklyMissions: number;
  weeklyGames: number;
  weekStartDate: string | null;

  // Tamagotchi
  tama: TamagotchiStats;

  addXP: (amount: number) => number;
  setDinoMood: (mood: DinoMood) => void;
  recordGameWin: () => void;
  recordAppOpen: () => void;
  startSession: () => void;
  loadFromStorage: () => Promise<void>;
  incrementMissionsCompleted: () => void;
  incrementChestCount: () => void;
  checkAndResetWeekly: () => void;

  // Tamagotchi actions
  feedDino: () => void;
  petDino: () => void;
  restDino: () => void;
  updateTamaStats: () => void;
}

function computeHealth(tama: TamagotchiStats): number {
  return clamp(Math.round((tama.hunger + tama.happiness + tama.energy) / 3));
}

function decayStats(tama: TamagotchiStats): TamagotchiStats {
  if (!tama.lastUpdatedAt) return tama;
  const hoursElapsed = (Date.now() - new Date(tama.lastUpdatedAt).getTime()) / 3600000;
  if (hoursElapsed < 0.01) return tama; // less than 36 seconds, skip

  const hunger = clamp(tama.hunger - DECAY.hunger * hoursElapsed);
  const happiness = clamp(tama.happiness - DECAY.happiness * hoursElapsed);
  const energy = clamp(tama.energy - DECAY.energy * hoursElapsed);
  const updated = { hunger, happiness, energy, health: 0, lastUpdatedAt: new Date().toISOString() };
  updated.health = computeHealth(updated);
  return updated;
}

function moodFromStats(tama: TamagotchiStats): DinoMood {
  const { hunger, happiness, energy, health } = tama;
  if (health < 25) return 'sad';
  if (energy < 20) return 'tired';
  if (hunger < 20) return 'sad';
  if (happiness > 70 && energy > 60) return 'energetic';
  return 'happy';
}

const DEFAULT_TAMA: TamagotchiStats = {
  hunger: 80,
  happiness: 75,
  energy: 90,
  health: 82,
  lastUpdatedAt: null,
};

function getMondayDateString(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon ...
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toDateString();
}

export const useGameStore = create<GameState>((set, get) => ({
  totalXP: 0,
  activeDinoId: 'rex',
  dinoMood: 'happy',
  streak: 0,
  gamesWon: 0,
  lastOpenedAt: null,
  sessionStartedAt: null,
  tama: DEFAULT_TAMA,

  // Progression counters
  totalMissionsCompleted: 0,
  chestCount: 0,

  // Weekly tracking
  weeklyXP: 0,
  weeklyMissions: 0,
  weeklyGames: 0,
  weekStartDate: null,

  addXP: (amount) => {
    const state = get();
    const newTotal = state.totalXP + amount;
    // Gain XP → boost happiness
    const tama = state.tama;
    const newTama = {
      ...tama,
      happiness: clamp(tama.happiness + 15),
      health: 0,
      lastUpdatedAt: new Date().toISOString(),
    };
    newTama.health = computeHealth(newTama);
    const weeklyXP = state.weeklyXP + amount;
    set({ totalXP: newTotal, tama: newTama, dinoMood: moodFromStats(newTama), weeklyXP });
    saveData(STORAGE_KEYS.GAME, { ...get(), totalXP: newTotal, tama: newTama, weeklyXP });
    return newTotal;
  },

  setDinoMood: (mood) => {
    set({ dinoMood: mood });
    saveData(STORAGE_KEYS.GAME, { ...get(), dinoMood: mood });
  },

  recordGameWin: () => {
    const state = get();
    const gamesWon = state.gamesWon + 1;
    const weeklyGames = state.weeklyGames + 1;
    // Winning a game drains energy, boosts happiness
    const tama = state.tama;
    const newTama = {
      ...tama,
      happiness: clamp(tama.happiness + 10),
      energy: clamp(tama.energy - 8),
      health: 0,
      lastUpdatedAt: new Date().toISOString(),
    };
    newTama.health = computeHealth(newTama);
    set({ gamesWon, tama: newTama, weeklyGames });
    saveData(STORAGE_KEYS.GAME, { ...get(), gamesWon, tama: newTama, weeklyGames });
  },

  incrementMissionsCompleted: () => {
    const state = get();
    const totalMissionsCompleted = state.totalMissionsCompleted + 1;
    const weeklyMissions = state.weeklyMissions + 1;
    set({ totalMissionsCompleted, weeklyMissions });
    saveData(STORAGE_KEYS.GAME, { ...get(), totalMissionsCompleted, weeklyMissions });
  },

  incrementChestCount: () => {
    const chestCount = get().chestCount + 1;
    set({ chestCount });
    saveData(STORAGE_KEYS.GAME, { ...get(), chestCount });
  },

  checkAndResetWeekly: () => {
    const currentMonday = getMondayDateString();
    const state = get();
    if (state.weekStartDate !== currentMonday) {
      set({
        weeklyXP: 0,
        weeklyMissions: 0,
        weeklyGames: 0,
        weekStartDate: currentMonday,
      });
      saveData(STORAGE_KEYS.GAME, {
        ...get(),
        weeklyXP: 0,
        weeklyMissions: 0,
        weeklyGames: 0,
        weekStartDate: currentMonday,
      });
    }
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

    // Decay stats on open
    const decayed = decayStats(get().tama);
    const mood = moodFromStats(decayed);
    set({ lastOpenedAt: now, streak, tama: decayed, dinoMood: mood });
    saveData(STORAGE_KEYS.GAME, { ...get(), lastOpenedAt: now, streak, tama: decayed, dinoMood: mood });

    // Check if week reset needed
    get().checkAndResetWeekly();
  },

  startSession: () => {
    set({ sessionStartedAt: new Date().toISOString() });
  },

  updateTamaStats: () => {
    const decayed = decayStats(get().tama);
    const mood = moodFromStats(decayed);
    set({ tama: decayed, dinoMood: mood });
    saveData(STORAGE_KEYS.GAME, { ...get(), tama: decayed, dinoMood: mood });
  },

  feedDino: () => {
    const tama = get().tama;
    const newTama = {
      ...tama,
      hunger: clamp(tama.hunger + 35),
      happiness: clamp(tama.happiness + 5),
      health: 0,
      lastUpdatedAt: new Date().toISOString(),
    };
    newTama.health = computeHealth(newTama);
    const mood = moodFromStats(newTama);
    set({ tama: newTama, dinoMood: mood });
    saveData(STORAGE_KEYS.GAME, { ...get(), tama: newTama, dinoMood: mood });
  },

  petDino: () => {
    const tama = get().tama;
    const newTama = {
      ...tama,
      happiness: clamp(tama.happiness + 25),
      health: 0,
      lastUpdatedAt: new Date().toISOString(),
    };
    newTama.health = computeHealth(newTama);
    const mood = moodFromStats(newTama);
    set({ tama: newTama, dinoMood: mood });
    saveData(STORAGE_KEYS.GAME, { ...get(), tama: newTama, dinoMood: mood });
  },

  restDino: () => {
    const tama = get().tama;
    const newTama = {
      ...tama,
      energy: clamp(tama.energy + 40),
      health: 0,
      lastUpdatedAt: new Date().toISOString(),
    };
    newTama.health = computeHealth(newTama);
    const mood = moodFromStats(newTama);
    set({ tama: newTama, dinoMood: mood });
    saveData(STORAGE_KEYS.GAME, { ...get(), tama: newTama, dinoMood: mood });
  },

  loadFromStorage: async () => {
    const saved = await loadData(STORAGE_KEYS.GAME, null);
    if (saved) {
      const s = saved as Partial<GameState>;
      // Decay stats since last save
      const tama = s.tama ? decayStats(s.tama) : DEFAULT_TAMA;
      const mood = moodFromStats(tama);
      set({ ...s, tama, dinoMood: mood } as Partial<GameState>);
    }
  },
}));
