import { items } from "@/app/Food/data/items";
import type { Staple } from "@/app/Food/data/staples";
import { ingredientMatches } from "@/lib/account/recipeFilter";

// A staple that's switched on covers every ingredient naming it, so "Poivre"
// also covers "Poivre noir" and "Beurre" covers "beurre non salé".
const isCoveredByStaple = (ingredientName: string, alwaysOnHand: Staple[]) =>
  alwaysOnHand.some((staple) =>
    [staple.name, ...(staple.aliases ?? [])].some((term) =>
      ingredientMatches(ingredientName, term)
    )
  );

// Inventory items keep an exact name match: fuzzy search confuses "poivre"
// with "Poire" and "Brie" with "Abricot".
const isInInventory = (ingredientName: string) => {
  const name = ingredientName.toLowerCase().trim();
  return items.some(
    (item) => item.quantity > 0 && item.name.toLowerCase().trim() === name
  );
};

export const isIngredientOnHand = (
  ingredientName: string,
  alwaysOnHand: Staple[]
): boolean =>
  isCoveredByStaple(ingredientName, alwaysOnHand) ||
  isInInventory(ingredientName);

export const getRecipeAvailability = (
  recipe: { ingredients: { name: string }[] },
  alwaysOnHand: Staple[]
) => {
  const missing = recipe.ingredients.filter(
    (ing) => !isIngredientOnHand(ing.name, alwaysOnHand)
  );

  return {
    missingIngredients: missing.map((ing) => ing.name),
    isFullyAvailable: missing.length === 0,
    label:
      missing.length === 0
        ? "Tous"
        : `${recipe.ingredients.length - missing.length}/${recipe.ingredients.length}`,
  };
};
