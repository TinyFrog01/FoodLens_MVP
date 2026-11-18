import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tr, useLanguage } from "@/lib/i18n";
import {
  BoundingBox,
  CONFIDENCE_THRESHOLD,
  DetectedItem,
  ImageSize,
  itemQuantity,
  normalizeName,
} from "@/lib/ingredientDetection";
import {
  CATEGORY_LABELS,
  categoryOf,
  editPhotoItems,
  keepItem,
  photoDateLabel,
  removeItem,
  renameItem,
  ReviewCard,
  skipItems,
} from "@/lib/photoStore";

// ─────────────────────────────────────────────
// Paquet de cartes « à vérifier », façon Tinder
// ─────────────────────────────────────────────
// Une carte par ingrédient sous le seuil de confiance, zoomée sur l'endroit
// où l'IA l'a vu. À droite : oui, c'est bien ça. À gauche : non, on le
// retire. Ou on écrit ce que c'est vraiment.
// Un ingrédient touché dans la liste sous la photo (vérifié ou non) s'ouvre
// seul dans le même paquet, son nom prêt à être corrigé.
// En haut : « Passer » (cette carte) et « Tout passer ». Un ingrédient passé
// reste à vérifier, en jaune, et ne compte pas dans les recettes.

const GREEN = "#37B24D";
const RED = "#E85C41";
export const YELLOW = "#F59F00";
const YELLOW_SOFT = "#FFF4D6";
const YELLOW_TEXT = "#A86A00";
const TEXT = "#1C1C1A";
const MUTED = "#8E8E86";
const BOX = "#FFD43B";

// Distance (px) ou vitesse à partir de laquelle un glissé compte.
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 0.6;
const BACK_SCALE = 0.94;

type Decision = "keep" | "remove" | "skip" | { rename: string };
// « up » = Passer : la carte se soulève et s'efface, ni oui ni non.
type Direction = "left" | "right" | "up";
type CardHandle = { swipe: (direction: Direction, decision: Decision) => void };
type Size = { width: number; height: number };

