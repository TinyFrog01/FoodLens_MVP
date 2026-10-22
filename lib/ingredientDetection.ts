import { File } from "expo-file-system";
import { Platform } from "react-native";

// ─────────────────────────────────────────────
// API FoodLens : détection des ingrédients sur une photo
// Docs : https://food-lense-aeoaeunkl-renjijenkins.vercel.app/docs
// ─────────────────────────────────────────────

// Surchargeable via EXPO_PUBLIC_FOODLENS_API_URL (fichier .env) pour pointer
// vers un autre déploiement sans toucher au code.
const API_URL = (
  process.env.EXPO_PUBLIC_FOODLENS_API_URL ??
  "https://food-lense-aeoaeunkl-renjijenkins.vercel.app"
).replace(/\/+$/, "");

const DETECT_ENDPOINT = `${API_URL}/api/v1/detect-ingredients`;

// ✅ Seuil de confiance (0–1) : au-dessus, l'ingrédient est accepté
// automatiquement ; en dessous, il part dans "à vérifier".
export const CONFIDENCE_THRESHOLD = 0.7;

const REQUEST_TIMEOUT_MS = 60_000;

export type DetectedItem = {
  name: string;
  // 0–1. Absent si l'API ne renvoie pas de score : l'ingrédient est alors
  // considéré comme sûr.
  confidence?: number;
  // false = "à vérifier" (sous le seuil, ou pas encore validé à la main).
  confirmed: boolean;
};

export type DetectionStatus = "pending" | "done" | "error";

export const countItems = (items: DetectedItem[] = []) => {
  const identified = items.filter((i) => i.confirmed).length;
  return { identified, needCheck: items.length - identified, total: items.length };
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
// Le schéma de réponse n'est pas décrit dans l'OpenAPI : on accepte les
// formes les plus courantes (tableau direct, { ingredients: [...] },
// JSON renvoyé sous forme de texte par le modèle, etc.).

const LIST_KEYS = [
  "ingredients",
  "items",
  "detections",
  "detected",
  "predictions",
  "results",
  "result",
  "data",
  "output",
];
const NAME_KEYS = ["name", "ingredient", "label", "item", "food", "class_name", "class"];
const CONFIDENCE_KEYS = ["confidence", "score", "probability", "certainty", "conf"];
const WORD_CONFIDENCE: Record<string, number> = { high: 0.9, medium: 0.6, low: 0.3 };

const toConfidence = (value: unknown): number | undefined => {
  if (typeof value === "string") {
    const word = WORD_CONFIDENCE[value.trim().toLowerCase()];
    if (word !== undefined) return word;
    value = parseFloat(value); // "92%" -> 92
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;

  // Certaines API répondent en pourcentage (0–100).
  const ratio = value > 1 ? value / 100 : value;
  return Math.min(1, Math.max(0, ratio));
};

// Le modèle peut renvoyer son JSON entouré de ```json ... ```.
const parseJsonText = (text: string): unknown => {
  const cleaned = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const findIngredientList = (body: unknown, depth = 0): unknown[] | null => {
  if (depth > 4) return null;

  if (typeof body === "string") {
    const parsed = parseJsonText(body);
    return parsed === undefined ? null : findIngredientList(parsed, depth + 1);
  }

  if (Array.isArray(body)) return body;
  if (!isRecord(body)) return null;

  for (const key of LIST_KEYS) {
    if (!(key in body)) continue;
    const value = body[key];

    // { "tomate": 0.92, "basilic": 0.4 }
    if (isRecord(value) && Object.values(value).every((v) => toConfidence(v) !== undefined)) {
      return Object.entries(value).map(([name, confidence]) => ({ name, confidence }));
    }

    const found = findIngredientList(value, depth + 1);
    if (found) return found;
  }

  // Dernier recours : premier tableau trouvé dans l'objet.
  const firstArray = Object.values(body).find(Array.isArray);
  return firstArray ?? null;
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const toDetectedItem = (raw: unknown): DetectedItem | null => {
  let name: unknown;
  let confidence: number | undefined;

  if (typeof raw === "string") {
    name = raw;
  } else if (isRecord(raw)) {
    name = NAME_KEYS.map((k) => raw[k]).find(
      (v) => typeof v === "string" && v.trim()
    );
    confidence = CONFIDENCE_KEYS.map((k) => toConfidence(raw[k])).find(
      (v) => v !== undefined
    );
  }

  if (typeof name !== "string" || !name.trim()) return null;

  return {
    name: capitalize(name.trim()),
    confidence,
    confirmed: confidence === undefined || confidence >= CONFIDENCE_THRESHOLD,
  };
};

// Un même ingrédient peut sortir plusieurs fois : on garde le meilleur score.
const dedupe = (items: DetectedItem[]) => {
  const byName = new Map<string, DetectedItem>();

  items.forEach((item) => {
    const key = normalizeName(item.name);
    const existing = byName.get(key);
    const score = item.confidence ?? 1;

    if (!existing || score > (existing.confidence ?? 1)) {
      byName.set(key, item);
    }
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
  if (status === 413) return "Photo too large for the analysis server.";
  if (status >= 500) return "The analysis server had a problem.";
  return `The analysis server refused the photo (${status}).`;
};

// Envoie la photo à l'API et renvoie les ingrédients reconnus, chacun
// marqué confirmé ou "à vérifier" selon CONFIDENCE_THRESHOLD.
export async function detectIngredients(uri: string): Promise<DetectedItem[]> {
  let form: FormData;
  try {
    form = await buildFormData(uri);
  } catch (err) {
    console.warn("detect-ingredients: couldn't read the photo", uri, err);
    throw new Error("Couldn't read the photo.");
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
        ? "The analysis took too long."
        : "Couldn't reach the analysis server."
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  const body = parseJsonText(text) ?? text;

  if (!response.ok) {
    console.warn(`detect-ingredients ${response.status}`, body);
    throw new Error(errorForStatus(response.status));
  }

  const list = findIngredientList(body);
  if (!list) {
    console.warn("detect-ingredients: unexpected response", body);
    throw new Error("Unexpected response from the analysis server.");
  }

  return dedupe(
    list.map(toDetectedItem).filter((i): i is DetectedItem => i !== null)
  );
}

export const detectionErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "The analysis failed.";
