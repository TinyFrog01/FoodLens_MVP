import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  FlatList,
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  ListViewToken,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRecipePhoto } from "@/app/Food/data/recipe/photos";
import type { Recipe } from "@/app/Food/data/recipe/types";
import { staples } from "@/app/Food/data/staples";
import { isIngredientOnHand } from "@/app/Food/data/utils/ingredients";
import Scrim from "@/components/Scrim";
import AvatarButton from "@/components/account/AvatarButton";
import { CookingForPill, CookingForSheet } from "@/components/account/CookingFor";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { applianceLabel } from "@/constants/dietary";
import { Palette } from "@/constants/theme";
import { useAccount } from "@/context/AccountContext";
import { useAlwaysOnHand } from "@/hooks/useAlwaysOnHand";
import { useLightStatusBar } from "@/hooks/useLightStatusBar";
import { useRecipeFeed } from "@/hooks/useRecipeFeed";
import { RecipeVerdict } from "@/lib/account/recipeFilter";
import { confirmAction } from "@/lib/confirm";
import { rankByFridge } from "@/lib/fridgeRanking";

// Deux touches plus rapprochées que ça : un « J'aime », comme sur TikTok. Une
// seule touche ouvre la recette, une fois ce délai passé.
const DOUBLE_TAP_MS = 260;
// Le plat avance doucement vers toi tant que sa carte est à l'écran : la photo
// vit comme une vidéo.
const DRIFT_MS = 9000;
// L'invite « Glisse vers le haut » n'apparaît que si on s'attarde sur la
// première carte.
const HINT_DELAY_MS = 1800;
// Photos chargées d'avance : pas d'écran noir en glissant.
const PREFETCH_AHEAD = 3;
const INGREDIENT_CHIPS = 4;
const RAIL_WIDTH = 72;
// Le rail monte au-dessus du pouce, qui tient le téléphone en bas à droite.
const RAIL_LIFT = 150;
const BURST_SIZE = 110;
// La carte affichée : celle qui occupe plus de la moitié de l'écran.
const VIEWABILITY = { itemVisiblePercentThreshold: 60 };

// Une fois par lancement : l'invite disparaît dès le premier glissement.
let swipeHintDone = false;


/* ---------------- BADGE ---------------- */

const getBadge = (missing: number) => {
  if (missing <= 0) return { text: "Tous", color: "#18A64B" };
  if (missing === 1) return { text: "1", color: "#F5C542" };
  if (missing === 2) return { text: "2", color: "#F59E0B" };
  if (missing === 3) return { text: "3", color: "#F97316" };
  if (missing === 4) return { text: "4", color: "#EA580C" };
  return { text: "+5", color: "#E53935" };
};

// Sous la pastille du rail : « Tous en main », « 1 manquant », « 3 manquants ».
const badgeCaption = (missing: number) =>
  missing <= 0 ? "en main" : missing === 1 ? "manquant" : "manquants";


/* ---------------- CARD ---------------- */

/* Pastilles personnelles : ce que quelqu'un n'aime pas, l'appareil qui
   manque, ce que quelqu'un aime (2 au maximum). */
const getFlags = (verdict: RecipeVerdict) => {
  const flags: {
    key: string;
    text: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }[] = [];

  verdict.dislikes.forEach(({ person, term }) =>
    flags.push({
      key: `dislike-${person}-${term}`,
      text: `${person} n'aime pas : ${term}`,
      icon: "thumbs-down-outline",
      color: "rgba(217,119,6,0.92)",
    })
  );

  if (verdict.missingAppliances.length > 0) {
    flags.push({
      key: "appliance",
      text: `Nécessite : ${verdict.missingAppliances.map(applianceLabel).join(", ")}`,
      icon: "alert-circle-outline",
      color: "rgba(0,0,0,0.6)",
    });
  }

  verdict.likes.forEach(({ person, term }) =>
    flags.push({
      key: `like-${person}-${term}`,
      text: `${person} aime : ${term}`,
      icon: "heart",
      color: "rgba(24,166,75,0.92)",
    })
  );

  return flags.slice(0, 2);
};

const shareRecipe = (recipe: Recipe) => {
  Share.share({
    title: recipe.title,
    message: recipe.sourceUrl ? `${recipe.title}\n${recipe.sourceUrl}` : recipe.title,
  }).catch(() => {
    // partage annulé ou indisponible (web sans navigator.share)
  });
};

