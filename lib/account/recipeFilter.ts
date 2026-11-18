import {
  AllergenKey,
  ApplianceKey,
  DietKey,
  allergenLabel,
  applianceLabel,
  dietLabel,
} from "@/constants/dietary";
import type { Recipe } from "@/app/Food/data/recipe/types";
import { formatNames, tr } from "@/lib/i18n";
import { englishIngredientNames, ingredientLabel } from "@/lib/recipeText";

import { Account, Member, RecipeCustomization, SELF_ID } from "./types";

export { formatNames };

// ─────────────────────────────────────────────
// Texte : « Oignons verts » doit correspondre à « oignon », « Œufs » à « oeuf ».
// ─────────────────────────────────────────────
// Les mêmes noms reviennent pour chaque recette × chaque terme : avec des
// milliers de recettes, les redécouper à chaque fois figeait le fil.
const wordsCache = new Map<string, string[]>();

export function normalizeWords(text: string): string[] {
  let words = wordsCache.get(text);
  if (!words) {
    words = splitWords(text);
    wordsCache.set(text, words);
  }
  return words;
}

function splitWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    // pluriels français simples (« oignons » -> « oignon », « choux » -> « chou »)
    .map((w) => (w.length > 3 && /[sx]$/.test(w) ? w.slice(0, -1) : w));
}

// Vrai si les mots du terme apparaissent à la suite dans le nom de l'ingrédient.
// Les goûts et allergies se tapent dans n'importe quelle langue : comparer aux
// noms français et anglais (voir recipeNames).
export function ingredientMatches(ingredientName: string, term: string) {
  const words = normalizeWords(ingredientName);
  const needle = normalizeWords(term);
  if (needle.length === 0 || needle.length > words.length) return false;
  for (let i = 0; i + needle.length <= words.length; i++) {
    if (needle.every((w, j) => words[i + j] === w)) return true;
  }
  return false;
}

// Tous les mots des ingrédients d'une recette (français et anglais), lus une
// seule fois. Choisir pour qui on cuisine relit les milliers de recettes pour
// chaque goût et chaque allergie de chaque personne : la plupart des termes
// n'y sont pas, et un mot absent suffit à les écarter sans relire chaque
// ingrédient (cocher une personne prenait plusieurs centaines de ms).
type RecipeWords = { names: string[]; words: Set<string> };
const recipeWordsCache = new WeakMap<Recipe, RecipeWords>();

function recipeWords(recipe: Recipe): RecipeWords {
  let entry = recipeWordsCache.get(recipe);
  if (!entry) {
    const names = recipeNames(recipe);
    const words = new Set<string>();
    for (const name of names) {
      for (const word of normalizeWords(name)) words.add(word);
    }
    entry = { names, words };
    recipeWordsCache.set(recipe, entry);
  }
  return entry;
}

// Vrai si un ingrédient de la recette correspond au terme : même réponse que
// ingredientMatches sur chaque nom français et anglais, en bien plus rapide.
export function recipeHasIngredient(recipe: Recipe, term: string) {
  const needle = normalizeWords(term);
  if (needle.length === 0) return false;
  const { names, words } = recipeWords(recipe);
  for (const word of needle) {
    if (!words.has(word)) return false;
  }
  // Un seul mot, présent dans un ingrédient : il correspond. Plusieurs mots
  // doivent se suivre dans le même ingrédient.
  return needle.length === 1 || names.some((name) => ingredientMatches(name, term));
}

// Les mêmes durées reviennent d'une recette à l'autre (« 30 min », « 1 h »).
const minutesCache = new Map<string, number | null>();

// « 1 h 20 min », « 1h30 », « 2 heures », « 40–45 minutes », « 30 »… -> minutes
export function parseMinutes(raw: string): number | null {
  let minutes = minutesCache.get(raw);
  if (minutes === undefined) {
    minutes = readMinutes(raw);
    minutesCache.set(raw, minutes);
  }
  return minutes;
}

function readMinutes(raw: string): number | null {
  const text = raw.toLowerCase().replace(/[–—]/g, "-");
  const tokens = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*(heures?|h|minutes?|min)?/g)];
  if (tokens.length === 0) return null;

  let total = 0;
  let lastUnit: "h" | "min" | null = null;
  for (const token of tokens) {
    const value = parseFloat(token[1].replace(",", "."));
    const unit = token[2] ? (token[2].startsWith("h") ? "h" : "min") : null;
    if (unit === "h") {
      total += value * 60;
      lastUnit = "h";
    } else if (unit === "min") {
      total += value;
      lastUnit = "min";
    } else if (lastUnit === "h") {
      total += value; // « 1h30 »
      lastUnit = "min";
    } else if (!text.slice((token.index ?? 0) + token[0].length).trimStart().startsWith("-")) {
      total += value; // nombre seul ; le début d'une fourchette « 40-45 » est ignoré
    }
  }
  return total > 0 ? Math.round(total) : null;
}

