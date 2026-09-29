import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

type DetectedItem = {
  name: string;
  confirmed: boolean;
};

type CategoryKey = "fridge" | "freezer" | "pantry" | "counter" | "uncategorized";



type Photo = {
  uri: string;
  category?: CategoryKey;
  date?: string;
  itemsDetected?: number;
  needCheck?: number;
  items?: DetectedItem[];
};

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
  const { photo } = useLocalSearchParams<{ photo: string }>();

  const data: Photo = useMemo(() => JSON.parse(photo), [photo]);

  const category = data.category ?? "counter";
  const categoryConfig = CATEGORY_CONFIG[category];

  const identified = data.itemsDetected ?? 2;
  const needCheck = data.needCheck ?? 1;
  const dateLabel = data.date ?? "Today • 9:12 AM";

  // Fallback list if no per-item detail was stored
  const items: DetectedItem[] =
    data.items ??
    Array.from({ length: identified + needCheck }).map((_, i) => ({
      name: i < identified ? `Item ${i + 1}` : `Unidentified item ${i + 1}`,
      confirmed: i < identified,
    }));

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
          <Text style={styles.statNumber}>{identified + needCheck}</Text>
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

      {/* Items list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detected items</Text>

        <View style={styles.itemsCard}>
          {items.map((item, index) => (
            <View
              key={`${item.name}-${index}`}
              style={[
                styles.itemRow,
                index !== items.length - 1 && styles.itemRowBorder,
              ]}
            >
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.itemDot,
                    { backgroundColor: item.confirmed ? "#37B24D" : "#E85C41" },
                  ]}
                />
                <Text style={styles.itemName}>{item.name}</Text>
              </View>

              {item.confirmed ? (
                <Ionicons name="checkmark-circle" size={18} color="#37B24D" />
              ) : (
                <TouchableOpacity style={styles.reviewButton}>
                  <Text style={styles.reviewButtonText}>Review</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>

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
    flexDirection: "row",
    alignItems: "center",
  },

  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },

  itemName: {
    fontSize: 15,
    color: "#1C1C1A",
    fontWeight: "600",
  },

  reviewButton: {
    backgroundColor: "#FFE9E3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },

  reviewButtonText: {
    color: "#E85C41",
    fontWeight: "700",
    fontSize: 12,
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