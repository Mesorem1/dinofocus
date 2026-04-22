import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Animated as RNAnimated,
} from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../src/store/gameStore';
import { useMissionStore } from '../../src/store/missionStore';
import { DinoCompanion } from '../../src/components/DinoCompanion';
import { XPBar } from '../../src/components/XPBar';
import { PinModal } from '../../src/components/PinModal';
import { useParentStore } from '../../src/store/parentStore';
import { useDinoMood } from '../../src/hooks/useDinoMood';
import { useHaptics } from '../../src/hooks/useHaptics';

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
  const { feedDino, petDino, restDino, updateTamaStats } = useGameStore();
  const { dailyMissions, currentIndex, completedToday } = useMissionStore();
  const { pin, unlock } = useParentStore();
  const mood = useDinoMood();
  const { tap, success } = useHaptics();
  const [showPin, setShowPin] = useState(false);
  const [feedAnim, setFeedAnim] = useState('');
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh stats every 60s while app is open
  useEffect(() => {
    const interval = setInterval(() => updateTamaStats(), 60000);
    return () => clearInterval(interval);
  }, []);

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
    tap();
    feedDino();
    setFeedAnim('🍖');
    setTimeout(() => setFeedAnim(''), 1200);
  };

  const handlePet = () => {
    if (tama.happiness >= 100) return;
    tap();
    petDino();
    setFeedAnim('💖');
    setTimeout(() => setFeedAnim(''), 1200);
  };

  const handleRest = () => {
    if (tama.energy >= 100) return;
    tap();
    restDino();
    setFeedAnim('⭐');
    setTimeout(() => setFeedAnim(''), 1200);
  };

  const moodInfo = MOOD_TEXT[mood] ?? MOOD_TEXT.happy;
  const dinoName = 'Rex';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={handleLogoTap} style={styles.logoArea}>
        <Text style={styles.appName}>🦕 DinoFocus</Text>
      </TouchableOpacity>

      {/* Dino Stage */}
      <View style={styles.dinoStage}>
        {/* Floating action emoji */}
        {feedAnim !== '' && (
          <Text style={styles.feedAnim}>{feedAnim}</Text>
        )}

        <DinoCompanion
          mood={mood}
          size={100}
          hunger={tama.hunger}
          happiness={tama.happiness}
          energy={tama.energy}
        />

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
        <Text style={styles.statsTitle}>État de Rex</Text>
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
          onPress={() => { tap(); router.push('/mission'); }}
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
  logoArea: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  appName: { fontSize: 24, fontWeight: '900', color: '#f9c74f', letterSpacing: 1 },

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
  },
  missionIcon: { fontSize: 32, marginRight: 12 },
  missionText: { flex: 1 },
  missionLabel: { color: '#a8e6cf', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  missionTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  missionProgress: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
  arrow: { color: '#f9c74f', fontSize: 26, fontWeight: 'bold' },
});
