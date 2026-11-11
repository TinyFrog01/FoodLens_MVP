import type { Recipe } from "@/app/Food/data/recipe/types";
import { getLanguage, type Language } from "@/lib/i18n";

// ─────────────────────────────────────────────
// Texte d'une recette dans la langue choisie
// ─────────────────────────────────────────────
// Les recettes restent en français dans recipe_r.ts : c'est sur ces noms que
// marchent le frigo, les allergènes et les régimes. La version anglaise
// (celle de Ricardo, sinon une traduction) ne sert qu'à l'affichage, et à la
// recherche et aux goûts tapés en anglais. Elle est rangée par id de recette,
// les ingrédients dans le même ordre que recipe.ingredients.
// Fichiers générés par « npm run convert:ricardo ».

type EnglishCard = { title: string; ingredients: string[] };
type EnglishSteps = { instructions: string[]; sourceUrl?: string };

// Lus à la première demande : rien à charger tant que l'app est en français.
let cards: Record<string, EnglishCard> | null = null;
let steps: Record<string, EnglishSteps> | null = null;

const englishCards = (): Record<string, EnglishCard> =>
  (cards ??= require("../app/Food/data/recipe/recipe_r_en.json"));
const englishSteps = (): Record<string, EnglishSteps> =>
  (steps ??= require("../app/Food/data/recipe/recipe_r_en_steps.json"));

export const englishTitle = (recipe: Recipe): string | undefined =>
  englishCards()[recipe.id]?.title;

// Noms anglais des ingrédients, dans l'ordre de recipe.ingredients.
export const englishIngredientNames = (recipe: Recipe): string[] | undefined =>
  englishCards()[recipe.id]?.ingredients;

export function recipeTitle(recipe: Recipe, language: Language = getLanguage()) {
  return (language === "en" && englishTitle(recipe)) || recipe.title;
}

// Le nom affiché de l'ingrédient n° `index` de la recette.
export function ingredientLabel(recipe: Recipe, index: number, language: Language = getLanguage()) {
  const french = recipe.ingredients[index]?.name ?? "";
  return (language === "en" && englishIngredientNames(recipe)?.[index]) || french;
}

export const ingredientLabels = (recipe: Recipe, language: Language = getLanguage()) =>
  recipe.ingredients.map((_, index) => ingredientLabel(recipe, index, language));

export function recipeSteps(recipe: Recipe, language: Language = getLanguage()) {
  const english = language === "en" ? englishSteps()[recipe.id]?.instructions : undefined;
  return english?.length ? english : recipe.instructions;
}

// La page de Ricardo dans la langue choisie.
export function recipeSourceUrl(recipe: Recipe, language: Language = getLanguage()) {
  return (language === "en" && englishSteps()[recipe.id]?.sourceUrl) || recipe.sourceUrl;
}

// ─────────────────────────────────────────────
// Unités
// ─────────────────────────────────────────────
// Les quantités restent celles de la recette française (métriques, comme
// Ricardo les donne en premier) : seul le mot de l'unité change.

// unité française -> [une, plusieurs]
const UNITS: Record<string, [string, string]> = {
  "c. à soupe": ["tbsp", "tbsp"],
  "c. à thé": ["tsp", "tsp"],
  tasse: ["cup", "cups"],
  pincée: ["pinch", "pinches"],
  gousse: ["clove", "cloves"],
  tranche: ["slice", "slices"],
  brin: ["sprig", "sprigs"],
  bouquet: ["bunch", "bunches"],
  botte: ["bunch", "bunches"],
  tête: ["head", "heads"],
  poignée: ["handful", "handfuls"],
  trait: ["dash", "dashes"],
  goutte: ["drop", "drops"],
  lanière: ["strip", "strips"],
  rondelle: ["slice", "slices"],
  abaisse: ["pie crust", "pie crusts"],
  boule: ["ball", "balls"],
  carré: ["square", "squares"],
  cube: ["cube", "cubes"],
  morceau: ["piece", "pieces"],
  quartier: ["wedge", "wedges"],
  boîte: ["can", "cans"],
  conserve: ["can", "cans"],
  canette: ["can", "cans"],
  cannette: ["can", "cans"],
  pot: ["jar", "jars"],
  bocal: ["jar", "jars"],
  contenant: ["container", "containers"],
  bouteille: ["bottle", "bottles"],
  sac: ["bag", "bags"],
  sachet: ["packet", "packets"],
  enveloppe: ["envelope", "envelopes"],
  paquet: ["package", "packages"],
  barquette: ["container", "containers"],
  emballage: ["package", "packages"],
  tube: ["tube", "tubes"],
  rouleau: ["roll", "rolls"],
  bloc: ["block", "blocks"],
  brique: ["carton", "cartons"],
  carton: ["carton", "cartons"],
};

// « branches de céleri » : des tiges ; « branches de thym » : des brins.
const STALKS = /c[ée]leri|rhubarbe|citronnelle|poireau|bette|cardon|fenouil/i;

const singular = (unit: string) => {
  const word = unit.toLowerCase();
  if (word === "morceaux") return "morceau";
  if (word === "rouleaux") return "rouleau";
  if (word === "bocaux") return "bocal";
  return UNITS[word] ? word : word.replace(/s$/, "");
};

// L'unité à afficher pour `quantity` (déjà ajustée aux portions).
export function unitLabel(
  unit: string,
  quantity: number,
  frenchName: string,
  language: Language = getLanguage()
) {
  if (language !== "en" || !unit) return unit;
  const word = singular(unit);
  const forms: [string, string] | undefined =
    word === "branche" || word === "tige"
      ? STALKS.test(frenchName)
        ? ["stalk", "stalks"]
        : ["sprig", "sprigs"]
      : UNITS[word];
  if (!forms) return unit; // ml, g, kg, L, lb, oz
  return quantity > 1 ? forms[1] : forms[0];
}
