# DinoFocus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire DinoFocus, une app mobile React Native pour enfants TDAH 6–12 ans avec un dino compagnon, des missions quotidiennes, 3 mini-jeux et un Dino-Dex.

**Architecture:** App Expo Router avec 4 onglets (Accueil, Mission, Jeux, Dino-Dex). État global géré par Zustand, persisté avec AsyncStorage. Pas de backend — tout local. Animations via Reanimated 3.

**Tech Stack:** React Native, Expo SDK 52, Expo Router, Zustand, AsyncStorage, Reanimated 3, Expo Notifications, Expo AV, Expo Haptics, Jest + React Native Testing Library.

**Répertoire projet:** `~/Documents/dinofocus`

---

## Structure des fichiers

```
dinofocus/
├── app/
│   ├── _layout.tsx                 # Root layout + tab navigator
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Tab bar config
│   │   ├── index.tsx               # Écran Accueil
│   │   ├── mission.tsx             # Écran Mission
│   │   ├── games.tsx               # Écran Mini-Jeux
│   │   └── dinodex.tsx             # Écran Dino-Dex
│   └── parent.tsx                  # Mode Parent (modal)
├── src/
│   ├── data/
│   │   ├── dinos.ts                # 20 dinos avec stats/rareté
│   │   ├── missions.ts             # Missions par défaut
│   │   └── badges.ts               # Définitions badges
│   ├── store/
│   │   ├── gameStore.ts            # État principal (XP, niveau, dino actif)
│   │   ├── missionStore.ts         # Missions du jour
│   │   └── parentStore.ts          # Config parent (PIN, durée session)
│   ├── hooks/
│   │   ├── useSessionTimer.ts      # Timer anti-hyperfocus
│   │   ├── useHaptics.ts           # Vibrations helper
│   │   └── useDinoMood.ts          # Calcul humeur dino
│   ├── components/
│   │   ├── DinoCompanion.tsx       # Dino animé central
│   │   ├── XPBar.tsx               # Barre XP animée
│   │   ├── MissionCard.tsx         # Carte mission unique
│   │   ├── Confetti.tsx            # Animation confettis
│   │   └── PinModal.tsx            # Saisie PIN parent
│   ├── games/
│   │   ├── MemoryGame.tsx          # Mémoire Dino
│   │   ├── EggHuntGame.tsx         # Chasse aux Œufs
│   │   └── PuzzleGame.tsx          # Puzzle Fossile
│   └── utils/
│       ├── storage.ts              # AsyncStorage helpers
│       ├── notifications.ts        # Setup notifications push
│       └── progression.ts          # Calculs XP/niveau/déblocage
├── assets/
│   └── sounds/                     # Sons (tap, victoire, level-up)
└── __tests__/
    ├── progression.test.ts
    ├── missionStore.test.ts
    ├── gameStore.test.ts
    └── components/
        ├── XPBar.test.tsx
        └── MissionCard.test.tsx
```

---

## Task 1 : Scaffold du projet Expo

**Files:**
- Create: `~/Documents/dinofocus/` (projet Expo)
- Create: `src/` structure complète

- [ ] **Step 1 : Créer le projet Expo**

```bash
cd ~/Documents
npx create-expo-app dinofocus --template blank-typescript
cd dinofocus
```

Expected output: `✅ Your project is ready!`

- [ ] **Step 2 : Installer les dépendances**

```bash
npx expo install expo-router expo-notifications expo-av expo-haptics @react-native-async-storage/async-storage react-native-reanimated
npm install zustand
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native @types/jest jest-expo
```

- [ ] **Step 3 : Configurer app.json pour Expo Router**

Remplacer le contenu de `app.json` :

```json
{
  "expo": {
    "name": "DinoFocus",
    "slug": "dinofocus",
    "version": "1.0.0",
    "scheme": "dinofocus",
    "web": { "bundler": "metro" },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#2d8a55"
        }
      ]
    ],
    "android": { "adaptiveIcon": { "foregroundImage": "./assets/images/adaptive-icon.png" } },
    "ios": { "supportsTablet": true }
  }
}
```

- [ ] **Step 4 : Configurer Jest dans package.json**

Ajouter dans `package.json` :

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/jest-native/extend-expect"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

