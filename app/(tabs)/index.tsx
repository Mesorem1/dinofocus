import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Animated as RNAnimated, ScrollView,
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
import { useWeeklyStore } from '../../src/store/weeklyStore';
import { calculateLevel } from '../../src/utils/progression';

// ── Stat Bar ──────────────────────────────────────────────────────────────────
interface StatBarProps {
  label: string;
  emoji: string;
  value: number;
  color: string;
}

function StatBar({ label, emoji, value, color }: StatBarProps) {
  const anim = useRef(new RNAnimated.Value(value)).current;

  useEffect(() => {
    RNAnimated.timing(anim, { toValue: value, duration: 600, useNativeDriver: false }).start();
  }, [value]);

  const widthPct = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const barColor = value < 25 ? '#ef4444' : value < 50 ? '#f59e0b' : color;

  return (
    <View style={sb.row}>
      <Text style={sb.emoji}>{emoji}</Text>
      <View style={sb.trackWrap}>
        <Text style={sb.label}>{label}</Text>
        <View style={sb.track}>
          <RNAnimated.View style={[sb.fill, { width: widthPct, backgroundColor: barColor }]} />
        </View>
      </View>
      <Text style={[sb.pct, { color: barColor }]}>{Math.round(value)}%</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  emoji: { fontSize: 18, width: 28, textAlign: 'center', marginRight: 8 },
  trackWrap: { flex: 1 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 3, fontWeight: '600', letterSpacing: 0.5 },
  track: { height: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
  pct: { width: 36, textAlign: 'right', fontSize: 11, fontWeight: '800', marginLeft: 8 },
});

// ── Action Button ─────────────────────────────────────────────────────────────
interface ActionBtnProps {
  emoji: string;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

function ActionBtn({ emoji, label, color, onPress, disabled }: ActionBtnProps) {
  return (
    <TouchableOpacity
      style={[ab.btn, { backgroundColor: color, opacity: disabled ? 0.4 : 1 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={ab.emoji}>{emoji}</Text>
      <Text style={ab.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const ab = StyleSheet.create({
  btn: { flex: 1, borderRadius: 18, paddingVertical: 14, alignItems: 'center', marginHorizontal: 4 },
  emoji: { fontSize: 28, marginBottom: 4 },
  label: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});

// ── Mood helpers ──────────────────────────────────────────────────────────────
const MOOD_TEXT: Record<string, { text: string; color: string }> = {
  happy: { text: '😊 Heureux', color: '#a8e6cf' },
  energetic: { text: '⚡ Plein d\'énergie !', color: '#f9c74f' },
  tired: { text: '😴 Fatigué...', color: '#94a3b8' },
  sad: { text: '😢 Je t\'attends...', color: '#fca5a5' },
};

// ── Home Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const totalXP = useGameStore(s => s.totalXP);
  const tama = useGameStore(s => s.tama);
  const totalMissionsCompleted = useGameStore(s => s.totalMissionsCompleted);
  const chestCount = useGameStore(s => s.chestCount);
  const { feedDino, petDino, restDino, updateTamaStats, addXP, incrementChestCount } = useGameStore();
  const { dailyMissions, currentIndex, completedToday } = useMissionStore();
  const { pin, unlock, dinoName, musicEnabled, toggleMusic, bedtimeHour } = useParentStore();
  const { updateProgress } = useWeeklyStore();
  const mood = useDinoMood();
  const { tap } = useHaptics();
  const sounds = useSounds();
  const {
    playFeed, playPet, playRest, playTap,
    playLevelUp, playChest,
    playRexHappy, playRexSad, playRexHungry, playRexTired,
  } = sounds;

  // Background music
  useBackgroundMusic();

  const [showPin, setShowPin] = useState(false);
  const [feedAnim, setFeedAnim] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [showChest, setShowChest] = useState(false);

  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLevelRef = useRef(calculateLevel(totalXP));
  const prevMoodRef = useRef(mood);
  const prevMissionsRef = useRef(totalMissionsCompleted);

  // Refresh stats every 60s while app is open
  useEffect(() => {
    const interval = setInterval(() => updateTamaStats(), 60000);
    return () => clearInterval(interval);
  }, []);

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
      // Small delay so level-up modal doesn't overlap
      setTimeout(() => {
        setShowChest(true);
        playChest();
      }, showLevelUp ? 1500 : 400);
    }
    prevMissionsRef.current = totalMissionsCompleted;
  }, [totalMissionsCompleted]);

  // Rex voice — react to mood changes
  useEffect(() => {
    if (prevMoodRef.current === mood) return;
    prevMoodRef.current = mood;
    if (tama.hunger < 30) {
      playRexHungry();
    } else if (tama.energy < 30) {
      playRexTired();
    } else if (mood === 'happy' || mood === 'energetic') {
      playRexHappy();
    } else if (mood === 'sad') {
      playRexSad();
    }
  }, [mood]);

  const handleRexTap = useCallback(() => {
    // Play Rex voice when user taps Rex
    if (tama.hunger < 30) {
      playRexHungry();
    } else if (tama.energy < 30) {
      playRexTired();
    } else if (mood === 'sad') {
      playRexSad();
    } else {
      playRexHappy();
    }
  }, [mood, tama.hunger, tama.energy]);

  const handleChestClose = () => {
    setShowChest(false);
    // Grant the +20 XP bonus
    addXP(20);
  };

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

  const handleFeed = () => {
    if (tama.hunger >= 100) return;
    tap(); playFeed();
    feedDino();
    updateProgress('feed_rex', 1);
    setFeedAnim('🍖');
    setTimeout(() => setFeedAnim(''), 1200);
  };

  const handlePet = () => {
    if (tama.happiness >= 100) return;
    tap(); playPet();
    petDino();
    setFeedAnim('💖');
    setTimeout(() => setFeedAnim(''), 1200);
  };

  const handleRest = () => {
    if (tama.energy >= 100) return;
    tap(); playRest();
    restDino();
    setFeedAnim('⭐');
    setTimeout(() => setFeedAnim(''), 1200);
  };

  const moodInfo = MOOD_TEXT[mood] ?? MOOD_TEXT.happy;

  // Bedtime lock check
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
          {feedAnim !== '' && (
            <Text style={styles.feedAnim}>{feedAnim}</Text>
          )}

          <TouchableOpacity onPress={handleRexTap} activeOpacity={0.9}>
            <DinoCompanion
              mood={mood}
              size={100}
              hunger={tama.hunger}
              happiness={tama.happiness}
              energy={tama.energy}
            />
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.dinoName}>{dinoName}</Text>
            <View style={[styles.moodPill, { backgroundColor: moodInfo.color + '33' }]}>
              <Text style={[styles.moodText, { color: moodInfo.color }]}>{moodInfo.text}</Text>
            </View>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpWrap}>
          <XPBar totalXP={totalXP} />
        </View>

        {/* Tamagotchi Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>État de {dinoName}</Text>
          <StatBar label="FAIM" emoji="🍖" value={tama.hunger} color="#22c55e" />
          <StatBar label="BONHEUR" emoji="😊" value={tama.happiness} color="#f59e0b" />
          <StatBar label="ÉNERGIE" emoji="⚡" value={tama.energy} color="#3b82f6" />
          <StatBar label="SANTÉ" emoji="❤️" value={tama.health} color="#ec4899" />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <ActionBtn
            emoji="🍖"
            label="Nourrir"
            color="#16a34a"
            onPress={handleFeed}
            disabled={tama.hunger >= 100}
          />
          <ActionBtn
            emoji="💖"
            label="Câlin"
            color="#db2777"
            onPress={handlePet}
            disabled={tama.happiness >= 100}
          />
          <ActionBtn
            emoji="💤"
            label="Dormir"
            color="#2563eb"
            onPress={handleRest}
            disabled={tama.energy >= 100}
          />
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

      {/* Bedtime Lock overlay */}
      {isBedtime && <BedtimeLock dinoName={dinoName} />}

      {/* Modals */}
      <LevelUpModal
        visible={showLevelUp}
        level={newLevel}
        onClose={() => setShowLevelUp(false)}
      />

      <ChestModal
        visible={showChest}
        onClose={handleChestClose}
      />

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
  container: { flex: 1, backgroundColor: '#0d3b2e' },
  scroll: { paddingBottom: 24 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  logoArea: { flex: 1, alignItems: 'flex-start' },
  appName: { fontSize: 24, fontWeight: '900', color: '#f9c74f', letterSpacing: 1 },
  musicBtn: { padding: 8 },
  musicIcon: { fontSize: 24 },

  dinoStage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: 150,
  },
  feedAnim: {
    position: 'absolute',
    top: -10,
    fontSize: 36,
    zIndex: 10,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  dinoName: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  moodPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  moodText: { fontSize: 12, fontWeight: '700' },

  xpWrap: { paddingHorizontal: 16, marginBottom: 8 },

  statsCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  statsTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
  },

  missionPreview: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionIcon: { fontSize: 32, marginRight: 12 },
  missionText: { flex: 1 },
  missionLabel: { color: '#a8e6cf', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  missionTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  missionProgress: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
  arrow: { color: '#f9c74f', fontSize: 26, fontWeight: 'bold' },
});
