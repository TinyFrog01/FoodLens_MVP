import React from "react";
import { View, StyleSheet } from "react-native";

type CompletionBarProps = {
  identified: number;
  total: number;
};

export default function CompletionBar({ identified, total }: CompletionBarProps) {
  const pct = total > 0 ? Math.min(1, Math.max(0, identified / total)) : 0;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FBEAE3", // pale peach/pink remainder, as in screenshot
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#37B24D", // green, matches sectionCount/badgeGreen color
  },
});