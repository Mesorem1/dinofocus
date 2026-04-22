import { Audio } from 'expo-av';
import { useRef, useCallback } from 'react';

// Sound registry — preloaded once
const SOUNDS = {
  feed:       require('../../assets/sounds/feed.wav'),
  pet:        require('../../assets/sounds/pet.wav'),
  rest:       require('../../assets/sounds/rest.wav'),
  win:        require('../../assets/sounds/win.wav'),
  tap:        require('../../assets/sounds/tap.wav'),
  error:      require('../../assets/sounds/error.wav'),
  game_start: require('../../assets/sounds/game_start.wav'),
  mission:    require('../../assets/sounds/mission.wav'),
} as const;

type SoundKey = keyof typeof SOUNDS;

// Cache loaded sounds
const soundCache: Partial<Record<SoundKey, Audio.Sound>> = {};

async function playSound(key: SoundKey, volume = 1.0): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    // Reuse cached sound or load new
    let sound = soundCache[key];
    if (!sound) {
      const { sound: loaded } = await Audio.Sound.createAsync(SOUNDS[key], { shouldPlay: false });
      soundCache[key] = loaded;
      sound = loaded;
    }

    await sound.setVolumeAsync(volume);
    await sound.replayAsync();
  } catch (e) {
    // Fail silently — sounds are optional
  }
}

export function useSounds() {
  const playFeed       = useCallback(() => playSound('feed',       0.8), []);
  const playPet        = useCallback(() => playSound('pet',        0.7), []);
  const playRest       = useCallback(() => playSound('rest',       0.6), []);
  const playWin        = useCallback(() => playSound('win',        0.9), []);
  const playTap        = useCallback(() => playSound('tap',        0.5), []);
  const playError      = useCallback(() => playSound('error',      0.7), []);
  const playGameStart  = useCallback(() => playSound('game_start', 0.8), []);
  const playMission    = useCallback(() => playSound('mission',    0.9), []);

  return { playFeed, playPet, playRest, playWin, playTap, playError, playGameStart, playMission };
}
