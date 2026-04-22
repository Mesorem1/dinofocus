import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { calculateLevel, xpForNextLevel, xpInCurrentLevel } from '../utils/progression';

interface XPBarProps {
  totalXP: number;
}

export function XPBar({ totalXP }: XPBarProps) {
  const level = calculateLevel(totalXP);
  const needed = xpForNextLevel(level);
  const current = xpInCurrentLevel(totalXP);
  const ratio = Math.min(current / needed, 1);

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(ratio, { duration: 800 });
  }, [ratio]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.level}>Niveau {level}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
      <Text style={styles.xpText}>{current} / {needed} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  level: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  track: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#f9c74f', borderRadius: 6 },
  xpText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
});
