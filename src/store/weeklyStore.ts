import { create } from 'zustand';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  completed: boolean;
  icon: string;
}

interface WeeklyState {
  challenges: WeeklyChallenge[];
  weekStartDate: string | null;

  updateProgress: (id: string, delta: number) => void;
  checkAndReset: () => void;
  loadFromStorage: () => Promise<void>;
}

function getMondayDateString(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon ...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toDateString();
}

const DEFAULT_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'win_games',
    title: 'Champion de la semaine',
    description: 'Gagne 5 mini-jeux cette semaine',
    goal: 5,
    progress: 0,
    completed: false,
    icon: '🏆',
  },
  {
    id: 'complete_missions',
    title: 'Explorateur intrépide',
    description: 'Complète 10 missions cette semaine',
    goal: 10,
    progress: 0,
    completed: false,
    icon: '🎯',
  },
  {
    id: 'feed_rex',
    title: 'Ami des dinos',
    description: 'Nourris Rex 7 fois cette semaine',
    goal: 7,
    progress: 0,
    completed: false,
    icon: '🍖',
  },
];

export const useWeeklyStore = create<WeeklyState>((set, get) => ({
  challenges: DEFAULT_CHALLENGES,
  weekStartDate: null,

  updateProgress: (id, delta) => {
    const challenges = get().challenges.map(c => {
      if (c.id !== id) return c;
      const progress = Math.min(c.progress + delta, c.goal);
      return { ...c, progress, completed: progress >= c.goal };
    });
    set({ challenges });
    saveData(STORAGE_KEYS.WEEKLY, { ...get(), challenges });
  },

  checkAndReset: () => {
    const currentMonday = getMondayDateString();
    if (get().weekStartDate !== currentMonday) {
      const challenges = DEFAULT_CHALLENGES.map(c => ({ ...c, progress: 0, completed: false }));
      set({ challenges, weekStartDate: currentMonday });
      saveData(STORAGE_KEYS.WEEKLY, { challenges, weekStartDate: currentMonday });
    }
  },

  loadFromStorage: async () => {
    const saved = await loadData<Partial<WeeklyState>>(STORAGE_KEYS.WEEKLY, {});
    const currentMonday = getMondayDateString();
    if (saved.weekStartDate !== currentMonday) {
      // New week — reset
      const challenges = DEFAULT_CHALLENGES.map(c => ({ ...c, progress: 0, completed: false }));
      set({ challenges, weekStartDate: currentMonday });
      saveData(STORAGE_KEYS.WEEKLY, { challenges, weekStartDate: currentMonday });
    } else if (saved.challenges) {
      set(saved as Partial<WeeklyState>);
    }
  },
}));
