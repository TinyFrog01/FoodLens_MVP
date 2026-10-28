import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { BottomTabBarButtonProps } from "expo-router/js-tabs";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Palette } from "@/constants/theme";

// Bouton caméra au centre de la barre : la plus grande cible, sous le pouce
// (une personne sur deux tient son téléphone d'une seule main).
export function CameraTabButton({ onPress, accessibilityState }: BottomTabBarButtonProps) {
  return (
    <View style={styles.slot}>
      <Pressable
        onPress={(event) => {
          if (process.env.EXPO_OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          onPress?.(event);
        }}
        accessibilityRole="button"
        accessibilityLabel="Scanner ton frigo"
        accessibilityState={accessibilityState}
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Ionicons name="camera" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: "center", justifyContent: "center" },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: -14,
    backgroundColor: Palette.ink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Palette.card,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: { transform: [{ scale: 0.94 }] },
});
