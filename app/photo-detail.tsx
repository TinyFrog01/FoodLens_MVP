import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import ReviewDeck from "@/components/ReviewDeck";
import { usePhotos } from "@/hooks/usePhotos";
import { confirmAction } from "@/lib/confirm";
import { tr, useLanguage } from "@/lib/i18n";
import {
  CONFIDENCE_THRESHOLD,
  countItems,
  describeItems,
  DetectedItem,
} from "@/lib/ingredientDetection";
import {
  addItem,
  analyzePhoto,
  CategoryKey,
  deletePhotoMessage,
  deletePhotos,
  editPhotoItems,
  photoDateLabel,
  ReviewCard,
  reviewCards,
  reviewItems,
  StoredPhoto as Photo,
} from "@/lib/photoStore";

const RED = "#E85C41";
// Ingrédient passé dans le paquet : toujours à vérifier, mais plus tard.
const YELLOW = "#F59F00";

// Sur le web, le champ « Ajouter un ingrédient » est une ligne de la liste :
// pas de cadre du navigateur autour (comme sur le téléphone).
const NO_WEB_OUTLINE = Platform.select<TextStyle>({
  web: { outlineStyle: "none" } as unknown as TextStyle,
  default: {},
});

const formatConfidence = (item: DetectedItem) =>
  item.confidence === undefined ? null : `${Math.round(item.confidence * 100)}%`;

const CATEGORY_CONFIG: Record<
  CategoryKey,
  { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  fridge: { get label() { return tr("Frigo", "Fridge"); }, icon: "fridge-outline" },
  freezer: { get label() { return tr("Congélateur", "Freezer"); }, icon: "snowflake" },
  pantry: { get label() { return tr("Garde-manger", "Pantry"); }, icon: "food-variant" },
  counter: { get label() { return tr("Comptoir", "Counter"); }, icon: "countertop-outline" },
  uncategorized: { get label() { return tr("Non catégorisé", "Uncategorized"); }, icon: "help-box-outline" },
};

