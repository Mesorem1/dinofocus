import { useAudioPlayer } from 'expo-audio';
import { useCallback } from 'react';

// Preload all sound assets
const SOUND_ASSETS = {
  feed:       require('../../assets/sounds/feed.wav'),
  pet:        require('../../assets/sounds/pet.wav'),
  rest:       require('../../assets/sounds/rest.wav'),
  win:        require('../../assets/sounds/win.wav'),
  tap:        require('../../assets/sounds/tap.wav'),
  error:      require('../../assets/sounds/error.wav'),
  game_start: require('../../assets/sounds/game_start.wav'),
  mission:    require('../../assets/sounds/mission.wav'),
} as const;

type SoundKey = keyof typeof SOUND_ASSETS;

// Individual player hooks — each creates one persistent player
function useSoundPlayer(key: SoundKey, volume = 1.0) {
  const player = useAudioPlayer(SOUND_ASSETS[key]);
  return useCallback(() => {
    try {
      player.volume = volume;
      player.seekTo(0);
      player.play();
    } catch (_) {
      // Fail silently
    }
  }, [player, volume]);
}

export function useSounds() {
  const playFeed      = useSoundPlayer('feed',       0.8);
  const playPet       = useSoundPlayer('pet',        0.7);
  const playRest      = useSoundPlayer('rest',       0.6);
  const playWin       = useSoundPlayer('win',        0.9);
  const playTap       = useSoundPlayer('tap',        0.5);
  const playError     = useSoundPlayer('error',      0.7);
  const playGameStart = useSoundPlayer('game_start', 0.8);
  const playMission   = useSoundPlayer('mission',    0.9);

  return { playFeed, playPet, playRest, playWin, playTap, playError, playGameStart, playMission };
}
