import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  capitalize,
  describeItems,
  DetectedItem,
  Detection,
  DetectionStatus,
  detectIngredients,
  detectionErrorMessage,
  ImageSize,
  itemQuantity,
  normalizeName,
} from "@/lib/ingredientDetection";
import { localeOf, tr } from "@/lib/i18n";

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
  // Libellé de la prise de vue, écrit dans la langue du moment (anciennes photos) ;
  // `takenAt` (ISO) permet de l'afficher dans la langue choisie.
  date?: string;
  takenAt?: string;
  items?: DetectedItem[];
  // undefined = photo jamais analysée (anciennes photos).
  detection?: DetectionStatus;
  detectionError?: string;
  // Taille de la photo vue par l'API : les boîtes des ingrédients y sont
  // exprimées en fractions. Absente sur les anciennes photos.
  imageSize?: ImageSize;
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  get fridge() { return tr("Frigo", "Fridge"); },
  get freezer() { return tr("Congélateur", "Freezer"); },
  get pantry() { return tr("Garde-manger", "Pantry"); },
  get counter() { return tr("Comptoir", "Counter"); },
  get uncategorized() { return tr("Non catégorisé", "Uncategorized"); },
};

// « 8 nov., 17 h 30 » / « Nov 8, 5:30 p.m. »
export const formatPhotoDate = (date: Date) =>
  date.toLocaleString(localeOf(), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const photoDateLabel = (photo: StoredPhoto) =>
  photo.takenAt ? formatPhotoDate(new Date(photo.takenAt)) : (photo.date ?? tr("Sans date", "No date"));

// Section où la photo est affichée : une catégorie inconnue tombe dans
// "Non catégorisé".
export const categoryOf = (photo: StoredPhoto): CategoryKey =>
  photo.category && photo.category in CATEGORY_LABELS
    ? photo.category
    : "uncategorized";

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
      photo.detectionError = tr("L'analyse a été interrompue.", "The analysis was interrupted.");
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
  detection: Promise<Detection>
) {
  try {
    const { items, imageSize } = await detection;
    await updatePhoto(id, uri, (p) => ({
      ...p,
      items,
      imageSize,
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

// ✅ Les ingrédients d'une photo partent avec elle : la liste d'aliments est
// recalculée à partir des photos restantes (collectIngredients). 2 pommes sur
// la photo supprimée = 2 pommes en moins ; celles vues ailleurs restent.
export function deletePhotos(ids: string[]) {
  return updatePhotos((photos) => photos.filter((p) => !ids.includes(p.id)));
}

export const deletePhotoMessage = (photo: StoredPhoto) =>
  photo.items?.length
    ? tr(
        `Ces aliments seront retirés de ta liste : ${describeItems(photo.items)}.`,
        `These foods will be removed from your list: ${describeItems(photo.items)}.`
      )
    : tr("Aucun aliment n'a été trouvé dessus.", "No food was found on it.");

export type ItemRef = { photoId: string; name: string };

// Gardé (ou corrigé, ou ajouté à la main) : il compte dans les recettes et
// n'est plus « passé ».
const asConfirmed = (item: DetectedItem): DetectedItem => ({
  ...item,
  confirmed: true,
  skipped: undefined,
});

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
            : photo.items.map((item) => (matches(item) ? asConfirmed(item) : item)),
      };
    })
  );
}

// ─────────────────────────────────────────────
// Vérification une carte à la fois (paquet à glisser)
// ─────────────────────────────────────────────

type ItemsChange = (items: DetectedItem[]) => DetectedItem[];

const isNamed = (name: string) => (item: DetectedItem) =>
  normalizeName(item.name) === normalizeName(name);

// ✅ Change les ingrédients d'une seule photo. Renvoie ceux d'avant, pour
// pouvoir annuler en les remettant tels quels.
export async function editPhotoItems(photoId: string, change: ItemsChange) {
  let before: DetectedItem[] | undefined;
  await updatePhotos((photos) =>
    photos.map((p) => {
      if (p.id !== photoId || !p.items) return p;
      before = p.items;
      return { ...p, items: change(p.items) };
    })
  );
  return before;
}

