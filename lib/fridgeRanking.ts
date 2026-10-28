import type { Staple } from "@/app/Food/data/staples";
import { getRecipeAvailability } from "@/app/Food/data/utils/ingredients";
import type { RecipeVerdict } from "@/lib/account/recipeFilter";

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
export function rankByFridge(visible: RecipeVerdict[], alwaysOnHand: Staple[]): RecipeVerdict[] {
  const ranked = visible
    .map((verdict, index) => {
      const missing = getRecipeAvailability(verdict.recipe, alwaysOnHand).missingIngredients.length;
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