type Burst = { id: number; x: number; y: number; tilt: number };

// Cœur qui jaillit là où on a touché deux fois, puis s'envole.
function HeartBurst({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onDone(burst.id));
  }, [progress, burst.id, onDone]);

  const scale = progress.interpolate({
    inputRange: [0, 0.15, 0.3, 1],
    outputRange: [0.3, 1.25, 1, 1.35],
  });
  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.6, 1], outputRange: [0, 1, 1, 0] });
  const rise = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -90] });

  return (
    <Animated.View
      style={[
        styles.burst,
        {
          left: burst.x - BURST_SIZE / 2,
          top: burst.y - BURST_SIZE / 2,
          opacity,
          transform: [{ translateY: rise }, { rotate: `${burst.tilt}deg` }, { scale }],
        },
      ]}
    >
      <Ionicons name="heart" size={BURST_SIZE} color={Palette.danger} style={styles.burstIcon} />
    </Animated.View>
  );
}

// Bouton du rail de droite : icône ombrée et petit libellé dessous.
function RailItem({
  label,
  accessibilityLabel,
  onPress,
  children,
}: {
  label: string;
  accessibilityLabel: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  const content = (
    <>
      {children}
      <Text style={styles.railLabel} numberOfLines={2}>
        {label}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.railItem} accessible accessibilityLabel={accessibilityLabel}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.railItem, pressed && { opacity: 0.7 }]}
    >
      {content}
    </Pressable>
  );
}

type CardProps = {
  verdict: RecipeVerdict;
  width: number;
  height: number;
  topInset: number;
  bottomInset: number;
  // carte à l'écran (et onglet affiché) : la photo s'anime
  active: boolean;
  liked: boolean;
  guest: boolean;
  reduceMotion: boolean;
  onOpen: (id: string) => void;
  onToggleLike: (id: string) => void;
  onDoubleTapLike: (id: string) => void;
  onShare: (recipe: Recipe) => void;
};

