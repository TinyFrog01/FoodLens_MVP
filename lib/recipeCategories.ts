import type { MaterialCommunityIcons } from "@expo/vector-icons";

import type { Recipe, RecipeCategory } from "@/app/Food/data/recipe/types";
import { tr } from "@/lib/i18n";

export type CategoryFilter = RecipeCategory | "all";

type Icon = keyof typeof MaterialCommunityIcons.glyphMap;

// Puces du fil et de la recherche, dans cet ordre : les soupers d'abord,
// c'est ce que l'accueil propose ce soir.
export const CATEGORIES: { key: CategoryFilter; label: string; one: string; icon: Icon }[] = [
  {
    key: "all",
    get label() { return tr("Tout", "All"); },
    get one() { return tr("Recette", "Recipe"); },
    icon: "silverware-variant",
  },
  {
    key: "souper",
    get label() { return tr("Soupers", "Dinners"); },
    get one() { return tr("Souper", "Dinner"); },
    icon: "silverware-fork-knife",
  },
  { key: "dessert", label: "Desserts", one: "Dessert", icon: "cupcake" },
  { key: "sauce", label: "Sauces", one: "Sauce", icon: "soy-sauce" },
  {
    key: "soupe",
    get label() { return tr("Soupes", "Soups"); },
    get one() { return tr("Soupe", "Soup"); },
    icon: "pot-steam-outline",
  },
  {
    key: "salade",
    get label() { return tr("Salades", "Salads"); },
    get one() { return tr("Salade", "Salad"); },
    icon: "leaf",
  },
  {
    key: "dejeuner",
    get label() { return tr("Déjeuners", "Breakfasts"); },
    get one() { return tr("Déjeuner", "Breakfast"); },
    icon: "egg-fried",
  },
  {
    key: "accompagnement",
    get label() { return tr("Accompagnements", "Sides"); },
    get one() { return tr("Accompagnement", "Side"); },
    icon: "carrot",
  },
  {
    key: "bouchee",
    get label() { return tr("Bouchées", "Appetizers"); },
    get one() { return tr("Bouchée", "Appetizer"); },
    icon: "cheese",
  },
  {
    key: "boisson",
    get label() { return tr("Boissons", "Drinks"); },
    get one() { return tr("Boisson", "Drink"); },
    icon: "glass-cocktail",
  },
];

// Recettes écrites à la main (sans `categories`) : d'après le moment du repas.
const FROM_COURSE: Partial<Record<Recipe["course"], RecipeCategory>> = {
  main: "souper",
  dessert: "dessert",
  breakfast: "dejeuner",
};

export function categoriesOf(recipe: Recipe): RecipeCategory[] {
  if (recipe.categories) return recipe.categories;
  const category = FROM_COURSE[recipe.course];
  return category ? [category] : [];
}

export const inCategory = (recipe: Recipe, filter: CategoryFilter) =>
  filter === "all" || categoriesOf(recipe).includes(filter);

// Le rayon affiché sur une carte : le premier dans l'ordre des puces.
export function mainCategory(recipe: Recipe) {
  const own = categoriesOf(recipe);
  return CATEGORIES.find((category) => category.key !== "all" && own.includes(category.key));
}
