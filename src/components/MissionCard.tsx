import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mission } from '../data/missions';

interface MissionCardProps {
  mission: Mission;
  onComplete: () => void;
  completedToday: number;
  totalToday: number;
}

export function MissionCard({ mission, onComplete, completedToday, totalToday }: MissionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{mission.icon}</Text>
      <Text style={styles.title}>{mission.dinoTitle}</Text>
      <Text style={styles.description}>{mission.dinoDescription}</Text>
      <Text style={styles.xp}>+{mission.xpReward} XP</Text>
      <TouchableOpacity style={styles.button} onPress={onComplete} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Mission terminée ! 🎉</Text>
      </TouchableOpacity>
      <Text style={styles.progress}>{completedToday} / {totalToday} missions aujourd'hui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center', margin: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  icon: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  xp: { fontSize: 18, fontWeight: 'bold', color: '#f4a261', marginBottom: 20 },
  button: { backgroundColor: '#2d8a55', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  progress: { marginTop: 16, fontSize: 12, color: '#999' },
});