export const keepItem = (name: string): ItemsChange => (items) =>
  items.map((item) => (isNamed(name)(item) ? asConfirmed(item) : item));

export const removeItem = (name: string): ItemsChange => (items) =>
  items.filter((item) => !isNamed(name)(item));

// ✅ « Passer » : l'ingrédient reste à vérifier, en jaune, sans compter dans
// les recettes. Plusieurs noms d'un coup pour « Tout passer ».
export const skipItems = (names: string[]): ItemsChange => (items) =>
  items.map((item) =>
    !item.confirmed && names.some((name) => isNamed(name)(item))
      ? { ...item, skipped: true }
      : item
  );

// ✅ « Ce n'est pas ça, c'est… » : l'ingrédient prend le nom écrit par
// l'utilisateur et compte comme vérifié. Si ce nom est déjà sur la photo, les
// deux ne font plus qu'un (quantités additionnées, mêmes boîtes).
export const renameItem = (oldName: string, newName: string): ItemsChange => (items) => {
  const name = newName.trim();
  const old = items.find(isNamed(oldName));
  if (!old || !name) return items;

  const existing = items.find((item) => item !== old && isNamed(name)(item));
  if (!existing) {
    // Le score de l'IA ne veut plus rien dire pour un nom donné à la main.
    const corrected = { ...asConfirmed(old), name: capitalize(name), confidence: undefined };
    return items.map((item) => (item === old ? corrected : item));
  }

  const boxes = [...(existing.boxes ?? []), ...(old.boxes ?? [])];
  const merged: DetectedItem = {
    ...asConfirmed(existing),
    quantity: itemQuantity(existing) + itemQuantity(old),
    ...(boxes.length > 0 ? { boxes } : {}),
  };
  return items
    .filter((item) => item !== old)
    .map((item) => (item === existing ? merged : item));
};

// ✅ Ingrédient oublié par l'IA, écrit au bout de la liste : sûr d'office,
// sans score ni place sur la photo. S'il y est déjà et vérifié, ça en fait un
// de plus ; encore « à vérifier », c'est que l'IA avait vu juste.
export const addItem = (newName: string): ItemsChange => (items) => {
  const name = newName.trim();
  if (!name) return items;

  const existing = items.find(isNamed(name));
  if (!existing) {
    return [...items, { name: capitalize(name), confirmed: true, quantity: 1 }];
  }

  const updated = existing.confirmed
    ? { ...existing, quantity: itemQuantity(existing) + 1 }
    : asConfirmed(existing);
  return items.map((item) => (item === existing ? updated : item));
};

// Une carte du paquet à glisser : un ingrédient et la photo où il a été vu.
export type ReviewCard = { photo: StoredPhoto; item: DetectedItem };

// ✅ Les ingrédients à vérifier de ces photos, en cartes : d'abord ceux jamais
// vus, puis ceux passés (en jaune), sauf si on ne veut que les nouveaux.
export function reviewCards(
  photos: StoredPhoto[],
  { withSkipped = true }: { withSkipped?: boolean } = {}
): ReviewCard[] {
  const cards = photos.flatMap((photo) =>
    (photo.items ?? []).filter((item) => !item.confirmed).map((item) => ({ photo, item }))
  );
  const unseen = cards.filter((card) => !card.item.skipped);
  return withSkipped ? [...unseen, ...cards.filter((card) => card.item.skipped)] : unseen;
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
  // Total sur toutes les photos (2 sur l'une + 1 sur l'autre = 3).
  quantity: number;
  // À vérifier et passé sur toutes les photos où il est : en jaune.
  skipped: boolean;
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
        quantity: 0,
        skipped: true,
        categories: [],
        refs: [],
      };

      group.skipped = group.skipped && !item.confirmed && !!item.skipped;
      const category = photo.category ?? "uncategorized";
      if (!group.categories.includes(category)) group.categories.push(category);
      group.refs.push({ photoId: photo.id, name: item.name });
      group.quantity += itemQuantity(item);
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
