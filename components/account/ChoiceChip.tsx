import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Palette } from "@/constants/theme";

// Pastille à cocher, même style que « Always on hand » (Aliments).
export default function ChoiceChip({
  label,
  selected,
  onPress,
  tone = "green",
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  tone?: "green" | "danger";
}) {
  const accent = tone === "danger" ? Palette.danger : Palette.green;
  const soft = tone === "danger" ? Palette.dangerSoft : Palette.greenSoft;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[styles.pill, selected && { borderColor: accent, backgroundColor: soft }]}
    >
      <View style={[styles.check, selected && { borderColor: accent, backgroundColor: accent }]}>
        {selected && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.label, selected && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Palette.bg,
    marginRight: 8,
    marginBottom: 8,
  },
  check: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C7C7BF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  checkMark: { fontSize: 10, color: "#FFFFFF", fontWeight: "800" },
  label: { fontSize: 14, color: Palette.muted, fontWeight: "600" },
  labelActive: { color: Palette.text },
});
