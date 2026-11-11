import { ricardoRecipes as recipes } from "@/app/Food/data/recipe/recipe_r";
import CookingMode from "@/components/CookingMode";
import Avatar from "@/components/account/Avatar";
import { CookingForSheet } from "@/components/account/CookingFor";
import { allergenLabel, applianceLabel } from "@/constants/dietary";
import { Palette } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { useOnHand } from "@/hooks/useOnHand";
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
import { useLanguage } from "@/lib/i18n";
import { recipeSteps, recipeTitle } from "@/lib/recipeText";
import {
  defaultServings,
  formatIngredient,
  profileLabel,
  recipeServings,
} from "@/lib/portions";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

// Shared palette (constants/theme): soft off-white background, white cards,
// green for what you have, red for what's missing. The darker amber keeps
// "doesn't like" notes legible on their light background.
const COLORS = {
  bg: Palette.bg,
  card: Palette.card,
  border: Palette.border,
  text: Palette.text,
  subtext: Palette.subtext,
  green: Palette.green,
  greenSoft: Palette.greenSoft,
  red: Palette.danger,
  redSoft: Palette.dangerSoft,
  amber: "#B45309",
  amberSoft: Palette.warnSoft,
};

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
  const { isOnHand } = useOnHand();
  const { tr } = useLanguage();
  const insets = useSafeAreaInsets();

  // Hooks must run before the early return below.
  // null : les portions par défaut du profil.
  const [guestServings, setGuestServings] = useState<number | null>(null);
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
        <Text style={{ color: COLORS.subtext }}>{tr("Recette introuvable.", "Recipe not found.")}</Text>
      </View>
    );
  }

  const people = account ? getCookingFor(account) : [];
  const title = recipeTitle(recipe);
  const steps = recipeSteps(recipe);

  // Portions : réglées d'office selon le profil sur les plats principaux
  // (2 pour toi, 4 pour ta famille), celles de la recette sinon — un gâteau
  // pour 9 deviendrait « 0,44 œuf ». Un réglage choisi pour cette recette est
  // mémorisé avec le compte.
  const baseServings = recipeServings(recipe);
  const peopleCount = Math.max(1, people.length);
  const suggestedServings = defaultServings(recipe, peopleCount);
  const servings = (account ? custom?.servings : guestServings) ?? suggestedServings;
  const setServings = (value: number) => {
    const next = Math.max(1, value);
    if (account) {
      updateCustomization(recipe.id, {
        servings: next === suggestedServings ? undefined : next,
      });
    } else {
      setGuestServings(next);
    }
  };
  const resetServings = () =>
    account
      ? updateCustomization(recipe.id, { servings: undefined })
      : setGuestServings(null);

  const scaleFactor = servings / baseServings;
  const dietTags = displayDiets(recipe);
  const personal = personalizeIngredients(recipe, custom);
  const kept = personal.filter((i) => !i.removed);
  const available = kept.filter((i) => isOnHand(i));
  const progressPct = kept.length
    ? Math.round((available.length / kept.length) * 100)
    : 0;
  const isFavorite = account?.favorites.includes(recipe.id) ?? false;
  const hasIngredientChanges =
    (custom?.removed?.length ?? 0) > 0 || Object.keys(custom?.swaps ?? {}).length > 0;

  const askForAccount = (message: string) =>
    confirmAction({
      title: tr("Crée ton compte gratuit", "Create your free account"),
      message,
      confirmLabel: tr("Créer mon compte", "Create my account"),
      cancelLabel: tr("Plus tard", "Later"),
      onConfirm: () => router.push({ pathname: "/auth", params: { mode: "signup" } }),
    });

  const onFavorite = () =>
    account
      ? toggleFavorite(recipe.id)
      : askForAccount(
          tr(
            "Tes recettes favorites seront enregistrées et faciles à retrouver.",
            "Your favorite recipes will be saved and easy to find."
          )
        );

  const onPersonalize = () => {
    if (!account) {
      askForAccount(
        tr(
          "Fais ta version : remplace ou retire des ingrédients et garde tes notes pour chaque recette.",
          "Make your version: swap or remove ingredients and keep your notes for each recipe."
        )
      );
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
      text: tr(
        `Nécessite : ${verdict.missingAppliances.map(applianceLabel).join(", ")} (tu n'en as pas)`,
        `Needs: ${verdict.missingAppliances.map(applianceLabel).join(", ")} (you don't have one)`
      ),
      icon: "alert-circle-outline",
      color: COLORS.subtext,
      bg: COLORS.bg,
    });
  }
  verdict.dislikes.forEach(({ person, term }) =>
    notices.push({
      key: `dislike-${person}-${term}`,
      text: tr(
        `${person} n'aime pas : ${term}. Touche « Faire ta version » pour le remplacer.`,
        `${person} dislikes: ${term}. Tap “Make your version” to swap it.`
      ),
      icon: "thumbs-down-outline",
      color: COLORS.amber,
      bg: COLORS.amberSoft,
    })
  );
  verdict.likes.forEach(({ person, term }) =>
    notices.push({
      key: `like-${person}-${term}`,
      text: tr(`${person} aime : ${term}`, `${person} likes: ${term}`),
      icon: "heart",
      color: COLORS.green,
      bg: COLORS.greenSoft,
    })
  );

  return (
    <View style={styles.root} {...panResponder.panHandlers}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navbarButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navbarTitle} numberOfLines={1}>
          {title}
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
      <Image source={getRecipePhoto(recipe.id, recipe.image)} style={styles.image} />
        <View style={styles.content}>
          {custom && (
            <View style={styles.versionPill}>
              <Ionicons name="create-outline" size={13} color={COLORS.text} />
              <Text style={styles.versionText}>{tr("Ta version", "Your version")}</Text>
            </View>
          )}
          <Text style={styles.title}>{title}</Text>

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
                <Text style={styles.factLabel}>{tr("Allergènes : ", "Allergens: ")}</Text>
                {recipe.allergens.length > 0
                  ? recipe.allergens.map(allergenLabel).join(" · ")
                  : tr("aucun allergène prioritaire", "no priority allergens")}
              </Text>
            </View>
            {recipe.appliances.length > 0 && (
              <View style={[styles.factRow, { marginTop: 8 }]}>
                <Ionicons name="flame-outline" size={16} color={COLORS.subtext} />
                <Text style={styles.factText}>
                  <Text style={styles.factLabel}>{tr("Appareils : ", "Appliances: ")}</Text>
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
                  <Text style={styles.forLabel}>{tr("Je cuisine pour", "I'm cooking for")}</Text>
                  <Text style={styles.forNames} numberOfLines={1}>
                    {formatNames(people.map((p) => p.name))}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSheetOpen(true)} style={styles.forChange}>
                  <Text style={styles.forChangeText}>{tr("Changer", "Change")}</Text>
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
                    {tr(
                      "Convient à tout le monde : régimes, allergies et appareils respectés.",
                      "Suits everyone: diets, allergies and appliances respected."
                    )}
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
                <Text style={styles.guestTitle}>{tr("Adapte cette recette à ta famille", "Fit this recipe to your family")}</Text>
                <Text style={styles.guestText}>
                  {tr(
                    "Crée ton compte pour tenir compte des régimes, des allergies et des goûts de chacun.",
                    "Create your account to take everyone's diets, allergies and tastes into account."
                  )}
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
              <Text style={styles.infoLabel}>{tr("Temps", "Time")}</Text>
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
              <Text style={styles.infoLabel}>{tr("Portions", "Servings")}</Text>
            </View>
          </View>
          {/* Portions par défaut selon le profil : on le dit, et on peut y revenir. */}
          {servings !== suggestedServings ? (
            <View style={styles.servingsActions}>
              <TouchableOpacity onPress={resetServings} style={styles.servingsChip}>
                <Ionicons name="refresh" size={14} color={COLORS.green} />
                <Text style={styles.servingsChipText}>
                  {tr(`Revenir à ${suggestedServings} portions`, `Back to ${suggestedServings} servings`)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : suggestedServings !== baseServings ? (
            <Text style={styles.servingsNote}>
              {tr(
                `Réglé pour ${profileLabel(peopleCount)} · recette d'origine : ${baseServings} portions`,
                `Set for ${profileLabel(peopleCount)} · original recipe: ${baseServings} servings`
              )}
            </Text>
          ) : null}

          {/* On-hand progress, styled after the Kitchen Inventory stats bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{tr("Dans ton frigo", "In your fridge")}</Text>
              <Text style={styles.progressNumber}>
                {tr(`${available.length} sur ${kept.length}`, `${available.length} of ${kept.length}`)}
              </Text>
            </View>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleInline}>{tr("Ingrédients", "Ingredients")}</Text>
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
                {editing ? tr("Terminé", "Done") : tr("Faire ta version", "Make your version")}
              </Text>
            </TouchableOpacity>
          </View>
          {editing && (
            <Text style={styles.editingHint}>
              {tr(
                "Remplace ou retire un ingrédient : la recette devient ta version.",
                "Swap or remove an ingredient: the recipe becomes your version."
              )}
            </Text>
          )}
          <View style={styles.sectionCard}>
            {personal.map((ingredient, idx) => {
              const owned = isOnHand(ingredient);
              const changed = ingredient.removed || ingredient.swapped;
              // Goûts et allergies tapés en français ou en anglais.
              const mentions = (terms: string[]) =>
                terms.some((t) => ingredient.matchNames.some((n) => ingredientMatches(n, t)));
              const dislikedBy = changed ? [] : people.filter((p) => mentions(p.dislikes)).map((p) => p.name);
              const avoidedBy = changed ? [] : people.filter((p) => mentions(p.avoid)).map((p) => p.name);

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
                          {formatIngredient(ingredient, scaleFactor)}
                        </Text>
                        {ingredient.swapped && (
                          <Text style={styles.ingredientCaption}>
                            {tr(`au lieu de : ${ingredient.originalLabel}`, `instead of: ${ingredient.originalLabel}`)}
                          </Text>
                        )}
                        {avoidedBy.length > 0 && (
                          <Text style={[styles.ingredientCaption, { color: COLORS.red }]}>
                            {tr(`À éviter pour ${formatNames(avoidedBy)}`, `To avoid for ${formatNames(avoidedBy)}`)}
                          </Text>
                        )}
                        {dislikedBy.length > 0 && (
                          <Text style={[styles.ingredientCaption, { color: COLORS.amber }]}>
                            {tr(
                              `${formatNames(dislikedBy)} n'aime${dislikedBy.length > 1 ? "nt" : ""} pas`,
                              `${formatNames(dislikedBy)} ${dislikedBy.length > 1 ? "don't" : "doesn't"} like it`
                            )}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {editing && (
                    <View style={styles.editActions}>
                      {ingredient.removed ? (
                        <SmallButton label={tr("Remettre", "Put back")} onPress={() => restoreIngredient(ingredient.originalName)} />
                      ) : ingredient.swapped ? (
                        <SmallButton label={tr("Annuler le remplacement", "Undo the swap")} onPress={() => undoSwap(ingredient.originalName)} />
                      ) : (
                        <>
                          <SmallButton
                            label={tr("Remplacer", "Swap")}
                            onPress={() => {
                              setSwapTarget(ingredient.originalName);
                              setSwapText("");
                            }}
                          />
                          <SmallButton label={tr("Retirer", "Remove")} onPress={() => removeIngredient(ingredient.originalName)} />
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
                        placeholder={tr(`Remplacer « ${ingredient.originalLabel} » par…`, `Replace “${ingredient.originalLabel}” with…`)}
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
              <Text style={styles.servingsResetText}>{tr("Rétablir les ingrédients d'origine", "Restore the original ingredients")}</Text>
            </TouchableOpacity>
          )}

          {/* Instructions, in a highlighted card like the reference "Direction" panel */}
          <Text style={styles.sectionTitle}>{tr("Étapes", "Steps")}</Text>
          <View style={styles.stepsCard}>
            {steps.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepRow,
                  index === steps.length - 1 && { marginBottom: 0 },
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
              <Text style={styles.sectionTitle}>{tr("Tes notes", "Your notes")}</Text>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                onBlur={saveNote}
                placeholder={tr("Astuces, ajustements, avis de la famille…", "Tips, tweaks, what the family thought…")}
                placeholderTextColor="#A6A6A0"
                multiline
                style={styles.noteInput}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating CTA, full width and under the thumb: the one main action here */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => {
            saveNote();
            setIsCooking(true);
          }}
        >
          <Text style={styles.ctaText}>{tr("Commencer à cuisiner", "Start cooking")}</Text>
        </TouchableOpacity>
      </View>

      {/* Step-by-step cooking mode: timer on steps that mention a wait,
          bold ingredients you can tap to cross out as you go. Uses the
          personalized ingredient list (removed / replaced ingredients). */}
      <CookingMode
        visible={isCooking}
        onClose={() => setIsCooking(false)}
        title={title}
        ingredients={kept.map((i) => ({
          name: i.label,
          unit: i.unit,
          quantity: i.quantity * scaleFactor,
          originalName: i.originalName,
        }))}
        instructions={steps}
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
    paddingHorizontal: 8,
    paddingBottom: 8,
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
  versionPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  versionText: { fontSize: 12.5, fontWeight: "800", color: COLORS.text },

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
    width: 32,
    height: 32,
    borderRadius: 16,
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
  servingsNote: { fontSize: 13, color: COLORS.subtext, textAlign: "center", marginTop: 10 },
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

  // Sober card like the others: color is kept for what you have / what's missing.
  stepsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stepRow: { flexDirection: "row", marginBottom: 18, alignItems: "flex-start" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, justifyContent: "center", alignItems: "center", marginRight: 14, marginTop: 2 },
  stepNumber: { color: COLORS.text, fontWeight: "800", fontSize: 13 },
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

  ctaWrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 14, paddingHorizontal: 20 },
  ctaButton: {
    backgroundColor: COLORS.text,
    borderRadius: 30,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: { color: "#FFF", fontSize: 17, fontWeight: "800" },
});
