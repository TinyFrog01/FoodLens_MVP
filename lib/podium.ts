import type { Recipe } from "@/app/Food/data/recipe/recipe";
import type { Staple } from "@/app/Food/data/staples";
import { isIngredientOnHand } from "@/app/Food/data/utils/ingredients";
import { parseMinutes, RecipeVerdict } from "@/lib/account/recipeFilter";

// Ce que tu as pour une recette : nombre d'ingrédients déjà là et ceux qui manquent.
export type FridgeMatch = {
  verdict: RecipeVerdict;
  have: number;
  missing: string[];
};

export type Podium = {
  gold?: FridgeMatch;
  silver?: FridgeMatch;
  bronze?: FridgeMatch;
  // Le reste du fil, dans son ordre habituel, sans les recettes du podium.
  rest: RecipeVerdict[];
};

// Un soir de semaine, une recette de plus d'une heure passe après les autres.
const WEEKNIGHT_MINUTES = 60;

export function matchFridge(verdict: RecipeVerdict, alwaysOnHand: Staple[]): FridgeMatch {
  const missing = verdict.recipe.ingredients
    .filter((ingredient) => !isIngredientOnHand(ingredient.name, alwaysOnHand))
    .map((ingredient) => ingredient.name);
  return { verdict, have: verdict.recipe.ingredients.length - missing.length, missing };
}

// « Tu as 3 ingrédients sur 5 » : parler de ce que la personne possède rend
// ses aliments plus précieux, et leur gaspillage plus pénible.
export function haveLabel(match: FridgeMatch) {
  const total = match.verdict.recipe.ingredients.length;
  return `Tu as ${match.have} ingrédient${match.have > 1 ? "s" : ""} sur ${total}`;
}

// « Il te manque : bacon, zeste de citron »
export function missingLabel(match: FridgeMatch) {
  if (match.missing.length === 0) return "Tout est déjà dans ton frigo.";
  const names = match.missing.map((name) => name.charAt(0).toLowerCase() + name.slice(1));
  return `Il te manque : ${names.join(", ")}`;
}

const isWeeknight = (recipe: Recipe) => {
  const minutes = parseMinutes(recipe.time);
  return minutes !== null && minutes <= WEEKNIGHT_MINUTES;
};

const share = (match: FridgeMatch) => match.have / (match.verdict.recipe.ingredients.length || 1);

const taste = (verdict: RecipeVerdict) => verdict.likes.length - 2 * verdict.dislikes.length;

// Les recettes qui collent le mieux à ce que tu as : d'abord celles qui se
// font en une heure, puis le moins d'ingrédients manquants, la plus grande
// part déjà là, et enfin les goûts des personnes choisies.
function rank(verdicts: RecipeVerdict[], alwaysOnHand: Staple[]) {
  return verdicts
    .map((verdict, index) => ({
      match: matchFridge(verdict, alwaysOnHand),
      weeknight: isWeeknight(verdict.recipe),
      index,
    }))
    .sort(
      (a, b) =>
        Number(b.weeknight) - Number(a.weeknight) ||
        a.match.missing.length - b.match.missing.length ||
        share(b.match) - share(a.match) ||
        taste(b.match.verdict) - taste(a.match.verdict) ||
        a.index - b.index
    )
    .map(({ match }) => match);
}

// Or, argent, bronze : trois soupers parmi les plats principaux. Si les
// filtres en laissent moins de trois, on complète avec le reste.
export function buildPodium(visible: RecipeVerdict[], alwaysOnHand: Staple[]): Podium {
  const isMain = (verdict: RecipeVerdict) => verdict.recipe.course === "main";
  let top = rank(visible.filter(isMain), alwaysOnHand).slice(0, 3);
  if (top.length < 3) {
    top = [...top, ...rank(visible.filter((v) => !isMain(v)), alwaysOnHand)].slice(0, 3);
  }

  const onPodium = new Set(top.map((match) => match.verdict.recipe.id));
  const [gold, silver, bronze] = top;
  return { gold, silver, bronze, rest: visible.filter((v) => !onPodium.has(v.recipe.id)) };
}
