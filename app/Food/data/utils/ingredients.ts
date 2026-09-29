import Fuse from "fuse.js";
import { items } from "@/app/Food/data/items";

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Same fuzzy-match approach as the item search bar, reused here so
// "Bouillon de legumes" in a recipe still matches "Bouillon de légumes"
// in your inventory.
const itemsFuse = new Fuse(items, { keys: ["name"], threshold: 0.3 });

export const isIngredientOnHand = (
  ingredientName: string,
  alwaysOnHandNames: string[]
): boolean => {
  const target = normalize(ingredientName);

  const isStaple = alwaysOnHandNames.some((name) => normalize(name) === target);
  if (isStaple) return true;

  const match = itemsFuse.search(ingredientName)[0];
  return !!match && match.item.quantity > 0;
};

export const getRecipeAvailability = (
  recipe: { ingredients: { name: string }[] },
  alwaysOnHandNames: string[]
) => {
  const missing = recipe.ingredients.filter(
    (ing) => !isIngredientOnHand(ing.name, alwaysOnHandNames)
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