// ─────────────────────────────────────────────
// Verdict pour une recette et les personnes choisies
// ─────────────────────────────────────────────
export type HideReason =
  | { kind: "allergen"; allergen: AllergenKey; people: string[] }
  | { kind: "avoid"; term: string; people: string[] }
  | { kind: "diet"; diet: DietKey; people: string[] }
  | { kind: "appliance"; appliances: ApplianceKey[] }
  | { kind: "time"; minutes: number; limit: number };

export type PersonTerm = { person: string; term: string };

export type RecipeVerdict = {
  recipe: Recipe;
  hidden: boolean;
  reasons: HideReason[];
  likes: PersonTerm[];
  dislikes: PersonTerm[];
  missingAppliances: ApplianceKey[];
};

export function getAllMembers(account: Account): Member[] {
  return [account.self, ...account.members];
}

export function getCookingFor(account: Account): Member[] {
  const all = getAllMembers(account);
  const chosen = all.filter((m) => account.cookingFor.includes(m.id));
  return chosen.length > 0 ? chosen : [account.self];
}

function addPerson<T extends { people: string[] }>(
  list: T[],
  match: (r: T) => boolean,
  create: () => T,
  person: string
) {
  const existing = list.find(match);
  if (existing) {
    if (!existing.people.includes(person)) existing.people.push(person);
  } else {
    list.push(create());
  }
}

export function evaluateRecipe(
  recipe: Recipe,
  account: Account | null,
  people: Member[] = account ? getCookingFor(account) : []
): RecipeVerdict {
  const verdict: RecipeVerdict = {
    recipe,
    hidden: false,
    reasons: [],
    likes: [],
    dislikes: [],
    missingAppliances: [],
  };
  if (!account) return verdict; // invité : aucune personnalisation

  const allergenReasons: Extract<HideReason, { kind: "allergen" }>[] = [];
  const avoidReasons: Extract<HideReason, { kind: "avoid" }>[] = [];
  const dietReasons: Extract<HideReason, { kind: "diet" }>[] = [];
  // Les mots de la recette ne sont lus que si quelqu'un a des goûts ou des
  // allergies à vérifier.
  const has = (term: string) => recipeHasIngredient(recipe, term);

  for (const person of people) {
    for (const allergen of person.allergens) {
      if (recipe.allergens.includes(allergen)) {
        addPerson(
          allergenReasons,
          (r) => r.allergen === allergen,
          () => ({ kind: "allergen", allergen, people: [person.name] }),
          person.name
        );
      }
    }
    for (const term of person.avoid) {
      if (has(term)) {
        addPerson(
          avoidReasons,
          (r) => r.term.toLowerCase() === term.toLowerCase(),
          () => ({ kind: "avoid", term, people: [person.name] }),
          person.name
        );
      }
    }
    for (const diet of person.diets) {
      if (!recipe.diets.includes(diet)) {
        addPerson(
          dietReasons,
          (r) => r.diet === diet,
          () => ({ kind: "diet", diet, people: [person.name] }),
          person.name
        );
      }
    }
    for (const term of person.likes) {
      if (has(term)) {
        verdict.likes.push({ person: person.name, term });
      }
    }
    for (const term of person.dislikes) {
      if (has(term)) {
        verdict.dislikes.push({ person: person.name, term });
      }
    }
  }

  verdict.reasons.push(...allergenReasons, ...avoidReasons, ...dietReasons);

  verdict.missingAppliances = recipe.appliances.filter(
    (a) => !account.appliances.includes(a)
  );
  if (verdict.missingAppliances.length > 0 && !account.showMissingAppliances) {
    verdict.reasons.push({ kind: "appliance", appliances: verdict.missingAppliances });
  }

  const minutes = parseMinutes(recipe.time);
  if (account.maxMinutes !== null && minutes !== null && minutes > account.maxMinutes) {
    verdict.reasons.push({ kind: "time", minutes, limit: account.maxMinutes });
  }

  verdict.hidden = verdict.reasons.length > 0;
  return verdict;
}

export type RecipeFeed = {
  visible: RecipeVerdict[];
  hidden: RecipeVerdict[];
  people: Member[];
};

// Les noms des ingrédients en français et en anglais : « kiwi », « cilantro » et
// « coriandre » doivent tous trouver leur recette, quelle que soit la langue de l'app.
export function recipeNames(recipe: Recipe): string[] {
  const french = recipe.ingredients.map((i) => i.name);
  const english = englishIngredientNames(recipe) ?? [];
  return english.length > 0 ? [...french, ...english] : french;
}

