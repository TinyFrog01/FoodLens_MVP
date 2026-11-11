import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Palette } from "@/constants/theme";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

// Français | English : la langue de toute l'app, recettes comprises. Chaque
// langue est écrite dans sa propre langue, pour qu'on trouve la sienne.
export default function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, tr } = useLanguage();

  return (
    <View
      style={[styles.track, compact && styles.trackCompact]}
      accessibilityRole="radiogroup"
      accessibilityLabel={tr("Langue", "Language")}
    >
      {LANGUAGES.map(({ key, label }) => {
        const selected = key === language;
        return (
          <Pressable
            key={key}
            onPress={() => setLanguage(key)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            style={({ pressed }) => [
              styles.option,
              compact && styles.optionCompact,
              selected && styles.optionOn,
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.label, compact && styles.labelCompact, selected && styles.labelOn]}>
              {compact ? key.toUpperCase() : label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: Palette.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    padding: 3,
    gap: 3,
  },
  trackCompact: { alignSelf: "flex-start", borderRadius: 16 },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 11,
  },
  optionCompact: { flex: 0, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 13 },
  optionOn: { backgroundColor: Palette.ink },
  label: { fontSize: 14, fontWeight: "700", color: Palette.muted },
  labelCompact: { fontSize: 12.5, fontWeight: "800" },
  labelOn: { color: "#FFFFFF" },
});
