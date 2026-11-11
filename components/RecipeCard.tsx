import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { getRecipePhoto } from "@/app/Food/data/recipe/photos";
import { Recipe } from "@/app/Food/data/recipe/types";
import type { OnHandCheck } from "@/app/Food/data/utils/ingredients";
import { dietLabel } from "@/constants/dietary";
import { CardShadow, Palette } from "@/constants/theme";
import { useLanguage } from "@/lib/i18n";
import { mainCategory } from "@/lib/recipeCategories";
import { makeTermMatcher } from "@/lib/recipeSearch";
import { ingredientLabel, recipeTitle } from "@/lib/recipeText";

type Props = {
  recipe: Recipe;
  onPress: () => void;
  // Ingrédients que tu as (essentiels et frigo) : en vert, avec un crochet.
  isOnHand?: OnHandCheck;
  // Mots cherchés : surlignés dans le titre et dans les ingrédients.
  terms?: string[];
};

const MAX_CHIPS = 8;
const NO_TERMS: string[] = [];

// « Poulet au citron », « citron » cherché : ["Poulet au ", "citron"].
const WORD = /([A-Za-zÀ-ÖØ-öø-ÿŒœ0-9]+)/;

function Highlighted({ text, matches }: { text: string; matches: (word: string) => boolean }) {
  return (
    <>
      {text.split(WORD).map((part, i) =>
        i % 2 === 1 && matches(part) ? (
          <Text key={i} style={styles.mark}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </>
  );
}

function RecipeCard({ recipe, onPress, isOnHand, terms = NO_TERMS }: Props) {
  const { language, tr } = useLanguage();
  const matches = useMemo(() => makeTermMatcher(terms), [terms]);
  const title = recipeTitle(recipe, language);

  const chips = useMemo(() => {
    const all = recipe.ingredients.map((ingredient, index) => {
      const name = ingredientLabel(recipe, index, language);
      return {
        key: `${ingredient.name}-${index}`,
        name,
        have: isOnHand?.(ingredient) ?? false,
        found: matches(name),
      };
    });
    // Ce que tu cherches d'abord, puis ce que tu as, puis le reste.
    const rank = (c: (typeof all)[number]) => (c.found ? 0 : c.have ? 1 : 2);
    return all.map((c, order) => ({ ...c, order })).sort((a, b) => rank(a) - rank(b) || a.order - b.order);
  }, [recipe, isOnHand, matches, language]);

  const total = chips.length;
  const have = chips.filter((c) => c.have).length;
  const missing = total - have;
  const category = mainCategory(recipe);
  const diet = recipe.diets.includes("vegan")
    ? "vegan"
    : recipe.diets.includes("vegetarian")
      ? "vegetarian"
      : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr(`Voir la recette : ${title}`, `See the recipe: ${title}`)}
      style={({ pressed }) => [styles.shadow, pressed && styles.pressed]}
    >
      <View style={styles.card}>
        <View>
          <Image source={getRecipePhoto(recipe.id, recipe.image)} style={styles.image} />

          {category && (
            <View style={styles.category}>
              <MaterialCommunityIcons name={category.icon} size={13} color={Palette.text} />
              <Text style={styles.categoryText}>{category.one}</Text>
            </View>
          )}

          {isOnHand && (
            <View style={[styles.stock, { backgroundColor: missing === 0 ? Palette.green : Palette.warn }]}>
              <Ionicons name={missing === 0 ? "checkmark-circle" : "cart-outline"} size={14} color="#FFF" />
              <Text style={styles.stockText}>
                {missing === 0 ? tr("Tout en main", "All on hand") : tr(`Il en manque ${missing}`, `${missing} missing`)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            <Highlighted text={title} matches={matches} />
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.info}>
              <Ionicons name="time-outline" size={15} color={Palette.subtext} />
              <Text style={styles.infoText}>{recipe.time}</Text>
            </View>
            <View style={styles.info}>
              <MaterialCommunityIcons name="fridge-outline" size={15} color={Palette.subtext} />
              <Text style={styles.infoText}>
                {isOnHand
                  ? tr(`${have} sur ${total} en main`, `${have} of ${total} on hand`)
                  : tr(`${total} ingrédients`, `${total} ingredients`)}
              </Text>
            </View>
            {diet && (
              <View style={styles.info}>
                <MaterialCommunityIcons
                  name={diet === "vegan" ? "sprout" : "leaf"}
                  size={15}
                  color={Palette.green}
                />
                <Text style={[styles.infoText, styles.diet]}>{dietLabel(diet)}</Text>
              </View>
            )}
          </View>

          <View style={styles.chips}>
            {chips.slice(0, MAX_CHIPS).map((chip) => (
              <View
                key={chip.key}
                style={[
                  styles.chip,
                  // Sans frigo (page otheridea) : toutes vertes, comme avant.
                  chip.have || !isOnHand ? styles.chipHave : styles.chipMissing,
                  chip.found && styles.chipFound,
                ]}
              >
                {chip.have && <Ionicons name="checkmark" size={13} color={Palette.green} />}
                <Text
                  style={[
                    styles.chipText,
                    chip.have || !isOnHand ? styles.chipTextHave : styles.chipTextMissing,
                    chip.found && styles.chipTextFound,
                  ]}
                  numberOfLines={1}
                >
                  {chip.name}
                </Text>
              </View>
            ))}
            {total > MAX_CHIPS && (
              <View style={[styles.chip, styles.chipMore]}>
                <Text style={[styles.chipText, styles.chipTextMissing]}>+{total - MAX_CHIPS}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(RecipeCard);

const styles = StyleSheet.create({
  shadow: { marginHorizontal: 16, marginBottom: 16, borderRadius: 20, ...CardShadow },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  card: { borderRadius: 20, backgroundColor: Palette.card, overflow: "hidden" },

  image: { width: "100%", height: 180, backgroundColor: Palette.border },

  category: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  categoryText: { fontSize: 12, fontWeight: "800", color: Palette.text },

  stock: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  stockText: { fontSize: 12, fontWeight: "800", color: "#FFF" },

  content: { padding: 16, paddingTop: 14 },
  title: { fontSize: 19, lineHeight: 24, fontWeight: "800", color: Palette.text },
  mark: { backgroundColor: "#FFE58A", color: Palette.text },

  infoRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 4, marginTop: 8 },
  info: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13, color: Palette.subtext, fontWeight: "600" },
  diet: { color: Palette.green },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipHave: { backgroundColor: "#EAF7E5" },
  chipMissing: { backgroundColor: "#F3F2EE" },
  chipFound: { borderColor: "#E0B100", backgroundColor: "#FFF6D1" },
  chipMore: { backgroundColor: "#F3F2EE" },
  chipText: { fontSize: 13, fontWeight: "700", flexShrink: 1 },
  chipTextHave: { color: "#2F7A3A" },
  chipTextMissing: { color: Palette.subtext },
  chipTextFound: { color: "#6B5200" },
});
