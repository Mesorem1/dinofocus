import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring
} from 'react-native-reanimated';
import { DinoMood } from '../store/gameStore';

interface DinoCompanionProps {
  mood: DinoMood;
  size?: number;
  hunger?: number;
  happiness?: number;
  energy?: number;
}

function getDinoEmoji(mood: DinoMood, hunger: number, happiness: number, energy: number): string {
  if (hunger < 15) return '😫';       // Very hungry
  if (energy < 15) return '😴';       // Exhausted
  if (happiness < 15) return '😢';    // Very sad
  if (mood === 'energetic') return '🦖';
  if (mood === 'happy') return '🦕';
  if (mood === 'tired') return '😴';
  if (mood === 'sad') return '🥺';
  return '🦕';
}

export function DinoCompanion({
  mood,
  size = 80,
  hunger = 80,
  happiness = 75,
  energy = 90,
}: DinoCompanionProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (mood === 'energetic') {
      // Bouncy jump animation
      translateY.value = withRepeat(
        withSequence(withTiming(-16, { duration: 400 }), withTiming(0, { duration: 400 })),
        -1, true
      );
    } else if (mood === 'happy') {
      // Gentle float
      translateY.value = withRepeat(
        withSequence(withTiming(-8, { duration: 700 }), withTiming(0, { duration: 700 })),
        -1, true
      );
    } else if (mood === 'sad') {
      // Sad droop
      translateY.value = withTiming(8, { duration: 600 });
      rotate.value = withTiming(-5, { duration: 600 });
    } else if (mood === 'tired') {
      // Slow sway
      translateY.value = withRepeat(
        withSequence(withTiming(4, { duration: 1200 }), withTiming(0, { duration: 1200 })),
        -1, true
      );
    }

    return () => {
      translateY.value = withTiming(0);
      rotate.value = withTiming(0);
    };
  }, [mood]);

  const celebrate = () => {
    scale.value = withSequence(
      withSpring(1.4),
      withSpring(0.85),
      withSpring(1.15),
      withSpring(1)
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const emoji = getDinoEmoji(mood, hunger, happiness, energy);

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.emoji, { fontSize: size }]} onPress={celebrate}>
        {emoji}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  emoji: { textAlign: 'center' },
});
