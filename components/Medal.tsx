import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Palette } from "@/constants/theme";
import { tr, useLanguage } from "@/lib/i18n";

export type Rank = 1 | 2 | 3;

// La couleur porte l'information : or, argent, bronze se lisent sans légende.
const MEDALS: Record<Rank, { color: string; label: string }> = {
  1: { color: "#E3B23C", get label() { return tr("Médaille d'or", "Gold medal"); } },
  2: { color: "#C3C8CF", get label() { return tr("Médaille d'argent", "Silver medal"); } },
  3: { color: "#C8834A", get label() { return tr("Médaille de bronze", "Bronze medal"); } },
};

export default function Medal({ rank, size = 30 }: { rank: Rank; size?: number }) {
  useLanguage();
  return (
    <View
      accessibilityLabel={MEDALS[rank].label}
      style={[
        styles.medal,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: MEDALS[rank].color,
        },
      ]}
    >
      <Text style={[styles.rank, { fontSize: Math.round(size * 0.5) }]}>{rank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  medal: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },
  rank: { color: Palette.ink, fontWeight: "900" },
});
