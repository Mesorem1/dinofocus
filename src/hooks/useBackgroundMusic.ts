import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { useParentStore } from '../store/parentStore';

const BG_MUSIC = require('../../assets/sounds/bgmusic.wav');

export function useBackgroundMusic() {
  const player = useAudioPlayer(BG_MUSIC);
  const musicEnabled = useParentStore(s => s.musicEnabled);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (musicEnabled) {
      try {
        player.loop = true;
        player.volume = 0.35;
        player.play();
        isPlayingRef.current = true;
      } catch (_) {
        // Fail silently
      }
    } else {
      try {
        player.pause();
        isPlayingRef.current = false;
      } catch (_) {
        // Fail silently
      }
    }
  }, [musicEnabled, player]);

  // Stop when unmounted (leaving home screen)
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (_) {
        // Fail silently
      }
    };
  }, [player]);
}
