import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  Animated as RNAnimated,
} from 'react-native';

const CHEST_MESSAGES = [
  'Tu es incroyable ! Rex t\'adore ! 🦕',
  'Un trésor pour un héros ! 🏅',
  'Quelle surprise ! Tu mérites ça ! 🌟',
  'Rex cache toujours les meilleurs trésors pour toi ! 💎',
  'Fantastique ! Continue comme ça ! 🚀',
  'Tu es une vraie star ! ⭐',
];

interface ChestModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChestModal({ visible, onClose }: ChestModalProps) {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const bounceAnim = useRef(new RNAnimated.Value(0)).current;
  const message = CHEST_MESSAGES[Math.floor(Math.random() * CHEST_MESSAGES.length)];

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
      RNAnimated.sequence([
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(bounceAnim, { toValue: -12, duration: 300, useNativeDriver: true }),
            RNAnimated.timing(bounceAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          { iterations: 3 }
        ),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <RNAnimated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <RNAnimated.Text style={[styles.chestEmoji, { transform: [{ translateY: bounceAnim }] }]}>
            🎁
          </RNAnimated.Text>
          <Text style={styles.title}>Coffre mystère !</Text>
          <View style={styles.rewardBox}>
            <Text style={styles.rewardEmoji}>✨</Text>
            <Text style={styles.rewardText}>+20 XP bonus !</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>Ouvrir ! 🎉</Text>
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
    borderColor: '#f59e0b',
  },
  chestEmoji: { fontSize: 80, marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,196,79,0.2)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  rewardEmoji: { fontSize: 24 },
  rewardText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#f9c74f',
  },
  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#f59e0b',
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
