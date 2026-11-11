import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { Palette } from "@/constants/theme";
import { formatCount, useLanguage } from "@/lib/i18n";
import { CATEGORIES, type CategoryFilter } from "@/lib/recipeCategories";

type Props = {
  value: CategoryFilter;
  onChange: (category: CategoryFilter) => void;
  // "dark" : par-dessus la photo du fil ; "light" : sur fond clair.
  tone: "dark" | "light";
  // Nombre de recettes par rayon (recherche en cours).
  counts?: Partial<Record<CategoryFilter, number>>;
};

// « 8 659 » en français, « 8,659 » en anglais (lib/i18n).
export { formatCount };

// Rayons à faire défiler de gauche à droite : Tout, Soupers, Desserts, Sauces…
export default function CategoryChips({ value, onChange, tone, counts }: Props) {
  const { tr } = useLanguage();
  const dark = tone === "dark";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map(({ key, label, icon }) => {
        const selected = key === value;
        const count = counts?.[key];
        const empty = count === 0 && !selected;
        const color = selected
          ? dark
            ? Palette.ink
            : "#FFFFFF"
          : dark
            ? "#FFFFFF"
            : Palette.text;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={count === undefined ? label : tr(`${label}, ${count} recettes`, `${label}, ${count} recipes`)}
            style={({ pressed }) => [
              styles.chip,
              dark ? styles.chipDark : styles.chipLight,
              selected && (dark ? styles.selectedDark : styles.selectedLight),
              empty && styles.empty,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons name={icon} size={15} color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
            {count !== undefined && (
              <Text style={[styles.count, { color }]}>{formatCount(count)}</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    borderWidth: 1,
  },
  chipDark: { backgroundColor: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.28)" },
  chipLight: { backgroundColor: Palette.card, borderColor: Palette.borderStrong },
  selectedDark: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  selectedLight: { backgroundColor: Palette.ink, borderColor: Palette.ink },
  empty: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  label: { fontSize: 14, fontWeight: "800" },
  count: { fontSize: 12, fontWeight: "700", opacity: 0.7 },
});
