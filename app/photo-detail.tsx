import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { usePhotos } from "@/hooks/usePhotos";
import {
  CONFIDENCE_THRESHOLD,
  countItems,
  DetectedItem,
} from "@/lib/ingredientDetection";
import {
  analyzePhoto,
  CategoryKey,
  reviewItems,
  StoredPhoto as Photo,
} from "@/lib/photoStore";

const formatConfidence = (item: DetectedItem) =>
  item.confidence === undefined ? null : `${Math.round(item.confidence * 100)}%`;

const CATEGORY_CONFIG: Record<
  CategoryKey,
  { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  fridge: { label: "Frigo", icon: "fridge-outline" },
  freezer: { label: "Congélateur", icon: "snowflake" },
  pantry: { label: "Garde-manger", icon: "food-variant" },
  counter: { label: "Comptoir", icon: "countertop-outline" },
  uncategorized: { label: "Non catégorisé", icon: "help-box-outline" },
};

export default function PhotoDetail() {
  const router = useRouter();
  const { id, photo } = useLocalSearchParams<{ id?: string; photo?: string }>();

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

  if (!data) return <View style={styles.container} />;

  const category = data.category ?? "counter";
  const categoryConfig = CATEGORY_CONFIG[category];
  const dateLabel = data.date ?? "Today • 9:12 AM";

  const items = data.items ?? [];
  const { identified, needCheck, total } = countItems(items);
  const toReview = items.filter((i) => !i.confirmed);
  const confirmed = items.filter((i) => i.confirmed);

  const review = (item: DetectedItem, action: "confirm" | "remove") =>
    reviewItems([{ photoId: data.id, name: item.name }], action).catch(
      console.error
    );

  const renderAnalysisState = () => {
    if (data.detection === "pending") {
      return (
        <View style={styles.stateCard}>
          <ActivityIndicator color="#37B24D" />
          <Text style={styles.stateText}>Analyzing ingredients…</Text>
        </View>
      );
    }

    let message: string | null = null;
    if (data.detection === "error") {
      message = data.detectionError ?? "The analysis failed.";
    } else if (data.detection !== "done") {
      message = "This photo hasn't been analyzed yet.";
    } else if (items.length === 0) {
      message = "No ingredients found on this photo.";
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
            {data.detection === undefined ? "Analyze" : "Analyze again"}
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

      <Text style={styles.smallTitle}>PHOTO DETAILS</Text>
      <Text style={styles.title}>{categoryConfig.label} scan</Text>
      <Text style={styles.subtitle}>{dateLabel}</Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statText}>Detected</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: "#37B24D" }]}>
            {identified}
          </Text>
          <Text style={styles.statText}>Identified</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: "#E85C41" }]}>
            {needCheck}
          </Text>
          <Text style={styles.statText}>Need review</Text>
        </View>
      </View>

      {renderAnalysisState()}

      {/* ✅ Sous le seuil de confiance : l'utilisateur garde ou retire */}
      {toReview.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To review</Text>
          <Text style={styles.sectionHint}>
            The AI is less than {Math.round(CONFIDENCE_THRESHOLD * 100)}% sure
            about these. Keep the ones that are really there.
          </Text>

          <View style={styles.itemsCard}>
            {toReview.map((item, index) => (
              <View
                key={item.name}
                style={[
                  styles.itemRow,
                  index !== toReview.length - 1 && styles.itemRowBorder,
                ]}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.itemDot, { backgroundColor: "#E85C41" }]} />
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {formatConfidence(item) && (
                    <Text style={styles.itemConfidence}>
                      {formatConfidence(item)}
                    </Text>
                  )}
                </View>

                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => review(item, "remove")}
                    accessibilityLabel={`Remove ${item.name}`}
                  >
                    <Ionicons name="close" size={16} color="#8E8E86" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keepButton}
                    onPress={() => review(item, "confirm")}
                  >
                    <Text style={styles.keepButtonText}>Keep</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {confirmed.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identified</Text>

          <View style={styles.itemsCard}>
            {confirmed.map((item, index) => (
              <View
                key={item.name}
                style={[
                  styles.itemRow,
                  index !== confirmed.length - 1 && styles.itemRowBorder,
                ]}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.itemDot, { backgroundColor: "#37B24D" }]} />
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {formatConfidence(item) && (
                    <Text style={styles.itemConfidence}>
                      {formatConfidence(item)}
                    </Text>
                  )}
                </View>

                <Ionicons name="checkmark-circle" size={18} color="#37B24D" />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Info card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Info</Text>

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
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{categoryConfig.label}</Text>
          </View>
        </View>
      </View>
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

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0EE",
  },

  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
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
});