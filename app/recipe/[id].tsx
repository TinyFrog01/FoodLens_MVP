import { items } from "@/app/Food/data/items";
import { recipes } from "@/app/Food/data/recipe/recipe";
import CookingMode from "@/components/CookingMode";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { getRecipePhoto } from "@/app/Food/data/recipe/photos";
import {
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

// Shared palette, pulled from the Kitchen Inventory screens (soft off-white
// background, white cards, green as the single accent color).
const COLORS = {
  bg: "#F7F7F5",
  card: "#FFFFFF",
  border: "#EEEEEE",
  text: "#111111",
  subtext: "#6B6B6B",
  green: "#18A64B",
  greenSoft: "#DFF7DF",
  red: "#E53935",
  redSoft: "#FFE4E4",
};

/**
 * This screen reads a few optional fields that may not exist yet on your
 * Recipe type: `vegan?: boolean`, `tags?: string[]`, `servings?: number`.
 * Add them to recipe.ts when you're ready — everything below degrades
 * gracefully if they're missing.
 */
type RecipeExtras = {
  vegan?: boolean;
  tags?: string[];
  servings?: number;
};

// Nicely formats a scaled quantity (2 -> "2", 1.333 -> "1.33").
function formatQuantity(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded}`;
}

export default function RecipePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recipe = recipes.find((r) => r.id === id) as
    | (typeof recipes)[number] & RecipeExtras
    | undefined;

  // Hooks must run before the early return below.
  const baseServings = recipe?.servings ?? 2;
  const [servings, setServings] = useState(baseServings);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCooking, setIsCooking] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          router.back();
        }
      },
    })
  ).current;

  const isIngredientAvailable = (ingredientName: string) => {
    const name = ingredientName.toLowerCase().trim();
    return items.some(
      (item) => item.quantity > 0 && item.name.toLowerCase().trim() === name
    );
  };

  const available = useMemo(
    () =>
      recipe ? recipe.ingredients.filter((i) => isIngredientAvailable(i.name)) : [],
    [recipe]
  );

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.subtext }}>Recipe not found.</Text>
      </View>
    );
  }

  const scaleFactor = servings / baseServings;
  const dietTags = recipe.vegan ? ["Vegan", ...(recipe.tags ?? [])] : recipe.tags ?? [];
  const progressPct = Math.round((available.length / recipe.ingredients.length) * 100);

  return (
    <View style={styles.root} {...panResponder.panHandlers}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navbarButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navbarTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
        <TouchableOpacity
          onPress={() => setIsFavorite((f) => !f)}
          style={styles.navbarButton}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? COLORS.red : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }}>
      <Image source={getRecipePhoto(recipe.id)} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Vegan / diet tags */}
          {dietTags.length > 0 && (
            <View style={styles.tagRow}>
              {dietTags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Time + servings */}
          <View style={styles.infoCard}>
            <View style={styles.infoCol}>
              <Ionicons name="time-outline" size={18} color={COLORS.subtext} />
              <Text style={styles.infoValue}>{recipe.time}</Text>
              <Text style={styles.infoLabel}>Time</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoCol}>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  onPress={() => setServings((s) => Math.max(1, s - 1))}
                  style={styles.stepperButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="remove" size={16} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.infoValue}>{servings}</Text>
                <TouchableOpacity
                  onPress={() => setServings((s) => s + 1)}
                  style={styles.stepperButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add" size={16} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.infoLabel}>Servings</Text>
            </View>
          </View>

          {/* On-hand progress, styled after the Kitchen Inventory stats bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>On hand</Text>
              <Text style={styles.progressNumber}>
                {available.length} of {recipe.ingredients.length}
              </Text>
            </View>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.sectionCard}>
            {recipe.ingredients.map((ingredient, idx) => {
              const owned = isIngredientAvailable(ingredient.name);
              const scaledQty = formatQuantity(ingredient.quantity * scaleFactor);
              return (
                <View
                  key={ingredient.name}
                  style={[
                    styles.ingredientRow,
                    idx === recipe.ingredients.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.leftSide}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: owned ? COLORS.greenSoft : COLORS.redSoft },
                      ]}
                    >
                      <Ionicons
                        name={owned ? "checkmark" : "close"}
                        size={16}
                        color={owned ? COLORS.green : COLORS.red}
                      />
                    </View>
                    <Text style={styles.ingredientText}>
                      {scaledQty}
                      {ingredient.unit} {ingredient.name}
                    </Text>
                  </View>
                  {!owned && (
                    <TouchableOpacity style={styles.addButton}>
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Instructions, in a highlighted card like the reference "Direction" panel */}
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.stepsCard}>
            {recipe.instructions.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepRow,
                  index === recipe.instructions.length - 1 && { marginBottom: 0 },
                ]}
              >
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating CTA, inspired by the "Start cooking" pill in the reference app */}
      <View style={styles.ctaWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => setIsCooking(true)}
        >
          <Text style={styles.ctaText}>Start cooking</Text>
        </TouchableOpacity>
      </View>

      {/* Step-by-step cooking mode: timer on steps that mention a wait,
          bold ingredients you can tap to cross out as you go. */}
      <CookingMode
        visible={isCooking}
        onClose={() => setIsCooking(false)}
        title={recipe.title}
        ingredients={recipe.ingredients.map((i) => ({
          ...i,
          quantity: i.quantity * scaleFactor,
        }))}
        instructions={recipe.instructions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 100,
    paddingHorizontal: 8,
    paddingTop: 30,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navbarButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  navbarTitle: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "700", color: COLORS.text },

  container: { flex: 1 },
  image: { width: "100%", height: 280 },
  content: { padding: 22 },

  title: { fontSize: 30, fontWeight: "800", color: COLORS.text, lineHeight: 36 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tagPill: { backgroundColor: COLORS.greenSoft, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: COLORS.green, fontSize: 13, fontWeight: "700" },

  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginTop: 20,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  infoCol: { flex: 1, alignItems: "center", gap: 4 },
  infoDivider: { width: 1, height: "70%", backgroundColor: COLORS.border },
  infoValue: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  infoLabel: { fontSize: 12, color: COLORS.subtext },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepperButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: { fontSize: 14, color: COLORS.subtext, fontWeight: "600" },
  progressNumber: { fontSize: 14, color: COLORS.green, fontWeight: "700" },
  progressBackground: { height: 8, borderRadius: 20, backgroundColor: COLORS.redSoft, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.green, borderRadius: 20 },

  sectionTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, marginTop: 28, marginBottom: 12 },

  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftSide: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 12 },
  ingredientText: { fontSize: 16, color: COLORS.text, flexShrink: 1 },
  addButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginLeft: 8 },
  addButtonText: { fontWeight: "600", fontSize: 13, color: COLORS.text },

  stepsCard: { backgroundColor: COLORS.greenSoft, borderRadius: 18, padding: 18 },
  stepRow: { flexDirection: "row", marginBottom: 18, alignItems: "flex-start" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.green, justifyContent: "center", alignItems: "center", marginRight: 14, marginTop: 2 },
  stepNumber: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  stepText: { flex: 1, fontSize: 16, lineHeight: 24, color: COLORS.text },

  ctaWrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingBottom: 28, paddingTop: 14, alignItems: "center" },
  ctaButton: {
    backgroundColor: COLORS.text,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});