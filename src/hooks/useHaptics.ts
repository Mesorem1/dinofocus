import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  const error = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  const heavy = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  return { tap, success, error, heavy };
}
