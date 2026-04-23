import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../src/store/gameStore';
import { useMissionStore } from '../../src/store/missionStore';
import { DinoCompanion } from '../../src/components/DinoCompanion';
import { XPBar } from '../../src/components/XPBar';
import { PinModal } from '../../src/components/PinModal';
import { LevelUpModal } from '../../src/components/LevelUpModal';
import { ChestModal } from '../../src/components/ChestModal';
import { WeeklyChallenges } from '../../src/components/WeeklyChallenges';
import { BedtimeLock } from '../../src/components/BedtimeLock';
import { useParentStore } from '../../src/store/parentStore';
import { useDinoMood } from '../../src/hooks/useDinoMood';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useSounds } from '../../src/hooks/useSounds';
import { useBackgroundMusic } from '../../src/hooks/useBackgroundMusic';
import { calculateLevel } from '../../src/utils/progression';

const MOOD_TEXT: Record<string, { text: string; color: string }> = {
  happy:     { text: '😊 Heureux',          color: '#a8e6cf' },
  energetic: { text: '⚡ Plein d\'énergie !', color: '#f9c74f' },
  tired:     { text: '😴 Fatigué...',        color: '#94a3b8' },
  sad:       { text: '😢 Je t\'attends...', color: '#fca5a5' },
};

export default function HomeScreen() {
  const totalXP               = useGameStore(s => s.totalXP);
  const tama                  = useGameStore(s => s.tama);
  const totalMissionsCompleted = useGameStore(s => s.totalMissionsCompleted);
  const chestCount            = useGameStore(s => s.chestCount);
  const { addXP, incrementChestCount } = useGameStore();

  const { dailyMissions, currentIndex, completedToday } = useMissionStore();
  const { pin, unlock, dinoName, musicEnabled, toggleMusic, bedtimeHour } = useParentStore();

  const mood = useDinoMood();
  const { tap } = useHaptics();
  const { playTap, playLevelUp, playChest, playRexHappy, playRexSad, playRexHungry, playRexTired } = useSounds();

  useBackgroundMusic();

  const [showPin, setShowPin]       = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel]     = useState(1);
  const [showChest, setShowChest]   = useState(false);

  const logoTapCount   = useRef(0);
  const logoTapTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLevelRef   = useRef(calculateLevel(totalXP));
  const prevMoodRef    = useRef(mood);
  const prevMissionsRef = useRef(totalMissionsCompleted);

  // Detect level-up
  useEffect(() => {
    const currentLevel = calculateLevel(totalXP);
    if (currentLevel > prevLevelRef.current) {
      prevLevelRef.current = currentLevel;
      setNewLevel(currentLevel);
      setShowLevelUp(true);
      playLevelUp();
    }
  }, [totalXP]);

  // Detect chest (every 5 missions)
  useEffect(() => {
    if (totalMissionsCompleted === 0) return;
    const missionsForChests = Math.floor(totalMissionsCompleted / 5);
    if (missionsForChests > chestCount) {
      incrementChestCount();
      setTimeout(() => { setShowChest(true); playChest(); }, showLevelUp ? 1500 : 400);
    }
    prevMissionsRef.current = totalMissionsCompleted;
  }, [totalMissionsCompleted]);

  // Rex voice — react to mood changes
  useEffect(() => {
    if (prevMoodRef.current === mood) return;
    prevMoodRef.current = mood;
    if (tama.hunger < 30)        playRexHungry();
    else if (tama.energy < 30)   playRexTired();
    else if (mood === 'happy' || mood === 'energetic') playRexHappy();
    else if (mood === 'sad')     playRexSad();
  }, [mood]);

  const handleRexTap = useCallback(() => {
    if (tama.hunger < 30)        playRexHungry();
    else if (tama.energy < 30)   playRexTired();
    else if (mood === 'sad')     playRexSad();
    else                         playRexHappy();
  }, [mood, tama.hunger, tama.energy]);

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 1500);
    if (logoTapCount.current >= 5) { logoTapCount.current = 0; setShowPin(true); }
  };

  const handlePinSubmit = (enteredPin: string) => {
    setShowPin(false);
    if (!pin) { useParentStore.getState().setPin(enteredPin); router.push('/parent'); }
    else if (unlock(enteredPin)) router.push('/parent');
  };

  const currentMission = dailyMissions[currentIndex];
  const moodInfo = MOOD_TEXT[mood] ?? MOOD_TEXT.happy;
  const isBedtime = bedtimeHour !== null && new Date().getHours() >= bedtimeHour;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleLogoTap} style={styles.logoArea}>
          <Text style={styles.appName}>🦕 DinoFocus</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { tap(); toggleMusic(); }} style={styles.musicBtn}>
          <Text style={styles.musicIcon}>{musicEnabled ? '🎵' : '🔇'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Dino Stage */}
        <View style={styles.dinoStage}>
          <TouchableOpacity onPress={handleRexTap} activeOpacity={0.9}>
            <DinoCompanion mood={mood} size={110} />
          </TouchableOpacity>
          <View style={styles.nameRow}>
            <Text style={styles.dinoName}>{dinoName ?? 'Rex'}</Text>
            <View style={[styles.moodPill, { backgroundColor: moodInfo.color + '33' }]}>
              <Text style={[styles.moodText, { color: moodInfo.color }]}>{moodInfo.text}</Text>
            </View>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpWrap}>
          <XPBar totalXP={totalXP} />
        </View>

        {/* Mission Preview */}
        {currentMission && (
          <TouchableOpacity
            style={styles.missionPreview}
            onPress={() => { tap(); playTap(); router.push('/mission'); }}
            activeOpacity={0.85}
          >
            <Text style={styles.missionIcon}>{currentMission.icon}</Text>
            <View style={styles.missionText}>
              <Text style={styles.missionLabel}>🎯 Mission du jour</Text>
              <Text style={styles.missionTitle} numberOfLines={1}>{currentMission.dinoTitle}</Text>
              <Text style={styles.missionProgress}>
                {completedToday} / {dailyMissions.length} complétées · +{currentMission.xpReward} XP
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Weekly Challenges */}
        <WeeklyChallenges />

      </ScrollView>

      {/* Bedtime lock */}
      {isBedtime && <BedtimeLock dinoName={dinoName ?? 'Rex'} />}

      {/* Modals */}
      <LevelUpModal visible={showLevelUp} level={newLevel} onClose={() => setShowLevelUp(false)} />
      <ChestModal visible={showChest} onClose={() => { setShowChest(false); addXP(20); }} />
      <PinModal visible={showPin} isSetup={!pin} onSubmit={handlePinSubmit} onClose={() => setShowPin(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0d3b2e' },
  scroll:     { paddingBottom: 32 },

  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  logoArea:   { flex: 1 },
  appName:    { fontSize: 24, fontWeight: '900', color: '#f9c74f', letterSpacing: 1 },
  musicBtn:   { padding: 8 },
  musicIcon:  { fontSize: 24 },

  dinoStage:  { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, minHeight: 180 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  dinoName:   { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  moodPill:   { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  moodText:   { fontSize: 12, fontWeight: '700' },

  xpWrap:     { paddingHorizontal: 16, marginBottom: 12 },

  missionPreview: { marginHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  missionIcon:    { fontSize: 32, marginRight: 12 },
  missionText:    { flex: 1 },
  missionLabel:   { color: '#a8e6cf', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  missionTitle:   { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  missionProgress:{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
  arrow:          { color: '#f9c74f', fontSize: 26, fontWeight: 'bold' },
});
