import { File } from "expo-file-system";
import { Platform } from "react-native";

import { tr } from "@/lib/i18n";

// ─────────────────────────────────────────────
// API FoodLens : détection des ingrédients sur une photo
// Docs : https://food-lense-api-git-confidence-and-boxes-renjijenkins.vercel.app/docs
// ─────────────────────────────────────────────

// URL de base du déploiement, sans /docs (la route est ajoutée plus bas).
// Surchargeable via EXPO_PUBLIC_FOODLENS_API_URL (fichier .env) pour pointer
// vers un autre déploiement sans toucher au code.
const API_URL = (
  process.env.EXPO_PUBLIC_FOODLENS_API_URL ??
  "https://food-lense-api-git-confidence-and-boxes-renjijenkins.vercel.app"
).replace(/\/+$/, "");

// ✅ Seuil de confiance (0–1) : au-dessus, l'ingrédient est accepté
// automatiquement ; en dessous, il part dans "à vérifier". Envoyé à l'API,
// qui marque elle-même chaque ingrédient (`confident`).
export const CONFIDENCE_THRESHOLD = 0.7;

const DETECT_ENDPOINT = `${API_URL}/api/v1/detect-ingredients?confidence_threshold=${Math.round(
  CONFIDENCE_THRESHOLD * 100
)}`;

const REQUEST_TIMEOUT_MS = 60_000;

// Zone de la photo où l'ingrédient a été vu, en fractions (0–1) de la photo
// remise droite : x/y = coin haut gauche.
export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  // Combien il y en a dans cette zone.
  quantity?: number;
  // 0–1
  confidence?: number;
};

export type ImageSize = { width: number; height: number };

export type DetectedItem = {
  name: string;
  // 0–1. Absent si l'API ne renvoie pas de score, ou si l'utilisateur a
  // corrigé le nom ou ajouté l'ingrédient : il est alors considéré comme sûr.
  confidence?: number;
  // false = "à vérifier" (sous le seuil, ou pas encore validé à la main).
  // Seuls les confirmés comptent dans les recettes.
  confirmed: boolean;
  // true = passé dans le paquet à glisser : toujours à vérifier, mais en
  // jaune, et le paquet ne s'ouvre plus tout seul pour lui. Effacé une fois
  // gardé.
  skipped?: boolean;
  // Nombre vu sur la photo (2 pommes = 2). Absent sur les anciennes photos.
  quantity?: number;
  // Où il est sur la photo. Absent sur les anciennes photos, et pour un
  // ingrédient ajouté à la main.
  boxes?: BoundingBox[];
};

// Résultat d'une analyse. imageSize sert à placer les boîtes sur la photo.
export type Detection = { items: DetectedItem[]; imageSize?: ImageSize };

export type DetectionStatus = "pending" | "done" | "error";

export const itemQuantity = (item: DetectedItem) => item.quantity ?? 1;

// "Pomme ×2, Lait"
export const describeItems = (items: DetectedItem[] = []) =>
  items
    .map((i) => (itemQuantity(i) > 1 ? `${i.name} ×${itemQuantity(i)}` : i.name))
    .join(", ");

// needCheck compte aussi ceux passés (skipped), qui restent à vérifier.
export const countItems = (items: DetectedItem[] = []) => {
  const identified = items.filter((i) => i.confirmed).length;
  const skipped = items.filter((i) => !i.confirmed && i.skipped).length;
  return { identified, needCheck: items.length - identified, skipped, total: items.length };
};

export const normalizeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// ─────────────────────────────────────────────
// Lecture de la réponse
// ─────────────────────────────────────────────
// { image: { width, height }, confidence_threshold, data: { ingredients: [
//   { name, quantity, unit, confidence (0–100), confident, boxes: [...] } ] } }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// L'API répond en pourcentage (0–100) ; l'app garde des fractions (0–1).
const toConfidence = (value: unknown) => {
  const n = toNumber(value);
  return n === undefined ? undefined : clamp01(n / 100);
};

