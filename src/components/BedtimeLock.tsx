import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BedtimeLockProps {
  dinoName: string;
}

export function BedtimeLock({ dinoName }: BedtimeLockProps) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.moon}>🌙</Text>
      <Text style={styles.dino}>😴</Text>
      <Text style={styles.title}>C'est l'heure de dormir !</Text>
      <Text style={styles.subtitle}>
        {dinoName} se repose déjà...{'\n'}À demain pour de nouvelles aventures !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 40,
  },
  moon: { fontSize: 60, marginBottom: 12 },
  dino: { fontSize: 80, marginBottom: 20 },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#a5b4fc',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(165,180,252,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
});