export default function PhotoDetail() {
  const router = useRouter();
  const { id, photo } = useLocalSearchParams<{ id?: string; photo?: string }>();
  useLanguage(); // redessine l'écran quand la langue change

  // Le param `photo` sert au premier rendu ; ensuite on suit la version
  // enregistrée, qui change quand l'analyse se termine ou qu'on valide
  // un ingrédient.
  const initial: Photo | undefined = useMemo(
    () => (photo ? JSON.parse(photo) : undefined),
    [photo]
  );
  const photos = usePhotos();
  const photoId = id ?? initial?.id;
  const data = photos.find((p) => p.id === photoId) ?? initial;

  // ✅ Le paquet « à vérifier » s'ouvre tout seul quand on arrive sur une
  // photo qui a des ingrédients jamais vus (ou dès que son analyse en
  // trouve). Ceux passés, en jaune, ne le rouvrent pas.
  const [autoDismissed, setAutoDismissed] = useState(false);

  // ✅ Paquet ouvert à la main : tous ceux à vérifier, passés compris (le
  // chiffre « À vérifier », « Vérifier en glissant »), ou un ingrédient
  // touché dans la liste, seul, pour corriger son nom.
  const [opened, setOpened] = useState<{ cards: ReviewCard[]; editing: boolean } | null>(
    null
  );

  // ✅ Ingrédient oublié par l'IA : écrit dans la dernière ligne de la liste.
  const [newName, setNewName] = useState("");

  if (!data) return <View style={styles.container} />;

  const category = data.category ?? "counter";
  const categoryConfig = CATEGORY_CONFIG[category];
  const dateLabel = photoDateLabel(data);

  const items = data.items ?? [];
  const { identified, needCheck, skipped, total } = countItems(items);
  // Jamais vus d'abord, puis passés : le même ordre que dans le paquet.
  const toReview = reviewCards([data]).map((card) => card.item);
  const confirmed = items.filter((i) => i.confirmed);
  // Tous passés : le chiffre « À vérifier » passe au jaune.
  const checkColor = skipped > 0 && skipped === needCheck ? YELLOW : RED;

  const autoCards =
    !autoDismissed && data.detection === "done"
      ? reviewCards([data], { withSkipped: false })
      : [];
  const deck = opened ?? (autoCards.length > 0 ? { cards: autoCards, editing: false } : null);
  const reviewAll = () => setOpened({ cards: reviewCards([data]), editing: false });
  const edit = (item: DetectedItem) =>
    setOpened({ cards: [{ photo: data, item }], editing: true });
  // Fermé (ou fini) : il ne se rouvre plus tout seul pendant cette visite.
  const closeDeck = () => {
    setOpened(null);
    setAutoDismissed(true);
  };

  // Seulement une fois l'analyse terminée : une analyse (re)lancée remplace
  // toute la liste, l'ajout serait perdu.
  const canAdd = data.detection === "done";
  const addName = newName.trim();
  const addIngredient = () => {
    if (!addName) return;
    editPhotoItems(data.id, addItem(addName)).catch(console.error);
    setNewName("");
  };

  const review = (item: DetectedItem, action: "confirm" | "remove") =>
    reviewItems([{ photoId: data.id, name: item.name }], action).catch(
      console.error
    );

  // Le nom seul est le bouton : les boutons Garder / Retirer de la ligne
  // restent à part (un bouton dans un bouton est invisible à VoiceOver).
  const renderItemName = (item: DetectedItem, color: string) => (
    <TouchableOpacity
      style={styles.itemLeft}
      onPress={() => edit(item)}
      accessibilityRole="button"
      accessibilityLabel={tr(`Modifier ${item.name}`, `Edit ${item.name}`)}
    >
      <View style={[styles.itemDot, { backgroundColor: color }]} />
      <Text style={styles.itemName} numberOfLines={1}>
        {describeItems([item])}
      </Text>
      {formatConfidence(item) && (
        <Text style={styles.itemConfidence}>{formatConfidence(item)}</Text>
      )}
      <Ionicons name="pencil" size={13} color="#C4C4BC" style={styles.editIcon} />
    </TouchableOpacity>
  );

  const handleDelete = () =>
    confirmAction({
      title: tr("Supprimer cette photo ?", "Delete this photo?"),
      message: deletePhotoMessage(data),
      confirmLabel: tr("Supprimer", "Delete"),
      destructive: true,
      onConfirm: () =>
        deletePhotos([data.id]).then(() => router.back(), console.error),
    });

  const renderAnalysisState = () => {
    if (data.detection === "pending") {
      return (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#37B24D" />
          <Text style={styles.stateText}>{tr("Analyse des ingrédients…", "Analyzing the ingredients…")}</Text>
        </View>
      );
    }

    let message: string | null = null;
    if (data.detection === "error") {
      message = data.detectionError ?? tr("L'analyse a échoué.", "The analysis failed.");
    } else if (data.detection !== "done") {
      message = tr("Cette photo n'a pas encore été analysée.", "This photo hasn't been analyzed yet.");
    } else if (items.length === 0) {
      message = tr("Aucun ingrédient trouvé sur cette photo.", "No ingredients found on this photo.");
    }
    if (!message) return null;

    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>{message}</Text>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => analyzePhoto(data).catch(console.error)}
        >
          <Ionicons name="sparkles-outline" size={16} color="white" />
          <Text style={styles.analyzeButtonText}>
            {data.detection === undefined ? tr("Analyser", "Analyze") : tr("Analyser de nouveau", "Analyze again")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      // Champ « Ajouter un ingrédient » : le bouton Ajouter répond dès le
      // premier toucher, clavier ouvert, et iOS remonte le champ au-dessus.
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1C1C1A" />
        </TouchableOpacity>

        <View style={styles.categoryPill}>
          <MaterialCommunityIcons
            name={categoryConfig.icon}
            size={16}
            color="#37B24D"
          />
          <Text style={styles.categoryPillText}>{categoryConfig.label}</Text>
        </View>
      </View>

      {/* Photo */}
      <Image source={{ uri: data.uri }} style={styles.photo} />

      <Text style={styles.smallTitle}>{tr("TON SCAN", "YOUR SCAN")}</Text>
      <Text style={styles.title}>{categoryConfig.label}</Text>
      <Text style={styles.subtitle}>{dateLabel}</Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statText}>{tr("Détectés", "Detected")}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: "#37B24D" }]}>
            {identified}
          </Text>
          <Text style={styles.statText}>{tr("Identifiés", "Identified")}</Text>
        </View>

        <View style={styles.separator} />

        {/* ✅ Le chiffre « À vérifier » ouvre le paquet avec tous ceux à
            vérifier, passés compris. */}
        <TouchableOpacity
          style={styles.stat}
          onPress={reviewAll}
          disabled={needCheck === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: needCheck === 0 }}
          accessibilityLabel={tr(
            `${needCheck} à vérifier : les revoir en glissant`,
            `${needCheck} to check: review them by swiping`
          )}
        >
          <Text style={[styles.statNumber, { color: checkColor }]}>{needCheck}</Text>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabel}>{tr("À vérifier", "To check")}</Text>
            {needCheck > 0 && <Ionicons name="chevron-forward" size={12} color="#777" />}
          </View>
        </TouchableOpacity>
      </View>

      {renderAnalysisState()}

      {/* ✅ Sous le seuil de confiance : l'utilisateur garde ou retire */}
      {toReview.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("À vérifier", "To check")}</Text>
          <Text style={styles.sectionHint}>
            {tr(
              `L'IA en est sûre à moins de ${Math.round(CONFIDENCE_THRESHOLD * 100)} %. Garde ceux qui sont vraiment dans ton frigo : les autres ne comptent pas dans les recettes.`,
              `The AI is less than ${Math.round(CONFIDENCE_THRESHOLD * 100)}% sure. Keep the ones that are really in your fridge: the others don't count in recipes.`
            )}
            {skipped > 0 &&
              tr(" En jaune : ceux que tu as passés.", " In yellow: the ones you skipped.")}
          </Text>

          <TouchableOpacity style={styles.swipeButton} onPress={reviewAll}>
            <MaterialCommunityIcons name="gesture-swipe-horizontal" size={18} color="white" />
            <Text style={styles.swipeButtonText}>
              {tr("Vérifier en glissant", "Review by swiping")}
            </Text>
          </TouchableOpacity>

          <View style={styles.itemsCard}>
            {toReview.map((item, index) => (
              <View
                key={item.name}
                style={[
                  styles.itemRow,
                  index !== toReview.length - 1 && styles.itemRowBorder,
                ]}
              >
                {renderItemName(item, item.skipped ? YELLOW : RED)}

                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => review(item, "remove")}
                    accessibilityLabel={tr(`Retirer ${item.name}`, `Remove ${item.name}`)}
                  >
                    <Ionicons name="close" size={16} color="#8E8E86" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keepButton}
                    onPress={() => review(item, "confirm")}
                  >
                    <Text style={styles.keepButtonText}>{tr("Garder", "Keep")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {(confirmed.length > 0 || canAdd) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr("Identifiés", "Identified")}</Text>

          <View style={styles.itemsCard}>
            {confirmed.map((item, index) => (
              <View
                key={item.name}
                style={[
                  styles.itemRow,
                  (index !== confirmed.length - 1 || canAdd) && styles.itemRowBorder,
                ]}
              >
                {renderItemName(item, "#37B24D")}

                <Ionicons name="checkmark-circle" size={18} color="#37B24D" />
              </View>
            ))}

            {/* ✅ Au bout de la liste : ce que l'IA n'a pas vu. Entrée garde le
                clavier ouvert pour en ajouter plusieurs à la suite. */}
            {canAdd && (
              <View style={styles.itemRow}>
                <Ionicons name="add" size={18} color="#37B24D" style={styles.addIcon} />
                <TextInput
                  style={[styles.addInput, NO_WEB_OUTLINE]}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder={tr("Ajouter un ingrédient", "Add an ingredient")}
                  placeholderTextColor="#A6A6A0"
                  accessibilityLabel={tr("Ajouter un ingrédient", "Add an ingredient")}
                  returnKeyType="done"
                  onSubmitEditing={addIngredient}
                  blurOnSubmit={false}
                  autoCorrect={false}
                />
                {addName !== "" && (
                  <TouchableOpacity
                    style={styles.keepButton}
                    onPress={addIngredient}
                    accessibilityLabel={tr(`Ajouter ${addName}`, `Add ${addName}`)}
                  >
                    <Text style={styles.keepButtonText}>{tr("Ajouter", "Add")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Info card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr("Infos", "Info")}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#8E8E86" />
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{dateLabel}</Text>
          </View>

          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <MaterialCommunityIcons
              name={categoryConfig.icon}
              size={18}
              color="#8E8E86"
            />
            <Text style={styles.infoLabel}>{tr("Emplacement", "Location")}</Text>
            <Text style={styles.infoValue}>{categoryConfig.label}</Text>
          </View>
        </View>
      </View>

      {/* ✅ Supprime la photo et les ingrédients trouvés dessus */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color="#E85C41" />
        <Text style={styles.deleteButtonText}>{tr("Supprimer la photo", "Delete the photo")}</Text>
      </TouchableOpacity>

      <ReviewDeck
        visible={deck !== null}
        cards={deck?.cards ?? []}
        editing={deck?.editing}
        onClose={closeDeck}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F6",
    paddingHorizontal: 16,
    paddingTop: 55,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F7EB",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
  },

  categoryPillText: {
    marginLeft: 6,
    color: "#37B24D",
    fontWeight: "700",
    fontSize: 13,
  },

  photo: {
    width: "100%",
    height: 280,
    borderRadius: 20,
    marginBottom: 20,
  },

  smallTitle: {
    color: "#37B24D",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1C1A",
  },

  subtitle: {
    color: "#8E8E86",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 25,
  },

  statsContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
  },

  stat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  separator: {
    width: 1,
    height: 34,
    backgroundColor: "#E8E8E8",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
  },

  statText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  // « À vérifier › » : le libellé et sa flèche (le chiffre se touche).
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },

  statLabel: {
    fontSize: 13,
    color: "#777",
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1C1C1A",
    marginBottom: 10,
  },

  itemsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    elevation: 3,
  },

  // Pas de marge verticale ici : elle est dans le nom (itemLeft), pour que
  // toute la hauteur de la ligne réponde au toucher.
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0EE",
  },

  itemLeft: {
    flex: 1,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginRight: 10,
  },

  editIcon: {
    marginLeft: 8,
  },

  // Le « + » centré sur les pastilles du dessus, le texte aligné sur les noms.
  addIcon: {
    marginLeft: -5,
    marginRight: 5,
  },

  addInput: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1A",
  },

  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },

  itemName: {
    flexShrink: 1,
    fontSize: 15,
    color: "#1C1C1A",
    fontWeight: "600",
  },

  itemConfidence: {
    marginLeft: 8,
    fontSize: 13,
    color: "#8E8E86",
    fontWeight: "600",
  },

  sectionHint: {
    fontSize: 13,
    color: "#8E8E86",
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 10,
  },

  reviewActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F4F4F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  keepButton: {
    backgroundColor: "#E7F7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },

  swipeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#37B24D",
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 12,
  },

  swipeButtonText: {
    marginLeft: 8,
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  keepButtonText: {
    color: "#37B24D",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── État de l'analyse (en cours / échec / rien trouvé) ──
  stateCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginBottom: 25,
    elevation: 3,
  },

  stateText: {
    marginTop: 8,
    fontSize: 14,
    color: "#8E8E86",
    textAlign: "center",
  },

  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#37B24D",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
  },

  analyzeButtonText: {
    marginLeft: 6,
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    elevation: 3,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0EE",
  },

  infoLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#8E8E86",
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    color: "#1C1C1A",
    fontWeight: "700",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE9E3",
    paddingVertical: 14,
    borderRadius: 30,
  },

  deleteButtonText: {
    marginLeft: 8,
    color: "#E85C41",
    fontWeight: "700",
    fontSize: 15,
  },
});