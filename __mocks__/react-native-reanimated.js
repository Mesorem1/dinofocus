const React = require('react');
const { View, Text, Image, ScrollView } = require('react-native');

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent: (component) => component,
};

function useSharedValue(initial) {
  const ref = React.useRef(initial);
  return {
    get value() { return ref.current; },
    set value(v) { ref.current = v; },
  };
}

function useAnimatedStyle(fn) {
  return fn();
}

function withTiming(toValue) { return toValue; }
function withSpring(toValue) { return toValue; }
function withDelay(_delay, animation) { return animation; }
function withRepeat(animation) { return animation; }
function withSequence(...animations) { return animations[animations.length - 1]; }
function runOnJS(fn) { return fn; }

const Easing = {
  in: () => (t) => t,
  out: () => (t) => t,
  inOut: () => (t) => t,
  quad: (t) => t,
  linear: (t) => t,
  ease: (t) => t,
};

module.exports = {
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
};
