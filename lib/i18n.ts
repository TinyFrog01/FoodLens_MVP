import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";

// ─────────────────────────────────────────────
// Langue de l'app : français ou anglais
// ─────────────────────────────────────────────
// Choisie dans le profil (Paramètres) et gardée sur l'appareil, même en mode
// invité. Les textes s'écrivent côte à côte dans le code :
//   tr("Voir la recette", "See the recipe")
// Les listes fixes (régimes, appareils, rayons…) passent par un getter, pour
// que `label` suive la langue sans changer le code qui les lit :
//   { key: "oven", get label() { return tr("Four", "Oven"); } }

export type Language = "fr" | "en";

export const LANGUAGES: { key: Language; label: string }[] = [
  { key: "fr", label: "Français" },
  { key: "en", label: "English" },
];

const STORAGE_KEY = "language";

// Une seule copie pour toute l'app : changer de langue redessine chaque écran
// qui l'utilise, y compris ceux restés ouverts dans les onglets.
let state: { language: Language; loaded: boolean } = { language: "fr", loaded: false };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const setState = (next: typeof state) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

function load() {
  if (!loading) {
    loading = AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "fr" || saved === "en") state = { ...state, language: saved };
      })
      .catch(() => {
        // lecture impossible : on garde le français
      })
      .finally(() => setState({ ...state, loaded: true }));
  }
  return loading;
}

export const getLanguage = () => state.language;

export function setLanguage(language: Language) {
  if (language === state.language) return;
  setState({ ...state, language });
  AsyncStorage.setItem(STORAGE_KEY, language).catch(() => {});
}

// Le texte dans la langue choisie. Hors d'un composant (fonctions de lib/),
// il suit la langue du moment : à appeler pendant le rendu d'un composant qui
// utilise useLanguage(), pour qu'un changement de langue le redessine.
export const tr = (fr: string, en: string) => (state.language === "en" ? en : fr);

// Pour les dates et les nombres (toLocaleDateString…).
export const localeOf = (language: Language = state.language) =>
  language === "en" ? "en-CA" : "fr-CA";

// « 8 659 » (espace fine) en français, « 8,659 » en anglais.
export const formatCount = (n: number, language: Language = state.language) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, language === "en" ? "," : "\u202f");

// « Léa, Max et Sam » / « Léa, Max and Sam »
export function formatNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${tr("et", "and")} ${names[names.length - 1]}`;
}

export function useLanguage() {
  useEffect(() => {
    load();
  }, []);

  const { language, loaded } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { language, loaded, setLanguage, tr };
}