const RecipeCard = memo(function RecipeCard({
  verdict,
  width,
  height,
  topInset,
  bottomInset,
  active,
  liked,
  guest,
  reduceMotion,
  onOpen,
  onToggleLike,
  onDoubleTapLike,
  onShare,
}: CardProps) {
  const item = verdict.recipe;
  const flags = getFlags(verdict);
  const { activeStaples } = useAlwaysOnHand();

  const onHand = item.ingredients.map((ingredient) =>
    isIngredientOnHand(ingredient.name, activeStaples)
  );
  const missing = onHand.filter((have) => !have).length;
  const badge = getBadge(missing);
  const moreIngredients = item.ingredients.length - INGREDIENT_CHIPS;

  // ── La photo avance et recule lentement tant que la carte est affichée ──
  const [drift] = useState(() => new Animated.Value(0));
  useEffect(() => {
    // Hors écran, elle reste où elle en est : pas de saut pendant le glissement.
    if (!active || reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: DRIFT_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: DRIFT_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, reduceMotion, drift]);
  const zoom = drift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });

  // ── Le cœur du rail rebondit quand la recette devient favorite ──
  const [pop] = useState(() => new Animated.Value(1));
  const wasLiked = useRef(liked);
  useEffect(() => {
    if (liked && !wasLiked.current && !reduceMotion) {
      pop.setValue(0.5);
      Animated.spring(pop, { toValue: 1, friction: 3, tension: 180, useNativeDriver: true }).start();
    }
    wasLiked.current = liked;
  }, [liked, reduceMotion, pop]);

  // ── Une touche : ouvrir. Deux touches : J'aime, avec un cœur à cet endroit ──
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextBurst = useRef(0);
  const lastTap = useRef(0);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    },
    []
  );

  const removeBurst = useCallback(
    (id: number) => setBursts((list) => list.filter((b) => b.id !== id)),
    []
  );

  const onPhotoPress = (event: GestureResponderEvent) => {
    const now = Date.now();
    if (now - lastTap.current > DOUBLE_TAP_MS) {
      lastTap.current = now;
      openTimer.current = setTimeout(() => {
        openTimer.current = null;
        onOpen(item.id);
      }, DOUBLE_TAP_MS);
      return;
    }

    // Chaque touche rapide qui suit ajoute un cœur, comme sur TikTok.
    lastTap.current = now;
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = null;

    if (!guest) {
      // Sur le web, c'est l'événement du navigateur : offsetX au lieu de locationX.
      const { locationX, locationY, offsetX, offsetY } = event.nativeEvent as typeof event.nativeEvent & {
        offsetX?: number;
        offsetY?: number;
      };
      if (process.env.EXPO_OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      if (!reduceMotion) {
        setBursts((list) => [
          ...list.slice(-3),
          {
            id: nextBurst.current++,
            x: locationX ?? offsetX ?? width / 2,
            y: locationY ?? offsetY ?? height / 2,
            tilt: Math.random() * 40 - 20,
          },
        ]);
      }
    }
    onDoubleTapLike(item.id);
  };

  const onHeartPress = () => {
    if (!guest && !liked && process.env.EXPO_OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleLike(item.id);
  };

  return (
    <View style={[styles.card, { width, height }]}>

      {/* PHOTO */}

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPhotoPress}
        accessibilityRole="button"
        accessibilityLabel={`Voir la recette : ${item.title}`}
      >
        <Animated.Image
          source={getRecipePhoto(item.id, item.image)}
          style={[styles.image, { transform: [{ scale: zoom }] }]}
        />
      </Pressable>

      <Scrim edge="top" height={topInset + 90} strength={0.4} />
      <Scrim height="60%" strength={0.85} />

      {bursts.map((burst) => (
        <HeartBurst key={burst.id} burst={burst} onDone={removeBurst} />
      ))}


      {/* LÉGENDE */}

      <View style={[styles.caption, { paddingBottom: bottomInset + 16 }]}>
        <Pressable onPress={() => onOpen(item.id)} accessible={false}>
          <Text style={styles.title} numberOfLines={3}>
            {item.title}
          </Text>

          {/* PERSONAL FLAGS */}

          {flags.length > 0 && (
            <View style={styles.flags}>
              {flags.map((flag) => (
                <View key={flag.key} style={[styles.flag, { backgroundColor: flag.color }]}>
                  <Ionicons name={flag.icon} size={13} color="#fff" />
                  <Text style={styles.flagText} numberOfLines={1}>
                    {flag.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* INGREDIENT CHIPS */}

          <View style={styles.ingredients}>
            {item.ingredients.slice(0, INGREDIENT_CHIPS).map((ingredient, i) => (
              <View
                key={`${ingredient.name}-${i}`}
                style={[styles.ingChip, onHand[i] ? styles.ingHave : styles.ingMissing]}
              >
                <Text style={styles.ingText} numberOfLines={1}>
                  {ingredient.name}
                </Text>
              </View>
            ))}
            {moreIngredients > 0 && (
              <View style={[styles.ingChip, styles.ingMore]}>
                <Text style={styles.ingText}>+{moreIngredients}</Text>
              </View>
            )}
          </View>
        </Pressable>

        <TouchableOpacity style={styles.button} onPress={() => onOpen(item.id)}>
          <Text style={styles.buttonText}>Voir la recette</Text>
          <Ionicons name="arrow-forward" size={18} color={Palette.ink} />
        </TouchableOpacity>
      </View>


      {/* RAIL : favori, temps, ingrédients manquants, partage */}

      <View style={[styles.rail, { bottom: bottomInset + RAIL_LIFT }]}>
        <RailItem
          label={liked ? "Favori" : "J'aime"}
          accessibilityLabel={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          onPress={onHeartPress}
        >
          <Animated.View style={{ transform: [{ scale: pop }] }}>
            <Ionicons
              name="heart"
              size={38}
              color={liked ? Palette.danger : "#FFFFFF"}
              style={styles.railIcon}
            />
          </Animated.View>
        </RailItem>

        <RailItem label={item.time} accessibilityLabel={`Temps : ${item.time}`}>
          <Ionicons name="time" size={34} color="#FFFFFF" style={styles.railIcon} />
        </RailItem>

        <RailItem
          label={badgeCaption(missing)}
          accessibilityLabel={
            missing <= 0
              ? "Tu as tous les ingrédients"
              : `${missing} ingrédient${missing > 1 ? "s" : ""} manquant${missing > 1 ? "s" : ""}`
          }
        >
          <View style={[styles.badge, { backgroundColor: badge.color }]}>
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
        </RailItem>

        <RailItem label="Partager" accessibilityLabel="Partager la recette" onPress={() => onShare(item)}>
          <Ionicons name="arrow-redo" size={34} color="#FFFFFF" style={styles.railIcon} />
        </RailItem>
      </View>

    </View>
  );
});


/* ---------------- SWIPE HINT ---------------- */

// Si on reste sur la première carte : une flèche qui invite à glisser.
function SwipeHint({ reduceMotion }: { reduceMotion: boolean }) {
  const [shown] = useState(() => new Animated.Value(0));
  const [bounce] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const appear = Animated.timing(shown, {
      toValue: 1,
      duration: 300,
      delay: HINT_DELAY_MS,
      useNativeDriver: true,
    });
    const nudge = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 520,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    appear.start();
    if (!reduceMotion) nudge.start();
    return () => {
      appear.stop();
      nudge.stop();
    };
  }, [shown, bounce, reduceMotion]);

  const lift = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });

  return (
    <Animated.View style={[styles.hint, { opacity: shown }]}>
      <Animated.View style={{ transform: [{ translateY: lift }] }}>
        <Ionicons name="chevron-up" size={34} color="#FFFFFF" style={styles.railIcon} />
      </Animated.View>
      <Text style={styles.hintText}>Glisse vers le haut</Text>
    </Animated.View>
  );
}


/* ---------------- FEED ---------------- */

export default function RecipeFeed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Hauteur de la barre d'onglets posée sur le fil (iOS), 0 ailleurs.
  const tabBarOverlap = useBottomTabOverflow();
  const { account, toggleFavorite, updateAccount } = useAccount();

  // Recettes filtrées pour les personnes choisies (tout, en mode invité)
  const { visible } = useRecipeFeed();
  const { activeIds } = useAlwaysOnHand();

  // Classées selon ce que tu as dans ton frigo
  const feed = useMemo(
    () => rankByFridge(visible, staples.filter((s) => activeIds.includes(s.id))),
    [visible, activeIds]
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const isEmpty = visible.length === 0;

  // Une carte = tout l'écran au-dessus des onglets, mesuré plutôt que
  // Dimensions (qui compte aussi la barre d'onglets sur Android).
  const [page, setPage] = useState({ width: 0, height: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hintPending, setHintPending] = useState(!swipeHintDone);

  const signedIn = account !== null;
  const favorites = account?.favorites;

  useLightStatusBar(!isEmpty);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  // « Réduire les animations » : ni zoom, ni cœurs, ni flèche qui rebondit.
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((on) => {
        if (!cancelled) setReduceMotion(on);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // À chaque carte : un léger déclic, et les photos suivantes se chargent.
  const lastIndex = useRef(0);
  const prefetched = useRef(new Set<string>());
  useEffect(() => {
    if (activeIndex !== lastIndex.current && process.env.EXPO_OS !== "web") {
      Haptics.selectionAsync();
    }
    lastIndex.current = activeIndex;

    feed.slice(activeIndex + 1, activeIndex + 1 + PREFETCH_AHEAD).forEach(({ recipe }) => {
      if (!recipe.image.startsWith("http") || prefetched.current.has(recipe.image)) return;
      prefetched.current.add(recipe.image);
      Image.prefetch(recipe.image).catch(() => {});
    });
  }, [activeIndex, feed]);

  const dismissHint = useCallback(() => {
    swipeHintDone = true;
    setHintPending(false);
  }, []);

  // Ne doit jamais changer d'un rendu à l'autre (exigence de FlatList).
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ListViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index == null) return;
      setActiveIndex(index);
      // arrivé plus loin sans glisser du doigt (molette, clavier) : l'invite a servi
      if (index > 0) dismissHint();
    },
    [dismissHint]
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPage((p) => (p.width === width && p.height === height ? p : { width, height }));
  };

  const askForAccount = useCallback(
    () =>
      confirmAction({
        title: "Crée ton compte gratuit",
        message: "Tes recettes favorites seront enregistrées et faciles à retrouver.",
        confirmLabel: "Créer mon compte",
        cancelLabel: "Plus tard",
        onConfirm: () => router.push({ pathname: "/auth", params: { mode: "signup" } }),
      }),
    [router]
  );

  const openRecipe = useCallback((id: string) => router.push(`/recipe/${id}`), [router]);

  const toggleLike = useCallback(
    (id: string) => (signedIn ? toggleFavorite(id) : askForAccount()),
    [signedIn, toggleFavorite, askForAccount]
  );

  // Toucher deux fois ajoute aux favoris, sans jamais retirer.
  const likeOnce = useCallback(
    (id: string) =>
      signedIn
        ? updateAccount((a) =>
            a.favorites.includes(id) ? a : { ...a, favorites: [id, ...a.favorites] }
          )
        : askForAccount(),
    [signedIn, updateAccount, askForAccount]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: RecipeVerdict; index: number }) => (
      <RecipeCard
        verdict={item}
        width={page.width}
        height={page.height}
        topInset={insets.top}
        bottomInset={tabBarOverlap}
        active={focused && index === activeIndex}
        liked={favorites?.includes(item.recipe.id) ?? false}
        guest={!signedIn}
        reduceMotion={reduceMotion}
        onOpen={openRecipe}
        onToggleLike={toggleLike}
        onDoubleTapLike={likeOnce}
        onShare={shareRecipe}
      />
    ),
    [
      page,
      insets.top,
      tabBarOverlap,
      focused,
      activeIndex,
      favorites,
      signedIn,
      reduceMotion,
      openRecipe,
      toggleLike,
      likeOnce,
    ]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: page.height, offset: page.height * index, index }),
    [page.height]
  );

  const showHint = hintPending && focused && activeIndex === 0 && feed.length > 1;

  return (
    <View style={[styles.page, !isEmpty && styles.pageDark]} onLayout={onLayout}>

      {isEmpty ? (

        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="food-off-outline"
            size={64}
            color="#BFBFBF"
          />
          <Text style={styles.emptyTitle}>
            Aucune recette ne convient
          </Text>
          <Text style={styles.emptyText}>
            Les régimes, allergies, appareils ou le temps maximum des
            personnes choisies masquent toutes les recettes.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setSheetOpen(true)}
          >
            <Text style={styles.emptyButtonText}>
              Changer pour qui je cuisine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.emptyLink}>Modifier mes préférences</Text>
          </TouchableOpacity>
        </View>

      ) : page.height > 0 && (

        <FlatList
          data={feed}
          keyExtractor={(item) => item.recipe.id}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          // Une carte par glissement, même lancé fort.
          pagingEnabled
          snapToInterval={page.height}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          onScrollBeginDrag={dismissHint}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={5}
          showsVerticalScrollIndicator={false}
        />

      )}

      {showHint && <SwipeHint reduceMotion={reduceMotion} />}


      {/* TOP BAR : pour qui je cuisine + compte */}

      <View
        style={[styles.topBar, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <CookingForPill onPress={() => setSheetOpen(true)} />
        <AvatarButton onDark={!isEmpty} />
      </View>


      {account && (
        <CookingForSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      )}

    </View>
  );
}