const toQuantity = (value: unknown) => {
  const n = toNumber(value);
  return n !== undefined && n > 0 ? n : undefined;
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const toBox = (raw: unknown): BoundingBox | null => {
  if (!isRecord(raw)) return null;
  const x = toNumber(raw.x);
  const y = toNumber(raw.y);
  const width = toNumber(raw.width);
  const height = toNumber(raw.height);
  if (x === undefined || y === undefined || !width || !height) return null;

  return {
    x: clamp01(x),
    y: clamp01(y),
    width: clamp01(width),
    height: clamp01(height),
    quantity: toQuantity(raw.quantity),
    confidence: toConfidence(raw.confidence),
  };
};

const toDetectedItem = (raw: unknown): DetectedItem | null => {
  if (!isRecord(raw) || typeof raw.name !== "string" || !raw.name.trim()) {
    return null;
  }

  const confidence = toConfidence(raw.confidence);
  const boxes = Array.isArray(raw.boxes)
    ? raw.boxes.map(toBox).filter((b): b is BoundingBox => b !== null)
    : [];

  return {
    name: capitalize(raw.name.trim()),
    confidence,
    // L'API compare déjà au seuil envoyé ; on recalcule seulement si elle ne
    // l'a pas fait.
    confirmed:
      typeof raw.confident === "boolean"
        ? raw.confident
        : confidence === undefined || confidence >= CONFIDENCE_THRESHOLD,
    quantity: toQuantity(raw.quantity) ?? 1,
    ...(boxes.length > 0 ? { boxes } : {}),
  };
};

const toImageSize = (raw: unknown): ImageSize | undefined => {
  if (!isRecord(raw)) return undefined;
  const width = toNumber(raw.width);
  const height = toNumber(raw.height);
  return width && height ? { width, height } : undefined;
};

// Un même ingrédient peut sortir plusieurs fois : on additionne les
// quantités, on garde le meilleur score et toutes les boîtes.
const dedupe = (items: DetectedItem[]) => {
  const byName = new Map<string, DetectedItem>();

  items.forEach((item) => {
    const key = normalizeName(item.name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, item);
      return;
    }

    const best =
      (item.confidence ?? 1) > (existing.confidence ?? 1) ? item : existing;
    const boxes = [...(existing.boxes ?? []), ...(item.boxes ?? [])];
    byName.set(key, {
      ...best,
      confirmed: existing.confirmed || item.confirmed,
      quantity: itemQuantity(existing) + itemQuantity(item),
      ...(boxes.length > 0 ? { boxes } : {}),
    });
  });

  return [...byName.values()];
};

// ─────────────────────────────────────────────
// Appel réseau
// ─────────────────────────────────────────────

const buildFormData = async (uri: string) => {
  const form = new FormData();

  if (Platform.OS === "web") {
    // Sur web, expo-camera renvoie une data URI : on la convertit en Blob.
    const blob = await (await fetch(uri)).blob();
    form.append("file", blob, "photo.jpg");
  } else {
    // ⚠️ Pas de { uri, name, type } façon React Native : depuis Expo 52+, le
    // fetch global est expo/fetch, qui rejette ce format ("Unsupported
    // FormDataPart implementation") avant même d'envoyer la requête.
    // Le File d'expo-file-system implémente Blob, lui est accepté.
    form.append("file", new File(uri));
  }

  return form;
};

const errorForStatus = (status: number) => {
  if (status === 413) return tr("Photo trop lourde pour le serveur d'analyse.", "The photo is too large for the analysis server.");
  if (status >= 500) return tr("Le serveur d'analyse a eu un problème.", "The analysis server had a problem.");
  return tr(`Le serveur d'analyse a refusé la photo (${status}).`, `The analysis server refused the photo (${status}).`);
};

// Envoie la photo à l'API et renvoie les ingrédients reconnus, chacun
// marqué confirmé ou "à vérifier" selon CONFIDENCE_THRESHOLD.
export async function detectIngredients(uri: string): Promise<Detection> {
  let form: FormData;
  try {
    form = await buildFormData(uri);
  } catch (err) {
    console.warn("detect-ingredients: couldn't read the photo", uri, err);
    throw new Error(tr("Impossible de lire la photo.", "Couldn't read the photo."));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(DETECT_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    // Message d'origine dans la console Metro pour comprendre la cause.
    console.warn("detect-ingredients: request failed", err);
    throw new Error(
      controller.signal.aborted
        ? tr("L'analyse a pris trop de temps.", "The analysis took too long.")
        : tr("Impossible de joindre le serveur d'analyse.", "Couldn't reach the analysis server.")
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  const body = parseJson(text) ?? text;

  if (!response.ok) {
    console.warn(`detect-ingredients ${response.status}`, body);
    throw new Error(errorForStatus(response.status));
  }

  const list = isRecord(body) && isRecord(body.data) ? body.data.ingredients : undefined;
  if (!Array.isArray(list)) {
    console.warn("detect-ingredients: unexpected response", body);
    throw new Error(tr("Réponse inattendue du serveur d'analyse.", "Unexpected answer from the analysis server."));
  }

  return {
    items: dedupe(list.map(toDetectedItem).filter((i): i is DetectedItem => i !== null)),
    imageSize: isRecord(body) ? toImageSize(body.image) : undefined,
  };
}

export const detectionErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : tr("L'analyse a échoué.", "The analysis failed.");
