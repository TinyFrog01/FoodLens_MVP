import { normalizeWords } from "@/lib/account/recipeFilter";
import {
  DERIVED,
  FAMILIES,
  WHOLE,
  type Cut,
  type Family,
  type Kind,
  type Terms,
} from "@/lib/ingredientFamilies";

// ─────────────────────────────────────────────
// Un aliment vu sur une photo couvre-t-il un ingrédient de recette ?
// ─────────────────────────────────────────────
// « Chicken » couvre les poitrines, les cuisses et le poulet entier, mais pas
// le bouillon de poulet. « Chicken breast » couvre les poitrines et le poulet
// cuit, pas « 1 poulet de 2 kg ». Les règles viennent de lib/ingredientFamilies.ts.

export type IngredientRef = { name: string; unit?: string };

// ─────────────────────────────────────────────
// Termes du dictionnaire, découpés en mots une seule fois
// ─────────────────────────────────────────────
type Phrase = { words: string[]; en: boolean };
type Trigger<T> = Phrase & { target: T };
type Index<T> = Map<string, Trigger<T>[]>;
type Found<T> = { target: T; pos: number; length: number; en: boolean };

// La normalisation retire le « s » final ; restent les pluriels anglais en
// -ies, -oes et -es (« cherries », « tomatoes », « peaches »).
function englishPlural(term: string) {
  if (/[^aeiou]y$/.test(term)) return term.slice(0, -1) + "ies";
  if (/(o|ch|sh|s|x)$/.test(term)) return term + "es";
  return term + "s";
}

const phrasesOf = ({ fr, en }: Terms): Phrase[] => [
  ...fr.map((term) => ({ words: normalizeWords(term), en: false })),
  ...en
    .flatMap((term) => [term, englishPlural(term)])
    .map((term) => ({ words: normalizeWords(term), en: true })),
];

// Rangés par premier mot : on ne compare que les termes qui commencent là.
function buildIndex<T>(entries: [Terms, T][]): Index<T> {
  const index: Index<T> = new Map();
  for (const [terms, target] of entries) {
    for (const phrase of phrasesOf(terms)) {
      if (phrase.words.length === 0) continue;
      const first = phrase.words[0];
      index.set(first, [...(index.get(first) ?? []), { ...phrase, target }]);
    }
  }
  return index;
}

// Les termes présents dans `words` et qui commencent avant `end`. Les termes
// anglais ne servent qu'aux noms renvoyés par l'IA : les recettes sont en français.
function findIn<T>(index: Index<T>, words: string[], end: number, english: boolean) {
  const found: Found<T>[] = [];
  for (let pos = 0; pos < end; pos++) {
    for (const trigger of index.get(words[pos]) ?? []) {
      if ((english || !trigger.en) && trigger.words.every((w, j) => words[pos + j] === w)) {
        found.push({ target: trigger.target, pos, length: trigger.words.length, en: trigger.en });
      }
    }
  }
  return found;
}

const idsIn = <T extends { id: string }>(index: Index<T>, words: string[], english: boolean) =>
  new Set(findIn(index, words, words.length, english).map((found) => found.target.id));

type Group = {
  family: Family;
  cuts: Index<Cut>;
  kinds: Index<Kind>;
  // Pour les agrumes, « jus » et « zeste » sont des morceaux, pas des produits
  // à part : un citron donne son jus.
  cutIds: Set<string>;
};

const GROUPS: Group[] = FAMILIES.map((family) => ({
  family,
  cuts: buildIndex((family.cuts ?? []).map((cut) => [cut, cut])),
  kinds: buildIndex((family.kinds ?? []).map((kind) => [kind, kind])),
  cutIds: new Set((family.cuts ?? []).map((cut) => cut.id)),
}));

const FAMILY_INDEX = buildIndex(GROUPS.map((group) => [group.family, group]));
const DERIVED_INDEX = buildIndex(DERIVED.map((derived) => [derived, derived.id]));

// « ailes de poulet entières » : des ailes, pas un poulet entier.
function cutsIn(group: Group, words: string[], english: boolean) {
  const cuts = idsIn(group.cuts, words, english);
  if (cuts.size > 1) cuts.delete(WHOLE);
  return cuts;
}

// ─────────────────────────────────────────────
// Lecture d'un nom d'ingrédient
// ─────────────────────────────────────────────
// « bouillon de légumes ou poulet » se lit en deux parties, une par choix.
type Part = {
  group?: Group;
  derived: Set<string>;
  // Les mots avant « au », « à la », « dans »… : « chocolat au lait » est du
  // chocolat, « thon dans l'huile » du thon. Le reste ne fait que parfumer.
  words: string[];
};

type Analysis = { parts: Part[]; head: string[] };

const SEPARATORS = new Set(["ou", "et", "or", "and"]);
const FLAVOR = new Set(normalizeWords("au aux dans with"));

function flavorStart(words: string[]) {
  const index = words.findIndex(
    (word, i) => FLAVOR.has(word) || (word === "a" && (words[i + 1] === "la" || words[i + 1] === "l"))
  );
  return index === -1 ? words.length : index;
}

