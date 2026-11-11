import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useDeferredValue, useEffect, useMemo } from "react";
import {
  BackHandler,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { OnHandCheck } from "@/app/Food/data/utils/ingredients";
import CategoryChips from "@/components/CategoryChips";
import RecipeCard from "@/components/RecipeCard";
import { Palette } from "@/constants/theme";
import type { RecipeVerdict } from "@/lib/account/recipeFilter";
import { formatCount, useLanguage } from "@/lib/i18n";
import {
  CATEGORIES,
  categoriesOf,
  inCategory,
  type CategoryFilter,
} from "@/lib/recipeCategories";
import { searchRecipes, searchTerms, type SearchHit } from "@/lib/recipeSearch";

type Props = {
  query: string;
  onChangeQuery: (query: string) => void;
  category: CategoryFilter;
  onChangeCategory: (category: CategoryFilter) => void;
  // Les recettes visibles pour les personnes choisies, classées selon le frigo.
  verdicts: RecipeVerdict[];
  isOnHand: OnHandCheck;
  // Hauteur de la barre d'onglets posée par-dessus (iOS), 0 ailleurs.
  bottomInset: number;
  onOpenRecipe: (id: string) => void;
  onClose: () => void;
};

// « 1 recette », « 0 recipes »
const recipes = (n: number, english: boolean) =>
  english ? `${formatCount(n)} recipe${n === 1 ? "" : "s"}` : `${formatCount(n)} recette${n > 1 ? "s" : ""}`;

// Sur le web, le champ a déjà son contour arrondi : pas de cadre du navigateur.
const NO_WEB_OUTLINE = Platform.select<TextStyle>({
  web: { outlineStyle: "none" } as unknown as TextStyle,
  default: {},
});

// Recherche ouverte depuis le fil : une liste de cartes plutôt que des pages
// plein écran, pour comparer les recettes d'un coup d'œil.
export default function RecipeSearch({
  query,
  onChangeQuery,
  category,
  onChangeCategory,
  verdicts,
  isOnHand,
  bottomInset,
  onOpenRecipe,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { language, tr } = useLanguage();
  const english = language === "en";

  // La saisie reste fluide : la liste suit dès que le téléphone a le temps.
  const deferredQuery = useDeferredValue(query);
  const terms = useMemo(() => searchTerms(deferredQuery), [deferredQuery]);
  // En anglais, les titres et ingrédients anglais comptent aussi.
  const hits = useMemo(() => searchRecipes(verdicts, terms, language), [verdicts, terms, language]);

  const counts = useMemo(() => {
    const byCategory: Partial<Record<CategoryFilter, number>> = { all: hits.length };
    for (const { verdict } of hits) {
      for (const key of categoriesOf(verdict.recipe)) byCategory[key] = (byCategory[key] ?? 0) + 1;
    }
    for (const { key } of CATEGORIES) byCategory[key] ??= 0;
    return byCategory;
  }, [hits]);

  const shown = useMemo(
    () => (category === "all" ? hits : hits.filter(({ verdict }) => inCategory(verdict.recipe, category))),
    [hits, category]
  );

  // Retour Android : ferme la recherche plutôt que l'app.
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  const renderItem = useCallback(
    ({ item }: { item: SearchHit }) => (
      <RecipeCard
        recipe={item.verdict.recipe}
        isOnHand={isOnHand}
        terms={terms}
        onPress={() => onOpenRecipe(item.verdict.recipe.id)}
      />
    ),
    [isOnHand, terms, onOpenRecipe]
  );

  const label = CATEGORIES.find((c) => c.key === category)?.label ?? "";
  const summary = terms.length
    ? tr(
        `${recipes(shown.length, english)} pour « ${deferredQuery.trim()} »`,
        `${recipes(shown.length, english)} for “${deferredQuery.trim()}”`
      )
    : tr(
        `${recipes(shown.length, english)}, celles que tu peux faire d'abord`,
        `${recipes(shown.length, english)}, the ones you can make first`
      );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <View style={styles.field}>
          <Ionicons name="search" size={19} color={Palette.muted} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            placeholder={tr("Une recette, un ingrédient…", "A recipe, an ingredient…")}
            placeholderTextColor={Palette.muted}
            style={[styles.input, NO_WEB_OUTLINE]}
            accessibilityLabel={tr("Rechercher une recette ou un ingrédient", "Search for a recipe or an ingredient")}
          />
          {query.length > 0 && (
            <Pressable onPress={() => onChangeQuery("")} hitSlop={10} accessibilityLabel={tr("Effacer", "Clear")}>
              <Ionicons name="close-circle" size={19} color={Palette.muted} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
          <Text style={styles.cancel}>{tr("Annuler", "Cancel")}</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        <CategoryChips value={category} onChange={onChangeCategory} tone="light" counts={counts} />
      </View>

      <FlatList
        data={shown}
        keyExtractor={(item) => item.verdict.recipe.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
        ListHeaderComponent={
          shown.length > 0 ? (
            <Text style={styles.summary}>
              {category === "all" ? summary : `${label} · ${summary}`}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="text-search" size={52} color={Palette.borderStrong} />
            <Text style={styles.emptyTitle}>
              {terms.length
                ? tr(`Rien pour « ${deferredQuery.trim()} »`, `Nothing for “${deferredQuery.trim()}”`)
                : tr("Aucune recette ici", "No recipes here")}
            </Text>
            <Text style={styles.emptyText}>
              {category !== "all" && counts.all
                ? tr(
                    `Il y en a ${formatCount(counts.all)} dans les autres rayons.`,
                    `There are ${formatCount(counts.all)} in the other sections.`
                  )
                : tr("Essaie un autre mot, ou un seul ingrédient.", "Try another word, or a single ingredient.")}
            </Text>
            {category !== "all" && (counts.all ?? 0) > 0 && (
              <Pressable style={styles.emptyButton} onPress={() => onChangeCategory("all")}>
                <Text style={styles.emptyButtonText}>{tr("Chercher partout", "Search everywhere")}</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Palette.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
  },
  input: { flex: 1, fontSize: 16, color: Palette.text, paddingVertical: 0 },
  cancel: { fontSize: 15, fontWeight: "700", color: Palette.green },

  chips: { paddingVertical: 12 },

  summary: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.subtext,
    marginHorizontal: 20,
    marginBottom: 10,
  },

  empty: { alignItems: "center", paddingHorizontal: 32, paddingTop: 60 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Palette.text,
    marginTop: 14,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Palette.subtext,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 21,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: Palette.ink,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  emptyButtonText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
