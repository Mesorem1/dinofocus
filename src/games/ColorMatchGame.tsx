import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

const COLORS = [
  { name: 'ROUGE', color: '#ef4444' },
  { name: 'BLEU', color: '#3b82f6' },
  { name: 'VERT', color: '#22c55e' },
  { name: 'JAUNE', color: '#f59e0b' },
  { name: 'VIOLET', color: '#a855f7' },
];

const TOTAL_ROUNDS = 10;
const TIME_PER_ROUND = 4;

interface Round {
  word: string;
  wordColor: string;
  targetColor: string;
  options: { name: string; color: string }[];
  correct: string;
}

function generateRound(): Round {
  const wordItem = COLORS[Math.floor(Math.random() * COLORS.length)];
  let displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  // Make it sometimes matching, sometimes not (50/50)
  if (Math.random() > 0.5) displayColor = wordItem;

  // Shuffle 4 options including the correct one
  const correct = displayColor.name;
  const others = COLORS.filter(c => c.name !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [...others, displayColor].sort(() => Math.random() - 0.5);

  return {
    word: wordItem.name,
    wordColor: displayColor.color,
    targetColor: displayColor.color,
    options,
    correct,
  };
}

interface ColorMatchGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function ColorMatchGame({ onWin, onQuit }: ColorMatchGameProps) {
  const [round, setRound] = useState(0);
  const [currentRound, setCurrentRound] = useState<Round>(generateRound);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const { tap, success, error } = useHaptics();

  useEffect(() => {
    if (done || selected) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [round, selected, done]);

  const handleTimeout = useCallback(() => {
    error();
    setFeedback('wrong');
    setTimeout(() => nextRound(false), 800);
  }, [round]);

  const nextRound = useCallback((wasCorrect: boolean) => {
    const nextRoundNum = round + 1;
    if (nextRoundNum >= TOTAL_ROUNDS) {
      setDone(true);
      const finalScore = score + (wasCorrect ? 1 : 0);
      if (finalScore >= 7) onWin();
    } else {
      setRound(nextRoundNum);
      setCurrentRound(generateRound());
      setSelected(null);
      setFeedback(null);
      setTimeLeft(TIME_PER_ROUND);
    }
  }, [round, score]);

  const handleAnswer = useCallback((name: string) => {
    if (selected || done) return;
    tap();
    setSelected(name);
    const isCorrect = name === currentRound.correct;
    if (isCorrect) {
      success();
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      error();
      setFeedback('wrong');
    }
    setTimeout(() => nextRound(isCorrect), 800);
  }, [selected, done, currentRound, round, score]);

  if (done) {
    const won = score >= 7;
    return (
      <View style={styles.result}>
        <Text style={styles.resultEmoji}>{won ? '🎨' : '🧪'}</Text>
        <Text style={styles.resultTitle}>{won ? 'Expert des couleurs !' : 'Continue de t\'entraîner !'}</Text>
        <Text style={styles.resultScore}>{score} / {TOTAL_ROUNDS} bonnes réponses</Text>
        <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
          <Text style={styles.quitText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.progress}>🎯 {round + 1} / {TOTAL_ROUNDS}</Text>
        <Text style={[styles.timer, timeLeft <= 1 && styles.timerUrgent]}>⏱️ {timeLeft}s</Text>
        <Text style={styles.score}>⭐ {score}</Text>
      </View>

      {/* Instructions */}
      <Text style={styles.instruction}>Quelle couleur est ce mot ?</Text>

      {/* Word Display */}
      <View style={[styles.wordBox, feedback === 'correct' && styles.wordBoxCorrect, feedback === 'wrong' && styles.wordBoxWrong]}>
        <Text style={[styles.word, { color: currentRound.wordColor }]}>
          {currentRound.word}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {currentRound.options.map(opt => {
          const isSelected = selected === opt.name;
          const isCorrect = opt.name === currentRound.correct;
          let bg = opt.color;
          let opacity = 1;
          if (selected) {
            if (isCorrect) { bg = opt.color; opacity = 1; }
            else if (isSelected) { bg = '#ef4444'; opacity = 1; }
            else opacity = 0.35;
          }
          return (
            <TouchableOpacity
              key={opt.name}
              style={[styles.optionBtn, { backgroundColor: bg, opacity }]}
              onPress={() => handleAnswer(opt.name)}
              activeOpacity={0.85}
              disabled={!!selected}
            >
              <Text style={styles.optionText}>{opt.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
        <Text style={styles.quitText}>Quitter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf4ff', padding: 20, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 24 },
  progress: { fontSize: 15, fontWeight: 'bold', color: '#1a1a2e' },
  timer: { fontSize: 20, fontWeight: 'bold', color: '#ef4444' },
  timerUrgent: { color: '#dc2626' },
  score: { fontSize: 15, fontWeight: 'bold', color: '#f59e0b' },
  instruction: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  wordBox: { width: '100%', borderRadius: 24, backgroundColor: '#fff', padding: 32, alignItems: 'center', marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  wordBoxCorrect: { backgroundColor: '#dcfce7' },
  wordBoxWrong: { backgroundColor: '#fee2e2' },
  word: { fontSize: 52, fontWeight: '900', letterSpacing: 2 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, width: '100%' },
  optionBtn: { width: '44%', paddingVertical: 18, borderRadius: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  optionText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdf4ff' },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8, textAlign: 'center' },
  resultScore: { fontSize: 16, color: '#555', marginBottom: 32 },
  quitBtn: { marginTop: 24 },
  quitText: { color: '#888', fontSize: 14 },
});
