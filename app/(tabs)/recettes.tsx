import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CompletionBar from "@/components/CompletionBar";
import AvatarButton from "@/components/account/AvatarButton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const CARD_WIDTH = (width - 48) / 2;

// ─────────────────────────────────────────────
// Config des catégories (ordre + icône + libellé)
// ─────────────────────────────────────────────
type CategoryKey = "fridge" | "freezer" | "pantry" | "counter" | "uncategorized";

type DetectedItem = {
  name: string;
  confirmed: boolean; // false = "needs review"
};

type Photo = {
  id: string;
  uri: string;
  category?: CategoryKey;
  date?: string;
  itemsDetected?: number;
  needCheck?: number;
  items?: DetectedItem[];
};

// Catégories affichées comme sections. "uncategorized" est en dernier et
// n'accueille que les photos sans catégorie connue (jamais choisie manuellement).
const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { key: "fridge", label: "Frigo", icon: "fridge-outline" },
  { key: "freezer", label: "Congélateur", icon: "snowflake" },
  { key: "pantry", label: "Garde-manger", icon: "food-variant" },
  { key: "counter", label: "Comptoir", icon: "countertop-outline" },
  { key: "uncategorized", label: "Non catégorisé", icon: "help-box-outline" },
];

export default function Recette() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchPhotos = async () => {
        const storedPhotos = await AsyncStorage.getItem("photos");

        if (storedPhotos) {
          const parsed = JSON.parse(storedPhotos);

          // Compatibilité : si d'anciennes entrées sont de simples strings
          // (uri uniquement) ou n'ont pas de catégorie/id, on les normalise.
          const normalized: Photo[] = parsed.map((p: any, index: number) => {
            if (typeof p === "string") {
              return {
                id: `legacy-${index}-${p}`,
                uri: p,
                category: "uncategorized" as CategoryKey,
              };
            }

            return {
              ...p,
              id: p.id ?? `legacy-${index}-${p.uri}`,
              category: p.category ?? ("uncategorized" as CategoryKey),
            };
          });

          setPhotos(normalized);
        } else {
          setPhotos([]);
        }
      };

      fetchPhotos();
    }, [])
  );

  // Regroupe les photos par catégorie
  const photosByCategory = useMemo(() => {
    const map: Record<CategoryKey, Photo[]> = {
      fridge: [],
      freezer: [],
      pantry: [],
      counter: [],
      uncategorized: [],
    };

    photos.forEach((p) => {
      const key = p.category && map[p.category] ? p.category : "uncategorized";
      map[key].push(p);
    });

    return map;
  }, [photos]);

  // ─────────────────────────────────────────────
  // Positionnement direct sur une photo (ex: celle qu'on vient de prendre)
  // ─────────────────────────────────────────────
  // La caméra renvoie ici avec ?highlightId=<id>. On mémorise la position de
  // chaque section / grille / card via onLayout, puis on place le scroll
  // pour que la photo soit centrée à l'écran, sans animation.
  const { highlightId } = useLocalSearchParams<{ highlightId?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const layout = useRef({
    viewportHeight: 0,
    contentHeight: 0,
    contentY: 0,
    sectionY: {} as Partial<Record<CategoryKey, number>>,
    gridY: {} as Partial<Record<CategoryKey, number>>,
    cards: {} as Record<string, { y: number; height: number }>,
  });
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Les onLayout arrivent dans un ordre non garanti : on attend un court
  // instant que toutes les positions soient à jour avant de calculer.
  const scrollToHighlight = useCallback(() => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    if (!highlightId) return;

    scrollTimer.current = setTimeout(() => {
      const l = layout.current;
      const categoryKey = (Object.keys(photosByCategory) as CategoryKey[]).find(
        (key) => photosByCategory[key].some((p) => p.id === highlightId)
      );
      if (!categoryKey) return; // photo pas encore chargée

      const card = l.cards[highlightId];
      const sectionY = l.sectionY[categoryKey];
      const gridY = l.gridY[categoryKey];
      if (!card || sectionY === undefined || gridY === undefined) return;

      const cardTop = l.contentY + sectionY + gridY + card.y;
      const target = cardTop - (l.viewportHeight - card.height) / 2;
      const maxY = Math.max(0, l.contentHeight - l.viewportHeight);

      scrollRef.current?.scrollTo({
        y: Math.min(Math.max(0, target), maxY),
        animated: false,
      });

      // On retire le paramètre pour ne pas re-scroller au prochain focus.
      router.setParams({ highlightId: undefined });
    }, 50);
  }, [highlightId, photosByCategory, router]);

  // Couvre le cas où aucun onLayout ne se redéclenche (ex: redo d'une photo
  // qui garde la même place).
  useEffect(() => {
    scrollToHighlight();
  }, [scrollToHighlight]);

  useEffect(
    () => () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    },
    []
  );

  // Stats globales (haut de page)
  const totalItems = photos.reduce((sum, p) => sum + (p.itemsDetected ?? 9), 0);
  const totalNeedCheck = photos.reduce((sum, p) => sum + (p.needCheck ?? 2), 0);

  const renderPhotoCard = (item: Photo, index: number) => {
    const needCheck = item.needCheck ?? (index % 3 === 0 ? 0 : 1);
    const identified = item.itemsDetected ?? 2;
    const dateLabel = item.date ?? "Today • 9:12 AM";

    // ✅ Si la catégorie de la photo est connue (pas "uncategorized"), on la
    // repasse à la caméra pour que le "redo" sauvegarde directement sans
    // redemander la catégorie. Sinon (photo "non catégorisée"), on laisse
    // la caméra demander la catégorie comme pour une nouvelle photo.
    const knownCategory =
      item.category && item.category !== "uncategorized"
        ? item.category
        : undefined;

    const handleRedo = () => {
      router.push({
        pathname: "/camera",
        params: {
          editId: item.id,
          ...(knownCategory ? { category: knownCategory } : {}),
        },
      });
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          layout.current.cards[item.id] = { y, height };
          scrollToHighlight();
        }}
        onPress={() =>
          router.push({
            pathname: "/photo-detail",
            params: { photo: JSON.stringify(item) },
          })
        }
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.uri }} style={styles.image} />

          {/* ✅ Bouton "redo" en coin supérieur pour reprendre la photo */}
          <TouchableOpacity
            style={styles.redoButton}
            onPress={handleRedo}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="refresh" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.date}>{dateLabel}</Text>

          {needCheck > 0 ? (
            <View style={styles.badge}>
              <Ionicons name="warning-outline" size={14} color="#E85C41" />
              <Text style={styles.badgeText}>{needCheck} to check</Text>
            </View>
          ) : (
            <View style={styles.badgeGreen}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#37B24D" />
              <Text style={styles.badgeGreenText}>{identified} identified</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Pour "uncategorized" on n'affiche pas de "+" : ces photos n'ont pas
  // vocation à recevoir de nouveaux ajouts manuels, seulement à accueillir
  // les anciennes photos sans catégorie.
  const renderAddCard = (categoryKey: CategoryKey) => {
    if (categoryKey === "uncategorized") return null;

    return (
      <TouchableOpacity
        key="add"
        style={styles.addCard}
        onPress={() =>
          router.push({
            pathname: "/camera",
            params: { category: categoryKey },
          })
        }
      >
        <Ionicons name="add" size={70} color="#B8B8B8" />
        <Text style={styles.addText}>Add photo</Text>
      </TouchableOpacity>
    );
  };

  const renderSection = (categoryKey: CategoryKey) => {
    const items = photosByCategory[categoryKey];
    const config = CATEGORIES.find((c) => c.key === categoryKey)!;

    // On masque la section "Non catégorisé" tant qu'elle est vide.
    if (categoryKey === "uncategorized" && items.length === 0) return null;

    const identifiedCount = items.reduce(
      (sum, p) => sum + (p.itemsDetected ?? 2),
      0
    );
    const totalCount = items.reduce(
      (sum, p) => sum + (p.itemsDetected ?? 2) + (p.needCheck ?? 1),
      0
    );

    return (
      <View
        key={categoryKey}
        style={styles.section}
        onLayout={(e) => {
          layout.current.sectionY[categoryKey] = e.nativeEvent.layout.y;
          scrollToHighlight();
        }}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconWrap}>
            <MaterialCommunityIcons name={config.icon} size={20} color="#37B24D" />
          </View>

          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>{config.label}</Text>
            <Text style={styles.sectionSubtitle}>
              {items.length} photo{items.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {totalCount > 0 && (
            <Text style={styles.sectionCount}>
              {identifiedCount} of {totalCount} identified
            </Text>
          )}
        </View>

        {totalCount > 0 && (
          <View style={styles.sectionCompletionBar}>
            <CompletionBar identified={identifiedCount} total={totalCount} />
          </View>
        )}

        <View
          style={styles.grid}
          onLayout={(e) => {
            layout.current.gridY[categoryKey] = e.nativeEvent.layout.y;
            scrollToHighlight();
          }}
        >
          {items.map((item, index) => renderPhotoCard(item, index))}
          {renderAddCard(categoryKey)}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      onLayout={(e) => {
        layout.current.viewportHeight = e.nativeEvent.layout.height;
        scrollToHighlight();
      }}
      onContentSizeChange={(_w, h) => {
        layout.current.contentHeight = h;
        scrollToHighlight();
      }}
    >
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <AvatarButton />
        </View>
        <Text style={styles.eyebrow}>KITCHEN INVENTORY</Text>
        <Text style={styles.pageTitle}>Your food photos</Text>
        <Text style={styles.pageSubtitle}>
          Every fridge you've scanned appears here.
        </Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{photos.length}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Items detected</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{totalNeedCheck}</Text>
          <Text style={styles.statLabel}>Need review</Text>
        </View>
      </View>

      {/* ✅ Tout le contenu qui doit respecter le padding horizontal de 16
          (sections de photos + état vide) est regroupé ici. Le header et la
          statsCard restent EN DEHORS de ce wrapper : ils gèrent déjà leur
          propre espacement horizontal (paddingHorizontal/marginHorizontal
          20), donc on ne veut pas leur ajouter le padding du container
          par-dessus. */}
      <View
        style={styles.content}
        onLayout={(e) => {
          layout.current.contentY = e.nativeEvent.layout.y;
          scrollToHighlight();
        }}
      >
        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={70} color="#BFBFBF" />

            <Text style={styles.emptyTitle}>No fridge scanned yet</Text>

            <Text style={styles.emptyText}>
              Take a picture from the Camera tab.
            </Text>
          </View>
        ) : (
          CATEGORIES.map((c) => renderSection(c.key))
        )}
      </View>
    </ScrollView>
  );
}

