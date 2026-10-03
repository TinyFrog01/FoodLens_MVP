import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { Palette } from "@/constants/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Pilule noire, comme « Start cooking » sur la fiche recette.
export function PrimaryButton({ label, onPress, disabled, loading, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.primary,
        (disabled || loading) && { opacity: 0.45 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.secondary,
        disabled && { opacity: 0.45 },
        pressed && { backgroundColor: Palette.bg },
        style,
      ]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({
  label,
  onPress,
  color = Palette.green,
  style,
}: ButtonProps & { color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => [styles.text, pressed && { opacity: 0.6 }, style]}
    >
      <Text style={[styles.textLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 54,
    borderRadius: 30,
    backgroundColor: Palette.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  secondary: {
    height: 54,
    borderRadius: 30,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  secondaryText: { color: Palette.text, fontSize: 16, fontWeight: "700" },
  text: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  textLabel: { fontSize: 15, fontWeight: "700" },
});
