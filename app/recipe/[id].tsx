import { recipes } from "@/app/Food/data/recipe/recipe";
import { isIngredientOnHand } from "@/app/Food/data/utils/ingredients";
import CookingMode from "@/components/CookingMode";
import Avatar from "@/components/account/Avatar";
import { CookingForSheet } from "@/components/account/CookingFor";
import { allergenLabel, applianceLabel } from "@/constants/dietary";
import { useAccount } from "@/context/AccountContext";
import { useAlwaysOnHand } from "@/hooks/useAlwaysOnHand";
import {
  describeReason,
  displayDiets,
  evaluateRecipe,
  formatNames,
  getCookingFor,
  ingredientMatches,
  personalizeIngredients,
} from "@/lib/account/recipeFilter";
import { confirmAction } from "@/lib/confirm";
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
  TextInput,
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
  amber: "#B45309",
  amberSoft: "#FEF3E2",
};

// Nicely formats a scaled quantity (2 -> "2", 1.333 -> "1.33").
function formatQuantity(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded}`;
}

type Notice = {
  key: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
};

export default function RecipePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recipe = recipes.find((r) => r.id === id);
  const { account, toggleFavorite, updateCustomization } = useAccount();
  const { activeStaples } = useAlwaysOnHand();

  // Hooks must run before the early return below.
  // Portions de la recette d'origine (certaines recettes n'en indiquent pas).
  const baseServings = recipe?.servings && recipe.servings > 0 ? recipe.servings : 2;
  const [guestServings, setGuestServings] = useState(baseServings);
  const [isCooking, setIsCooking] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [swapText, setSwapText] = useState("");
  const custom = account && recipe ? account.customizations[recipe.id] : undefined;
  const [noteDraft, setNoteDraft] = useState(custom?.note ?? "");

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

  const verdict = useMemo(
    () => (recipe ? evaluateRecipe(recipe, account) : null),
    [recipe, account]
  );

  if (!recipe || !verdict) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.subtext }}>Recette introuvable.</Text>
      </View>
    );
  }

  const people = account ? getCookingFor(account) : [];

  // Portions : celles de la recette, ou celles choisies pour cette recette
  // (mémorisées avec le compte). On ne les change pas d'office selon le
  // nombre de personnes — un gâteau pour 9 deviendrait « 0.44 oeufs » —
  // mais on propose d'ajuster en un geste.
  const servings = account ? custom?.servings ?? baseServings : guestServings;
  const canSuggest = Boolean(account && recipe.servings && recipe.servings > 0);
  const setServings = (value: number) => {
    const next = Math.max(1, value);
    if (account) updateCustomization(recipe.id, { servings: next });
    else setGuestServings(next);
  };

  const scaleFactor = servings / baseServings;
  const dietTags = displayDiets(recipe);
  const personal = personalizeIngredients(recipe, custom);
  const kept = personal.filter((i) => !i.removed);
  const available = kept.filter((i) => isIngredientOnHand(i.name, activeStaples));
  const progressPct = kept.length
    ? Math.round((available.length / kept.length) * 100)
    : 0;
  const isFavorite = account?.favorites.includes(recipe.id) ?? false;
  const hasIngredientChanges =
    (custom?.removed?.length ?? 0) > 0 || Object.keys(custom?.swaps ?? {}).length > 0;

  const askForAccount = (message: string) =>
    confirmAction({
      title: "Créez un compte gratuit",
      message,
      confirmLabel: "Créer un compte",
      cancelLabel: "Plus tard",
      onConfirm: () => router.push({ pathname: "/auth", params: { mode: "signup" } }),
    });

  const onFavorite = () =>
    account
      ? toggleFavorite(recipe.id)
      : askForAccount("Vos favoris seront enregistrés et faciles à retrouver.");

  const onPersonalize = () => {
    if (!account) {
      askForAccount("Remplacez ou retirez des ingrédients et gardez vos notes pour chaque recette.");
      return;
    }
    setEditing((e) => !e);
    setSwapTarget(null);
  };

  // ── Personnalisation des ingrédients ──
  const removeIngredient = (name: string) =>
    updateCustomization(recipe.id, { removed: [...(custom?.removed ?? []), name] });
  const restoreIngredient = (name: string) =>
    updateCustomization(recipe.id, {
      removed: (custom?.removed ?? []).filter((n) => n !== name),
    });
  const undoSwap = (name: string) => {
    const { [name]: _undone, ...rest } = custom?.swaps ?? {};
    updateCustomization(recipe.id, { swaps: rest });
  };
  const confirmSwap = () => {
    const value = swapText.trim();
    if (swapTarget && value) {
      updateCustomization(recipe.id, {
        swaps: { ...(custom?.swaps ?? {}), [swapTarget]: value },
      });
    }
    setSwapTarget(null);
    setSwapText("");
  };

  const saveNote = () => {
    if (!account || noteDraft.trim() === (custom?.note ?? "").trim()) return;
    updateCustomization(recipe.id, { note: noteDraft.trim() || undefined });
  };

  // ── Avertissements pour les personnes choisies ──
  const notices: Notice[] = [];
  verdict.reasons.forEach((reason, i) => {
    if (reason.kind === "appliance") return; // affiché plus bas, une seule fois
    const danger = reason.kind !== "time";
    notices.push({
      key: `reason-${i}`,
      text: describeReason(reason),
      icon: danger ? "warning-outline" : "time-outline",
      color: danger ? COLORS.red : COLORS.subtext,
      bg: danger ? COLORS.redSoft : COLORS.bg,
    });
  });
  if (verdict.missingAppliances.length > 0) {
    notices.push({
      key: "appliances",
      text: `Nécessite : ${verdict.missingAppliances.map(applianceLabel).join(", ")} (vous n'en avez pas)`,
      icon: "alert-circle-outline",
      color: COLORS.subtext,
      bg: COLORS.bg,
    });
  }
  verdict.dislikes.forEach(({ person, term }) =>
    notices.push({
      key: `dislike-${person}-${term}`,
      text: `${person} n'aime pas : ${term}. Touchez « Personnaliser » pour le remplacer.`,
      icon: "thumbs-down-outline",
      color: COLORS.amber,
      bg: COLORS.amberSoft,
    })
  );
  verdict.likes.forEach(({ person, term }) =>
    notices.push({
      key: `like-${person}-${term}`,
      text: `${person} aime : ${term}`,
      icon: "heart",
      color: COLORS.green,
      bg: COLORS.greenSoft,
    })
  );

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
        <TouchableOpacity onPress={onFavorite} style={styles.navbarButton}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? COLORS.red : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
      >
      <Image source={getRecipePhoto(recipe.id)} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Diet tags */}
          {dietTags.length > 0 && (
            <View style={styles.tagRow}>
              {dietTags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Allergènes et appareils de la recette */}
          <View style={styles.factsCard}>
            <View style={styles.factRow}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.subtext} />
              <Text style={styles.factText}>
                <Text style={styles.factLabel}>Allergènes : </Text>
                {recipe.allergens.length > 0
                  ? recipe.allergens.map(allergenLabel).join(" · ")
                  : "aucun allergène prioritaire"}
              </Text>
            </View>
            {recipe.appliances.length > 0 && (
              <View style={[styles.factRow, { marginTop: 8 }]}>
                <Ionicons name="flame-outline" size={16} color={COLORS.subtext} />
                <Text style={styles.factText}>
                  <Text style={styles.factLabel}>Appareils : </Text>
                  {recipe.appliances.map(applianceLabel).join(" · ")}
                </Text>
              </View>
            )}
          </View>

          {/* Pour qui je cuisine */}
          {account ? (
            <View style={styles.forCard}>
              <View style={styles.forHeader}>
                <View style={styles.avatarStack}>
                  {people.slice(0, 4).map((p, i) => (
                    <View key={p.id} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                      <Avatar name={p.name} color={p.color} size={32} bordered />
                    </View>
                  ))}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.forLabel}>Je cuisine pour</Text>
                  <Text style={styles.forNames} numberOfLines={1}>
                    {formatNames(people.map((p) => p.name))}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSheetOpen(true)} style={styles.forChange}>
                  <Text style={styles.forChangeText}>Changer</Text>
                </TouchableOpacity>
              </View>

              {notices.length > 0 ? (
                notices.map((n) => (
                  <View key={n.key} style={[styles.notice, { backgroundColor: n.bg }]}>
                    <Ionicons name={n.icon} size={16} color={n.color} />
                    <Text style={[styles.noticeText, { color: n.color }]}>{n.text}</Text>
                  </View>
                ))
              ) : (
                <View style={[styles.notice, { backgroundColor: COLORS.greenSoft }]}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                  <Text style={[styles.noticeText, { color: COLORS.green }]}>
                    Convient à tout le monde : régimes, allergies et appareils respectés.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.guestCard}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: "/auth", params: { mode: "signup" } })}
            >
              <Ionicons name="people-outline" size={22} color={COLORS.green} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.guestTitle}>Adaptez cette recette à votre famille</Text>
                <Text style={styles.guestText}>
                  Créez un compte pour tenir compte des régimes, allergies et goûts de chacun.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.subtext} />
            </TouchableOpacity>
          )}

          {/* Time + servings */}
          <View style={styles.infoCard}>
            <View style={styles.infoCol}>
              <Ionicons name="time-outline" size={18} color={COLORS.subtext} />
              <Text style={styles.infoValue}>{recipe.time || "—"}</Text>
              <Text style={styles.infoLabel}>Temps</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoCol}>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  onPress={() => setServings(servings - 1)}
                  style={styles.stepperButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="remove" size={16} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.infoValue}>{servings}</Text>
                <TouchableOpacity
                  onPress={() => setServings(servings + 1)}
                  style={styles.stepperButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add" size={16} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.infoLabel}>Portions</Text>
            </View>
          </View>
          {account && (
            <View style={styles.servingsActions}>
              {canSuggest && servings !== people.length && (
                <TouchableOpacity
                  onPress={() => setServings(people.length)}
                  style={styles.servingsChip}
                >
                  <Ionicons name="people-outline" size={14} color={COLORS.green} />
                  <Text style={styles.servingsChipText}>
                    Ajuster pour {people.length} personne{people.length > 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              )}
              {custom?.servings !== undefined && custom.servings !== baseServings && (
                <TouchableOpacity
                  onPress={() => updateCustomization(recipe.id, { servings: undefined })}
                  style={styles.servingsChip}
                >
                  <Ionicons name="refresh" size={14} color={COLORS.green} />
                  <Text style={styles.servingsChipText}>
                    Recette d&apos;origine ({baseServings})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* On-hand progress, styled after the Kitchen Inventory stats bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>En stock</Text>
              <Text style={styles.progressNumber}>
                {available.length} sur {kept.length}
              </Text>
            </View>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleInline}>Ingrédients</Text>
            <TouchableOpacity
              onPress={onPersonalize}
              style={[styles.personalizeButton, editing && styles.personalizeButtonActive]}
            >
              <Ionicons
                name={editing ? "checkmark" : "create-outline"}
                size={15}
                color={editing ? "#FFF" : COLORS.text}
              />
              <Text style={[styles.personalizeText, editing && { color: "#FFF" }]}>
                {editing ? "Terminé" : "Personnaliser"}
              </Text>
            </TouchableOpacity>
          </View>
          {editing && (
            <Text style={styles.editingHint}>
              Remplacez ou retirez un ingrédient : la recette est enregistrée à votre
              façon.
            </Text>
          )}
          <View style={styles.sectionCard}>
            {personal.map((ingredient, idx) => {
              const owned = isIngredientOnHand(ingredient.name, activeStaples);
              const scaledQty = formatQuantity(ingredient.quantity * scaleFactor);
              const changed = ingredient.removed || ingredient.swapped;
              const dislikedBy = changed
                ? []
                : people
                    .filter((p) => p.dislikes.some((t) => ingredientMatches(ingredient.originalName, t)))
                    .map((p) => p.name);
              const avoidedBy = changed
                ? []
                : people
                    .filter((p) => p.avoid.some((t) => ingredientMatches(ingredient.originalName, t)))
                    .map((p) => p.name);

              return (
                <View
                  key={`${idx}-${ingredient.originalName}`}
                  style={[
                    styles.ingredientRow,
                    idx === personal.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.ingredientMain}>
                    <View style={styles.leftSide}>
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: ingredient.removed
                              ? COLORS.bg
                              : owned
                                ? COLORS.greenSoft
                                : COLORS.redSoft,
                          },
                        ]}
                      >
                        <Ionicons
                          name={ingredient.removed ? "remove" : owned ? "checkmark" : "close"}
                          size={16}
                          color={ingredient.removed ? COLORS.subtext : owned ? COLORS.green : COLORS.red}
                        />
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text
                          style={[
                            styles.ingredientText,
                            ingredient.removed && styles.ingredientRemoved,
                          ]}
                        >
                          {scaledQty}
                          {ingredient.unit} {ingredient.name}
                        </Text>
                        {ingredient.swapped && (
                          <Text style={styles.ingredientCaption}>
                            au lieu de : {ingredient.originalName}
                          </Text>
                        )}
                        {avoidedBy.length > 0 && (
                          <Text style={[styles.ingredientCaption, { color: COLORS.red }]}>
                            À éviter pour {formatNames(avoidedBy)}
                          </Text>
                        )}
                        {dislikedBy.length > 0 && (
                          <Text style={[styles.ingredientCaption, { color: COLORS.amber }]}>
                            {formatNames(dislikedBy)} n&apos;aime{dislikedBy.length > 1 ? "nt" : ""} pas
                          </Text>
                        )}
                      </View>
                    </View>

                    {!editing && !owned && !ingredient.removed && (
                      <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>Ajouter</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {editing && (
                    <View style={styles.editActions}>
                      {ingredient.removed ? (
                        <SmallButton label="Remettre" onPress={() => restoreIngredient(ingredient.originalName)} />
                      ) : ingredient.swapped ? (
                        <SmallButton label="Annuler le remplacement" onPress={() => undoSwap(ingredient.originalName)} />
                      ) : (
                        <>
                          <SmallButton
                            label="Remplacer"
                            onPress={() => {
                              setSwapTarget(ingredient.originalName);
                              setSwapText("");
                            }}
                          />
                          <SmallButton label="Retirer" onPress={() => removeIngredient(ingredient.originalName)} />
                        </>
                      )}
                    </View>
                  )}

                  {editing && swapTarget === ingredient.originalName && (
                    <View style={styles.swapRow}>
                      <TextInput
                        value={swapText}
                        onChangeText={setSwapText}
                        onSubmitEditing={confirmSwap}
                        placeholder={`Remplacer « ${ingredient.originalName} » par…`}
                        placeholderTextColor="#A6A6A0"
                        autoFocus
                        returnKeyType="done"
                        style={styles.swapInput}
                      />
                      <TouchableOpacity style={styles.swapOk} onPress={confirmSwap}>
                        <Text style={styles.swapOkText}>OK</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          {editing && hasIngredientChanges && (
            <TouchableOpacity
              onPress={() => updateCustomization(recipe.id, { removed: [], swaps: {} })}
              style={styles.servingsReset}
            >
              <Text style={styles.servingsResetText}>Rétablir les ingrédients d&apos;origine</Text>
            </TouchableOpacity>
          )}

          {/* Instructions, in a highlighted card like the reference "Direction" panel */}
          <Text style={styles.sectionTitle}>Étapes</Text>
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

          {/* Notes personnelles */}
          {account && (
            <>
              <Text style={styles.sectionTitle}>Mes notes</Text>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                onBlur={saveNote}
                placeholder="Astuces, ajustements, avis de la famille…"
                placeholderTextColor="#A6A6A0"
                multiline
                style={styles.noteInput}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating CTA, inspired by the "Start cooking" pill in the reference app */}
      <View style={styles.ctaWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => {
            saveNote();
            setIsCooking(true);
          }}
        >
          <Text style={styles.ctaText}>Commencer à cuisiner</Text>
        </TouchableOpacity>
      </View>

      {/* Step-by-step cooking mode: timer on steps that mention a wait,
          bold ingredients you can tap to cross out as you go. Uses the
          personalized ingredient list (removed / replaced ingredients). */}
      <CookingMode
        visible={isCooking}
        onClose={() => setIsCooking(false)}
        title={recipe.title}
        ingredients={kept.map((i) => ({
          name: i.name,
          unit: i.unit,
          quantity: i.quantity * scaleFactor,
        }))}
        instructions={recipe.instructions}
      />

      {account && <CookingForSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />}
    </View>
  );
}

function SmallButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.smallButton} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
      <Text style={styles.smallButtonText}>{label}</Text>
    </TouchableOpacity>
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

  factsCard: { marginTop: 14 },
  factRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  factText: { flex: 1, fontSize: 14, color: COLORS.subtext, lineHeight: 20 },
  factLabel: { fontWeight: "700", color: COLORS.text },

  forCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  forHeader: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  avatarStack: { flexDirection: "row" },
  forLabel: { fontSize: 12, color: COLORS.subtext, fontWeight: "600" },
  forNames: { fontSize: 15, color: COLORS.text, fontWeight: "700", marginTop: 1 },
  forChange: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  forChangeText: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noticeText: { flex: 1, fontSize: 13.5, fontWeight: "600", lineHeight: 19 },

  guestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guestTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  guestText: { fontSize: 13, color: COLORS.subtext, marginTop: 2, lineHeight: 18 },

  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginTop: 14,
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
  servingsActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 10 },
  servingsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.greenSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  servingsChipText: { color: COLORS.green, fontWeight: "700", fontSize: 13 },
  servingsReset: { alignSelf: "center", paddingVertical: 8, marginTop: 4 },
  servingsResetText: { color: COLORS.green, fontWeight: "700", fontSize: 13 },

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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitleInline: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  personalizeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  personalizeButtonActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  personalizeText: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  editingHint: { fontSize: 13, color: COLORS.subtext, marginTop: -4, marginBottom: 10, lineHeight: 18 },

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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ingredientMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSide: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 12 },
  ingredientText: { fontSize: 16, color: COLORS.text, flexShrink: 1 },
  ingredientRemoved: { textDecorationLine: "line-through", color: COLORS.subtext },
  ingredientCaption: { fontSize: 12.5, color: COLORS.subtext, marginTop: 2, fontWeight: "600" },
  addButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginLeft: 8 },
  addButtonText: { fontWeight: "600", fontSize: 13, color: COLORS.text },
  editActions: { flexDirection: "row", gap: 6, marginTop: 10, marginLeft: 44 },
  smallButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallButtonText: { fontSize: 12.5, fontWeight: "700", color: COLORS.text },
  swapRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginLeft: 44, gap: 8 },
  swapInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  swapOk: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
  },
  swapOkText: { color: "#FFF", fontWeight: "700" },

  stepsCard: { backgroundColor: COLORS.greenSoft, borderRadius: 18, padding: 18 },
  stepRow: { flexDirection: "row", marginBottom: 18, alignItems: "flex-start" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.green, justifyContent: "center", alignItems: "center", marginRight: 14, marginTop: 2 },
  stepNumber: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  stepText: { flex: 1, fontSize: 16, lineHeight: 24, color: COLORS.text },

  noteInput: {
    minHeight: 110,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.text,
    textAlignVertical: "top",
  },

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
