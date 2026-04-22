import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

const DINO_EMOJIS = ['🦖', '🦕', '🐊', '🦎', '🐢', '🦅', '🥚', '🦴'];

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean; }

function createCards(): Card[] {
  const pairs = [...DINO_EMOJIS, ...DINO_EMOJIS];
  return pairs.sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

interface MemoryGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function MemoryGame({ onWin, onQuit }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>(createCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const { tap, success, error } = useHaptics();

  const handleFlip = useCallback((id: number) => {
    if (selected.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    tap();
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected.map(sid => newCards.find(c => c.id === sid)!);
      if (a.emoji === b.emoji) {
        success();
        const matched = newCards.map(c => newSelected.includes(c.id) ? { ...c, matched: true } : c);
        setCards(matched);
        setSelected([]);
        if (matched.every(c => c.matched)) setTimeout(onWin, 500);
      } else {
        error();
        setTimeout(() => {
          setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 900);
      }
    }
  }, [cards, selected]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Mémoire Dino</Text>
      <Text style={styles.moves}>Tentatives : {moves}</Text>
      <View style={styles.grid}>
        {cards.map(card => (
          <TouchableOpacity key={card.id} style={[styles.card, (card.flipped || card.matched) && styles.cardFlipped]} onPress={() => handleFlip(card.id)} activeOpacity={0.8}>
            <Text style={styles.cardEmoji}>{card.flipped || card.matched ? card.emoji : '❓'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
        <Text style={styles.quitText}>Quitter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  moves: { fontSize: 14, color: '#888', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  card: { width: 72, height: 72, backgroundColor: '#3b82f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardFlipped: { backgroundColor: '#dbeafe' },
  cardEmoji: { fontSize: 32 },
  quitBtn: { marginTop: 24, padding: 12 },
  quitText: { color: '#888', fontSize: 14 },
});
