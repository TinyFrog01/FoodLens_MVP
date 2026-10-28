import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // Always the light chrome material: the app's screens stay light even
      // when the phone is in dark mode.
      tint="systemChromeMaterialLight"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
