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
