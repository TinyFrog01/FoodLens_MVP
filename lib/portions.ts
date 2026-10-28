import type { Recipe } from "@/app/Food/data/recipe/recipe";

// Portions d'origine de la recette (certaines recettes n'en indiquent pas).
export const recipeServings = (recipe: Recipe) =>
  recipe.servings && recipe.servings > 0 ? recipe.servings : 2;

// Portions par défaut selon le profil : 2 pour un étudiant, une personne
// seule ou un couple, 4 pour une famille (une par personne au-delà). La
// plupart des gens gardent le réglage par défaut : il doit convenir dès la
// première recette. Seuls les plats principaux s'ajustent, un gâteau pour 9
// deviendrait « 0,44 œuf ».
export function defaultServings(recipe: Recipe, peopleCount: number) {
  if (recipe.course !== "main") return recipeServings(recipe);
  return peopleCount >= 3 ? Math.max(4, peopleCount) : 2;
}

export const profileLabel = (peopleCount: number) =>
  peopleCount >= 3 ? "ta famille" : peopleCount === 2 ? "vous deux" : "toi";

const FRACTIONS: [number, string][] = [
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [1 / 2, "½"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
];

// Unités où une décimale n'aide personne : « 333 g » plutôt que « 333,33 g ».
const ROUNDED_UNITS = new Set(["g", "ml", "mL"]);

// 1.5 -> « 1 ½ », 0.333 -> « ⅓ », 2.4 -> « 2,4 » : plus facile à lire en cuisine.
export function formatQuantity(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const whole = Math.floor(rounded);
  const rest = rounded - whole;
  if (rest === 0) return `${whole}`;

  const fraction = FRACTIONS.find(([f]) => Math.abs(rest - f) < 0.04);
  if (fraction) return whole > 0 ? `${whole} ${fraction[1]}` : fraction[1];
  return `${rounded}`.replace(".", ",");
}

// « 250 g farine », « ½ poulet entier » ; une quantité nulle (« au goût ») n'est pas affichée.
export function formatIngredient(
  ingredient: { name: string; quantity: number; unit: string },
  factor = 1
) {
  let quantity = ingredient.quantity * factor;
  if (ROUNDED_UNITS.has(ingredient.unit) && quantity >= 10) quantity = Math.round(quantity);
  const amount = quantity > 0 ? formatQuantity(quantity) : "";
  return [amount, ingredient.unit, ingredient.name].filter(Boolean).join(" ");
}
