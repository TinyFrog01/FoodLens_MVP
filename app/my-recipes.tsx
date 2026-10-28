import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRecipePhoto } from "@/app/Food/data/recipe/photos";
import { Recipe, recipes } from "@/app/Food/data/recipe/recipe";
import TopBar from "@/components/account/TopBar";
import { CardShadow, Palette, TextStyles } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { useRecipeFeed } from "@/hooks/useRecipeFeed";
import { describeReason } from "@/lib/account/recipeFilter";

type Tab = "favorites" | "custom" | "hidden";

const TABS: { key: Tab; label: string; title: string }[] = [
  { key: "favorites", label: "Favoris", title: "Tes favoris" },
  { key: "custom", label: "Tes versions", title: "Tes versions" },
  { key: "hidden", label: "Masquées", title: "Recettes masquées" },
];

const EMPTY: Record<Tab, { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }> = {
  favorites: {
    icon: "heart-outline",
    title: "Aucun favori",
    text: "Touche le cœur sur une recette pour la retrouver ici.",
  },
  custom: {
    icon: "create-outline",
    title: "Pas encore de version à toi",
    text: "Sur une recette, touche « Faire ta version » ou ajoute une note.",
  },
  hidden: {
    icon: "eye-outline",
    title: "Aucune recette masquée",
    text: "Toutes les recettes conviennent aux personnes choisies.",
  },
};

type Row = { recipe: Recipe; detail: string; tone: "muted" | "danger" };

export default function MyRecipes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { account } = useAccount();
  const { hidden } = useRecipeFeed();
  const [tab, setTab] = useState<Tab>(
    TABS.some((t) => t.key === params.tab) ? (params.tab as Tab) : "favorites"
  );

  if (!account) return null;

  const byId = (id: string) => recipes.find((r) => r.id === id);
  let rows: Row[] = [];
  if (tab === "favorites") {
    rows = account.favorites
      .map(byId)
      .filter((r): r is Recipe => Boolean(r))
      .map((recipe) => ({ recipe, detail: recipe.time, tone: "muted" }));
  } else if (tab === "custom") {
    rows = Object.entries(account.customizations).flatMap(([id, custom]) => {
      const recipe = byId(id);
      if (!recipe) return [];
      const changes = (custom.removed?.length ?? 0) + Object.keys(custom.swaps ?? {}).length;
      const parts = [
        custom.note?.trim() ? `« ${custom.note.trim()} »` : null,
        changes > 0 ? `${changes} ingrédient${changes > 1 ? "s" : ""} modifié${changes > 1 ? "s" : ""}` : null,
        custom.servings ? `${custom.servings} portions` : null,
      ].filter(Boolean);
      return [{ recipe, detail: parts.join(" · "), tone: "muted" as const }];
    });
  } else {
    rows = hidden.map((v) => ({
      recipe: v.recipe,
      detail: v.reasons.map(describeReason).join("\n"),
      tone: "danger",
    }));
  }

  return (
    <View style={styles.page}>
      <TopBar />
      <View style={styles.header}>
        <Text style={TextStyles.eyebrow}>TES RECETTES</Text>
        <Text style={TextStyles.pageTitle}>{TABS.find((t) => t.key === tab)?.title}</Text>
        {tab === "hidden" && (
          <Text style={TextStyles.pageSubtitle}>
            Masquées pour les personnes pour qui tu cuisines en ce moment.
          </Text>
        )}

        <View style={styles.segmented}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.segment, tab === t.key && styles.segmentOn]}
            >
              <Text style={[styles.segmentText, tab === t.key && styles.segmentTextOn]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.recipe.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 30 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name={EMPTY[tab].icon} size={54} color="#BFBFBF" />
            <Text style={styles.emptyTitle}>{EMPTY[tab].title}</Text>
            <Text style={styles.emptyText}>{EMPTY[tab].text}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/recipe/${item.recipe.id}`)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
          >
            <Image source={getRecipePhoto(item.recipe.id)} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title} numberOfLines={2}>
                {item.recipe.title}
              </Text>
              {item.detail ? (
                <Text
                  style={[styles.detail, item.tone === "danger" && { color: Palette.danger }]}
                  numberOfLines={3}
                >
                  {item.detail}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7BF" />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, marginBottom: 14 },
  segmented: {
    flexDirection: "row",
    backgroundColor: "#ECEBE6",
    borderRadius: 14,
    padding: 4,
    marginTop: 16,
  },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  segmentOn: { backgroundColor: Palette.card, ...CardShadow },
  segmentText: { fontSize: 14, fontWeight: "600", color: Palette.muted },
  segmentTextOn: { color: Palette.text, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.card,
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    ...CardShadow,
  },
  thumb: { width: 64, height: 64, borderRadius: 14, backgroundColor: "#E9E8E3" },
  title: { fontSize: 15, fontWeight: "700", color: Palette.text },
  detail: { fontSize: 13, color: Palette.muted, marginTop: 3, lineHeight: 18 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Palette.text, marginTop: 14 },
  emptyText: { fontSize: 15, color: Palette.muted, marginTop: 6, textAlign: "center", lineHeight: 21 },
});
