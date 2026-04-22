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
}

const MOOD_EMOJI: Record<DinoMood, string> = {
  happy: '🦖',
  energetic: '🦖',
  tired: '😴',
  sad: '🥺',
};

export function DinoCompanion({ mood, size = 80 }: DinoCompanionProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (mood === 'happy' || mood === 'energetic') {
      translateY.value = withRepeat(
        withSequence(withTiming(-10, { duration: 600 }), withTiming(0, { duration: 600 })),
        -1, true
      );
    } else if (mood === 'sad') {
      translateY.value = withTiming(6, { duration: 500 });
    } else {
      translateY.value = withTiming(0);
    }
  }, [mood]);

  const celebrate = () => {
    scale.value = withSequence(
      withSpring(1.3),
      withSpring(0.9),
      withSpring(1)
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.emoji, { fontSize: size }]} onPress={celebrate}>
        {MOOD_EMOJI[mood]}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  emoji: { textAlign: 'center' },
});
