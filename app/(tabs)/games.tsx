import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView,
} from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import { useSessionTimer } from '../../src/hooks/useSessionTimer';
import { MemoryGame } from '../../src/games/MemoryGame';
import { EggHuntGame } from '../../src/games/EggHuntGame';
import { PuzzleGame } from '../../src/games/PuzzleGame';
import { DinoRunnerGame } from '../../src/games/DinoRunnerGame';
import { ColorMatchGame } from '../../src/games/ColorMatchGame';
import { Confetti } from '../../src/components/Confetti';
import { useHaptics } from '../../src/hooks/useHaptics';

type ActiveGame = 'memory' | 'eggs' | 'puzzle' | 'runner' | 'colors' | null;

const GAMES: {
  id: ActiveGame;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  color: string;
  gradient: string;
  difficulty: string;
  diffColor: string;
}[] = [
  {
    id: 'memory',
    title: 'Mémoire Dino',
    description: 'Retrouve toutes les paires de cartes !',
    emoji: '🧠',
    xp: 25,
    color: '#3b82f6',
    gradient: '#2563eb',
    difficulty: 'Facile',
    diffColor: '#22c55e',
  },
  {
    id: 'eggs',
    title: 'Chasse aux Œufs',
    description: 'Attrape 10 œufs en 30 secondes !',
    emoji: '🥚',
    xp: 30,
    color: '#22c55e',
    gradient: '#16a34a',
    difficulty: 'Moyen',
    diffColor: '#f59e0b',
  },
  {
    id: 'puzzle',
    title: 'Puzzle Fossile',
    description: 'Réponds aux questions sur les dinos !',
    emoji: '🦴',
    xp: 35,
    color: '#a855f7',
    gradient: '#9333ea',
    difficulty: 'Moyen',
    diffColor: '#f59e0b',
  },
  {
    id: 'runner',
    title: 'Dino Runner',
    description: 'Saute par-dessus les obstacles !',
    emoji: '🦖',
    xp: 40,
    color: '#f59e0b',
    gradient: '#d97706',
    difficulty: 'Difficile',
    diffColor: '#ef4444',
  },
  {
    id: 'colors',
    title: 'Couleurs Folles',
    description: 'Trouve la vraie couleur du mot !',
    emoji: '🎨',
    xp: 40,
    color: '#ec4899',
    gradient: '#db2777',
    difficulty: 'Difficile',
    diffColor: '#ef4444',
  },
];

export default function GamesScreen() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const { addXP, recordGameWin, setDinoMood } = useGameStore();
  const { isResting, resumeSession } = useSessionTimer();
  const { success } = useHaptics();

  const handleWin = (xp: number) => {
    success();
    addXP(xp);
    recordGameWin();
    setDinoMood('energetic');
    setLastXP(xp);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setActiveGame(null);
    }, 2800);
  };

  if (isResting) {
    return (
      <SafeAreaView style={styles.restContainer}>
        <Text style={styles.restEmoji}>😴</Text>
        <Text style={styles.restTitle}>Rex se repose...</Text>
        <Text style={styles.restSub}>Tu as bien joué ! Reviens dans un moment.</Text>
        <TouchableOpacity style={styles.resumeBtn} onPress={resumeSession}>
          <Text style={styles.resumeText}>Continuer quand même</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (activeGame === 'memory') return <><MemoryGame onWin={() => handleWin(25)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;
  if (activeGame === 'eggs') return <><EggHuntGame onWin={() => handleWin(30)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;
  if (activeGame === 'puzzle') return <><PuzzleGame onWin={() => handleWin(35)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;
  if (activeGame === 'runner') return <><DinoRunnerGame onWin={() => handleWin(40)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;
  if (activeGame === 'colors') return <><ColorMatchGame onWin={() => handleWin(40)} onQuit={() => setActiveGame(null)} /><Confetti visible={showConfetti} /></>;

  const totalXP = GAMES.reduce((sum, g) => sum + g.xp, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.header}>🎮 Mini-Jeux</Text>
          <Text style={styles.sub}>Entraîne Rex en jouant !</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>Jusqu'à {totalXP} XP disponibles</Text>
          </View>
        </View>

        {/* Game Cards */}
        <View style={styles.list}>
          {GAMES.map((game, index) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => setActiveGame(game.id)}
              activeOpacity={0.9}
            >
              {/* Left color strip */}
              <View style={[styles.colorStrip, { backgroundColor: game.color }]} />

              {/* Emoji */}
              <View style={[styles.emojiBox, { backgroundColor: game.color + '22' }]}>
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
              </View>

              {/* Info */}
              <View style={styles.gameInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  {index >= 3 && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NOUVEAU</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.gameDesc}>{game.description}</Text>
                <View style={styles.metaRow}>
                  <View style={[styles.diffBadge, { backgroundColor: game.diffColor + '22' }]}>
                    <Text style={[styles.diffText, { color: game.diffColor }]}>{game.difficulty}</Text>
                  </View>
                  <Text style={[styles.gameXP, { color: game.color }]}>+{game.xp} XP</Text>
                </View>
              </View>

              {/* Arrow */}
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  restContainer: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', padding: 40 },
  restEmoji: { fontSize: 80, marginBottom: 16 },
  restTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  restSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 },
  resumeBtn: { backgroundColor: '#2d8a55', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 16 },
  resumeText: { color: '#fff', fontWeight: 'bold' },

  headerSection: { padding: 20, paddingBottom: 8 },
  header: { fontSize: 28, fontWeight: '900', color: '#1a1a2e', marginBottom: 4 },
  sub: { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
  xpBadge: { backgroundColor: '#fef9c3', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#fde047' },
  xpBadgeText: { color: '#854d0e', fontWeight: '700', fontSize: 12 },

  list: { padding: 16, gap: 14 },

  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  colorStrip: { width: 6, alignSelf: 'stretch' },
  emojiBox: { width: 70, height: 70, alignItems: 'center', justifyContent: 'center', margin: 12, borderRadius: 16 },
  gameEmoji: { fontSize: 38 },
  gameInfo: { flex: 1, paddingVertical: 14, paddingRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  gameTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a2e' },
  newBadge: { backgroundColor: '#fef08a', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  newBadgeText: { fontSize: 9, fontWeight: '900', color: '#854d0e', letterSpacing: 0.5 },
  gameDesc: { fontSize: 12, color: '#64748b', marginBottom: 8, lineHeight: 17 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffText: { fontSize: 11, fontWeight: '700' },
  gameXP: { fontSize: 13, fontWeight: '800' },
  arrow: { fontSize: 28, color: '#cbd5e1', paddingRight: 16, fontWeight: '300' },
});
