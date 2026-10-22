import { items } from "@/app/Food/data/items";
import { staples } from "@/app/Food/data/staples";
import AvatarButton from "@/components/account/AvatarButton";
import { useAlwaysOnHand } from "@/hooks/useAlwaysOnHand";
import { usePhotos } from "@/hooks/usePhotos";
import { normalizeName } from "@/lib/ingredientDetection";
import {
  CATEGORY_LABELS,
  collectIngredients,
  PhotoIngredient,
  reviewItems,
} from "@/lib/photoStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Fuse from "fuse.js";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const horizontalPadding = width * 0.05;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LETTER_HEIGHT = 15;

// Fixed row heights used to compute scroll offsets analytically instead of
// relying on FlatList.scrollToIndex (which only works for already-measured
// rows and was causing the "flash back to A" bug on far jumps).
const ITEM_ROW_HEIGHT = 92; // card padding/margins from styles.card
const HEADER_ROW_HEIGHT = 48; // letterHeader padding/margins from styles.letterHeader

type Item = {
  id: string;
  name: string;
  location: string;
  quantity: number;
  // Vu sur au moins une photo (ic\u00f4ne appareil photo dans la liste).
  fromPhoto?: boolean;
};

const removeAccent = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const categoriesLabel = (ingredient: PhotoIngredient) =>
  ingredient.categories.map((c) => CATEGORY_LABELS[c]).join(", ");

// \u2705 Ajoute \u00e0 l'inventaire les ingr\u00e9dients confirm\u00e9s sur les photos : +1 par
// photo pour un aliment d\u00e9j\u00e0 list\u00e9, sinon une nouvelle entr\u00e9e rang\u00e9e selon
// la cat\u00e9gorie de la photo. Tri\u00e9 pour que les lettres restent dans l'ordre.
const mergeInventory = (base: Item[], detected: PhotoIngredient[]) => {
  const merged = base.map((item) => ({ ...item }));

  detected.forEach((ingredient) => {
    const key = normalizeName(ingredient.name);
    const existing = merged.find((item) => normalizeName(item.name) === key);

    if (existing) {
      existing.quantity += ingredient.refs.length;
      existing.fromPhoto = true;
      return;
    }

    merged.push({
      id: `photo-${ingredient.key}`,
      name: ingredient.name,
      location: categoriesLabel(ingredient),
      quantity: ingredient.refs.length,
      fromPhoto: true,
    });
  });

  return merged.sort((a, b) =>
    normalizeName(a.name).localeCompare(normalizeName(b.name))
  );
};

