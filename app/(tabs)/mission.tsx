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
