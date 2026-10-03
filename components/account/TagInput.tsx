import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Palette } from "@/constants/theme";

const TONES = {
  green: { accent: Palette.green, soft: Palette.greenSoft },
  warn: { accent: Palette.warn, soft: Palette.warnSoft },
  danger: { accent: Palette.danger, soft: Palette.dangerSoft },
};

// Liste libre d'aliments (aime / n'aime pas / à éviter) avec suggestions.
export default function TagInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
  tone = "green",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  tone?: keyof typeof TONES;
}) {
  const [text, setText] = useState("");
  const { accent, soft } = TONES[tone];
  const has = (v: string) => values.some((x) => x.toLowerCase() === v.toLowerCase());

  const add = (raw: string) => {
    const value = raw.trim();
    if (value && !has(value)) onChange([...values, value]);
    setText("");
  };

  const query = text.trim().toLowerCase();
  const visibleSuggestions = suggestions
    .filter((s) => !has(s) && (!query || s.toLowerCase().includes(query)))
    .slice(0, 8);

  return (
    <View>
      {values.length > 0 && (
        <View style={styles.row}>
          {values.map((value) => (
            <Pressable
              key={value}
              onPress={() => onChange(values.filter((v) => v !== value))}
              accessibilityLabel={`Retirer ${value}`}
              style={[styles.tag, { backgroundColor: soft, borderColor: accent }]}
            >
              <Text style={[styles.tagText, { color: accent }]}>{value}</Text>
              <Ionicons name="close" size={14} color={accent} style={{ marginLeft: 4 }} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => add(text)}
          placeholder={placeholder}
          placeholderTextColor="#A6A6A0"
          returnKeyType="done"
          blurOnSubmit={false}
          style={styles.input}
        />
        <Pressable
          onPress={() => add(text)}
          disabled={!text.trim()}
          style={[styles.addButton, !text.trim() && { opacity: 0.4 }]}
          accessibilityLabel="Ajouter"
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {visibleSuggestions.length > 0 && (
        <View style={[styles.row, { marginTop: 10 }]}>
          {visibleSuggestions.map((s) => (
            <Pressable key={s} onPress={() => add(s)} style={styles.suggestion}>
              <Ionicons name="add" size={13} color={Palette.muted} />
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { fontSize: 14, fontWeight: "700" },
  inputRow: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Palette.text,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Palette.ink,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D6D6D0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  suggestionText: { fontSize: 13, color: Palette.muted, fontWeight: "600", marginLeft: 3 },
});
