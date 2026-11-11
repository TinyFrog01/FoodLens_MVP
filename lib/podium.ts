import type { Recipe } from "@/app/Food/data/recipe/types";
import type { OnHandCheck } from "@/app/Food/data/utils/ingredients";
import { parseMinutes, RecipeVerdict } from "@/lib/account/recipeFilter";
import { tr } from "@/lib/i18n";
import { ingredientLabel } from "@/lib/recipeText";

// Ce que tu as pour une recette : nombre d'ingrédients déjà là et ceux qui
// manquent (leur place dans recipe.ingredients, pour les nommer dans la langue choisie).
export type FridgeMatch = {
  verdict: RecipeVerdict;
  have: number;
  missing: number[];
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

export function matchFridge(verdict: RecipeVerdict, isOnHand: OnHandCheck): FridgeMatch {
  const missing = verdict.recipe.ingredients.flatMap((ingredient, index) =>
    isOnHand(ingredient) ? [] : [index]
  );
  return { verdict, have: verdict.recipe.ingredients.length - missing.length, missing };
}

// « Tu as 3 ingrédients sur 5 » : parler de ce que la personne possède rend
// ses aliments plus précieux, et leur gaspillage plus pénible.
export function haveLabel(match: FridgeMatch) {
  const total = match.verdict.recipe.ingredients.length;
  return tr(
    `Tu as ${match.have} ingrédient${match.have > 1 ? "s" : ""} sur ${total}`,
    `You have ${match.have} of ${total} ingredient${total === 1 ? "" : "s"}`
  );
}

// « Il te manque : bacon, zeste de citron »
export function missingLabel(match: FridgeMatch) {
  if (match.missing.length === 0) return tr("Tout est déjà dans ton frigo.", "Everything is already in your fridge.");
  const names = match.missing
    .map((index) => ingredientLabel(match.verdict.recipe, index))
    .map((name) => name.charAt(0).toLowerCase() + name.slice(1))
    .join(", ");
  return tr(`Il te manque : ${names}`, `You're missing: ${names}`);
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
function rank(verdicts: RecipeVerdict[], isOnHand: OnHandCheck) {
  return verdicts
    .map((verdict, index) => ({
      match: matchFridge(verdict, isOnHand),
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
export function buildPodium(visible: RecipeVerdict[], isOnHand: OnHandCheck): Podium {
  const isMain = (verdict: RecipeVerdict) => verdict.recipe.course === "main";
  let top = rank(visible.filter(isMain), isOnHand).slice(0, 3);
  if (top.length < 3) {
    top = [...top, ...rank(visible.filter((v) => !isMain(v)), isOnHand)].slice(0, 3);
  }

  const onPodium = new Set(top.map((match) => match.verdict.recipe.id));
  const [gold, silver, bronze] = top;
  return { gold, silver, bronze, rest: visible.filter((v) => !onPodium.has(v.recipe.id)) };
}
