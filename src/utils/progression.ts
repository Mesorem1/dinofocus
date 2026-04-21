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
