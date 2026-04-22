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
