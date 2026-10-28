/** delete photos:
 * await AsyncStorage.clear();
 */

import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLightStatusBar } from "@/hooks/useLightStatusBar";
import {
  countItems,
  DetectedItem,
  detectionErrorMessage,
  DetectionStatus,
} from "@/lib/ingredientDetection";
import {
  saveDetectionResult,
  startAnalysis,
  StoredPhoto,
  updatePhotos,
} from "@/lib/photoStore";

// ─────────────────────────────────────────────
// Mêmes catégories que recette.tsx
// ─────────────────────────────────────────────
type CategoryKey = "fridge" | "freezer" | "pantry" | "counter";

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { key: "fridge", label: "Frigo", icon: "fridge-outline" },
  { key: "freezer", label: "Congélateur", icon: "snowflake" },
  { key: "pantry", label: "Garde-manger", icon: "food-variant" },
  { key: "counter", label: "Comptoir", icon: "countertop-outline" },
];

// ✅ Une photo prise pendant la session en cours, pas encore enregistrée.
// category = null tant que l'utilisateur ne l'a pas rangée.
// detection : analyse des ingrédients lancée dès la prise de la photo.
type Shot = {
  id: string;
  uri: string;
  category: CategoryKey | null;
  detection: DetectionStatus;
  items?: DetectedItem[];
  detectionError?: string;
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Règle française : « 0 photo », « 1 photo », « 2 photos ».
const pluralize = (count: number, word: string) =>
  `${count} ${word}${count > 1 ? "s" : ""}`;

// ✅ Petit retour haptique à chaque photo / choix (non disponible sur web).
const haptic = () => {
  if (process.env.EXPO_OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// ✅ Alert.alert ne fait rien sur web : on passe par window.confirm.
const confirmDiscard = (count: number, onDiscard: () => void) => {
  const title = `Supprimer ${count > 1 ? `ces ${count} photos` : "cette photo"} ?`;
  const message = count > 1 ? "Elles ne sont pas encore enregistrées." : "Elle n'est pas encore enregistrée.";

  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n${message}`)) onDiscard();
    return;
  }

  Alert.alert(title, message, [
    { text: "Garder", style: "cancel" },
    { text: "Supprimer", style: "destructive", onPress: onDiscard },
  ]);
};

// ✅ Résultat de l'analyse sous chaque photo de l'étape de tri. Les
// ingrédients sous le seuil de confiance sont en orange avec un "?".
const DetectionSummary = ({
  shot,
  onRetry,
}: {
  shot: Shot;
  onRetry: () => void;
}) => {
  if (shot.detection === "pending") {
    return (
      <View style={styles.detectionRow}>
        <ActivityIndicator size="small" color={GREEN} />
        <Text style={styles.detectionText}>Recherche des ingrédients…</Text>
      </View>
    );
  }

  if (shot.detection === "error") {
    return (
      <View style={styles.detectionRow}>
        <Ionicons name="warning-outline" size={16} color={WARN} />
        <Text style={styles.detectionText} numberOfLines={2}>
          {shot.detectionError ?? "Impossible d'analyser cette photo."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const items = shot.items ?? [];
  if (items.length === 0) {
    return (
      <View style={styles.detectionRow}>
        <Text style={styles.detectionText}>Aucun ingrédient trouvé</Text>
      </View>
    );
  }

  const { needCheck } = countItems(items);

  return (
    <View style={styles.detectionResult}>
      <Text style={styles.detectionText}>
        {pluralize(items.length, "ingrédient")}
        {needCheck > 0 ? ` · ${needCheck} à vérifier` : ""}
      </Text>

      <View style={styles.ingredientChips}>
        {items.map((item) => (
          <View
            key={item.name}
            style={[
              styles.ingredientChip,
              !item.confirmed && styles.ingredientChipCheck,
            ]}
          >
            <Text
              style={[
                styles.ingredientChipText,
                !item.confirmed && styles.ingredientChipTextCheck,
              ]}
            >
              {item.confirmed ? item.name : `${item.name} ?`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function Camera() {
  const router = useRouter();
  useLightStatusBar();

  // ✅ catégorie passée par le "+" d'une section (ex: /camera?category=fridge)
  // ✅ editId passé par le bouton "redo" d'une photo existante
  //    (ex: /camera?editId=123&category=fridge)
  const params = useLocalSearchParams<{
    category?: string;
    editId?: string;
  }>();

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  // ✅ Mode rafale : toutes les photos prises depuis l'ouverture de la
  // caméra. Elles ne sont enregistrées qu'à la fin, une fois rangées.
  const [shots, setShots] = useState<Shot[]>([]);

  // ✅ "camera" = on enchaîne les photos, "sort" = on range chaque photo.
  const [step, setStep] = useState<"camera" | "sort">("camera");

  // ✅ Catégorie appliquée automatiquement aux PROCHAINES photos. Choisie via
  // les puces en haut de la caméra, ou préréglée par le "+" d'une section.
  // null = l'utilisateur rangera les photos à l'étape suivante.
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(
    null
  );

  // ✅ si défini, on est en mode "redo" : une seule photo, qui remplacera
  // l'entrée existante ayant cet id, à la même place, plutôt que d'en
  // créer une nouvelle.
  const [presetEditId, setPresetEditId] = useState<string | undefined>(
    undefined
  );
  const isRedo = !!presetEditId;

  const [saving, setSaving] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);
  const trayRef = useRef<ScrollView | null>(null);

  // ✅ Empêche deux captures simultanées si l'utilisateur tape très vite.
  const capturingRef = useRef(false);

  // ✅ Analyse en cours de chaque photo (par id de Shot), pour pouvoir
  // enregistrer son résultat même si elle se termine après "Save".
  const detectionsRef = useRef(new Map<string, Promise<DetectedItem[]>>());

  // ✅ Flash blanc sur l'aperçu à chaque photo, pour confirmer la prise
  // sans interrompre la rafale par un écran de prévisualisation.
  const [flashOpacity] = useState(() => new Animated.Value(0));

  // ✅ On garde toujours la dernière valeur des params dans un ref, MAIS on ne
  // met pas `params` dans les deps du callback passé à useFocusEffect.
  // Pourquoi : useFocusEffect ré-exécute son callback dès que la référence de
  // ce callback change (via useCallback) ET que l'écran est déjà focus — pas
  // seulement lors d'un vrai évènement focus/blur. Comme on efface category
  // et editId juste après les avoir lus (router.setParams), si ces valeurs
  // étaient dans les deps, ce nettoyage créait un nouveau callback et
  // relançait aussitôt l'effet avec des params vides, ce qui écrasait
  // activeCategory/presetEditId avant même que l'utilisateur ait pris la
  // photo. En passant par un ref (jamais dans les deps), l'effet ne se
  // redéclenche que lors d'un vrai focus (ex: retour sur l'onglet).
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // Même raison : lu dans useFocusEffect sans être une dépendance.
  const shotsRef = useRef(shots);
  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);

  useFocusEffect(
    useCallback(() => {
      const incomingCategory = paramsRef.current.category as
        | CategoryKey
        | undefined;
      const incomingEditId = paramsRef.current.editId;

      if (incomingEditId) {
        // Mode redo : on repart d'une session vide (une seule photo).
        setShots([]);
      }

      if (incomingCategory || incomingEditId) {
        // Venu d'un "+" ou d'un redo : on veut prendre une photo, donc on
        // revient sur la caméra même si l'étape de tri était ouverte.
        setStep("camera");
      }

      if (incomingCategory) {
        // Venu d'un "+" de section (ou d'un redo avec catégorie connue) :
        // la puce correspondante est présélectionnée.
        setActiveCategory(incomingCategory);
      } else if (incomingEditId || shotsRef.current.length === 0) {
        // Pas de catégorie résiduelle d'une visite précédente. Si une rafale
        // est en cours, on garde en revanche la puce choisie par l'utilisateur.
        setActiveCategory(null);
      }

      setPresetEditId(incomingEditId);

      if (incomingCategory || incomingEditId) {
        router.setParams({ category: undefined, editId: undefined });
      }
      // Deps volontairement vide : voir commentaire ci-dessus.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          FoodLens a besoin de ta caméra pour scanner ton frigo.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const unsortedCount = shots.filter((s) => !s.category).length;
  const canSave = shots.length > 0 && unsortedCount === 0 && !saving;
  const activeCategoryConfig = CATEGORIES.find((c) => c.key === activeCategory);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const resetSession = () => {
    setShots([]);
    setStep("camera");
    setActiveCategory(null);
    setPresetEditId(undefined);
    detectionsRef.current.clear();
  };

  const patchShot = (id: string, patch: Partial<Shot>) => {
    setShots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  // ✅ Chaque photo part à l'API dès qu'elle est prise, en arrière-plan :
  // la rafale n'attend jamais la réponse.
  const startDetection = (id: string, uri: string) => {
    const detection = startAnalysis(uri);
    detectionsRef.current.set(id, detection);

    detection.then(
      (items) =>
        patchShot(id, { detection: "done", items, detectionError: undefined }),
      (err) =>
        patchShot(id, {
          detection: "error",
          detectionError: detectionErrorMessage(err),
        })
    );
  };

  const retryDetection = (shot: Shot) => {
    patchShot(shot.id, { detection: "pending", detectionError: undefined });
    startDetection(shot.id, shot.uri);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || capturingRef.current) return;
    capturingRef.current = true;

    // Retour immédiat pour que la rafale paraisse instantanée.
    haptic();
    flashOpacity.setValue(0.7);
    Animated.timing(flashOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    try {
      // quality 0.7 : la photo est envoyée à l'API, hébergée sur Vercel qui
      // refuse les requêtes de plus de 4,5 Mo (une photo en qualité 1 peut
      // dépasser). Aucune différence visible à l'écran.
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        exif: false,
      });

      const shot: Shot = {
        id: generateId(),
        uri: picture.uri,
        category: activeCategory,
        detection: "pending",
      };
      startDetection(shot.id, shot.uri);

      if (isRedo) {
        // Mode redo : une seule photo, on passe directement à la validation.
        setShots([shot]);
        setStep("sort");
      } else {
        setShots((prev) => [...prev, shot]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      capturingRef.current = false;
    }
  };

  const removeShot = (id: string) => {
    const remaining = shots.filter((s) => s.id !== id);
    setShots(remaining);
    if (remaining.length === 0) setStep("camera");
  };

  const setShotCategory = (id: string, category: CategoryKey) => {
    haptic();
    setShots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, category } : s))
    );
  };

  // ✅ "Tout mettre dans…" : range toutes les photos d'un seul tap.
  const setAllCategory = (category: CategoryKey) => {
    haptic();
    setShots((prev) => prev.map((s) => ({ ...s, category })));
  };

  const handleBackToCamera = () => {
    // En mode redo, revenir à la caméra = reprendre la photo.
    if (isRedo) setShots([]);
    setStep("camera");
  };

  const handleClose = () => {
    const leave = () => {
      resetSession();
      router.replace("/recettes");
    };

    if (shots.length > 0) {
      confirmDiscard(shots.length, leave);
    } else {
      leave();
    }
  };

  // ✅ Enregistre toutes les photos de la session d'un coup, chacune dans
  // la catégorie choisie.
  const saveShots = async () => {
    if (!canSave) return;
    setSaving(true);

    const dateLabel = new Date().toLocaleString("fr-CA", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    // Résultat de l'analyse s'il est déjà là, sinon "pending" : il sera
    // ajouté à la photo enregistrée dès que l'API aura répondu.
    const toStored = (shot: Shot, id: string): StoredPhoto => ({
      id,
      uri: shot.uri,
      category: shot.category ?? undefined,
      date: dateLabel,
      detection: shot.detection,
      items: shot.items,
      detectionError: shot.detectionError,
    });

    // En mode redo, la photo garde l'id de l'entrée qu'elle remplace.
    let saved: { shot: Shot; id: string }[] = [];

    try {
      await updatePhotos((photos) => {
        if (presetEditId) {
          // ✅ Mode "redo" : on remplace la photo existante EN PLACE
          // (même id, même position dans le tableau), on ne fait
          // surtout pas un push d'une nouvelle entrée.
          const shot = shots[0];
          const idx = photos.findIndex((p) => p.id === presetEditId);

          if (idx !== -1) {
            saved = [{ shot, id: presetEditId }];
            return photos.map((p, i) =>
              i === idx ? { ...p, ...toStored(shot, presetEditId) } : p
            );
          }

          // Filet de sécurité si l'entrée d'origine a disparu entre-temps.
          saved = [{ shot, id: shot.id }];
          return [...photos, toStored(shot, shot.id)];
        }

        saved = shots.map((shot) => ({ shot, id: shot.id }));
        return [...photos, ...shots.map((shot) => toStored(shot, shot.id))];
      });
    } catch (err) {
      // On garde les photos à l'écran pour que l'utilisateur puisse réessayer.
      console.error(err);
      setSaving(false);
      Alert.alert("Impossible d'enregistrer tes photos", "Réessaie.");
      return;
    }

    // Analyses encore en cours : le résultat sera écrit sur la photo
    // enregistrée quand l'API répondra, même après la fermeture de la caméra.
    saved.forEach(({ shot, id }) => {
      const detection = detectionsRef.current.get(shot.id);
      if (shot.detection === "pending" && detection) {
        saveDetectionResult(id, shot.uri, detection);
      }
    });

    setSaving(false);
    resetSession();
    router.back();
  };

  // ============================
  // SORT (ranger chaque photo avant d'enregistrer)
  // ============================

  if (step === "sort") {
    let saveLabel = `Enregistrer ${pluralize(shots.length, "photo")}`;
    if (unsortedCount > 0) {
      saveLabel = `Range encore ${pluralize(unsortedCount, "photo")}`;
    } else if (isRedo) {
      saveLabel = "Remplacer la photo";
    }

    return (
      <View style={styles.sortContainer}>
        <View style={styles.sortHeader}>
          <TouchableOpacity
            style={styles.sortBackButton}
            onPress={handleBackToCamera}
            accessibilityLabel={isRedo ? "Reprendre la photo" : "Retour à la caméra"}
          >
            <Ionicons name="chevron-back" size={22} color="#1C1C1A" />
          </TouchableOpacity>

          <View style={styles.sortTitleWrap}>
            <Text style={styles.sortTitle}>
              {isRedo ? "Remplacer la photo" : "Où ranger chaque photo ?"}
            </Text>
            <Text style={styles.sortSubtitle}>
              {unsortedCount > 0
                ? `${pluralize(unsortedCount, "photo")} à ranger`
                : "Tout est rangé, prêt à enregistrer"}
            </Text>
          </View>
        </View>

        {/* ✅ Raccourci : tout ranger au même endroit en un tap */}
        {shots.length > 1 && (
          <View style={styles.bulkRow}>
            <Text style={styles.bulkLabel}>TOUT RANGER DANS</Text>
            <View style={styles.bulkChips}>
              {CATEGORIES.map((c) => {
                const allHere = shots.every((s) => s.category === c.key);

                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.bulkChip, allHere && styles.bulkChipActive]}
                    onPress={() => setAllCategory(c.key)}
                  >
                    <MaterialCommunityIcons
                      name={c.icon}
                      size={18}
                      color={allHere ? "white" : GREEN}
                    />
                    <Text
                      style={[
                        styles.bulkChipText,
                        allHere && styles.bulkChipTextActive,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.sortList}
          showsVerticalScrollIndicator={false}
        >
          {shots.map((shot, index) => (
            <View
              key={shot.id}
              style={[styles.shotCard, !shot.category && styles.shotCardUnsorted]}
            >
              <View style={styles.shotRow}>
                <View>
                  <Image source={{ uri: shot.uri }} style={styles.shotImage} />

                  {!isRedo && (
                    <>
                      <View style={styles.shotIndex}>
                        <Text style={styles.shotIndexText}>{index + 1}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.shotRemove}
                        onPress={() => removeShot(shot.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={`Retirer la photo ${index + 1}`}
                      >
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* ✅ Un tap = photo rangée */}
                <View style={styles.shotOptions}>
                  {CATEGORIES.map((c) => {
                    const selected = shot.category === c.key;

                    return (
                      <TouchableOpacity
                        key={c.key}
                        style={[
                          styles.shotOption,
                          selected && styles.shotOptionActive,
                        ]}
                        onPress={() => setShotCategory(shot.id, c.key)}
                      >
                        <MaterialCommunityIcons
                          name={c.icon}
                          size={18}
                          color={selected ? "white" : GREEN}
                        />
                        <Text
                          style={[
                            styles.shotOptionText,
                            selected && styles.shotOptionTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <DetectionSummary
                shot={shot}
                onRetry={() => retryDetection(shot)}
              />
            </View>
          ))}

          {!isRedo && (
            <TouchableOpacity
              style={styles.addMore}
              onPress={() => setStep("camera")}
            >
              <Ionicons name="camera-outline" size={20} color="#999" />
              <Text style={styles.addMoreText}>Prendre d&apos;autres photos</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.sortFooter}>
          {isRedo && (
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleBackToCamera}
            >
              <Text style={styles.retakeButtonText}>Reprendre</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={saveShots}
            disabled={!canSave}
          >
            <Text style={styles.saveButtonText}>{saveLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================
  // CAMERA (rafale)
  // ============================

  let hint = "Prends-en autant que tu veux, tu les rangeras ensuite";
  if (isRedo) {
    hint = "Reprends cette photo";
  } else if (activeCategoryConfig) {
    hint = `Les photos vont directement dans : ${activeCategoryConfig.label}`;
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      <Animated.View
        pointerEvents="none"
        style={[styles.camera, styles.flash, { opacity: flashOpacity }]}
      />

      {/* ---------- TOP BLACK BAR ---------- */}

      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} accessibilityLabel="Fermer">
          <AntDesign name="close" size={25} color="white" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>
          {shots.length > 0 && !isRedo ? pluralize(shots.length, "photo") : ""}
        </Text>

        <View style={{ width: 25 }} />
      </View>

      {/* ---------- CATÉGORIE DES PROCHAINES PHOTOS ---------- */}
      {/* ✅ Choisir une puce range directement les photos suivantes :
          on peut enchaîner frigo -> congélateur -> ... sans étape de tri. */}

      <View style={styles.categoryBar}>
        {CATEGORIES.map((c) => {
          const selected = activeCategory === c.key;

          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.categoryChip, selected && styles.categoryChipActive]}
              onPress={() => setActiveCategory(selected ? null : c.key)}
            >
              <MaterialCommunityIcons name={c.icon} size={18} color="white" />
              <Text
                style={styles.categoryChipText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ---------- PHOTOS DE LA RAFALE ---------- */}

      <View style={styles.trayArea}>
        {shots.length > 0 && !isRedo ? (
          <ScrollView
            ref={trayRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trayContent}
            onContentSizeChange={() =>
              trayRef.current?.scrollToEnd({ animated: true })
            }
          >
            {shots.map((shot, index) => {
              const config = CATEGORIES.find((c) => c.key === shot.category);

              return (
                <View key={shot.id} style={styles.trayItem}>
                  <Image source={{ uri: shot.uri }} style={styles.trayImage} />

                  {/* Où ira cette photo ("?" = à ranger plus tard) */}
                  <View
                    style={[styles.trayBadge, !config && styles.trayBadgeUnsorted]}
                  >
                    <MaterialCommunityIcons
                      name={config ? config.icon : "help"}
                      size={12}
                      color="white"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.trayRemove}
                    onPress={() => removeShot(shot.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityLabel={`Retirer la photo ${index + 1}`}
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>

                  {/* Analyse : en cours / nombre d'ingrédients / échec */}
                  <View
                    style={[
                      styles.trayDetection,
                      shot.detection === "error" && styles.trayDetectionError,
                    ]}
                  >
                    {shot.detection === "pending" ? (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        style={styles.traySpinner}
                      />
                    ) : (
                      <Text style={styles.trayDetectionText}>
                        {shot.detection === "error"
                          ? "!"
                          : (shot.items?.length ?? 0)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.hint}>{hint}</Text>
        )}
      </View>

      {/* ---------- BOTTOM BLACK BAR ---------- */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.sideSlot}
          onPress={toggleCameraFacing}
          accessibilityLabel="Changer de caméra"
        >
          <AntDesign name="retweet" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleTakePhoto}
          accessibilityLabel="Prendre la photo"
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <View style={styles.sideSlot}>
          {shots.length > 0 && !isRedo && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep("sort")}
              accessibilityLabel={`Ranger ${pluralize(shots.length, "photo")}`}
            >
              <Ionicons name="arrow-forward" size={26} color="white" />

              <View style={styles.nextCount}>
                <Text style={styles.nextCountText}>{shots.length}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const GREEN = "#27AE60";
const GREEN_LIGHT = "#E7F7EB";
const TEXT_DARK = "#1C1C1A";
const TEXT_MUTED = "#8E8E86";
const WARN = "#E0A458";

// Espace laissé sous le contenu pour la tab bar (absolue sur iOS).
const TAB_BAR_OFFSET = Platform.OS === "ios" ? 96 : 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  camera: {
    flex: 1,
    position: "absolute",

    top: 110,
    bottom: 220,

    left: 0,
    right: 0,
  },

  flash: {
    backgroundColor: "white",
  },

  // ======================
  // TOP BAR
  // ======================

  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 0,
    right: 0,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 20,
  },

  topTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  // ======================
  // CATEGORY BAR (haut de l'aperçu)
  // ======================

  // ✅ 4 boutons de même largeur : toujours tous visibles, même sur
  // petit écran (pas de défilement horizontal).
  categoryBar: {
    position: "absolute",
    top: 122,
    left: 12,
    right: 12,
    flexDirection: "row",
  },

  categoryChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 3,
  },

  categoryChipActive: {
    backgroundColor: GREEN,
  },

  categoryChipText: {
    color: "white",
    fontWeight: "600",
    fontSize: 11,
    marginTop: 3,
  },

  // ======================
  // TRAY (bas de l'aperçu)
  // ======================

  trayArea: {
    position: "absolute",
    bottom: 232,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  // Padding vertical : laisse dépasser le badge et la croix de chaque vignette.
  trayContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  trayItem: {
    marginRight: 10,
  },

  trayImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
  },

  trayBadge: {
    position: "absolute",
    bottom: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  trayBadgeUnsorted: {
    backgroundColor: "#E0A458",
  },

  trayRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  trayDetection: {
    position: "absolute",
    bottom: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  trayDetectionError: {
    backgroundColor: WARN,
  },

  traySpinner: {
    transform: [{ scale: 0.6 }],
  },

  trayDetectionText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },

  hint: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
  },

  // ======================
  // BOTTOM BAR
  // ======================

  bottomBar: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,

    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  // ✅ Largeur fixe des deux côtés pour garder le déclencheur centré,
  // que le bouton "suivant" soit affiché ou non.
  sideSlot: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },

  captureButton: {
    width: 86,
    height: 86,
    borderRadius: 43,

    borderWidth: 5,
    borderColor: "white",

    justifyContent: "center",
    alignItems: "center",
  },

  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "white",
  },

  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  nextCount: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  nextCountText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "800",
  },

  // ======================
  // SORT
  // ======================

  sortContainer: {
    flex: 1,
    backgroundColor: "#F8F8F6",
    paddingTop: 55,
  },

  sortHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  sortBackButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    marginRight: 12,
  },

  sortTitleWrap: {
    flex: 1,
  },

  sortTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
  },

  sortSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  bulkRow: {
    marginBottom: 14,
  },

  bulkLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 16,
  },

  bulkChips: {
    flexDirection: "row",
    paddingHorizontal: 13,
  },

  bulkChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 3,
  },

  bulkChipActive: {
    backgroundColor: GREEN,
  },

  bulkChipText: {
    marginTop: 3,
    color: GREEN,
    fontWeight: "700",
    fontSize: 11,
  },

  bulkChipTextActive: {
    color: "white",
  },

  sortList: {
    paddingHorizontal: 16,
    // Laisse la place au bouton "Save" et à la tab bar.
    paddingBottom: TAB_BAR_OFFSET + 90,
  },

  shotCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 3,
  },

  // ✅ Met en évidence les photos encore à ranger.
  shotCardUnsorted: {
    borderColor: "#F5C2B5",
  },

  shotRow: {
    flexDirection: "row",
  },

  // ── Résultat de l'analyse (sous chaque photo) ──
  detectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 2,
  },

  detectionResult: {
    marginTop: 10,
    paddingHorizontal: 2,
  },

  detectionText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },

  retryButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: GREEN_LIGHT,
  },

  retryButtonText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 13,
  },

  ingredientChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },

  ingredientChip: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },

  ingredientChipCheck: {
    backgroundColor: "#FFE9E3",
  },

  ingredientChipText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 12,
  },

  ingredientChipTextCheck: {
    color: "#E85C41",
  },

  shotImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
  },

  shotIndex: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  shotIndexText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  shotRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  shotOptions: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
    marginLeft: 10,
  },

  shotOption: {
    width: "48%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F4F4F0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  shotOptionActive: {
    backgroundColor: GREEN,
  },

  shotOptionText: {
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_DARK,
    marginTop: 3,
  },

  shotOptionTextActive: {
    color: "white",
  },

  addMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D6D6D6",
    backgroundColor: "#FCFCFC",
    paddingVertical: 18,
  },

  addMoreText: {
    marginLeft: 8,
    color: "#999",
    fontWeight: "600",
  },

  // Fond opaque pour que la liste ne passe pas visuellement sous le bouton.
  sortFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: TAB_BAR_OFFSET,
    backgroundColor: "#F8F8F6",
  },

  retakeButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: "#EDEDE8",
    marginRight: 10,
  },

  retakeButtonText: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: "700",
  },

  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  saveButtonDisabled: {
    backgroundColor: "#A9CBB3",
  },

  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  // ======================
  // PERMISSION
  // ======================

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 20,
  },

  permissionText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },

  permissionButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },

  permissionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
