import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  Animated as RNAnimated,
} from 'react-native';

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  onClose: () => void;
}

export function LevelUpModal({ visible, level, onClose }: LevelUpModalProps) {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      RNAnimated.sequence([
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        RNAnimated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <RNAnimated.View style={[styles.card, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}>
          <Text style={styles.stars}>✨⭐✨</Text>
          <Text style={styles.emoji}>🦕</Text>
          <Text style={styles.title}>Niveau supérieur !</Text>
          <Text style={styles.level}>Niveau {level}</Text>
          <Text style={styles.subtitle}>Rex est fier de toi ! Continue comme ça !</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>Super ! 🎉</Text>
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    borderWidth: 3,
    borderColor: '#f9c74f',
  },
  stars: { fontSize: 28, marginBottom: 8 },
  emoji: { fontSize: 72, marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f9c74f',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  level: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#f9c74f',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  btnText: {
    color: '#1a1a2e',
    fontWeight: '900',
    fontSize: 16,
  },
});
