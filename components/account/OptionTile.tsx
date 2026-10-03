import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { Palette } from "@/constants/theme";

// Tuile sélectionnable (appareils, régimes) : icône + libellé + coche.
export default function OptionTile({
  label,
  description,
  icon,
  selected,
  onPress,
  style,
}: {
  label: string;
  description?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.tile,
        selected && styles.tileSelected,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={selected ? Palette.green : Palette.muted}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      <View style={[styles.check, selected && styles.checkSelected]}>
        {selected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Palette.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Palette.border,
    padding: 14,
    minHeight: 104,
  },
  tileSelected: { borderColor: Palette.green, backgroundColor: "#F6FBF7" },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Palette.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconWrapSelected: { backgroundColor: Palette.greenSoft },
  label: { fontSize: 15, fontWeight: "700", color: Palette.text },
  description: { fontSize: 12.5, color: Palette.muted, marginTop: 3, lineHeight: 17 },
  check: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C7C7BF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkSelected: { backgroundColor: Palette.green, borderColor: Palette.green },
});