const haptic = () => {
  if (process.env.EXPO_OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ─────────────────────────────────────────────
// Zoom sur les boîtes de l'ingrédient
// ─────────────────────────────────────────────

// Marge autour des boîtes (fraction de leur taille), et zone minimale
// (fraction du petit côté de la photo) pour garder du contexte autour d'un
// petit objet au lieu de zoomer sur des pixels.
const PADDING = 0.25;
const MIN_REGION = 0.35;

function zoomOnBoxes(frame: Size, image: ImageSize, boxes: BoundingBox[]) {
  const left = Math.min(...boxes.map((b) => b.x)) * image.width;
  const top = Math.min(...boxes.map((b) => b.y)) * image.height;
  const right = Math.max(...boxes.map((b) => b.x + b.width)) * image.width;
  const bottom = Math.max(...boxes.map((b) => b.y + b.height)) * image.height;

  const minSide = MIN_REGION * Math.min(image.width, image.height);
  const regionWidth = Math.max((right - left) * (1 + 2 * PADDING), minSide);
  const regionHeight = Math.max((bottom - top) * (1 + 2 * PADDING), minSide);

  // Toute la zone est visible ; jamais plus petit que la photo entière.
  const scale = Math.max(
    Math.min(frame.width / regionWidth, frame.height / regionHeight),
    Math.min(frame.width / image.width, frame.height / image.height)
  );
  const width = image.width * scale;
  const height = image.height * scale;

  // Centré sur les boîtes, sans laisser de vide autour de la photo quand
  // c'est évitable.
  const offset = (frameSide: number, imageSide: number, center: number) =>
    imageSide <= frameSide
      ? (frameSide - imageSide) / 2
      : Math.min(0, Math.max(frameSide - imageSide, frameSide / 2 - center));
  const x = offset(frame.width, width, ((left + right) / 2) * scale);
  const y = offset(frame.height, height, ((top + bottom) / 2) * scale);

  return {
    image: { left: x, top: y, width, height },
    boxes: boxes.map((b) => ({
      left: x + b.x * width,
      top: y + b.y * height,
      width: b.width * width,
      height: b.height * height,
    })),
  };
}

function BoxCrop({ uri, imageSize, boxes }: { uri: string; imageSize?: ImageSize; boxes?: BoundingBox[] }) {
  const [frame, setFrame] = useState<Size | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFrame({ width, height });
  };

  // Anciennes photos sans boîtes : la photo entière.
  const zoom = frame && imageSize && boxes?.length ? zoomOnBoxes(frame, imageSize, boxes) : null;

  return (
    <View style={styles.crop} onLayout={onLayout} pointerEvents="none">
      {frame && !zoom && (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}
      {zoom && (
        <>
          <Image source={{ uri }} style={[styles.cropImage, zoom.image]} resizeMode="stretch" />
          {zoom.boxes.map((box, i) => (
            <View key={i} style={[styles.box, box]} />
          ))}
        </>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Une carte
// ─────────────────────────────────────────────

type CardProps = {
  card: ReviewCard;
  isTop: boolean;
  onDecide: (card: ReviewCard, decision: Decision) => void;
  // Paquet de plusieurs photos : la carte dit d'où elle vient.
  showSource: boolean;
  ref?: React.Ref<CardHandle>;
};

function SwipeCard({ card, isTop, onDecide, showSource, ref }: CardProps) {
  const { item, photo } = card;
  const [position] = useState(() => new Animated.ValueXY());
  // Passer : la carte s'efface sur place au lieu de s'envoler.
  const [fade] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(isTop ? 1 : BACK_SCALE));
  const [corrected, setCorrected] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // La carte de derrière grossit quand elle passe devant (et inversement
  // quand on annule).
  useEffect(() => {
    Animated.spring(scale, {
      toValue: isTop ? 1 : BACK_SCALE,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [isTop, scale]);

  // La carte s'envole, puis la décision est enregistrée. Un autre bouton ou
  // un glissé pendant le vol interrompt l'animation (finished = false) :
  // c'est alors le dernier geste qui compte, jamais deux décisions.
  const swipe = (direction: Direction, decision: Decision, dy = 0) => {
    setCorrected(typeof decision === "object");
    setSkipping(decision === "skip");
    haptic();

    const done = ({ finished }: { finished: boolean }) => {
      if (finished) onDecide(card, decision);
    };

    // Passer : la carte se soulève et s'efface, le tampon « PASSÉ » lisible
    // au milieu (en s'envolant vers le haut, il sortirait de l'écran aussitôt).
    if (direction === "up") {
      Animated.parallel([
        Animated.timing(position, { toValue: { x: 0, y: -60 }, duration: 280, useNativeDriver: false }),
        Animated.timing(fade, { toValue: 0, duration: 280, useNativeDriver: false }),
      ]).start(done);
      return;
    }

    // Un « Passer » en cours est interrompu : la carte redevient opaque.
    fade.setValue(1);
    const distance = Dimensions.get("window").width * 1.4;
    Animated.timing(position, {
      toValue: { x: direction === "right" ? distance : -distance, y: dy },
      duration: 220,
      useNativeDriver: false,
    }).start(done);
  };

  useImperativeHandle(ref, () => ({ swipe }));

  // Créé une seule fois (le recréer en plein glissé le casserait) : il garde
  // le swipe du premier rendu, d'où un onDecide qui ne dépend que de `card`.
  const [panResponder] = useState(() =>
    PanResponder.create({
      // Les glissés surtout horizontaux seulement : un tap reste un tap.
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      // Un glissé pendant un « Passer » l'annule : carte opaque, sans tampon.
      onPanResponderGrant: () => {
        fade.setValue(1);
        setSkipping(false);
      },
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_DISTANCE || g.vx > SWIPE_VELOCITY) {
          swipe("right", "keep", g.dy);
        } else if (g.dx < -SWIPE_DISTANCE || g.vx < -SWIPE_VELOCITY) {
          swipe("left", "remove", g.dy);
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () =>
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start(),
    })
  );

  const rotate = position.x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ["-12deg", "0deg", "12deg"],
  });
  const yesOpacity = position.x.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const noOpacity = position.x.interpolate({
    inputRange: [-90, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const quantity = itemQuantity(item);
  const percent =
    item.confidence === undefined ? null : Math.round(item.confidence * 100);
  // Un ingrédient déjà sûr (touché dans « Identifiés ») ne s'affiche pas en rouge.
  const sure = item.confidence !== undefined && item.confidence >= CONFIDENCE_THRESHOLD;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fade,
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
            { scale },
          ],
        },
      ]}
      pointerEvents={isTop ? "auto" : "none"}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <BoxCrop uri={photo.uri} imageSize={photo.imageSize} boxes={item.boxes} />

      <Animated.View style={[styles.stamp, styles.stampYes, { opacity: yesOpacity }]}>
        <Text style={[styles.stampText, { color: GREEN }]}>
          {corrected ? tr("CORRIGÉ", "FIXED") : tr("OUI", "YES")}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.stamp, styles.stampNo, { opacity: noOpacity }]}>
        <Text style={[styles.stampText, { color: RED }]}>{tr("NON", "NO")}</Text>
      </Animated.View>
      {skipping && (
        <View style={styles.stampSkipRow}>
          <View style={styles.stampSkip}>
            <Text style={[styles.stampText, { color: YELLOW }]}>{tr("PASSÉ", "SKIPPED")}</Text>
          </View>
        </View>
      )}

      <View style={styles.cardBody}>
        {item.skipped && (
          <Text style={styles.skippedTag}>{tr("PASSÉ PLUS TÔT", "SKIPPED EARLIER")}</Text>
        )}
        <Text style={styles.question}>{tr("Est-ce bien…", "Is this…")}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name} ?
          </Text>
          {quantity > 1 && (
            <View style={styles.quantityPill}>
              <Text style={styles.quantityText}>×{quantity}</Text>
            </View>
          )}
        </View>
        {percent !== null && (
          <Text style={[styles.confidence, sure && styles.confidenceSure]}>
            {tr(`L'IA en est sûre à ${percent} %`, `The AI is ${percent}% sure`)}
          </Text>
        )}
        {showSource && (
          <Text style={styles.source} numberOfLines={1}>
            {CATEGORY_LABELS[categoryOf(photo)]} · {photoDateLabel(photo)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// Le paquet
// ─────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
  // Les cartes, dans l'ordre (voir reviewCards). Lues à l'ouverture : une
  // décision change les photos enregistrées, pas le paquet.
  cards: ReviewCard[];
  // Ingrédient touché dans une liste : sa carte seule, pour corriger son nom
  // (ou le garder, ou le retirer).
  editing?: boolean;
};

const cardKey = ({ photo, item }: ReviewCard) => `${photo.id}:${normalizeName(item.name)}`;

export default function ReviewDeck({ visible, onClose, cards, editing = false }: Props) {
  // Jamais d'écran vide sans carte.
  const open = visible && cards.length > 0;
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      {/* Monté à chaque ouverture : le paquet repart des cartes reçues. */}
      {open && <Deck cards={cards} editing={editing} onClose={onClose} />}
    </Modal>
  );
}

// Les ingrédients d'une photo avant une décision, pour « annuler ».
type Undo = { photoId: string; before: Promise<DetectedItem[] | undefined> };

function Deck({ cards, editing, onClose }: Omit<Props, "visible"> & { editing: boolean }) {
  useLanguage();
  const insets = useSafeAreaInsets();

  // Figé à l'ouverture : une décision change la photo enregistrée, pas
  // l'ordre des cartes.
  const [queue] = useState(cards);
  const [manyPhotos] = useState(() => new Set(cards.map((c) => c.photo.id)).size > 1);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<Undo[]>([]);
  // Ingrédient touché : son nom actuel, à modifier.
  const [draft, setDraft] = useState(editing ? cards[0].item.name : "");
  const topCard = useRef<CardHandle>(null);

  // Ouvert pendant qu'on écrivait dans la page (« Ajouter un ingrédient ») :
  // le clavier de ce champ resterait par-dessus les cartes.
  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const current = queue[index];

  // Appelé par la carte avec la version de son premier rendu : ne lit rien
  // qui change d'un rendu à l'autre (la place de la carte vient de `card`).
  const decide = (card: ReviewCard, decision: Decision) => {
    const { photo, item } = card;
    const change =
      decision === "keep"
        ? keepItem(item.name)
        : decision === "remove"
          ? removeItem(item.name)
          : decision === "skip"
            ? skipItems([item.name])
            : renameItem(item.name, decision.rename);
    const before = editPhotoItems(photo.id, change);
    before.catch(console.error);

    const next = queue.indexOf(card) + 1;
    if (next >= queue.length) {
      onClose();
      return;
    }
    setDraft("");
    setHistory((prev) => [...prev, { photoId: photo.id, before }]);
    setIndex(next);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory(history.slice(0, -1));
    setIndex(index - 1);
    // Mis en file après la décision annulée : on remet la photo comme avant.
    last.before
      .then((items) => items && editPhotoItems(last.photoId, () => items))
      .catch(console.error);
  };

  // ✅ « Tout passer » : cette carte et les suivantes restent à vérifier, en
  // jaune. Une écriture par photo.
  const skipAll = () => {
    const names = new Map<string, string[]>();
    queue.slice(index).forEach(({ photo, item }) => {
      names.set(photo.id, [...(names.get(photo.id) ?? []), item.name]);
    });
    names.forEach((list, photoId) =>
      editPhotoItems(photoId, skipItems(list)).catch(console.error)
    );
    haptic();
    onClose();
  };

  const correction = draft.trim();
  const submitCorrection = () => {
    if (!correction) return;
    Keyboard.dismiss();
    // Nom laissé tel quel : c'est un « oui ».
    topCard.current?.swipe(
      "right",
      correction === current.item.name ? "keep" : { rename: correction }
    );
  };

  if (!current) return null;
  const name = current.item.name;

  // Carte du dessus + celle d'après, dessinée derrière.
  const visibleCards = queue.slice(index, index + 2).reverse();

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 14 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, editing && styles.headerAlone]}>
        <Pressable
          style={styles.iconButton}
          onPress={onClose}
          accessibilityLabel={tr("Fermer", "Close")}
        >
          <Ionicons name="close" size={22} color={TEXT} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {editing ? tr("Modifier", "Edit") : tr("À vérifier", "To check")}
          </Text>
          {!editing && (
            <Text style={styles.headerCount}>
              {index + 1} / {queue.length}
            </Text>
          )}
        </View>
        <View style={styles.iconButtonSpacer} />
      </View>

      {/* Une seule carte : ni compteur ni progression, rien à passer. */}
      {!editing && (
        <>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(index / queue.length) * 100}%` }]} />
          </View>

          {/* ✅ Pas envie de décider maintenant : en jaune, à revoir plus tard. */}
          <View style={styles.skipRow}>
            <Pressable
              style={styles.skipButton}
              onPress={() => topCard.current?.swipe("up", "skip")}
              accessibilityRole="button"
              accessibilityLabel={tr(`Passer ${name}`, `Skip ${name}`)}
            >
              <Ionicons name="play-skip-forward" size={14} color={YELLOW_TEXT} />
              <Text style={styles.skipText}>{tr("Passer", "Skip")}</Text>
            </Pressable>
            <Pressable
              style={styles.skipButton}
              onPress={skipAll}
              accessibilityRole="button"
              accessibilityLabel={tr("Tout passer", "Skip all")}
            >
              <Ionicons name="play-forward" size={14} color={YELLOW_TEXT} />
              <Text style={styles.skipText}>{tr("Tout passer", "Skip all")}</Text>
            </Pressable>
          </View>
        </>
      )}

      <View style={styles.stack}>
        {visibleCards.map((card) => (
          <SwipeCard
            key={cardKey(card)}
            ref={card === current ? topCard : undefined}
            card={card}
            isTop={card === current}
            onDecide={decide}
            showSource={manyPhotos}
          />
        ))}
      </View>

      <View style={styles.correctRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={tr("Pas ça ? Écris ce que c'est", "Not that? Type what it is")}
          placeholderTextColor={MUTED}
          returnKeyType="done"
          onSubmitEditing={submitCorrection}
          autoCorrect={false}
          // Ingrédient touché : son nom est sélectionné, taper le remplace.
          selectTextOnFocus={editing}
        />
        <Pressable
          style={[styles.sendButton, !correction && styles.sendButtonDisabled]}
          onPress={submitCorrection}
          disabled={!correction}
          accessibilityLabel={tr("Corriger", "Correct")}
        >
          <Ionicons name="checkmark" size={20} color="white" />
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.bigButton, styles.noButton]}
          onPress={() => topCard.current?.swipe("left", "remove")}
          accessibilityLabel={tr(`Non, retirer ${name}`, `No, remove ${name}`)}
        >
          <Ionicons name="close" size={34} color={RED} />
        </Pressable>
        {/* Une seule carte : le paquet se ferme sur la décision, rien à annuler. */}
        {!editing && (
          <Pressable
            style={[styles.smallButton, history.length === 0 && styles.smallButtonDisabled]}
            onPress={undo}
            disabled={history.length === 0}
            accessibilityLabel={tr("Annuler", "Undo")}
          >
            <Ionicons name="arrow-undo" size={20} color={history.length ? YELLOW : "#CFCFC8"} />
          </Pressable>
        )}
        <Pressable
          style={[styles.bigButton, styles.yesButton]}
          onPress={() => topCard.current?.swipe("right", "keep")}
          accessibilityLabel={tr(`Oui, garder ${name}`, `Yes, keep ${name}`)}
        >
          <Ionicons name="checkmark" size={34} color={GREEN} />
        </Pressable>
      </View>

      <Text style={styles.hint}>
        {tr(
          "Glisse à droite si c'est bien ça, à gauche sinon.",
          "Swipe right if it's right, left if it isn't."
        )}
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F8F6",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  // Sans barre de progression dessous : même écart jusqu'à la carte.
  headerAlone: {
    marginBottom: 32,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  iconButtonSpacer: { width: 38 },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT,
  },

  headerCount: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "600",
    marginTop: 2,
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E8E8E4",
    overflow: "hidden",
    marginBottom: 12,
  },

  skipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: YELLOW_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  skipText: {
    fontSize: 14,
    fontWeight: "700",
    color: YELLOW_TEXT,
  },

  progressFill: {
    height: "100%",
    backgroundColor: GREEN,
  },

  stack: {
    flex: 1,
    marginBottom: 14,
    // Web : sans ça, glisser une carte sélectionne du texte, et le glissé
    // suivant devient un glisser-déposer du navigateur qui bloque la carte.
    userSelect: "none",
  },

  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  crop: {
    flex: 1,
    backgroundColor: TEXT,
    overflow: "hidden",
  },

  cropImage: {
    position: "absolute",
  },

  box: {
    position: "absolute",
    borderWidth: 3,
    borderColor: BOX,
    borderRadius: 8,
  },

  stamp: {
    position: "absolute",
    top: 28,
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  stampYes: {
    left: 22,
    borderColor: GREEN,
    transform: [{ rotate: "-14deg" }],
  },

  stampNo: {
    right: 22,
    borderColor: RED,
    transform: [{ rotate: "14deg" }],
  },

  // Au milieu de la photo : la carte s'efface sur place.
  stampSkipRow: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  stampSkip: {
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderColor: YELLOW,
    transform: [{ rotate: "-6deg" }],
  },

  stampText: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 1,
  },

  skippedTag: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: YELLOW,
    marginBottom: 4,
  },

  source: {
    marginTop: 6,
    fontSize: 13,
    color: MUTED,
  },

  cardBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  question: {
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
    marginBottom: 2,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardName: {
    flexShrink: 1,
    fontSize: 26,
    fontWeight: "800",
    color: TEXT,
  },

  quantityPill: {
    marginLeft: 10,
    backgroundColor: "#F4F4F0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },

  confidence: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: RED,
  },

  confidenceSure: {
    color: GREEN,
  },

  correctRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  input: {
    flex: 1,
    height: 46,
    backgroundColor: "white",
    borderRadius: 23,
    paddingHorizontal: 18,
    fontSize: 15,
    color: TEXT,
    borderWidth: 1,
    borderColor: "#ECECE8",
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginLeft: 8,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#CFCFC8",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },

  bigButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  noButton: {
    borderWidth: 2,
    borderColor: "#FFD9D0",
  },

  yesButton: {
    borderWidth: 2,
    borderColor: "#CDEFD5",
  },

  smallButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    borderWidth: 2,
    borderColor: "#FFE8B0",
  },

  smallButtonDisabled: {
    borderColor: "#ECECE8",
  },

  hint: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 13,
    color: MUTED,
  },
});
