import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWeeklyStore } from '../store/weeklyStore';

export function WeeklyChallenges() {
  const challenges = useWeeklyStore(s => s.challenges);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓️ Défis de la semaine</Text>
      {challenges.map(c => {
        const ratio = Math.min(c.progress / c.goal, 1);
        const pct = Math.round(ratio * 100);
        return (
          <View key={c.id} style={[styles.row, c.completed && styles.rowDone]}>
            <Text style={styles.icon}>{c.completed ? '✅' : c.icon}</Text>
            <View style={styles.info}>
              <Text style={[styles.challengeTitle, c.completed && styles.textDone]}>
                {c.title}
              </Text>
              <Text style={styles.desc}>{c.description}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%` }, c.completed && styles.fillDone]} />
              </View>
              <Text style={styles.progress}>
                {c.progress} / {c.goal}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 16,
  },
  title: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rowDone: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  icon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  info: { flex: 1 },
  challengeTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  textDone: { color: '#86efac' },
  desc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 6,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: {
    height: '100%',
    backgroundColor: '#f9c74f',
    borderRadius: 4,
  },
  fillDone: { backgroundColor: '#22c55e' },
  progress: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
  },
});
