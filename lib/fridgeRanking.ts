import type { Recipe } from "@/app/Food/data/recipe/types";
import type { OnHandCheck } from "@/app/Food/data/utils/ingredients";
import type { RecipeVerdict } from "@/lib/account/recipeFilter";

// Ce qui manque à une recette ne dépend que du frigo : compté une fois par
// état du frigo, changer les personnes choisies ne refait que le tri.
const missingByFridge = new WeakMap<OnHandCheck, WeakMap<Recipe, number>>();

function missingCount(recipe: Recipe, isOnHand: OnHandCheck) {
  let counts = missingByFridge.get(isOnHand);
  if (!counts) {
    counts = new WeakMap();
    missingByFridge.set(isOnHand, counts);
  }
  let missing = counts.get(recipe);
  if (missing === undefined) {
    missing = 0;
    for (const ingredient of recipe.ingredients) {
      if (!isOnHand(ingredient)) missing++;
    }
    counts.set(recipe, missing);
  }
  return missing;
}

// Toutes les 4 cartes, une recette où il te manque des ingrédients : tu en
// découvres d'autres même quand ton frigo permet déjà d'en faire plusieurs.
const MIX_EVERY = 4;

type Ranked = { verdict: RecipeVerdict; have: number; missing: number; index: number };

// D'abord le moins d'ingrédients manquants, puis le plus d'ingrédients que
// tu as déjà, et enfin l'ordre habituel du fil.
const byFridge = (a: Ranked, b: Ranked) =>
  a.missing - b.missing || b.have - a.have || a.index - b.index;

// Classe les recettes selon ce que tu as : celles que tu peux faire tout de
// suite en premier, avec une recette à compléter glissée de temps en temps,
// puis toutes les autres, de la plus complète à la moins complète.
export function rankByFridge(visible: RecipeVerdict[], isOnHand: OnHandCheck): RecipeVerdict[] {
  const ranked = visible
    .map((verdict, index) => {
      const missing = missingCount(verdict.recipe, isOnHand);
      return { verdict, have: verdict.recipe.ingredients.length - missing, missing, index };
    })
    .sort(byFridge);

  const ready = ranked.filter((r) => r.missing === 0);
  const toComplete = ranked.filter((r) => r.missing > 0);

  const feed: Ranked[] = [];
  while (ready.length > 0) {
    const mixIn = (feed.length + 1) % MIX_EVERY === 0 && toComplete.length > 0;
    feed.push((mixIn ? toComplete : ready).shift()!);
  }

  return [...feed, ...toComplete].map((r) => r.verdict);
}