// \u2705 Ingr\u00e9dients vus sur les photos mais sous le seuil de confiance :
// l'utilisateur les garde (ils rejoignent la liste) ou les retire.
const ToReviewCard = ({ ingredients }: { ingredients: PhotoIngredient[] }) => {
  if (ingredients.length === 0) return null;

  return (
    <View style={[styles.staplesCard, styles.reviewCard]}>
      <View style={styles.staplesHeader}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.staplesTitle}>To review</Text>
          <Text style={styles.staplesSubtitle}>
            {"Seen on your photos, but the AI isn't sure. Keep the ones you really have."}
          </Text>
        </View>
        <Text style={[styles.staplesCount, styles.reviewCount]}>
          {ingredients.length}
        </Text>
      </View>

      {ingredients.map((ingredient, index) => (
        <View
          key={ingredient.key}
          style={[styles.reviewRow, index > 0 && styles.reviewRowBorder]}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.reviewName} numberOfLines={1}>
              {ingredient.name}
            </Text>
            <Text style={styles.reviewMeta} numberOfLines={1}>
              {categoriesLabel(ingredient)}
              {ingredient.confidence !== undefined
                ? ` \u00b7 ${Math.round(ingredient.confidence * 100)}% sure`
                : ""}
            </Text>
          </View>

          <Pressable
            style={styles.reviewRemove}
            onPress={() => reviewItems(ingredient.refs, "remove").catch(console.error)}
            accessibilityLabel={`Remove ${ingredient.name}`}
          >
            <Text style={styles.reviewRemoveText}>\u2715</Text>
          </Pressable>
          <Pressable
            style={styles.reviewKeep}
            onPress={() => reviewItems(ingredient.refs, "confirm").catch(console.error)}
          >
            <Text style={styles.reviewKeepText}>Keep</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

const AlwaysOnHandCard = () => {
  const { activeIds, toggle } = useAlwaysOnHand();

  return (
    <View style={styles.staplesCard}>
      <View style={styles.staplesHeader}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.staplesTitle}>Always on hand</Text>
          <Text style={styles.staplesSubtitle}>
            Ingrédients de base toujours disponibles. Désactive ceux qu'il
            t'arrive de manquer — les recettes en tiendront compte.
          </Text>
        </View>
        <Text style={styles.staplesCount}>
          {activeIds.length} sur {staples.length}
        </Text>
      </View>


      <View style={styles.staplesRow}>
        {staples.map((staple) => {
          const active = activeIds.includes(staple.id);
          return (
            <Pressable
              key={staple.id}
              onPress={() => toggle(staple.id)}
              style={[styles.staplePill, active && styles.staplePillActive]}
            >
              <View
                style={[
                  styles.staplesCheck,
                  active && styles.staplesCheckActive,
                ]}
              >
                {active && <Text style={styles.staplesCheckMark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.staplesLabel,
                  active && styles.staplesLabelActive,
                ]}
              >
                {staple.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Drives the alphabet wave (bold letter + neighbors fading out)
  const activeIndex = useRef(new Animated.Value(-100)).current;
  // While true, list-driven updates to activeIndex are suppressed so a
  // sidebar drag isn't fought over by the scroll listener
  const isDraggingSidebar = useRef(false);

  // Absolute screen Y of the alphabet sidebar's top edge. We use this with
  // pageY (screen-absolute) instead of locationY, because locationY is
  // relative to whichever child (a specific letter's Animated.Text)
  // actually received the touch — not to the sidebar container — so it
  // gives inconsistent results depending on which letter you tap/land on.
  const alphabetContainerRef = useRef<View>(null);
  const alphabetContainerPageY = useRef(0);

  // Measured height of the "Always on hand" header block (+ its wrapper
  // margins), so offset math below stays accurate regardless of how many
  // staples are active / how many rows they wrap onto.
  const listHeaderHeight = useRef(0);

  // ✅ Inventaire = liste de base + ingrédients confirmés sur les photos.
  const photos = usePhotos();
  const photoIngredients = useMemo(() => collectIngredients(photos), [photos]);
  const inventory = useMemo(
    () => mergeInventory(items, photoIngredients.confirmed),
    [photoIngredients]
  );

  const fuse = useMemo(
    () =>
      new Fuse(inventory, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [inventory]
  );

  const groupedItems = useMemo(() => {
    return Object.values(
      inventory.reduce((groups: any, item) => {
        const letter = removeAccent(item.name[0].toUpperCase());

        if (!groups[letter]) {
          groups[letter] = { type: "header", letter, id: `header-${letter}` };
        }
        if (!groups[letter + "-items"]) {
          groups[letter + "-items"] = [];
        }
        // `letter` is carried on every item too, so the FlatList's
        // viewability callback can tell which section is on screen even
        // when the section header itself has scrolled out of view.
        groups[letter + "-items"].push({ ...item, type: "item", letter });

        return groups;
      }, {})
    ).flat();
  }, [inventory]);

  // Analytic top-offset (in px, relative to the start of the list content,
  // i.e. AFTER the ListHeaderComponent) for each letter's header row.
  // Because every row height is fixed by style, we can compute exactly
  // where each letter lands without needing FlatList to have rendered/
  // measured it yet — this is what lets us jump straight to any letter
  // in one frame instead of falling back to an estimate that lands near A.
  const letterOffsetsFromTop = useMemo(() => {
    const map: Record<string, number> = {};
    let offset = 0;
    (groupedItems as any[]).forEach((entry) => {
      if (entry.type === "header") {
        map[entry.letter] = offset;
        offset += HEADER_ROW_HEIGHT;
      } else {
        offset += ITEM_ROW_HEIGHT;
      }
    });
    return map;
  }, [groupedItems]);

  const filteredItems = search
    ? fuse.search(search).map((result) => ({ ...result.item, type: "item" }))
    : groupedItems;

  const totalItems = inventory.length;
  const totalUnits = inventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const lowStock = inventory.filter((i) => i.quantity <= 1).length;

  const scrollToLetter = (letter: string) => {
    let target: string | undefined = letter;

    if (!(target in letterOffsetsFromTop)) {
      const letterIdx = alphabet.indexOf(letter);
      target = undefined;
      for (let d = 1; d < alphabet.length && !target; d++) {
        const up = alphabet[letterIdx + d];
        const down = alphabet[letterIdx - d];
        if (up && up in letterOffsetsFromTop) target = up;
        else if (down && down in letterOffsetsFromTop) target = down;
      }
    }

    if (target && flatListRef.current) {
      // No header row is prepended when searching (ListHeaderComponent is
      // null in that case), so only add its height when it's present.
      const headerHeight = search ? 0 : listHeaderHeight.current;
      const offset = headerHeight + letterOffsetsFromTop[target];
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  };

  const handleSidebarTouch = (evt: any) => {
    isDraggingSidebar.current = true;
    // pageY is the touch's absolute position on screen, so subtracting the
    // container's own absolute top edge gives a position that's always
    // correct relative to the sidebar — whether the touch landed on a
    // single tapped letter or moved there via a swipe.
    const y = evt.nativeEvent.pageY - alphabetContainerPageY.current;
    let index = Math.floor(y / LETTER_HEIGHT);
    index = Math.max(0, Math.min(alphabet.length - 1, index));
    activeIndex.setValue(index); // instant feedback while dragging/tapping
    scrollToLetter(alphabet[index]);
  };

  const measureAlphabetContainer = () => {
    // Re-measure on every touch start (cheap, native call) rather than
    // relying solely on onLayout, so rotations/keyboard-driven layout
    // shifts can't leave a stale offset behind.
    alphabetContainerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      alphabetContainerPageY.current = pageY;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // measure() is async, so do it synchronously via onLayout's cached
        // value first, then handle the touch — re-measuring here keeps it
        // fresh for the *next* touch without delaying this one.
        handleSidebarTouch(evt);
        measureAlphabetContainer();
      },
      onPanResponderMove: handleSidebarTouch,
      onPanResponderRelease: () => {
        isDraggingSidebar.current = false;
        // no reset here — the list's own scroll position (from
        // scrollToLetter above) takes over via onViewableItemsChanged
      },
      onPanResponderTerminate: () => {
        isDraggingSidebar.current = false;
      },
    })
  ).current;

  // Keeps the bold letter synced to whatever section is actually visible,
  // so scrolling the list itself (not just dragging the sidebar) keeps
  // the highlight accurate — starting from wherever you last navigated to
  // instead of resetting to the top.
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (isDraggingSidebar.current || !viewableItems.length) return;
      const topItem = viewableItems[0].item;
      const idx = alphabet.indexOf(topItem?.letter);
      if (idx !== -1) {
        Animated.timing(activeIndex, {
          toValue: idx,
          duration: 120,
          useNativeDriver: false,
        }).start();
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 1,
  }).current;

  const renderItem = ({ item }: any) => {
    if (item.type === "header") {
      return <Text style={styles.letterHeader}>{item.letter}</Text>;
    }

    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.subtitleRow}>
            {item.fromPhoto && (
              <MaterialCommunityIcons
                name="camera-outline"
                size={14}
                color={TEXT_MUTED}
                style={styles.subtitleIcon}
              />
            )}
            <Text style={styles.subtitle}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.quantityPill}>
          <Text style={styles.quantity}>{item.quantity}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <AvatarButton />
        </View>
        <Text style={styles.eyebrow}>KITCHEN INVENTORY</Text>
        <Text style={styles.pageTitle}>Your items</Text>
        <Text style={styles.pageSubtitle}>Everything currently in your kitchen.</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{totalItems}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{totalUnits}</Text>
          <Text style={styles.statLabel}>Total units</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={[styles.statNumber, lowStock > 0 && styles.statNumberWarn]}>
            {lowStock}
          </Text>
          <Text style={styles.statLabel}>Running low</Text>
        </View>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Recherche..."
        placeholderTextColor="#A6A6A0"
        value={search}
        onChangeText={setSearch}
      />

      {/* Sidebar stays fixed outside the FlatList — it never scrolls away,
          only the card + ingredients inside the FlatList do. */}
      <View style={styles.container}>
        <View
          ref={alphabetContainerRef}
          style={styles.alphabetContainer}
          onLayout={measureAlphabetContainer}
          {...panResponder.panHandlers}
        >
          {alphabet.map((letter, index) => {
            const distance = Animated.subtract(activeIndex, index);

            const scale = distance.interpolate({
              inputRange: [-3, -2, -1, 0, 1, 2, 3],
              outputRange: [1, 1.15, 1.4, 1.75, 1.4, 1.15, 1],
              extrapolate: "clamp",
            });

            const color = distance.interpolate({
              inputRange: [-3, -2, -1, 0, 1, 2, 3],
              outputRange: [
                "#C7C7BF",
                "#9C9C93",
                "#5C5C55",
                "#000000",
                "#5C5C55",
                "#9C9C93",
                "#C7C7BF",
              ],
              extrapolate: "clamp",
            });

            return (
              <Animated.Text
                key={letter}
                style={[styles.letterIndex, { color, transform: [{ scale }] }]}
              >
                {letter}
              </Animated.Text>
            );
          })}
        </View>

        <FlatList
          ref={flatListRef}
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          // Un élément (et non une fonction) : sinon le header est remonté
          // à chaque rendu, ce qui arrive dès qu'une analyse se termine.
          ListHeaderComponent={
            search ? null : (
              <View
                onLayout={(e) => {
                  // + staplesHeaderWrapper margins (marginTop 14 + marginBottom 4)
                  listHeaderHeight.current = e.nativeEvent.layout.height + 18;
                }}
              >
                <ToReviewCard ingredients={photoIngredients.toReview} />
                <AlwaysOnHandCard />
              </View>
            )
          }
          ListHeaderComponentStyle={styles.staplesHeaderWrapper}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
    </View>
  );
}

const GREEN = "#3E9C5C";
const BG = "#F7F6F3";
const CARD_BG = "#FFFFFF";
const TEXT_MUTED = "#8E8E86";
const WARN = "#E0A458";

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG, paddingTop: 55 },
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
  },
  statBlock: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 34, backgroundColor: "#EDEDE8" },
  statNumber: { fontSize: 24, fontWeight: "800", color: "#1C1C1A" },
  statNumberWarn: { color: WARN },
  statLabel: { fontSize: 13, color: TEXT_MUTED, marginTop: 4 },
  search: {
    height: 46,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#EDEDE8",
  },
  staplesHeaderWrapper: {
    marginTop: 14,
    marginBottom: 4,
  },
  staplesCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    // no marginHorizontal here — horizontal padding now comes from the
    // FlatList's row container (styles.container), so it lines up with
    // the item cards below it
    padding: 18,
    borderWidth: 1,
    borderColor: "#EFEFEA",
  },
  staplesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  staplesTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1C1C1A",
    marginBottom: 4,
  },
  staplesSubtitle: { fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
  staplesCount: { fontSize: 13, fontWeight: "700", color: GREEN },
  staplesRow: { flexDirection: "row", flexWrap: "wrap" },
  staplePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E4E4DE",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: BG,
    marginRight: 8,
    marginBottom: 8,
  },
  staplePillActive: { borderColor: GREEN, backgroundColor: "#EEF6F0" },
  staplesCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C7C7BF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  staplesCheckActive: { borderColor: GREEN, backgroundColor: GREEN },
  staplesCheckMark: { fontSize: 10, color: "#FFFFFF", fontWeight: "800" },
  staplesLabel: { fontSize: 14, color: TEXT_MUTED, fontWeight: "600" },
  staplesLabelActive: { color: "#1C1C1A", fontWeight: "600" },
  container: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: horizontalPadding,
    marginTop: 10,
  },
  list: { flex: 1, marginLeft: 15 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEA",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1C1C1A" },
  subtitleRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  subtitleIcon: { marginRight: 4 },
  subtitle: { fontSize: 14, color: TEXT_MUTED },
  reviewCard: { marginBottom: 12, borderColor: "#F5D9C9" },
  reviewCount: { color: WARN },
  reviewRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  reviewRowBorder: { borderTopWidth: 1, borderTopColor: "#F0F0EC" },
  reviewName: { fontSize: 15, fontWeight: "700", color: "#1C1C1A" },
  reviewMeta: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  reviewRemove: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  reviewRemoveText: { fontSize: 13, color: TEXT_MUTED, fontWeight: "700" },
  reviewKeep: {
    backgroundColor: "#EEF6F0",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  reviewKeepText: { fontSize: 14, color: GREEN, fontWeight: "700" },
  quantityPill: {
    backgroundColor: "#EEF6F0",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  quantity: { fontSize: 20, fontWeight: "700", color: GREEN },
  alphabetContainer: {
    justifyContent: "center",
    paddingTop: 4,
    // Extra bottom space so the full A–Z run clears the tab/nav bar
    // instead of the last few letters sitting underneath it.
    paddingBottom: 70,
  },
  letterIndex: {
    fontSize: 11,
    fontWeight: "700",
    height: LETTER_HEIGHT,
    lineHeight: LETTER_HEIGHT,
    width: 16,
    textAlign: "center",
  },
  letterHeader: {
    paddingVertical: 4,
    fontSize: 20,
    fontWeight: "800",
    color: "#1C1C1A",
    marginVertical: 8,
    marginLeft: 5,
  },
});