- [ ] **Step 5 : Créer la structure src/**

```bash
mkdir -p src/data src/store src/hooks src/components src/games src/utils __tests__/components
```

- [ ] **Step 6 : Vérifier que le projet démarre**

```bash
npx expo start
```

Expected: QR code affiché, pas d'erreur de compilation.

- [ ] **Step 7 : Commit**

```bash
git add -A
git commit -m "feat: scaffold Expo project with dependencies"
```

---

## Task 2 : Données — Dinos, Missions, Badges

**Files:**
- Create: `src/data/dinos.ts`
- Create: `src/data/missions.ts`
- Create: `src/data/badges.ts`

- [ ] **Step 1 : Créer src/data/dinos.ts**

```typescript
export type DinoRarity = 'common' | 'rare' | 'legendary';

export interface Dino {
  id: string;
  name: string;
  emoji: string;
  rarity: DinoRarity;
  xpRequired: number;
  funFact: string;
}

export const DINOS: Dino[] = [
  { id: 'rex', name: 'T-Rex', emoji: '🦖', rarity: 'common', xpRequired: 0, funFact: 'Le T-Rex avait des bras minuscules mais une mâchoire ultra-puissante !' },
  { id: 'bronto', name: 'Brontosaure', emoji: '🦕', rarity: 'common', xpRequired: 100, funFact: 'Le Brontosaure pouvait peser autant que 4 éléphants !' },
  { id: 'tricera', name: 'Tricératops', emoji: '🦏', rarity: 'common', xpRequired: 200, funFact: 'Les 3 cornes du Tricératops pouvaient mesurer 1 mètre !' },
  { id: 'ptero', name: 'Ptérosaure', emoji: '🦅', rarity: 'common', xpRequired: 350, funFact: 'Le Ptérosaure n\'était pas un dinosaure, mais un reptile volant !' },
  { id: 'stego', name: 'Stégosaure', emoji: '🦎', rarity: 'rare', xpRequired: 500, funFact: 'Le cerveau du Stégosaure était aussi petit qu\'une balle de golf !' },
  { id: 'ankylo', name: 'Ankylosaure', emoji: '🐢', rarity: 'rare', xpRequired: 700, funFact: 'L\'Ankylosaure avait une armure si dure qu\'elle pouvait briser des os !' },
  { id: 'raptor', name: 'Vélociraptor', emoji: '🐦', rarity: 'rare', xpRequired: 900, funFact: 'Les Vélociraptors chassaient en groupe comme des loups !' },
  { id: 'spino', name: 'Spinosaure', emoji: '🐊', rarity: 'rare', xpRequired: 1200, funFact: 'Le Spinosaure était plus grand que le T-Rex et adorait nager !' },
  { id: 'diplo', name: 'Diplodocus', emoji: '🐍', rarity: 'rare', xpRequired: 1500, funFact: 'Le cou du Diplodocus mesurait 8 mètres — comme un bus !' },
  { id: 'para', name: 'Parasaurolophus', emoji: '🎺', rarity: 'rare', xpRequired: 1800, funFact: 'Le Parasaurolophus faisait des sons avec sa crête comme une trompette !' },
  { id: 'iguano', name: 'Iguanodon', emoji: '👍', rarity: 'common', xpRequired: 250, funFact: 'L\'Iguanodon avait un pouce en forme de pique pour se défendre !' },
  { id: 'compso', name: 'Compsognathus', emoji: '🐓', rarity: 'common', xpRequired: 150, funFact: 'Le Compsognathus était aussi petit qu\'un poulet !' },
  { id: 'pachycephalo', name: 'Pachycéphalosaurus', emoji: '🪖', rarity: 'rare', xpRequired: 1100, funFact: 'Ce dino se battait en fonçant tête baissée comme un bélier !' },
  { id: 'carno', name: 'Carnotaurus', emoji: '🐂', rarity: 'rare', xpRequired: 1400, funFact: 'Le Carnotaurus avait de vraies cornes et courait à 50 km/h !' },
  { id: 'bary', name: 'Baryonyx', emoji: '🎣', rarity: 'rare', xpRequired: 1600, funFact: 'Le Baryonyx pêchait le poisson avec ses grandes griffes !' },
  { id: 'theri', name: 'Therizinosaurus', emoji: '🦅', rarity: 'legendary', xpRequired: 2000, funFact: 'Ses griffes de 70 cm sont les plus longues de tout le règne animal !' },
  { id: 'argento', name: 'Argentinosaurus', emoji: '🏔️', rarity: 'legendary', xpRequired: 2500, funFact: 'L\'Argentinosaurus est le plus grand animal ayant jamais marché sur Terre !' },
  { id: 'draco', name: 'Dracorex', emoji: '🐉', rarity: 'legendary', xpRequired: 3000, funFact: 'Son nom signifie "roi dragon" — il ressemblait vraiment à un dragon !' },
  { id: 'microraptor', name: 'Microraptor', emoji: '🦋', rarity: 'legendary', xpRequired: 3500, funFact: 'Le Microraptor avait 4 ailes et pouvait planer entre les arbres !' },
  { id: 'yutyrannus', name: 'Yutyrannus', emoji: '❄️', rarity: 'legendary', xpRequired: 4000, funFact: 'Le Yutyrannus était un T-Rex géant… couvert de plumes !' },
];
```

- [ ] **Step 2 : Créer src/data/missions.ts**

```typescript
export type MissionType = 'real' | 'ingame';
export type MissionCategory = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Mission {
  id: string;
  type: MissionType;
  category: MissionCategory;
  dinoTitle: string;
  dinoDescription: string;
  realTitle?: string;
  icon: string;
  xpReward: number;
  isCustom?: boolean;
}

export const DEFAULT_MISSIONS: Mission[] = [
  { id: 'm1', type: 'real', category: 'morning', dinoTitle: 'Nourris ton dino !', dinoDescription: 'Rex a faim ! Brosse tes dents pour lui donner de l\'énergie.', realTitle: 'Se brosser les dents', icon: '🦷', xpReward: 40 },
  { id: 'm2', type: 'real', category: 'morning', dinoTitle: 'Prépare l\'armure !', dinoDescription: 'Ton dino a besoin que tu t\'habilles pour partir à l\'aventure.', realTitle: 'S\'habiller', icon: '👕', xpReward: 30 },
  { id: 'm3', type: 'real', category: 'afternoon', dinoTitle: 'Prépare le repaire !', dinoDescription: 'Un bon dresseur garde son repaire en ordre. Range ta chambre !', realTitle: 'Ranger sa chambre', icon: '🏠', xpReward: 50 },
  { id: 'm4', type: 'real', category: 'afternoon', dinoTitle: 'Entraînement cérébral !', dinoDescription: 'Les dinos les plus forts font leurs devoirs. À toi !', realTitle: 'Faire ses devoirs', icon: '📚', xpReward: 50 },
  { id: 'm5', type: 'real', category: 'evening', dinoTitle: 'Recharge les batteries !', dinoDescription: 'Ton dino se repose mieux quand tu vas au lit à l\'heure.', realTitle: 'Aller se coucher', icon: '🌙', xpReward: 40 },
  { id: 'm6', type: 'real', category: 'anytime', dinoTitle: 'Hydrate ton dino !', dinoDescription: 'Rex adore quand tu bois un grand verre d\'eau !', realTitle: 'Boire de l\'eau', icon: '💧', xpReward: 20 },
  { id: 'm7', type: 'ingame', category: 'anytime', dinoTitle: 'Entraîne ta mémoire !', dinoDescription: 'Joue au jeu de mémoire pour rendre ton dino plus intelligent.', icon: '🧠', xpReward: 25 },
  { id: 'm8', type: 'ingame', category: 'anytime', dinoTitle: 'Chasse aux œufs !', dinoDescription: 'Trouve les œufs cachés pour faire évoluer ton dino.', icon: '🥚', xpReward: 25 },
  { id: 'm9', type: 'ingame', category: 'anytime', dinoTitle: 'Assemble le fossile !', dinoDescription: 'Reconstitue le squelette mystère pour débloquer un nouveau dino.', icon: '🦴', xpReward: 30 },
  { id: 'm10', type: 'real', category: 'morning', dinoTitle: 'Ravitaille ton dino !', dinoDescription: 'Un bon petit-déjeuner donne de l\'énergie à Rex pour la journée.', realTitle: 'Prendre son petit-déjeuner', icon: '🍳', xpReward: 35 },
];
```

- [ ] **Step 3 : Créer src/data/badges.ts**

```typescript
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: { missionsCompleted: number; streak: number; gamesWon: number; totalXP: number }) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first_mission', title: 'Premier Pas', description: 'Complète ta première mission', icon: '⭐', condition: (s) => s.missionsCompleted >= 1 },
  { id: 'five_missions', title: 'Chasseur', description: 'Complète 5 missions', icon: '🎯', condition: (s) => s.missionsCompleted >= 5 },
  { id: 'streak_3', title: '3 Jours de Suite', description: 'Reviens 3 jours d\'affilée', icon: '🔥', condition: (s) => s.streak >= 3 },
  { id: 'streak_7', title: 'Une Semaine !', description: 'Reviens 7 jours d\'affilée', icon: '🌟', condition: (s) => s.streak >= 7 },
  { id: 'first_game', title: 'Joueur', description: 'Gagne ton premier mini-jeu', icon: '🎮', condition: (s) => s.gamesWon >= 1 },
  { id: 'ten_games', title: 'Champion', description: 'Gagne 10 mini-jeux', icon: '🏆', condition: (s) => s.gamesWon >= 10 },
  { id: 'xp_500', title: 'Explorateur', description: 'Atteins 500 XP', icon: '🗺️', condition: (s) => s.totalXP >= 500 },
  { id: 'xp_2000', title: 'Maître Dresseur', description: 'Atteins 2000 XP', icon: '👑', condition: (s) => s.totalXP >= 2000 },
];
```

- [ ] **Step 4 : Commit**

```bash
git add src/data/
git commit -m "feat: add dinos, missions and badges data"
```

---

## Task 3 : Utils — Progression & Storage

**Files:**
- Create: `src/utils/progression.ts`
- Create: `src/utils/storage.ts`
- Create: `__tests__/progression.test.ts`

- [ ] **Step 1 : Écrire les tests de progression d'abord**

```typescript
// __tests__/progression.test.ts
import { calculateLevel, xpForNextLevel, getUnlockedDinos } from '../src/utils/progression';
import { DINOS } from '../src/data/dinos';

describe('calculateLevel', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });
  it('reaches level 2 at 100 XP', () => {
    expect(calculateLevel(100)).toBe(2);
  });
  it('reaches level 3 at 300 XP (100 + 200)', () => {
    expect(calculateLevel(300)).toBe(3);
  });
  it('reaches level 4 at 650 XP (100 + 200 + 350)', () => {
    expect(calculateLevel(650)).toBe(4);
  });
});

describe('xpForNextLevel', () => {
  it('needs 100 XP to go from level 1 to 2', () => {
    expect(xpForNextLevel(1)).toBe(100);
  });
  it('needs 200 XP to go from level 2 to 3', () => {
    expect(xpForNextLevel(2)).toBe(200);
  });
});

describe('getUnlockedDinos', () => {
  it('only unlocks Rex at 0 XP', () => {
    const unlocked = getUnlockedDinos(0);
    expect(unlocked).toHaveLength(1);
    expect(unlocked[0].id).toBe('rex');
  });
  it('unlocks Brontosaure at 100 XP', () => {
    const unlocked = getUnlockedDinos(100);
    const ids = unlocked.map(d => d.id);
    expect(ids).toContain('bronto');
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
npx jest __tests__/progression.test.ts
```

Expected: FAIL — `Cannot find module '../src/utils/progression'`

- [ ] **Step 3 : Créer src/utils/progression.ts**

```typescript
import { DINOS, Dino } from '../data/dinos';

const XP_THRESHOLDS = [0, 100, 300, 650, 1100, 1700, 2500, 3500, 5000, 7000];

export function calculateLevel(totalXP: number): number {
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (totalXP >= XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function xpForNextLevel(currentLevel: number): number {
  const thresholds = [100, 200, 350, 450, 600, 800, 1000, 1500, 2000];
  return thresholds[currentLevel - 1] ?? 2000;
}

export function xpInCurrentLevel(totalXP: number): number {
  const level = calculateLevel(totalXP);
  const levelStart = XP_THRESHOLDS[level - 1] ?? 0;
  return totalXP - levelStart;
}

export function getUnlockedDinos(totalXP: number): Dino[] {
  return DINOS.filter(d => totalXP >= d.xpRequired);
}

export function getNewlyUnlockedDino(prevXP: number, newXP: number): Dino | null {
  const before = getUnlockedDinos(prevXP).map(d => d.id);
  const after = getUnlockedDinos(newXP);
  return after.find(d => !before.includes(d.id)) ?? null;
}
```

- [ ] **Step 4 : Relancer les tests**

```bash
npx jest __tests__/progression.test.ts
```

Expected: PASS (4 suites, toutes vertes)

- [ ] **Step 5 : Créer src/utils/storage.ts**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function saveData<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function clearData(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  GAME: 'dinofocus:game',
  MISSIONS: 'dinofocus:missions',
  PARENT: 'dinofocus:parent',
} as const;
```

- [ ] **Step 6 : Commit**

```bash
git add src/utils/ __tests__/progression.test.ts
git commit -m "feat: add progression utils and storage helpers (TDD)"
```

---

## Task 4 : Stores Zustand

**Files:**
- Create: `src/store/gameStore.ts`
- Create: `src/store/missionStore.ts`
- Create: `src/store/parentStore.ts`
- Create: `__tests__/gameStore.test.ts`
- Create: `__tests__/missionStore.test.ts`

- [ ] **Step 1 : Écrire les tests du gameStore**

```typescript
// __tests__/gameStore.test.ts
import { act, renderHook } from '@testing-library/react-native';
import { useGameStore } from '../src/store/gameStore';

beforeEach(() => {
  useGameStore.setState({
    totalXP: 0,
    activeDinoId: 'rex',
    dinoMood: 'happy',
    streak: 0,
    gamesWon: 0,
    lastOpenedAt: null,
    sessionStartedAt: null,
  });
});

describe('addXP', () => {
  it('increments totalXP', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addXP(50));
    expect(result.current.totalXP).toBe(50);
  });

  it('returns the new total', () => {
    const { result } = renderHook(() => useGameStore());
    let newTotal: number = 0;
    act(() => { newTotal = result.current.addXP(100); });
    expect(newTotal).toBe(100);
  });
});

describe('recordGameWin', () => {
  it('increments gamesWon', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.recordGameWin());
    expect(result.current.gamesWon).toBe(1);
  });
});
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

```bash
npx jest __tests__/gameStore.test.ts
```

Expected: FAIL

- [ ] **Step 3 : Créer src/store/gameStore.ts**

```typescript
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
```

- [ ] **Step 4 : Relancer les tests**

```bash
npx jest __tests__/gameStore.test.ts
```

Expected: PASS

- [ ] **Step 5 : Écrire les tests du missionStore**

```typescript
// __tests__/missionStore.test.ts
import { act, renderHook } from '@testing-library/react-native';
import { useMissionStore } from '../src/store/missionStore';

beforeEach(() => {
  useMissionStore.setState({
    dailyMissions: [],
    currentIndex: 0,
    completedToday: 0,
    lastResetDate: null,
  });
});

describe('completeMission', () => {
  it('increments completedToday', () => {
    const { result } = renderHook(() => useMissionStore());
    act(() => result.current.completeMission());
    expect(result.current.completedToday).toBe(1);
  });

  it('advances currentIndex', () => {
    const { result } = renderHook(() => useMissionStore());
    act(() => result.current.completeMission());
    expect(result.current.currentIndex).toBe(1);
  });
});
```

- [ ] **Step 6 : Créer src/store/missionStore.ts**

```typescript
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
```

- [ ] **Step 7 : Créer src/store/parentStore.ts**

```typescript
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
```

- [ ] **Step 8 : Lancer tous les tests**

```bash
npx jest __tests__/
```

Expected: PASS (toutes les suites vertes)

- [ ] **Step 9 : Commit**

```bash
git add src/store/ __tests__/
git commit -m "feat: add Zustand stores for game, missions and parent (TDD)"
```

---

## Task 5 : Hooks — SessionTimer, Haptics, DinoMood

**Files:**
- Create: `src/hooks/useSessionTimer.ts`
- Create: `src/hooks/useHaptics.ts`
- Create: `src/hooks/useDinoMood.ts`

- [ ] **Step 1 : Créer src/hooks/useSessionTimer.ts**

```typescript
import { useEffect, useRef, useState } from 'react';
import { useParentStore } from '../store/parentStore';
import { useGameStore } from '../store/gameStore';

export function useSessionTimer() {
  const sessionDurationMinutes = useParentStore(s => s.sessionDurationMinutes);
  const startSession = useGameStore(s => s.startSession);
  const [isResting, setIsResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(sessionDurationMinutes * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startSession();
    setSecondsLeft(sessionDurationMinutes * 60);
    setIsResting(false);

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsResting(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [sessionDurationMinutes]);

  const resumeSession = () => {
    setIsResting(false);
    setSecondsLeft(sessionDurationMinutes * 60);
    startSession();

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsResting(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return { isResting, secondsLeft, resumeSession };
}
```

- [ ] **Step 2 : Créer src/hooks/useHaptics.ts**

```typescript
import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  const error = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  const heavy = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  return { tap, success, error, heavy };
}
```

- [ ] **Step 3 : Créer src/hooks/useDinoMood.ts**

```typescript
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { DinoMood } from '../store/gameStore';

export function useDinoMood() {
  const { lastOpenedAt, setDinoMood, dinoMood } = useGameStore();

  useEffect(() => {
    if (!lastOpenedAt) return;
    const diffHours = (Date.now() - new Date(lastOpenedAt).getTime()) / 3600000;
    let mood: DinoMood;
    if (diffHours >= 24) mood = 'sad';
    else if (diffHours >= 8) mood = 'tired';
    else mood = 'happy';
    setDinoMood(mood);
  }, [lastOpenedAt]);

  return dinoMood;
}
```

- [ ] **Step 4 : Commit**

```bash
git add src/hooks/
git commit -m "feat: add session timer, haptics, and dino mood hooks"
```

---

## Task 6 : Composants partagés — DinoCompanion, XPBar, Confetti

**Files:**
- Create: `src/components/DinoCompanion.tsx`
- Create: `src/components/XPBar.tsx`
- Create: `src/components/Confetti.tsx`
- Create: `__tests__/components/XPBar.test.tsx`

- [ ] **Step 1 : Écrire le test XPBar**

```typescript
// __tests__/components/XPBar.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { XPBar } from '../../src/components/XPBar';

describe('XPBar', () => {
  it('renders level label', () => {
    const { getByText } = render(<XPBar totalXP={0} />);
    expect(getByText('Niveau 1')).toBeTruthy();
  });

  it('shows level 2 at 100 XP', () => {
    const { getByText } = render(<XPBar totalXP={100} />);
    expect(getByText('Niveau 2')).toBeTruthy();
  });
});
```

- [ ] **Step 2 : Créer src/components/XPBar.tsx**

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { calculateLevel, xpForNextLevel, xpInCurrentLevel } from '../utils/progression';

interface XPBarProps {
  totalXP: number;
}

export function XPBar({ totalXP }: XPBarProps) {
  const level = calculateLevel(totalXP);
  const needed = xpForNextLevel(level);
  const current = xpInCurrentLevel(totalXP);
  const ratio = Math.min(current / needed, 1);

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(ratio, { duration: 800 });
  }, [ratio]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.level}>Niveau {level}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
      <Text style={styles.xpText}>{current} / {needed} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  level: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  track: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#f9c74f', borderRadius: 6 },
  xpText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
});
```

- [ ] **Step 3 : Lancer le test**

```bash
npx jest __tests__/components/XPBar.test.tsx
```

Expected: PASS

- [ ] **Step 4 : Créer src/components/DinoCompanion.tsx**

```typescript
import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring
} from 'react-native-reanimated';
import { DinoMood } from '../store/gameStore';

interface DinoCompanionProps {
  mood: DinoMood;
  size?: number;
}

const MOOD_EMOJI: Record<DinoMood, string> = {
  happy: '🦖',
  energetic: '🦖',
  tired: '😴',
  sad: '🥺',
};

export function DinoCompanion({ mood, size = 80 }: DinoCompanionProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (mood === 'happy' || mood === 'energetic') {
      translateY.value = withRepeat(
        withSequence(withTiming(-10, { duration: 600 }), withTiming(0, { duration: 600 })),
        -1, true
      );
    } else if (mood === 'sad') {
      translateY.value = withTiming(6, { duration: 500 });
    } else {
      translateY.value = withTiming(0);
    }
  }, [mood]);

  const celebrate = () => {
    scale.value = withSequence(
      withSpring(1.3),
      withSpring(0.9),
      withSpring(1)
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.emoji, { fontSize: size }]} onPress={celebrate}>
        {MOOD_EMOJI[mood]}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  emoji: { textAlign: 'center' },
});
```

- [ ] **Step 5 : Créer src/components/Confetti.tsx**

```typescript
import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, Easing, runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORS = ['#f9c74f', '#f4a261', '#90be6d', '#43aa8b', '#577590', '#f8961e'];
const PIECES = 30;

interface ConfettiPiece {
  x: number;
  delay: number;
  color: string;
  size: number;
}

const pieces: ConfettiPiece[] = Array.from({ length: PIECES }, (_, i) => ({
  x: Math.random() * width,
  delay: Math.random() * 400,
  color: COLORS[i % COLORS.length],
  size: 8 + Math.random() * 8,
}));

interface ConfettiProps {
  visible: boolean;
  onDone?: () => void;
}

function ConfettiPieceComponent({ x, delay, color, size, visible, onDone }: ConfettiPiece & { visible: boolean; onDone?: () => void }) {
  const y = useSharedValue(-20);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      y.value = -20;
      opacity.value = 1;
      y.value = withDelay(delay, withTiming(height + 20, { duration: 1800, easing: Easing.in(Easing.quad) }));
      opacity.value = withDelay(delay + 1200, withTiming(0, { duration: 600 }, () => {
        if (onDone) runOnJS(onDone)();
      }));
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
    left: x,
    width: size,
    height: size,
    backgroundColor: color,
    position: 'absolute',
    borderRadius: 2,
  }));

  return <Animated.View style={style} />;
}

export function Confetti({ visible, onDone }: ConfettiProps) {
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <ConfettiPieceComponent key={i} {...p} visible={visible} onDone={i === 0 ? onDone : undefined} />
      ))}
    </View>
  );
}
```

- [ ] **Step 6 : Créer src/components/MissionCard.tsx**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mission } from '../data/missions';

interface MissionCardProps {
  mission: Mission;
  onComplete: () => void;
  completedToday: number;
  totalToday: number;
}

export function MissionCard({ mission, onComplete, completedToday, totalToday }: MissionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{mission.icon}</Text>
      <Text style={styles.title}>{mission.dinoTitle}</Text>
      <Text style={styles.description}>{mission.dinoDescription}</Text>
      <Text style={styles.xp}>+{mission.xpReward} XP</Text>
      <TouchableOpacity style={styles.button} onPress={onComplete} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Mission terminée ! 🎉</Text>
      </TouchableOpacity>
      <Text style={styles.progress}>{completedToday} / {totalToday} missions aujourd'hui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center', margin: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  icon: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  xp: { fontSize: 18, fontWeight: 'bold', color: '#f4a261', marginBottom: 20 },
  button: { backgroundColor: '#2d8a55', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  progress: { marginTop: 16, fontSize: 12, color: '#999' },
});
```

- [ ] **Step 7 : Créer src/components/PinModal.tsx**

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface PinModalProps {
  visible: boolean;
  onSubmit: (pin: string) => void;
  onClose: () => void;
  isSetup?: boolean;
}

export function PinModal({ visible, onSubmit, onClose, isSetup }: PinModalProps) {
  const [pin, setPin] = useState('');

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        onSubmit(next);
        setPin('');
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{isSetup ? 'Crée ton code parent' : 'Code parent'}</Text>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
            ))}
          </View>
          <View style={styles.grid}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.key, !k && styles.keyEmpty]}
                onPress={() => k === '⌫' ? handleDelete() : k ? handlePress(k) : null}
                disabled={!k}
              >
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  container: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: 300 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 24, color: '#1a1a2e' },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#2d8a55' },
  dotFilled: { backgroundColor: '#2d8a55' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 220, justifyContent: 'center', gap: 12 },
  key: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { backgroundColor: 'transparent' },
  keyText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  cancel: { marginTop: 16, color: '#999', fontSize: 14 },
});
```

- [ ] **Step 8 : Commit**

```bash
git add src/components/ __tests__/components/
git commit -m "feat: add DinoCompanion, XPBar, Confetti, MissionCard, PinModal components"
```

---

## Task 7 : Navigation — Layout racine + onglets

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`

- [ ] **Step 1 : Créer app/_layout.tsx**

```typescript
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useGameStore } from '../src/store/gameStore';
import { useMissionStore } from '../src/store/missionStore';
import { useParentStore } from '../src/store/parentStore';
import { scheduleInactivityNotification } from '../src/utils/notifications';

export default function RootLayout() {
  const loadGame = useGameStore(s => s.loadFromStorage);
  const loadMissions = useMissionStore(s => s.loadFromStorage);
  const loadParent = useParentStore(s => s.loadFromStorage);
  const recordAppOpen = useGameStore(s => s.recordAppOpen);

  useEffect(() => {
    (async () => {
      await loadGame();
      await loadMissions();
      await loadParent();
      recordAppOpen();
      scheduleInactivityNotification();
    })();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="parent" options={{ presentation: 'modal', title: 'Mode Parent 👨‍👩‍👧', headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />
    </Stack>
  );
}
```

- [ ] **Step 2 : Créer app/(tabs)/_layout.tsx**

```typescript
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0d1117', borderTopWidth: 0, height: 65, paddingBottom: 8 },
        tabBarActiveTintColor: '#f9c74f',
        tabBarInactiveTintColor: '#555',
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: () => <TabIcon emoji="🏠" /> }} />
      <Tabs.Screen name="mission" options={{ title: 'Mission', tabBarIcon: () => <TabIcon emoji="🎯" /> }} />
      <Tabs.Screen name="games" options={{ title: 'Jeux', tabBarIcon: () => <TabIcon emoji="🎮" /> }} />
      <Tabs.Screen name="dinodex" options={{ title: 'Dino-Dex', tabBarIcon: () => <TabIcon emoji="🦕" /> }} />
    </Tabs>
  );
}
```

- [ ] **Step 3 : Commit**

```bash
git add app/
git commit -m "feat: add root layout and tab navigation"
```

---

## Task 8 : Écran Accueil

**Files:**
- Create: `app/(tabs)/index.tsx`

- [ ] **Step 1 : Créer app/(tabs)/index.tsx**

```typescript
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../src/store/gameStore';
import { useMissionStore } from '../../src/store/missionStore';
import { DinoCompanion } from '../../src/components/DinoCompanion';
import { XPBar } from '../../src/components/XPBar';
import { PinModal } from '../../src/components/PinModal';
import { useParentStore } from '../../src/store/parentStore';
import { useDinoMood } from '../../src/hooks/useDinoMood';
import { useHaptics } from '../../src/hooks/useHaptics';

export default function HomeScreen() {
  const totalXP = useGameStore(s => s.totalXP);
  const { dailyMissions, currentIndex, completedToday } = useMissionStore();
  const { pin, unlock, isUnlocked } = useParentStore();
  const mood = useDinoMood();
  const { tap } = useHaptics();
  const [showPin, setShowPin] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentMission = dailyMissions[currentIndex];

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 1500);
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      setShowPin(true);
    }
  };

  const handlePinSubmit = (enteredPin: string) => {
    setShowPin(false);
    if (!pin) {
      useParentStore.getState().setPin(enteredPin);
      router.push('/parent');
    } else if (unlock(enteredPin)) {
      router.push('/parent');
    }
  };

  const MOOD_TEXT: Record<string, string> = {
    happy: '😊 Heureux',
    energetic: '⚡ Énergique',
    tired: '😴 Fatigué',
    sad: '😢 Tu me manques...',
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleLogoTap} style={styles.logoArea}>
        <Text style={styles.appName}>DinoFocus</Text>
      </TouchableOpacity>

      <View style={styles.dinoArea}>
        <DinoCompanion mood={mood} size={90} />
        <Text style={styles.moodBadge}>{MOOD_TEXT[mood]}</Text>
      </View>

      <XPBar totalXP={totalXP} />

      {currentMission && (
        <TouchableOpacity style={styles.missionPreview} onPress={() => { tap(); router.push('/mission'); }} activeOpacity={0.85}>
          <Text style={styles.missionIcon}>{currentMission.icon}</Text>
          <View style={styles.missionText}>
            <Text style={styles.missionLabel}>🎯 Mission du jour</Text>
            <Text style={styles.missionTitle} numberOfLines={1}>{currentMission.dinoTitle}</Text>
            <Text style={styles.missionProgress}>{completedToday} / {dailyMissions.length} complétées · +{currentMission.xpReward} XP</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      )}

      <PinModal
        visible={showPin}
        isSetup={!pin}
        onSubmit={handlePinSubmit}
        onClose={() => setShowPin(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d3b2e', alignItems: 'center' },
  logoArea: { paddingTop: 16, paddingBottom: 8 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#f9c74f', letterSpacing: 1 },
  dinoArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  moodBadge: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, color: '#fff', fontSize: 14 },
  missionPreview: { margin: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', width: '90%' },
  missionIcon: { fontSize: 36, marginRight: 12 },
  missionText: { flex: 1 },
  missionLabel: { color: '#a8e6cf', fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  missionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  missionProgress: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  arrow: { color: '#f9c74f', fontSize: 28, fontWeight: 'bold' },
});
```

- [ ] **Step 2 : Tester visuellement sur simulateur**

```bash
npx expo start
```

Vérifier : dino animé visible, barre XP, carte mission en bas.

- [ ] **Step 3 : Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: add home screen with dino companion and mission preview"
```

---

## Task 9 : Écran Mission

**Files:**
- Create: `app/(tabs)/mission.tsx`

- [ ] **Step 1 : Créer app/(tabs)/mission.tsx**

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useMissionStore } from '../../src/store/missionStore';
import { useGameStore } from '../../src/store/gameStore';
import { MissionCard } from '../../src/components/MissionCard';
import { Confetti } from '../../src/components/Confetti';
import { useHaptics } from '../../src/hooks/useHaptics';
import { getNewlyUnlockedDino } from '../../src/utils/progression';

export default function MissionScreen() {
  const { dailyMissions, currentIndex, completedToday, completeMission } = useMissionStore();
  const { totalXP, addXP, setDinoMood } = useGameStore();
  const { success } = useHaptics();
  const [showConfetti, setShowConfetti] = useState(false);
  const [unlockedDino, setUnlockedDino] = useState<string | null>(null);

  const currentMission = dailyMissions[currentIndex];
  const allDone = currentIndex >= dailyMissions.length;

  const handleComplete = () => {
    if (!currentMission) return;
    success();
    setShowConfetti(true);
    const newXP = addXP(currentMission.xpReward);
    const newly = getNewlyUnlockedDino(totalXP, newXP);
    if (newly) setUnlockedDino(newly.name);
    setDinoMood('happy');
    completeMission();
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎯 Missions</Text>

      {allDone ? (
        <View style={styles.allDone}>
          <Text style={styles.allDoneEmoji}>🎉</Text>
          <Text style={styles.allDoneTitle}>Toutes les missions terminées !</Text>
          <Text style={styles.allDoneSubtitle}>Reviens demain pour de nouvelles aventures.</Text>
        </View>
      ) : currentMission ? (
        <MissionCard
          mission={currentMission}
          onComplete={handleComplete}
          completedToday={completedToday}
          totalToday={dailyMissions.length}
        />
      ) : null}

      {unlockedDino && (
        <View style={styles.unlockBanner}>
          <Text style={styles.unlockText}>🦕 Nouveau dino débloqué : {unlockedDino} !</Text>
        </View>
      )}

      <Confetti visible={showConfetti} onDone={() => setShowConfetti(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff7ed' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', padding: 20, paddingBottom: 0 },
  allDone: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  allDoneEmoji: { fontSize: 80, marginBottom: 16 },
  allDoneTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 8 },
  allDoneSubtitle: { fontSize: 15, color: '#888', textAlign: 'center' },
  unlockBanner: { backgroundColor: '#f9c74f', padding: 12, borderRadius: 12, margin: 20, alignItems: 'center' },
  unlockText: { fontWeight: 'bold', color: '#1a1a2e', fontSize: 14 },
});
```

- [ ] **Step 2 : Tester visuellement**

Complète une mission → vérifie confettis + XP mis à jour sur l'écran Accueil.

- [ ] **Step 3 : Commit**

```bash
git add app/(tabs)/mission.tsx
git commit -m "feat: add mission screen with completion flow and confetti"
```

---

## Task 10 : Mini-Jeu — Mémoire Dino

**Files:**
- Create: `src/games/MemoryGame.tsx`

- [ ] **Step 1 : Créer src/games/MemoryGame.tsx**

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

const DINO_EMOJIS = ['🦖', '🦕', '🐊', '🦎', '🐢', '🦅', '🥚', '🦴'];

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean; }

function createCards(): Card[] {
  const pairs = [...DINO_EMOJIS, ...DINO_EMOJIS];
  return pairs.sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

interface MemoryGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function MemoryGame({ onWin, onQuit }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>(createCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const { tap, success, error } = useHaptics();

  const handleFlip = useCallback((id: number) => {
    if (selected.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    tap();
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected.map(sid => newCards.find(c => c.id === sid)!);
      if (a.emoji === b.emoji) {
        success();
        const matched = newCards.map(c => newSelected.includes(c.id) ? { ...c, matched: true } : c);
        setCards(matched);
        setSelected([]);
        if (matched.every(c => c.matched)) setTimeout(onWin, 500);
      } else {
        error();
        setTimeout(() => {
          setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 900);
      }
    }
  }, [cards, selected]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Mémoire Dino</Text>
      <Text style={styles.moves}>Tentatives : {moves}</Text>
      <View style={styles.grid}>
        {cards.map(card => (
          <TouchableOpacity key={card.id} style={[styles.card, (card.flipped || card.matched) && styles.cardFlipped]} onPress={() => handleFlip(card.id)} activeOpacity={0.8}>
            <Text style={styles.cardEmoji}>{card.flipped || card.matched ? card.emoji : '❓'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
        <Text style={styles.quitText}>Quitter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  moves: { fontSize: 14, color: '#888', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  card: { width: 72, height: 72, backgroundColor: '#3b82f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardFlipped: { backgroundColor: '#dbeafe' },
  cardEmoji: { fontSize: 32 },
  quitBtn: { marginTop: 24, padding: 12 },
  quitText: { color: '#888', fontSize: 14 },
});
```

- [ ] **Step 2 : Commit**

```bash
git add src/games/MemoryGame.tsx
git commit -m "feat: add Memory Dino mini-game"
```

---

## Task 11 : Mini-Jeu — Chasse aux Œufs

**Files:**
- Create: `src/games/EggHuntGame.tsx`

- [ ] **Step 1 : Créer src/games/EggHuntGame.tsx**

```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useHaptics } from '../hooks/useHaptics';

const { width, height } = Dimensions.get('window');
const GAME_DURATION = 30;
const EGG_LIFETIME = 1500;

interface Egg { id: number; x: number; y: number; }

interface EggHuntGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function EggHuntGame({ onWin, onQuit }: EggHuntGameProps) {
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const eggIdRef = useRef(0);
  const { tap, success } = useHaptics();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); setGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const spawner = setInterval(() => {
      const id = eggIdRef.current++;
      const newEgg: Egg = { id, x: 40 + Math.random() * (width - 120), y: 120 + Math.random() * (height - 300) };
      setEggs(prev => [...prev, newEgg]);
      setTimeout(() => setEggs(prev => prev.filter(e => e.id !== id)), EGG_LIFETIME);
    }, 700);
    return () => clearInterval(spawner);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver && score >= 10) onWin();
  }, [gameOver]);

  const handleTap = (id: number) => {
    tap();
    setScore(s => s + 1);
    setEggs(prev => prev.filter(e => e.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.hud}>
        <Text style={styles.score}>🥚 {score}</Text>
        <Text style={styles.timer}>⏱️ {timeLeft}s</Text>
      </View>

      {eggs.map(egg => (
        <TouchableOpacity key={egg.id} style={[styles.egg, { left: egg.x, top: egg.y }]} onPress={() => handleTap(egg.id)} activeOpacity={0.7}>
          <Text style={styles.eggEmoji}>🥚</Text>
        </TouchableOpacity>
      ))}

      {gameOver && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>{score >= 10 ? '🎉 Bravo !' : '😅 Essaie encore !'}</Text>
          <Text style={styles.resultScore}>Tu as attrapé {score} œufs !</Text>
          {score < 10 && <TouchableOpacity style={styles.retryBtn} onPress={() => { setScore(0); setTimeLeft(GAME_DURATION); setGameOver(false); setEggs([]); }}><Text style={styles.retryText}>Rejouer</Text></TouchableOpacity>}
        </View>
      )}

      <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
        <Text style={styles.quitText}>Quitter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  hud: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  score: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  timer: { fontSize: 22, fontWeight: 'bold', color: '#ef4444' },
  egg: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  eggEmoji: { fontSize: 44 },
  result: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  resultScore: { fontSize: 18, color: '#555', marginBottom: 24 },
  retryBtn: { backgroundColor: '#2d8a55', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 16 },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  quitBtn: { position: 'absolute', bottom: 30, alignSelf: 'center' },
  quitText: { color: '#888', fontSize: 14 },
});
```

- [ ] **Step 2 : Commit**

```bash
git add src/games/EggHuntGame.tsx
git commit -m "feat: add Egg Hunt mini-game"
```

---

## Task 12 : Mini-Jeu — Puzzle Fossile

**Files:**
- Create: `src/games/PuzzleGame.tsx`

- [ ] **Step 1 : Créer src/games/PuzzleGame.tsx**

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

const PUZZLES = [
  { question: 'Quel dino avait une crête pour faire de la musique ?', options: ['T-Rex', 'Parasaurolophus', 'Stégosaure', 'Raptor'], answer: 'Parasaurolophus', emoji: '🎺' },
  { question: 'Quel dino est le plus grand prédateur connu ?', options: ['Vélociraptor', 'T-Rex', 'Spinosaure', 'Carnotaurus'], answer: 'Spinosaure', emoji: '🐊' },
  { question: 'Quel dino avait des plaques osseuses sur le dos ?', options: ['Tricératops', 'Ankylosaure', 'Stégosaure', 'Diplodocus'], answer: 'Stégosaure', emoji: '🦎' },
  { question: 'Combien de cornes avait le Tricératops ?', options: ['1', '2', '3', '4'], answer: '3', emoji: '🦏' },
  { question: 'Quel dino volait dans les airs ?', options: ['Compsognathus', 'Ptérosaure', 'Vélociraptor', 'Iguanodon'], answer: 'Ptérosaure', emoji: '🦅' },
];

interface PuzzleGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function PuzzleGame({ onWin, onQuit }: PuzzleGameProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { tap, success, error } = useHaptics();

  const puzzle = PUZZLES[index];

  const handleAnswer = useCallback((option: string) => {
    if (selected) return;
    tap();
    setSelected(option);
    const correct = option === puzzle.answer;
    if (correct) { success(); setScore(s => s + 1); }
    else error();

    setTimeout(() => {
      if (index + 1 >= PUZZLES.length) {
        setDone(true);
        if (score + (correct ? 1 : 0) >= 3) onWin();
      } else {
        setIndex(i => i + 1);
        setSelected(null);
      }
    }, 1000);
  }, [index, selected, score, puzzle]);

  if (done) {
    return (
      <View style={styles.result}>
        <Text style={styles.resultEmoji}>{score >= 3 ? '🏆' : '📚'}</Text>
        <Text style={styles.resultTitle}>{score >= 3 ? 'Bravo !' : 'Continue à apprendre !'}</Text>
        <Text style={styles.resultScore}>{score} / {PUZZLES.length} bonnes réponses</Text>
        <TouchableOpacity style={styles.quitBtn} onPress={onQuit}><Text style={styles.quitText}>Retour</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>{index + 1} / {PUZZLES.length}</Text>
      <Text style={styles.emoji}>{puzzle.emoji}</Text>
      <Text style={styles.question}>{puzzle.question}</Text>
      <View style={styles.options}>
        {puzzle.options.map(option => {
          const isSelected = selected === option;
          const isCorrect = option === puzzle.answer;
          let bg = '#fff';
          if (isSelected) bg = isCorrect ? '#dcfce7' : '#fee2e2';
          else if (selected && isCorrect) bg = '#dcfce7';
          return (
            <TouchableOpacity key={option} style={[styles.option, { backgroundColor: bg }]} onPress={() => handleAnswer(option)} activeOpacity={0.8}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
        <Text style={styles.quitText}>Quitter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff', padding: 20, alignItems: 'center' },
  progress: { color: '#888', fontSize: 13, marginBottom: 12 },
  emoji: { fontSize: 64, marginBottom: 16 },
  question: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 28, lineHeight: 28 },
  options: { width: '100%', gap: 12 },
  option: { padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  optionText: { fontSize: 16, color: '#1a1a2e', fontWeight: '500' },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  resultScore: { fontSize: 16, color: '#555', marginBottom: 24 },
  quitBtn: { marginTop: 20 },
  quitText: { color: '#888', fontSize: 14 },
});
```

- [ ] **Step 2 : Commit**

```bash
git add src/games/PuzzleGame.tsx
git commit -m "feat: add Fossil Puzzle mini-game"
```

---

## Task 13 : Écran Mini-Jeux

**Files:**
- Create: `app/(tabs)/games.tsx`

- [ ] **Step 1 : Créer app/(tabs)/games.tsx**

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import { useSessionTimer } from '../../src/hooks/useSessionTimer';
import { MemoryGame } from '../../src/games/MemoryGame';
import { EggHuntGame } from '../../src/games/EggHuntGame';
import { PuzzleGame } from '../../src/games/PuzzleGame';
import { Confetti } from '../../src/components/Confetti';
import { useHaptics } from '../../src/hooks/useHaptics';

type ActiveGame = 'memory' | 'eggs' | 'puzzle' | null;

const GAMES = [
  { id: 'memory' as ActiveGame, title: 'Mémoire Dino', description: 'Retrouve les paires !', emoji: '🧠', xp: 25, color: '#3b82f6' },
  { id: 'eggs' as ActiveGame, title: 'Chasse aux Œufs', description: 'Attrape les œufs !', emoji: '🥚', xp: 30, color: '#22c55e' },
  { id: 'puzzle' as ActiveGame, title: 'Puzzle Fossile', description: 'Réponds aux questions !', emoji: '🦴', xp: 35, color: '#a855f7' },
];

export default function GamesScreen() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { addXP, recordGameWin, setDinoMood } = useGameStore();
  const { isResting, resumeSession } = useSessionTimer();
  const { success } = useHaptics();

  const handleWin = (xp: number) => {
    success();
    addXP(xp);
    recordGameWin();
    setDinoMood('energetic');
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setActiveGame(null); }, 2500);
  };

  if (isResting) {
    return (
      <SafeAreaView style={styles.restContainer}>
        <Text style={styles.restEmoji}>😴</Text>
        <Text style={styles.restTitle}>Rex se repose...</Text>
        <Text style={styles.restSub}>Tu as bien joué ! Reviens dans un moment.</Text>
        <TouchableOpacity style={styles.resumeBtn} onPress={resumeSession}>
          <Text style={styles.resumeText}>Continuer quand même</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (activeGame === 'memory') return <><MemoryGame onWin={() => handleWin(25)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;
  if (activeGame === 'eggs') return <><EggHuntGame onWin={() => handleWin(30)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;
  if (activeGame === 'puzzle') return <><PuzzleGame onWin={() => handleWin(35)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎮 Mini-Jeux</Text>
      <Text style={styles.sub}>Entraîne ton dino en jouant !</Text>
      <View style={styles.list}>
        {GAMES.map(game => (
          <TouchableOpacity key={game.id} style={[styles.gameCard, { backgroundColor: game.color }]} onPress={() => setActiveGame(game.id)} activeOpacity={0.85}>
            <Text style={styles.gameEmoji}>{game.emoji}</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDesc}>{game.description}</Text>
            </View>
            <Text style={styles.gameXP}>+{game.xp} XP</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  restContainer: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', padding: 40 },
  restEmoji: { fontSize: 80, marginBottom: 16 },
  restTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  restSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 },
  resumeBtn: { backgroundColor: '#2d8a55', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 16 },
  resumeText: { color: '#fff', fontWeight: 'bold' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', padding: 20, paddingBottom: 4 },
  sub: { fontSize: 14, color: '#888', paddingHorizontal: 20, marginBottom: 16 },
  list: { padding: 16, gap: 14 },
  gameCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  gameEmoji: { fontSize: 44, marginRight: 14 },
  gameInfo: { flex: 1 },
  gameTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  gameDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  gameXP: { fontSize: 16, fontWeight: 'bold', color: '#fff', backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
});
```

- [ ] **Step 2 : Commit**

```bash
git add app/(tabs)/games.tsx
git commit -m "feat: add games screen with session timer and 3 mini-games"
```

---

## Task 14 : Écran Dino-Dex

**Files:**
- Create: `app/(tabs)/dinodex.tsx`

- [ ] **Step 1 : Créer app/(tabs)/dinodex.tsx**

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Modal } from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import { DINOS, Dino, DinoRarity } from '../../src/data/dinos';
import { BADGES } from '../../src/data/badges';
import { getUnlockedDinos } from '../../src/utils/progression';

const RARITY_COLOR: Record<DinoRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  legendary: '#f59e0b',
};

export default function DinoDexScreen() {
  const { totalXP, gamesWon, streak } = useGameStore();
  const { completedToday } = require('../../src/store/missionStore').useMissionStore();
  const unlocked = getUnlockedDinos(totalXP);
  const unlockedIds = new Set(unlocked.map(d => d.id));
  const [selectedDino, setSelectedDino] = useState<Dino | null>(null);

  const stats = { missionsCompleted: completedToday, streak, gamesWon, totalXP };
  const earnedBadges = BADGES.filter(b => b.condition(stats));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🦕 Dino-Dex</Text>
      <Text style={styles.sub}>{unlocked.length} / {DINOS.length} dinos débloqués</Text>

      <FlatList
        data={DINOS}
        numColumns={4}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          earnedBadges.length > 0 ? (
            <View style={styles.badges}>
              <Text style={styles.badgesTitle}>Badges</Text>
              <View style={styles.badgeRow}>
                {earnedBadges.map(b => (
                  <View key={b.id} style={styles.badge}>
                    <Text style={styles.badgeIcon}>{b.icon}</Text>
                    <Text style={styles.badgeLabel}>{b.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isUnlocked = unlockedIds.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.dinoCell, !isUnlocked && styles.dinoCellLocked]}
              onPress={() => isUnlocked && setSelectedDino(item)}
              activeOpacity={isUnlocked ? 0.8 : 1}
            >
              <Text style={[styles.dinoEmoji, !isUnlocked && styles.locked]}>
                {isUnlocked ? item.emoji : '❓'}
              </Text>
              {isUnlocked && (
                <View style={[styles.rarityDot, { backgroundColor: RARITY_COLOR[item.rarity] }]} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!selectedDino} transparent animationType="slide" onRequestClose={() => setSelectedDino(null)}>
        {selectedDino && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>{selectedDino.emoji}</Text>
              <Text style={styles.modalName}>{selectedDino.name}</Text>
              <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLOR[selectedDino.rarity] }]}>
                <Text style={styles.rarityText}>{selectedDino.rarity === 'common' ? 'Commun' : selectedDino.rarity === 'rare' ? 'Rare' : 'Légendaire'}</Text>
              </View>
              <Text style={styles.funFact}>"{selectedDino.funFact}"</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDino(null)}>
                <Text style={styles.closeBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf4ff' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', padding: 20, paddingBottom: 4 },
  sub: { fontSize: 13, color: '#888', paddingHorizontal: 20, marginBottom: 8 },
  grid: { padding: 12 },
  dinoCell: { flex: 1, aspectRatio: 1, margin: 5, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  dinoCellLocked: { backgroundColor: '#f3f4f6' },
  dinoEmoji: { fontSize: 32 },
  locked: { opacity: 0.5 },
  rarityDot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', bottom: 6, right: 6 },
  badges: { marginBottom: 16 },
  badgesTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: '#fff', borderRadius: 12, padding: 8, alignItems: 'center', minWidth: 64 },
  badgeIcon: { fontSize: 20 },
  badgeLabel: { fontSize: 10, color: '#555', marginTop: 2, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center', width: '100%', paddingBottom: 48 },
  modalEmoji: { fontSize: 80, marginBottom: 12 },
  modalName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  rarityBadge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 14, marginBottom: 16 },
  rarityText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  funFact: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, fontStyle: 'italic', marginBottom: 24 },
  closeBtn: { backgroundColor: '#1a1a2e', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 32 },
  closeBtnText: { color: '#fff', fontWeight: 'bold' },
});
```

- [ ] **Step 2 : Commit**

```bash
git add app/(tabs)/dinodex.tsx
git commit -m "feat: add Dino-Dex screen with collection and badges"
```

---

## Task 15 : Mode Parent

**Files:**
- Create: `app/parent.tsx`
- Create: `src/utils/notifications.ts`

- [ ] **Step 1 : Créer src/utils/notifications.ts**

```typescript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleInactivityNotification(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rex a besoin de toi ! 🦖',
      body: 'Ton dinosaure est triste sans toi. Viens jouer !',
      sound: true,
    },
    trigger: { seconds: 86400, repeats: false },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

- [ ] **Step 2 : Créer app/parent.tsx**

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useParentStore } from '../src/store/parentStore';
import { useGameStore } from '../src/store/gameStore';
import { useMissionStore } from '../src/store/missionStore';
import { DEFAULT_MISSIONS, Mission } from '../src/data/missions';
import { cancelAllNotifications, scheduleInactivityNotification } from '../src/utils/notifications';

export default function ParentScreen() {
  const { sessionDurationMinutes, setSessionDuration, notificationsEnabled, toggleNotifications, lock } = useParentStore();
  const { totalXP, streak, gamesWon } = useGameStore();
  const { completedToday, addCustomMission } = useMissionStore();

  const handleClose = () => { lock(); router.back(); };

  const handleToggleNotifications = async () => {
    toggleNotifications();
    if (notificationsEnabled) await cancelAllNotifications();
    else await scheduleInactivityNotification();
  };

  const handleAddMission = (mission: Mission) => {
    addCustomMission({ ...mission, id: `custom_${Date.now()}`, isCustom: true });
    Alert.alert('Mission ajoutée !', `"${mission.dinoTitle}" a été ajoutée aux missions du jour.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>📊 Statistiques</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>{totalXP}</Text><Text style={styles.statLabel}>XP total</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{completedToday}</Text><Text style={styles.statLabel}>Missions auj.</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{streak}</Text><Text style={styles.statLabel}>Jours de suite</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{gamesWon}</Text><Text style={styles.statLabel}>Jeux gagnés</Text></View>
        </View>

        <Text style={styles.section}>⏱️ Durée de session</Text>
        <View style={styles.durationRow}>
          {([5, 10, 15] as const).map(d => (
            <TouchableOpacity key={d} style={[styles.durationBtn, sessionDurationMinutes === d && styles.durationBtnActive]} onPress={() => setSessionDuration(d)}>
              <Text style={[styles.durationText, sessionDurationMinutes === d && styles.durationTextActive]}>{d} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>🔔 Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={handleToggleNotifications} trackColor={{ true: '#2d8a55' }} />
        </View>

        <Text style={styles.section}>➕ Ajouter une mission</Text>
        {DEFAULT_MISSIONS.filter(m => m.type === 'real').map(m => (
          <TouchableOpacity key={m.id} style={styles.missionRow} onPress={() => handleAddMission(m)}>
            <Text style={styles.missionIcon}>{m.icon}</Text>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{m.realTitle}</Text>
              <Text style={styles.missionSub}>{m.dinoTitle}</Text>
            </View>
            <Text style={styles.addBtn}>+</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>Fermer le mode parent</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  section: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', marginTop: 24, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  durationRow: { flexDirection: 'row', gap: 12 },
  durationBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, alignItems: 'center' },
  durationBtnActive: { backgroundColor: '#2d8a55' },
  durationText: { fontWeight: 'bold', color: '#555' },
  durationTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { fontSize: 15, color: '#1a1a2e' },
  missionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  missionIcon: { fontSize: 28, marginRight: 12 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a2e' },
  missionSub: { fontSize: 12, color: '#888' },
  addBtn: { fontSize: 24, color: '#2d8a55', fontWeight: 'bold', paddingHorizontal: 8 },
  closeBtn: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 32, marginBottom: 20 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
```

- [ ] **Step 3 : Commit**

```bash
git add app/parent.tsx src/utils/notifications.ts
git commit -m "feat: add parent mode with stats, session control and custom missions"
```

---

## Task 16 : Tests finaux & vérification complète

**Files:**
- Modify: `__tests__/progression.test.ts` (déjà complet)

- [ ] **Step 1 : Lancer tous les tests**

```bash
npx jest --coverage
```

Expected: Toutes les suites passent. Coverage > 60% sur `src/utils/progression.ts` et les stores.

- [ ] **Step 2 : Vérifier le build Expo**

```bash
npx expo export --platform android
```

Expected: Build sans erreur de TypeScript.

- [ ] **Step 3 : Test manuel golden path**

Sur simulateur ou appareil physique via `npx expo start` :

1. Premier lancement → dino Rex visible, niveau 1, 0 XP
2. Onglet Mission → mission affichée → taper "Mission terminée !" → confettis → XP augmenté
3. Onglet Jeux → jouer Mémoire → gagner → confettis → XP augmenté
4. Onglet Dino-Dex → Rex débloqué visible, autres en silhouette
5. Accueil → taper 5 fois sur "DinoFocus" → modal PIN → créer PIN → Mode Parent s'ouvre
6. Mode Parent → voir stats → changer durée session → fermer

- [ ] **Step 4 : Commit final**

```bash
git add -A
git commit -m "feat: DinoFocus v1 complete — TDAH children app with dino companion, missions, mini-games and parent mode"
```

---

## Récapitulatif des commandes de test

```bash
npx jest                          # tous les tests
npx jest --watch                  # mode watch
npx jest --coverage               # avec couverture
npx expo start                    # lancer en dev
npx expo export --platform android  # vérifier build
```
