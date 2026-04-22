import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import { useSessionTimer } from '../../src/hooks/useSessionTimer';
import { MemoryGame } from '../../src/games/MemoryGame';
import { EggHuntGame } from '../../src/games/EggHuntGame';
import { PuzzleGame } from '../../src/games/PuzzleGame';
import { Confetti } from '../../src/components/Confetti';
import { useHaptics } from '../../src/hooks/useHaptics';

type ActiveGame = 'memory' | 'eggs' | 'puzzle' | null;

const GAMES = [
  { id: 'memory' as ActiveGame, title: 'Mémoire Dino', description: 'Retrouve les paires !', emoji: '🧠', xp: 25, color: '#3b82f6' },
  { id: 'eggs' as ActiveGame, title: 'Chasse aux Œufs', description: 'Attrape les œufs !', emoji: '🥚', xp: 30, color: '#22c55e' },
  { id: 'puzzle' as ActiveGame, title: 'Puzzle Fossile', description: 'Réponds aux questions !', emoji: '🦴', xp: 35, color: '#a855f7' },
];

export default function GamesScreen() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { addXP, recordGameWin, setDinoMood } = useGameStore();
  const { isResting, resumeSession } = useSessionTimer();
  const { success } = useHaptics();

  const handleWin = (xp: number) => {
    success();
    addXP(xp);
    recordGameWin();
    setDinoMood('energetic');
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setActiveGame(null); }, 2500);
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎮 Mini-Jeux</Text>
      <Text style={styles.sub}>Entraîne ton dino en jouant !</Text>
      <View style={styles.list}>
        {GAMES.map(game => (
          <TouchableOpacity key={game.id} style={[styles.gameCard, { backgroundColor: game.color }]} onPress={() => setActiveGame(game.id)} activeOpacity={0.85}>
            <Text style={styles.gameEmoji}>{game.emoji}</Text>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDesc}>{game.description}</Text>
            </View>
            <Text style={styles.gameXP}>+{game.xp} XP</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  restContainer: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', padding: 40 },
  restEmoji: { fontSize: 80, marginBottom: 16 },
  restTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  restSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 },
  resumeBtn: { backgroundColor: '#2d8a55', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 16 },
  resumeText: { color: '#fff', fontWeight: 'bold' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', padding: 20, paddingBottom: 4 },
  sub: { fontSize: 14, color: '#888', paddingHorizontal: 20, marginBottom: 16 },
  list: { padding: 16, gap: 14 },
  gameCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  gameEmoji: { fontSize: 44, marginRight: 14 },
  gameInfo: { flex: 1 },
  gameTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  gameDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  gameXP: { fontSize: 16, fontWeight: 'bold', color: '#fff', backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
});
