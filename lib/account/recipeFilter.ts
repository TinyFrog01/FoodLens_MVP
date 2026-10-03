import {
  AllergenKey,
  ApplianceKey,
  DietKey,
  allergenLabel,
  applianceLabel,
  dietLabel,
} from "@/constants/dietary";
import type { Recipe } from "@/app/Food/data/recipe/recipe";

import { Account, Member, RecipeCustomization, SELF_ID } from "./types";

// ─────────────────────────────────────────────
// Texte : « Oignons verts » doit correspondre à « oignon », « Œufs » à « oeuf ».
// ─────────────────────────────────────────────
function normalizeWords(text: string): string[] {
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
export function ingredientMatches(ingredientName: string, term: string) {
  const words = normalizeWords(ingredientName);
  const needle = normalizeWords(term);
  if (needle.length === 0 || needle.length > words.length) return false;
  for (let i = 0; i + needle.length <= words.length; i++) {
    if (needle.every((w, j) => words[i + j] === w)) return true;
  }
  return false;
}

// « 1 h 20 min », « 1h30 », « 2 heures », « 40–45 minutes », « 30 »… -> minutes
export function parseMinutes(raw: string): number | null {
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
  const names = recipe.ingredients.map((i) => i.name);

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
      if (names.some((n) => ingredientMatches(n, term))) {
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
      if (names.some((n) => ingredientMatches(n, term))) {
        verdict.likes.push({ person: person.name, term });
      }
    }
    for (const term of person.dislikes) {
      if (names.some((n) => ingredientMatches(n, term))) {
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
export function formatNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} et ${names[names.length - 1]}`;
}

export function describeReason(reason: HideReason): string {
  switch (reason.kind) {
    case "allergen":
      return `Contient : ${allergenLabel(reason.allergen)} (${formatNames(reason.people)})`;
    case "avoid":
      return `Contient : ${reason.term} (${formatNames(reason.people)})`;
    case "diet":
      return `Ne convient pas au régime ${dietLabel(reason.diet).toLowerCase()} (${formatNames(reason.people)})`;
    case "appliance":
      return `Appareil manquant : ${reason.appliances.map(applianceLabel).join(", ")}`;
    case "time":
      return `Plus long que votre limite (${formatDuration(reason.minutes)} > ${formatDuration(reason.limit)})`;
  }
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m}` : `${h} h`;
}

// Résumé d'une personne : « Végétarien · Allergies : Arachides · N'aime pas : oignon »
export function describeMember(member: Member) {
  const parts = member.diets.map(dietLabel);
  const allergies = [...member.allergens.map(allergenLabel), ...member.avoid];
  if (allergies.length > 0) {
    parts.push(`Allergies : ${allergies.join(", ")}`);
  }
  if (member.dislikes.length > 0) {
    parts.push(`N'aime pas : ${member.dislikes.slice(0, 2).join(", ")}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Aucune restriction";
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
export type PersonalIngredient = Recipe["ingredients"][number] & {
  originalName: string;
  removed: boolean;
  swapped: boolean;
};

export function personalizeIngredients(
  recipe: Recipe,
  custom: RecipeCustomization | undefined
): PersonalIngredient[] {
  return recipe.ingredients.map((ingredient) => {
    const replacement = custom?.swaps?.[ingredient.name];
    return {
      ...ingredient,
      name: replacement ?? ingredient.name,
      originalName: ingredient.name,
      removed: custom?.removed?.includes(ingredient.name) ?? false,
      swapped: Boolean(replacement),
    };
  });
}

export const isSelf = (member: Member) => member.id === SELF_ID;
