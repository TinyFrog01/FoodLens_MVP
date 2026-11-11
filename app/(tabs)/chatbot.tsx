import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AvatarButton from "@/components/account/AvatarButton";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { useLanguage } from "@/lib/i18n";

export default function Assistant() {
  const insets = useSafeAreaInsets();
  const { account } = useAccount();
  const { tr } = useLanguage();
  const [question, setQuestion] = useState("");
  const greeting = account
    ? tr(`Bonjour ${account.self.name} !`, `Hello ${account.self.name}!`)
    : tr("Bonjour !", "Hello!");
  // Exemples de demandes : un tap remplit la question.
  const suggestions = [
    tr("Sans gluten, en 30 minutes", "Gluten-free, in 30 minutes"),
    tr("Végétarien pour 4", "Vegetarian for 4"),
    tr("Avec ce qu'il reste dans mon frigo", "With what's left in my fridge"),
  ];

  return (
    <View style={[styles.page, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={TextStyles.eyebrow}>ASSISTANT</Text>
          <Text style={TextStyles.pageTitle}>{greeting}</Text>
        </View>
        <AvatarButton />
      </View>
      <Text style={TextStyles.pageSubtitle}>
        {tr(
          "Demande une recette selon tes contraintes, ou envoie une photo pour identifier un aliment.",
          "Ask for a recipe that fits your needs, or send a photo to identify a food."
        )}
      </Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={22} color={Palette.muted} />
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder={tr("Demander une recette…", "Ask for a recipe…")}
          placeholderTextColor="#A6A6A0"
          returnKeyType="send"
          style={styles.input}
        />
      </View>

      <View style={styles.chips}>
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => setQuestion(suggestion)}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.chipText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "flex-start" },
  searchBar: {
    height: 56,
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    ...CardShadow,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: Palette.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    backgroundColor: Palette.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: { fontSize: 14, fontWeight: "600", color: Palette.text },
});
