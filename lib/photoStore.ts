import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DetectedItem,
  DetectionStatus,
  detectIngredients,
  detectionErrorMessage,
  normalizeName,
} from "@/lib/ingredientDetection";

const STORAGE_KEY = "photos";

export type CategoryKey =
  | "fridge"
  | "freezer"
  | "pantry"
  | "counter"
  | "uncategorized";

export type StoredPhoto = {
  id: string;
  uri: string;
  category?: CategoryKey;
  date?: string;
  items?: DetectedItem[];
  // undefined = photo jamais analysée (anciennes photos).
  detection?: DetectionStatus;
  detectionError?: string;
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fridge: "Frigo",
  freezer: "Congélateur",
  pantry: "Garde-manger",
  counter: "Comptoir",
  uncategorized: "Non catégorisé",
};

// Uris en cours d'analyse pendant cette session. Une photo enregistrée en
// "pending" qui n'y est pas a été interrompue (app fermée avant la réponse).
const analyzing = new Set<string>();

// ✅ Lance l'analyse d'une photo qui vient d'être prise.
export function startAnalysis(uri: string) {
  analyzing.add(uri);
  return detectIngredients(uri);
}

// Compatibilité : d'anciennes entrées sont de simples strings (uri
// uniquement) ou n'ont pas de catégorie/id.
const normalize = (parsed: any[]): StoredPhoto[] =>
  parsed.map((p, index) => {
    if (typeof p === "string") {
      return { id: `legacy-${index}-${p}`, uri: p, category: "uncategorized" };
    }

    const photo: StoredPhoto = {
      ...p,
      id: p.id ?? `legacy-${index}-${p.uri}`,
      category: p.category ?? "uncategorized",
    };

    // Sans ça, la photo resterait "Analyzing…" pour toujours.
    if (photo.detection === "pending" && !analyzing.has(photo.uri)) {
      photo.detection = "error";
      photo.detectionError = "The analysis was interrupted.";
    }

    return photo;
  });

export async function readPhotos(): Promise<StoredPhoto[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? normalize(JSON.parse(stored)) : [];
}

// ─────────────────────────────────────────────
// Écritures
// ─────────────────────────────────────────────
// ✅ Les écritures passent toutes par une file : une détection qui se termine
// pendant un enregistrement ne doit pas écraser ce que l'autre vient d'écrire
// (lecture -> modification -> écriture n'est pas atomique avec AsyncStorage).

type Listener = (photos: StoredPhoto[]) => void;
const listeners = new Set<Listener>();
let writeQueue: Promise<unknown> = Promise.resolve();

export function subscribePhotos(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updatePhotos(
  mutate: (photos: StoredPhoto[]) => StoredPhoto[]
): Promise<StoredPhoto[]> {
  const result = writeQueue.then(async () => {
    const next = mutate(await readPhotos());
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener(next));
    return next;
  });

  writeQueue = result.catch(() => {});
  return result;
}

// On vérifie aussi l'uri : si la photo a été reprise (redo) entre-temps,
// le résultat de l'ancienne analyse ne doit pas écraser la nouvelle.
const updatePhoto = (
  id: string,
  uri: string,
  change: (photo: StoredPhoto) => StoredPhoto
) =>
  updatePhotos((photos) =>
    photos.map((p) => (p.id === id && p.uri === uri ? change(p) : p))
  );

// Enregistre sur la photo le résultat d'une analyse déjà lancée.
export async function saveDetectionResult(
  id: string,
  uri: string,
  detection: Promise<DetectedItem[]>
) {
  try {
    const items = await detection;
    await updatePhoto(id, uri, (p) => ({
      ...p,
      items,
      detection: "done",
      detectionError: undefined,
    }));
  } catch (err) {
    await updatePhoto(id, uri, (p) => ({
      ...p,
      detection: "error",
      detectionError: detectionErrorMessage(err),
    }));
  } finally {
    analyzing.delete(uri);
  }
}

// (Re)lance l'analyse d'une photo déjà enregistrée.
export async function analyzePhoto(photo: StoredPhoto) {
  // Marqué "en cours" avant d'écrire "pending", pour ne jamais être lu
  // comme une analyse interrompue.
  analyzing.add(photo.uri);
  await updatePhoto(photo.id, photo.uri, (p) => ({
    ...p,
    detection: "pending",
    detectionError: undefined,
  }));
  await saveDetectionResult(photo.id, photo.uri, detectIngredients(photo.uri));
}

export type ItemRef = { photoId: string; name: string };

// "Garder" (confirm) ou "Retirer" (remove) un ingrédient à vérifier, sur une
// ou plusieurs photos à la fois.
export function reviewItems(refs: ItemRef[], action: "confirm" | "remove") {
  return updatePhotos((photos) =>
    photos.map((photo) => {
      const names = refs
        .filter((r) => r.photoId === photo.id)
        .map((r) => normalizeName(r.name));
      if (names.length === 0 || !photo.items) return photo;

      const matches = (item: DetectedItem) =>
        names.includes(normalizeName(item.name));

      return {
        ...photo,
        items:
          action === "remove"
            ? photo.items.filter((item) => !matches(item))
            : photo.items.map((item) =>
                matches(item) ? { ...item, confirmed: true } : item
              ),
      };
    })
  );
}

// ─────────────────────────────────────────────
// Ingrédients vus sur l'ensemble des photos
// ─────────────────────────────────────────────

export type PhotoIngredient = {
  key: string;
  name: string;
  confirmed: boolean;
  // Meilleur score parmi les photos où il apparaît.
  confidence?: number;
  categories: CategoryKey[];
  refs: ItemRef[];
};

// Regroupe par nom les ingrédients de toutes les photos, séparés entre
// confirmés et "à vérifier".
export function collectIngredients(photos: StoredPhoto[]) {
  const groups = new Map<string, PhotoIngredient>();

  photos.forEach((photo) => {
    photo.items?.forEach((item) => {
      const key = `${item.confirmed ? "ok" : "check"}:${normalizeName(item.name)}`;
      const group = groups.get(key) ?? {
        key,
        name: item.name,
        confirmed: item.confirmed,
        confidence: item.confidence,
        categories: [],
        refs: [],
      };

      const category = photo.category ?? "uncategorized";
      if (!group.categories.includes(category)) group.categories.push(category);
      group.refs.push({ photoId: photo.id, name: item.name });
      if ((item.confidence ?? 1) > (group.confidence ?? 1)) {
        group.confidence = item.confidence;
      }

      groups.set(key, group);
    });
  });

  const all = [...groups.values()];
  return {
    confirmed: all.filter((g) => g.confirmed),
    toReview: all.filter((g) => !g.confirmed),
  };
}
