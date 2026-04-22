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