// Le nom le plus long d'abord (« pommes de terre » plutôt que « pomme »), un
// nom précis plutôt qu'un nom large (« fromage cheddar » est du cheddar), puis
// le mot principal : le premier en français (« tomates cerises »), le dernier
// en anglais (« cherry tomatoes »).
function pickGroup(found: Found<Group>[], end: number): Group | undefined {
  const headness = (f: Found<Group>) => (f.en ? end - f.pos - f.length : f.pos);
  const broad = (f: Found<Group>) => Number(Boolean(f.target.family.broad));
  const [best] = [...found].sort(
    (a, b) => b.length - a.length || broad(a) - broad(b) || headness(a) - headness(b)
  );
  return best?.target;
}

function analyzePart(words: string[], english: boolean, previous?: Part): Part {
  const end = flavorStart(words);
  const derived = new Set(findIn(DERIVED_INDEX, words, end, english).map((found) => found.target));
  return {
    group: pickGroup(findIn(FAMILY_INDEX, words, end, english), end),
    // « bouillon de bœuf ou poulet » : le poulet aussi est en bouillon.
    derived: derived.size === 0 && previous ? previous.derived : derived,
    words: words.slice(0, end),
  };
}

function analyze(name: string, english: boolean): Analysis {
  const words = normalizeWords(name);
  const parts: Part[] = [];
  let start = 0;
  for (let i = 0; i <= words.length; i++) {
    if (i < words.length && !SEPARATORS.has(words[i])) continue;
    if (i > start) parts.push(analyzePart(words.slice(start, i), english, parts[parts.length - 1]));
    start = i + 1;
  }
  return { parts, head: parts.flatMap((part) => part.words) };
}

// Les mêmes ingrédients reviennent dans des milliers de recettes.
const recipeAnalyses = new Map<string, Analysis>();

function analyzeRecipe(name: string) {
  let analysis = recipeAnalyses.get(name);
  if (!analysis) {
    analysis = analyze(name, false);
    recipeAnalyses.set(name, analysis);
  }
  return analysis;
}

// ─────────────────────────────────────────────
// Comparaison
// ─────────────────────────────────────────────
type Scanned = Part & { cuts: Set<string>; kinds: Set<string> };

const scannedParts = (name: string): Scanned[] =>
  analyze(name, true).parts.map((part) => ({
    ...part,
    cuts: part.group ? cutsIn(part.group, part.words, true) : new Set<string>(),
    kinds: part.group ? idsIn(part.group.kinds, part.words, true) : new Set<string>(),
  }));

const sameIds = (a: Set<string>, b: Set<string>, ignore?: Set<string>) => {
  const kept = (ids: Set<string>) => [...ids].filter((id) => !ignore?.has(id));
  const [x, y] = [kept(a), kept(b)];
  return x.length === y.length && x.every((id) => y.includes(id));
};

const FILLER = new Set(
  normalizeWords("de d du des la le l les a en un une of the frais fraîche fresh bio organic")
);
const contentWords = (words: string[]) => words.filter((w) => !FILLER.has(w) && !/^\d+$/.test(w));
const within = (a: string[], b: string[]) => a.length > 0 && a.every((w) => b.includes(w));
const sameWords = (a: string[], b: string[]) => {
  const [x, y] = [contentWords(a), contentWords(b)];
  return within(x, y) || within(y, x);
};

// Compté ou pesé en kg : l'aliment entier (« 1 poulet de 2 kg »).
const WHOLE_UNITS = new Set(["", "kg", "lb", "lbs"]);

function cutsMatch(group: Group, have: Set<string>, wanted: Set<string>, unit: string) {
  const { cuts = [], plain } = group.family;
  if (cuts.length === 0) return true;
  // L'aliment entier, ou sans précision (« chicken ») : tous ses morceaux.
  if (have.size === 0 || have.has(WHOLE)) return true;
  // « poulet cuit » : n'importe quel morceau, une fois cuit.
  if (cuts.some((cut) => cut.anyInRecipe && wanted.has(cut.id))) return true;
  if (wanted.has(WHOLE)) return false;
  if (wanted.size > 0) return [...wanted].some((id) => have.has(id));
  // La recette ne nomme aucun morceau.
  if (plain === "whole") return false;
  if (plain === "byUnit") return !WHOLE_UNITS.has(unit.trim().toLowerCase());
  return true;
}

function covers(item: Scanned, recipe: Analysis, unit: string) {
  const { group } = item;

  // Aliment absent du dictionnaire : les mêmes mots, dans un ingrédient que le
  // dictionnaire ne connaît pas non plus.
  if (!group) {
    return recipe.parts.some(
      (part) =>
        !part.group && sameIds(part.derived, item.derived) && sameWords(item.words, part.words)
    );
  }

  return (
    recipe.parts.some(
      (part) => part.group === group && sameIds(part.derived, item.derived, group.cutIds)
    ) &&
    sameIds(idsIn(group.kinds, recipe.head, false), item.kinds) &&
    cutsMatch(group, item.cuts, cutsIn(group, recipe.head, false), unit)
  );
}

// Vérifie les ingrédients de recette contre les aliments confirmés sur les
// photos (noms en français ou en anglais, tels que l'IA les renvoie).
export function makeFridgeMatcher(scanned: string[]): (ingredient: IngredientRef) => boolean {
  const items = scanned.flatMap(scannedParts);
  if (items.length === 0) return () => false;

  return ({ name, unit = "" }) => {
    const recipe = analyzeRecipe(name);
    return items.some((item) => covers(item, recipe, unit));
  };
}
