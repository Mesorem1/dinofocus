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