/* ---------------- STYLES ---------------- */

const textShadow = {
  textShadowColor: "rgba(0,0,0,0.45)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 6,
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Palette.bg },
  pageDark: { backgroundColor: Palette.ink },

  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ── Carte ──
  card: { backgroundColor: Palette.ink, overflow: "hidden" },
  image: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },

  burst: { position: "absolute", width: BURST_SIZE, height: BURST_SIZE, pointerEvents: "none" },
  burstIcon: {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },

  caption: {
    position: "absolute",
    left: 0,
    right: RAIL_WIDTH + 8,
    bottom: 0,
    paddingLeft: 16,
    pointerEvents: "box-none",
  },
  title: { color: "#FFFFFF", fontSize: 26, lineHeight: 31, fontWeight: "900", ...textShadow },

  flags: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  flag: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },
  flagText: { color: "#fff", fontSize: 12, fontWeight: "800", marginLeft: 5, flexShrink: 1 },

  ingredients: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  ingChip: {
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },
  ingHave: { backgroundColor: "rgba(24,166,75,0.92)" },
  ingMissing: { backgroundColor: "rgba(229,57,53,0.92)" },
  ingMore: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  ingText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
  },
  buttonText: { color: Palette.ink, fontSize: 16, fontWeight: "900" },

  // ── Rail de droite ──
  rail: { position: "absolute", right: 4, width: RAIL_WIDTH, alignItems: "center", gap: 18 },
  railItem: { width: RAIL_WIDTH, alignItems: "center" },
  railIcon: textShadow,
  railLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
    ...textShadow,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },
  badgeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },

  // ── Invite à glisser ──
  hint: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "36%",
    alignItems: "center",
    pointerEvents: "none",
  },
  hintText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 2, ...textShadow },

  // ── Fil vide ──
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1C1C1A",
    marginTop: 18,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E86",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 21,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 30,
  },
  emptyButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  emptyLink: { marginTop: 16, color: "#3E9C5C", fontSize: 15, fontWeight: "700" },
});