// Recettes visibles (aimées d'abord, détestées en dernier) et recettes masquées.
export function buildFeed(recipes: Recipe[], account: Account | null): RecipeFeed {
  const people = account ? getCookingFor(account) : [];
  const verdicts = recipes.map((r) => evaluateRecipe(r, account, people));
  const score = (v: RecipeVerdict) => v.likes.length - 2 * v.dislikes.length;

  const visible = verdicts
    .filter((v) => !v.hidden)
    .map((v, index) => ({ v, index }))
    .sort((a, b) => score(b.v) - score(a.v) || a.index - b.index)
    .map(({ v }) => v);

  return { visible, hidden: verdicts.filter((v) => v.hidden), people };
}

// ─────────────────────────────────────────────
// Libellés
// ─────────────────────────────────────────────
export function describeReason(reason: HideReason): string {
  const people = formatNames(reason.kind === "appliance" || reason.kind === "time" ? [] : reason.people);
  switch (reason.kind) {
    case "allergen":
      return tr(
        `Contient : ${allergenLabel(reason.allergen)} (${people})`,
        `Contains: ${allergenLabel(reason.allergen)} (${people})`
      );
    case "avoid":
      return tr(`Contient : ${reason.term} (${people})`, `Contains: ${reason.term} (${people})`);
    case "diet":
      return tr(
        `Ne convient pas au régime ${dietLabel(reason.diet).toLowerCase()} (${people})`,
        `Not ${dietLabel(reason.diet).toLowerCase()} (${people})`
      );
    case "appliance": {
      const names = reason.appliances.map(applianceLabel).join(", ");
      return tr(`Appareil manquant : ${names}`, `Missing appliance: ${names}`);
    }
    case "time": {
      const times = `${formatDuration(reason.minutes)} > ${formatDuration(reason.limit)}`;
      return tr(`Plus long que votre limite (${times})`, `Longer than your limit (${times})`);
    }
  }
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? tr(`${h} h ${m}`, `${h} h ${m} min`) : `${h} h`;
}

// Résumé d'une personne : « Végétarien · Allergies : Arachides · N'aime pas : oignon »
export function describeMember(member: Member) {
  const parts = member.diets.map(dietLabel);
  const allergies = [...member.allergens.map(allergenLabel), ...member.avoid].join(", ");
  if (allergies) {
    parts.push(tr(`Allergies : ${allergies}`, `Allergies: ${allergies}`));
  }
  if (member.dislikes.length > 0) {
    const dislikes = member.dislikes.slice(0, 2).join(", ");
    parts.push(tr(`N'aime pas : ${dislikes}`, `Dislikes: ${dislikes}`));
  }
  return parts.length > 0 ? parts.join(" · ") : tr("Aucune restriction", "No restrictions");
}

// Régimes à afficher sur une recette, sans redondance (végétalien implique
// végétarien, qui implique pescétarien ; « sans porc » seulement s'il apporte
// une info, c.-à-d. pour une recette avec viande).
export function displayDiets(recipe: Recipe): string[] {
  const d = recipe.diets;
  const out: DietKey[] = [];
  if (d.includes("vegan")) out.push("vegan");
  else if (d.includes("vegetarian")) out.push("vegetarian");
  else if (d.includes("pescatarian")) out.push("pescatarian");
  if (d.includes("gluten-free")) out.push("gluten-free");
  if (d.includes("dairy-free")) out.push("dairy-free");
  if (d.includes("pork-free") && !d.includes("pescatarian")) out.push("pork-free");
  if (d.includes("low-carb")) out.push("low-carb");
  return out.map(dietLabel);
}

// ─────────────────────────────────────────────
// Recette personnalisée : ingrédients retirés / remplacés
// ─────────────────────────────────────────────
// `name` et `originalName` restent les noms français de la recette (frigo,
// retraits et remplacements enregistrés) ; `label` et `originalLabel` sont ceux
// à afficher, dans la langue choisie.
export type PersonalIngredient = Recipe["ingredients"][number] & {
  originalName: string;
  label: string;
  originalLabel: string;
  // Noms à comparer aux goûts et allergies (français, et anglais s'il existe).
  matchNames: string[];
  removed: boolean;
  swapped: boolean;
};

export function personalizeIngredients(
  recipe: Recipe,
  custom: RecipeCustomization | undefined
): PersonalIngredient[] {
  const english = englishIngredientNames(recipe);
  return recipe.ingredients.map((ingredient, index) => {
    const replacement = custom?.swaps?.[ingredient.name];
    const originalLabel = ingredientLabel(recipe, index);
    return {
      ...ingredient,
      name: replacement ?? ingredient.name,
      originalName: ingredient.name,
      label: replacement ?? originalLabel,
      originalLabel,
      matchNames: english?.[index] ? [ingredient.name, english[index]] : [ingredient.name],
      removed: custom?.removed?.includes(ingredient.name) ?? false,
      swapped: Boolean(replacement),
    };
  });
}

export const isSelf = (member: Member) => member.id === SELF_ID;
