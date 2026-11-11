import type { Staple } from "@/app/Food/data/staples";
import { ingredientMatches } from "@/lib/account/recipeFilter";
import { IngredientRef, makeFridgeMatcher } from "@/lib/fridgeMatch";

export type { IngredientRef };

// Vrai si tu as l'ingrédient : un essentiel « toujours là » activé, ou un
// aliment confirmé sur tes photos.
export type OnHandCheck = (ingredient: IngredientRef) => boolean;

// A staple that's switched on covers every ingredient naming it, so "Poivre"
// also covers "Poivre noir" and "Beurre" covers "beurre non salé".
const isCoveredByStaple = (ingredientName: string, alwaysOnHand: Staple[]) =>
  alwaysOnHand.some((staple) =>
    [staple.name, ...(staple.aliases ?? [])].some((term) =>
      ingredientMatches(ingredientName, term)
    )
  );

// `scanned` : les noms des aliments confirmés sur les photos, tels que l'IA
// les a renvoyés. Les recettes répètent les mêmes ingrédients des milliers de
// fois : chacun n'est vérifié qu'une fois par état du frigo.
export function makeOnHandCheck(alwaysOnHand: Staple[], scanned: string[]): OnHandCheck {
  const inFridge = makeFridgeMatcher(scanned);
  const known = new Map<string, boolean>();

  return (ingredient) => {
    // L'unité compte : « 2 kg de poulet » est un poulet entier, « 250 ml de
    // poulet » de la chair.
    const key = `${ingredient.unit ?? ""}\n${ingredient.name}`;
    let have = known.get(key);
    if (have === undefined) {
      have = isCoveredByStaple(ingredient.name, alwaysOnHand) || inFridge(ingredient);
      known.set(key, have);
    }
    return have;
  };
}

export const getRecipeAvailability = (
  recipe: { ingredients: IngredientRef[] },
  isOnHand: OnHandCheck
) => {
  const missing = recipe.ingredients.filter((ing) => !isOnHand(ing));

  return {
    missingIngredients: missing.map((ing) => ing.name),
    isFullyAvailable: missing.length === 0,
    label:
      missing.length === 0
        ? "Tous"
        : `${recipe.ingredients.length - missing.length}/${recipe.ingredients.length}`,
  };
};
