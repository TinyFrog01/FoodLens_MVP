import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getRecipePhoto } from "@/app/Food/data/recipe/photos";
import { Palette } from "@/constants/theme";
import { FridgeMatch, haveLabel, missingLabel } from "@/lib/podium";

import Medal from "./Medal";
import Scrim from "./Scrim";

// Joué une fois par lancement : l'écran de bienvenue puis l'onglet « Ce soir »
// ne rejouent pas deux fois le même moment.
let revealPlayed = false;

// Attente courte : assez pour créer l'attente, pas assez pour lasser.
const SEARCH_MS = 900;

type Props = {
  match: FridgeMatch;
  height: number;
  bottomInset: number;
  eyebrow: string;
  ctaLabel: string;
  onPress: () => void;
  // Classement définitif (essentiels chargés) : le plat dévoilé ne changera plus.
  ready: boolean;
  footer?: React.ReactNode;
};

// La meilleure recette pour ce que tu as, en plein écran. Une courte attente,
// puis le plat apparaît : le dévoilement est le pic de l'expérience, celui
// dont on se souvient, et le plaisir tient surtout à la récompense attendue.
export default function GoldHero({
  match,
  height,
  bottomInset,
  eyebrow,
  ctaLabel,
  onPress,
  ready,
  footer,
}: Props) {
  const [revealed, setRevealed] = useState(revealPlayed);
  const [photo] = useState(() => new Animated.Value(revealPlayed ? 1 : 0));
  const [details] = useState(() => new Animated.Value(revealPlayed ? 1 : 0));
  const [medal] = useState(() => new Animated.Value(revealPlayed ? 1 : 0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (revealed || !ready) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const show = (animate: boolean) => {
      if (cancelled) return;
      breathing.stop();
      revealPlayed = true;
      setRevealed(true);

      if (!animate) {
        photo.setValue(1);
        details.setValue(1);
        medal.setValue(1);
        return;
      }

      if (process.env.EXPO_OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Animated.sequence([
        Animated.timing(photo, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(medal, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }),
          Animated.timing(details, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    // « Réduire les animations » : le plat s'affiche directement.
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (cancelled) return;
        if (reduceMotion) {
          show(false);
          return;
        }
        breathing.start();
        timer = setTimeout(() => show(true), SEARCH_MS);
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      breathing.stop();
    };
  }, [revealed, ready, photo, details, medal, pulse]);

  const recipe = match.verdict.recipe;
  const zoom = photo.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1] });
  const rise = details.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const breathe = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  return (
    <View style={[styles.page, { height }]}>
      <Animated.Image
        source={getRecipePhoto(recipe.id)}
        style={[styles.photo, { opacity: photo, transform: [{ scale: zoom }] }]}
      />
      <Scrim />

      {!revealed && (
        <View style={styles.search}>
          <Animated.View style={[styles.searchIcon, { transform: [{ scale: breathe }] }]}>
            <MaterialCommunityIcons name="fridge-outline" size={34} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.searchText}>{"On regarde ce qu'il y a dans ton frigo…"}</Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.content,
          {
            paddingBottom: bottomInset + 20,
            opacity: details,
            transform: [{ translateY: rise }],
            pointerEvents: revealed ? "auto" : "none",
          },
        ]}
      >
        <View style={styles.eyebrowRow}>
          <Animated.View style={{ transform: [{ scale: medal }] }}>
            <Medal rank={1} />
          </Animated.View>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {recipe.title}
        </Text>
        <Text style={styles.meta}>
          {[recipe.time, haveLabel(match)].filter(Boolean).join("  ·  ")}
        </Text>
        <Text style={styles.missing} numberOfLines={2}>
          {missingLabel(match)}
        </Text>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>

        {footer}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", backgroundColor: Palette.ink, overflow: "hidden" },
  photo: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },

  search: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  searchIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },

  content: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  eyebrow: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: { color: "#FFFFFF", fontSize: 34, lineHeight: 40, fontWeight: "900" },
  meta: { color: "rgba(255,255,255,0.92)", fontSize: 15, fontWeight: "700", marginTop: 10 },
  missing: { color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 19, marginTop: 4 },
  cta: {
    height: 56,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  ctaText: { color: Palette.ink, fontSize: 17, fontWeight: "800" },
});
