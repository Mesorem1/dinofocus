import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

const PUZZLES = [
  { question: 'Quel dino avait une crête pour faire de la musique ?', options: ['T-Rex', 'Parasaurolophus', 'Stégosaure', 'Raptor'], answer: 'Parasaurolophus', emoji: '🎺' },
  { question: 'Quel dino est le plus grand prédateur connu ?', options: ['Vélociraptor', 'T-Rex', 'Spinosaure', 'Carnotaurus'], answer: 'Spinosaure', emoji: '🐊' },
  { question: 'Quel dino avait des plaques osseuses sur le dos ?', options: ['Tricératops', 'Ankylosaure', 'Stégosaure', 'Diplodocus'], answer: 'Stégosaure', emoji: '🦎' },
  { question: 'Combien de cornes avait le Tricératops ?', options: ['1', '2', '3', '4'], answer: '3', emoji: '🦏' },
  { question: 'Quel dino volait dans les airs ?', options: ['Compsognathus', 'Ptérosaure', 'Vélociraptor', 'Iguanodon'], answer: 'Ptérosaure', emoji: '🦅' },
];

interface PuzzleGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function PuzzleGame({ onWin, onQuit }: PuzzleGameProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { tap, success, error } = useHaptics();

  const puzzle = PUZZLES[index];

  const handleAnswer = useCallback((option: string) => {
    if (selected) return;
    tap();
    setSelected(option);
    const correct = option === puzzle.answer;
    if (correct) { success(); setScore(s => s + 1); }
    else error();

    setTimeout(() => {
      if (index + 1 >= PUZZLES.length) {
        setDone(true);
        if (score + (correct ? 1 : 0) >= 3) onWin();
      } else {
        setIndex(i => i + 1);
        setSelected(null);
      }
    }, 1000);
  }, [index, selected, score, puzzle]);

  if (done) {
    return (
      <View style={styles.result}>
        <Text style={styles.resultEmoji}>{score >= 3 ? '🏆' : '📚'}</Text>
        <Text style={styles.resultTitle}>{score >= 3 ? 'Bravo !' : 'Continue à apprendre !'}</Text>
        <Text style={styles.resultScore}>{score} / {PUZZLES.length} bonnes réponses</Text>
        <TouchableOpacity style={styles.quitBtn} onPress={onQuit}><Text style={styles.quitText}>Retour</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>{index + 1} / {PUZZLES.length}</Text>
      <Text style={styles.emoji}>{puzzle.emoji}</Text>
      <Text style={styles.question}>{puzzle.question}</Text>
      <View style={styles.options}>
        {puzzle.options.map(option => {
          const isSelected = selected === option;
          const isCorrect = option === puzzle.answer;
          let bg = '#fff';
          if (isSelected) bg = isCorrect ? '#dcfce7' : '#fee2e2';
          else if (selected && isCorrect) bg = '#dcfce7';
          return (
            <TouchableOpacity key={option} style={[styles.option, { backgroundColor: bg }]} onPress={() => handleAnswer(option)} activeOpacity={0.8}>
              <Text style={styles.optionText}>{option}</Text>
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
  container: { flex: 1, backgroundColor: '#eff6ff', padding: 20, alignItems: 'center' },
  progress: { color: '#888', fontSize: 13, marginBottom: 12 },
  emoji: { fontSize: 64, marginBottom: 16 },
  question: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 28, lineHeight: 28 },
  options: { width: '100%', gap: 12 },
  option: { padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  optionText: { fontSize: 16, color: '#1a1a2e', fontWeight: '500' },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  resultScore: { fontSize: 16, color: '#555', marginBottom: 24 },
  quitBtn: { marginTop: 20 },
  quitText: { color: '#888', fontSize: 14 },
});
