import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Modal } from 'react-native';
import { useGameStore } from '../../src/store/gameStore';
import { useMissionStore } from '../../src/store/missionStore';
import { DINOS, Dino, DinoRarity } from '../../src/data/dinos';
import { BADGES } from '../../src/data/badges';
import { getUnlockedDinos } from '../../src/utils/progression';

const RARITY_COLOR: Record<DinoRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  legendary: '#f59e0b',
};

export default function DinoDexScreen() {
  const { totalXP, gamesWon, streak } = useGameStore();
  const { completedToday } = useMissionStore();
  const unlocked = getUnlockedDinos(totalXP);
  const unlockedIds = new Set(unlocked.map(d => d.id));
  const [selectedDino, setSelectedDino] = useState<Dino | null>(null);

  const stats = { missionsCompleted: completedToday, streak, gamesWon, totalXP };
  const earnedBadges = BADGES.filter(b => b.condition(stats));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🦕 Dino-Dex</Text>
      <Text style={styles.sub}>{unlocked.length} / {DINOS.length} dinos débloqués</Text>

      <FlatList
        data={DINOS}
        numColumns={4}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          earnedBadges.length > 0 ? (
            <View style={styles.badges}>
              <Text style={styles.badgesTitle}>Badges</Text>
              <View style={styles.badgeRow}>
                {earnedBadges.map(b => (
                  <View key={b.id} style={styles.badge}>
                    <Text style={styles.badgeIcon}>{b.icon}</Text>
                    <Text style={styles.badgeLabel}>{b.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isUnlocked = unlockedIds.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.dinoCell, !isUnlocked && styles.dinoCellLocked]}
              onPress={() => isUnlocked && setSelectedDino(item)}
              activeOpacity={isUnlocked ? 0.8 : 1}
            >
              <Text style={[styles.dinoEmoji, !isUnlocked && styles.locked]}>
                {isUnlocked ? item.emoji : '❓'}
              </Text>
              {isUnlocked && (
                <View style={[styles.rarityDot, { backgroundColor: RARITY_COLOR[item.rarity] }]} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!selectedDino} transparent animationType="slide" onRequestClose={() => setSelectedDino(null)}>
        {selectedDino && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>{selectedDino.emoji}</Text>
              <Text style={styles.modalName}>{selectedDino.name}</Text>
              <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLOR[selectedDino.rarity] }]}>
                <Text style={styles.rarityText}>{selectedDino.rarity === 'common' ? 'Commun' : selectedDino.rarity === 'rare' ? 'Rare' : 'Légendaire'}</Text>
              </View>
              <Text style={styles.funFact}>"{selectedDino.funFact}"</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDino(null)}>
                <Text style={styles.closeBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf4ff' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', padding: 20, paddingBottom: 4 },
  sub: { fontSize: 13, color: '#888', paddingHorizontal: 20, marginBottom: 8 },
  grid: { padding: 12 },
  dinoCell: { flex: 1, aspectRatio: 1, margin: 5, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  dinoCellLocked: { backgroundColor: '#f3f4f6' },
  dinoEmoji: { fontSize: 32 },
  locked: { opacity: 0.5 },
  rarityDot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', bottom: 6, right: 6 },
  badges: { marginBottom: 16 },
  badgesTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: '#fff', borderRadius: 12, padding: 8, alignItems: 'center', minWidth: 64 },
  badgeIcon: { fontSize: 20 },
  badgeLabel: { fontSize: 10, color: '#555', marginTop: 2, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center', width: '100%', paddingBottom: 48 },
  modalEmoji: { fontSize: 80, marginBottom: 12 },
  modalName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  rarityBadge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 14, marginBottom: 16 },
  rarityText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  funFact: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, fontStyle: 'italic', marginBottom: 24 },
  closeBtn: { backgroundColor: '#1a1a2e', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 32 },
  closeBtnText: { color: '#fff', fontWeight: 'bold' },
});
