/** delete photos:
 * await AsyncStorage.clear();
 */

import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function Camera() {
  const router = useRouter();

  // ✅ catégorie passée par le "+" d'une section (ex: /camera?category=fridge)
  // ✅ editId passé par le bouton "redo" d'une photo existante
  //    (ex: /camera?editId=123&category=fridge)
  const params = useLocalSearchParams<{
    category?: string;
    editId?: string;
  }>();

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);

  // ✅ catégorie effective pour CETTE visite de l'écran. Recalculée à chaque
  // focus (et non figée au montage) car l'écran Camera reste monté entre
  // les onglets : sans ça, une catégorie choisie via un "+" resterait
  // "collée" même si on rouvre l'appareil photo depuis l'onglet Caméra.
  const [presetCategory, setPresetCategory] = useState<CategoryKey | undefined>(
    undefined
  );

  // ✅ si défini, on est en mode "redo" : la photo prise remplacera
  // l'entrée existante ayant cet id, à la même place, plutôt que d'en
  // créer une nouvelle.
  const [presetEditId, setPresetEditId] = useState<string | undefined>(
    undefined
  );

  // ✅ affiché uniquement quand la caméra a été ouverte SANS catégorie préréglée
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);

  // ✅ On garde toujours la dernière valeur des params dans un ref, MAIS on ne
  // met pas `params` dans les deps du callback passé à useFocusEffect.
  // Pourquoi : useFocusEffect ré-exécute son callback dès que la référence de
  // ce callback change (via useCallback) ET que l'écran est déjà focus — pas
  // seulement lors d'un vrai évènement focus/blur. Comme on efface category
  // et editId juste après les avoir lus (router.setParams), si ces valeurs
  // étaient dans les deps, ce nettoyage créait un nouveau callback et
  // relançait aussitôt l'effet avec des params vides, ce qui écrasait
  // presetCategory/presetEditId à `undefined` avant même que l'utilisateur
  // ait pris la photo. En passant par un ref (jamais dans les deps), l'effet
  // ne se redéclenche que lors d'un vrai focus (ex: retour sur l'onglet).
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useFocusEffect(
    useCallback(() => {
      const incomingCategory = paramsRef.current.category as
        | CategoryKey
        | undefined;
      const incomingEditId = paramsRef.current.editId;

      if (incomingCategory) {
        // Venu d'un "+" de section (ou d'un redo avec catégorie connue) :
        // on retient la catégorie pour cette session, puis on la retire
        // immédiatement de l'URL. Ainsi, la prochaine fois que l'écran
        // regagne le focus (ex: appui sur l'onglet Caméra) sans nouvelle
        // navigation, il n'y aura plus de catégorie résiduelle et
        // l'utilisateur sera invité à en choisir une.
        setPresetCategory(incomingCategory);
      } else {
        setPresetCategory(undefined);
      }

      // Même logique pour l'id de la photo à remplacer (mode redo).
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
          We need your permission to use the camera.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    const picture = await cameraRef.current.takePictureAsync({
      quality: 1,
      base64: false,
      exif: false,
    });

    setPhoto(picture.uri);
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setShowCategoryPicker(false);
  };

  // ✅ appelé une fois qu'on connaît la catégorie (préréglée ou choisie)
  const savePhoto = async (category: CategoryKey) => {
    if (!photo) return;

    try {
      const storedPhotos = await AsyncStorage.getItem("photos");
      const photos = storedPhotos ? JSON.parse(storedPhotos) : [];

      const dateLabel = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      if (presetEditId) {
        // ✅ Mode "redo" : on remplace la photo existante EN PLACE
        // (même id, même position dans le tableau), on ne fait
        // surtout pas un push d'une nouvelle entrée.
        const idx = photos.findIndex((p: any) => p.id === presetEditId);

        if (idx !== -1) {
          photos[idx] = {
            ...photos[idx],
            uri: photo,
            category,
            date: dateLabel,
          };
        } else {
          // Filet de sécurité si l'entrée d'origine a disparu entre-temps.
          photos.push({
            id: generateId(),
            uri: photo,
            category,
            date: dateLabel,
          });
        }
      } else {
        // ✅ Nouvelle photo classique.
        photos.push({
          id: generateId(),
          uri: photo,
          category,
          date: dateLabel,
        });
      }

      await AsyncStorage.setItem("photos", JSON.stringify(photos));
    } catch (err) {
      console.error(err);
    }

    setPhoto(null);
    setShowCategoryPicker(false);
    setPresetCategory(undefined);
    setPresetEditId(undefined);
    router.back();
  };

  // ✅ appelé au clic sur "Use Photo"
  const handleUsePhoto = () => {
    if (presetCategory) {
      // venu d'un "+" de section (ou redo avec catégorie connue)
      // -> on sait déjà où ranger la photo
      savePhoto(presetCategory);
    } else {
      // caméra ouverte directement depuis l'onglet, ou redo d'une photo
      // "non catégorisée" -> on demande la catégorie
      setShowCategoryPicker(true);
    }
  };

  // ============================
  // CATEGORY PICKER (après "Use Photo" quand pas de catégorie préréglée)
  // ============================

  if (photo && showCategoryPicker) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />

        <View style={styles.pickerOverlay}>
          <Text style={styles.pickerTitle}>Where was this taken?</Text>

          <View style={styles.pickerGrid}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={styles.pickerOption}
                onPress={() => savePhoto(c.key)}
              >
                <MaterialCommunityIcons name={c.icon} size={26} color="#27AE60" />
                <Text style={styles.pickerOptionText}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
            <Text style={styles.pickerBack}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================
  // PHOTO PREVIEW
  // ============================

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />

        <View style={styles.previewButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#444" }]}
            onPress={handleRetakePhoto}
          >
            <Text style={styles.actionText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#27AE60" }]}
            onPress={handleUsePhoto}
          >
            <Text style={styles.actionText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================
  // CAMERA
  // ============================

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* ---------- TOP BLACK BAR ---------- */}

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace("/recettes")}>
          <AntDesign name="close" size={25} color="white" />
        </TouchableOpacity>

        <View style={{ width: 25 }} />
      </View>

      {/* ---------- BOTTOM BLACK BAR ---------- */}

      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <AntDesign name="picture" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleTakePhoto}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleCameraFacing}>
          <AntDesign name="retweet" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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

  // ======================
  // PREVIEW
  // ======================

  preview: {
    flex: 1,
    resizeMode: "cover",
  },

  previewButtons: {
    position: "absolute",
    bottom: 100,
    width: "100%",

    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  actionButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
  },

  actionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  // ======================
  // CATEGORY PICKER
  // ======================

  pickerOverlay: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,

    backgroundColor: "rgba(20,20,20,0.92)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  pickerTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  pickerOption: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  pickerOptionText: {
    color: "white",
    fontWeight: "600",
    marginTop: 8,
  },

  pickerBack: {
    color: "#999",
    textAlign: "center",
    marginTop: 6,
    fontSize: 15,
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
    backgroundColor: "#27AE60",
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