const GREEN = "#3E9C5C";
const BG = "#F7F6F3";
const CARD_BG = "#FFFFFF";
const TEXT_MUTED = "#8E8E86";
const WARN = "#E0A458";

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, marginBottom: 18 },
  headerAvatar: { position: "absolute", top: 0, right: 20, zIndex: 1 },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pageTitle: { fontSize: 34, fontWeight: "800", color: "#1C1C1A" },
  pageSubtitle: { fontSize: 15, color: TEXT_MUTED, marginTop: 4 },

  statsCard: {
    flexDirection: "row",
    backgroundColor: CARD_BG,
    borderRadius: 20,
    marginHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 25,
  },
  statBlock: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 34, backgroundColor: "#EDEDE8" },
  statNumber: { fontSize: 24, fontWeight: "800", color: "#1C1C1A" },
  statNumberWarn: { color: WARN },
  statLabel: { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },

  container: {
    flex: 1,
    backgroundColor: "#F8F8F6",
    paddingTop: 55,
  },

  // ✅ Seul ce wrapper porte le padding horizontal de 16, appliqué
  // uniquement aux sections de photos / état vide (pas au header, pas à
  // la statsCard, qui gèrent déjà leur propre espacement).
  content: {
    paddingHorizontal: 16,
  },

  smallTitle: {
    color: "#37B24D",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  title: {
    fontSize: 34,
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
    marginBottom: 25,
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

  statText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  // ── Sections (Frigo / Congélateur / Garde-manger / Comptoir / Non catégorisé) ──
  section: {
    marginTop: 0,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E7F7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1C1C1A",
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#8E8E86",
    marginTop: 1,
  },

  sectionCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#37B24D",
  },

  sectionCompletionBar: {
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    margin: 8,
    elevation: 4,
  },

  // ✅ Conteneur de l'image, nécessaire pour positionner le bouton redo
  // en absolu par-dessus la photo sans changer le layout de la card.
  imageWrapper: {
    width: "100%",
    position: "relative",
  },

  image: {
    width: "100%",
    height: 210,
  },

  // ✅ Bouton redo, coin supérieur droit de la photo.
  redoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  cardFooter: {
    padding: 12,
  },

  date: {
    color: "#666",
    marginBottom: 8,
  },

  badge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#FFE9E3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    alignItems: "center",
  },

  badgeText: {
    marginLeft: 5,
    color: "#E85C41",
    fontWeight: "700",
  },

  badgeGreen: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#E7F7EB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    alignItems: "center",
  },

  badgeGreenText: {
    marginLeft: 5,
    color: "#37B24D",
    fontWeight: "700",
  },

  addCard: {
    width: CARD_WIDTH,
    height: 295,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D6D6D6",
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    backgroundColor: "#FCFCFC",
  },

  addText: {
    marginTop: 10,
    color: "#999",
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
  },

  emptyText: {
    marginTop: 10,
    color: "#777",
    fontSize: 16,
  },
});