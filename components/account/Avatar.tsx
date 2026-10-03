import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "?";

export default function Avatar({
  name,
  color,
  size = 40,
  bordered = false,
}: {
  name: string;
  color: string;
  size?: number;
  bordered?: boolean;
}) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        bordered && styles.bordered,
      ]}
    >
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.38) }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  bordered: { borderWidth: 2, borderColor: "#FFFFFF" },
  initials: { color: "#FFFFFF", fontWeight: "800" },
});
