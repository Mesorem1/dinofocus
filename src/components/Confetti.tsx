import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, Easing, runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORS = ['#f9c74f', '#f4a261', '#90be6d', '#43aa8b', '#577590', '#f8961e'];
const PIECES = 30;

interface ConfettiPiece {
  x: number;
  delay: number;
  color: string;
  size: number;
}

const pieces: ConfettiPiece[] = Array.from({ length: PIECES }, (_, i) => ({
  x: Math.random() * width,
  delay: Math.random() * 400,
  color: COLORS[i % COLORS.length],
  size: 8 + Math.random() * 8,
}));

interface ConfettiProps {
  visible: boolean;
  onDone?: () => void;
}

function ConfettiPieceComponent({ x, delay, color, size, visible, onDone }: ConfettiPiece & { visible: boolean; onDone?: () => void }) {
  const y = useSharedValue(-20);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      y.value = -20;
      opacity.value = 1;
      y.value = withDelay(delay, withTiming(height + 20, { duration: 1800, easing: Easing.in(Easing.quad) }));
      opacity.value = withDelay(delay + 1200, withTiming(0, { duration: 600 }, () => {
        if (onDone) runOnJS(onDone)();
      }));
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
    left: x,
    width: size,
    height: size,
    backgroundColor: color,
    position: 'absolute',
    borderRadius: 2,
  }));

  return <Animated.View style={style} />;
}

export function Confetti({ visible, onDone }: ConfettiProps) {
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <ConfettiPieceComponent key={i} {...p} visible={visible} onDone={i === 0 ? onDone : undefined} />
      ))}
    </View>
  );
}
