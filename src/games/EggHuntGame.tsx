import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

const { width, height } = Dimensions.get('window');
const GAME_DURATION = 30;
const EGG_LIFETIME = 1500;

interface Egg { id: number; x: number; y: number; }

interface EggHuntGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function EggHuntGame({ onWin, onQuit }: EggHuntGameProps) {
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const eggIdRef = useRef(0);
  const { tap } = useHaptics();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); setGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const spawner = setInterval(() => {
      const id = eggIdRef.current++;
      const newEgg: Egg = { id, x: 40 + Math.random() * (width - 120), y: 120 + Math.random() * (height - 300) };
      setEggs(prev => [...prev, newEgg]);
      setTimeout(() => setEggs(prev => prev.filter(e => e.id !== id)), EGG_LIFETIME);
    }, 700);
    return () => clearInterval(spawner);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver && score >= 10) onWin();
  }, [gameOver]);

  const handleTap = (id: number) => {
    tap();
    setScore(s => s + 1);
    setEggs(prev => prev.filter(e => e.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.hud}>
        <Text style={styles.score}>🥚 {score}</Text>
        <Text style={styles.timer}>⏱️ {timeLeft}s</Text>
      </View>

      {eggs.map(egg => (
        <TouchableOpacity key={egg.id} style={[styles.egg, { left: egg.x, top: egg.y }]} onPress={() => handleTap(egg.id)} activeOpacity={0.7}>
          <Text style={styles.eggEmoji}>🥚</Text>
        </TouchableOpacity>
      ))}

      {gameOver && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>{score >= 10 ? '🎉 Bravo !' : '😅 Essaie encore !'}</Text>
          <Text style={styles.resultScore}>Tu as attrapé {score} œufs !</Text>
          {score < 10 && (
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setScore(0); setTimeLeft(GAME_DURATION); setGameOver(false); setEggs([]); }}>
              <Text style={styles.retryText}>Rejouer</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
        <Text style={styles.quitText}>Quitter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  hud: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  score: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  timer: { fontSize: 22, fontWeight: 'bold', color: '#ef4444' },
  egg: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  eggEmoji: { fontSize: 44 },
  result: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  resultScore: { fontSize: 18, color: '#555', marginBottom: 24 },
  retryBtn: { backgroundColor: '#2d8a55', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 16 },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  quitBtn: { position: 'absolute', bottom: 30, alignSelf: 'center' },
  quitText: { color: '#888', fontSize: 14 },
});
