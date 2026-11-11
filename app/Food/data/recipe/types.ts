import type { AllergenKey, ApplianceKey, DietKey } from "@/constants/dietary";

// Moment du repas : seuls les plats principaux sont proposés pour le souper
// (podium de l'accueil, portions par défaut selon le profil).
export type Course = "main" | "side" | "breakfast" | "dessert" | "basic";

// Rayons où chercher une recette (puces du fil et de la recherche). Une
// recette peut être dans plusieurs : une soupe-repas est un souper et une soupe.
export type RecipeCategory =
  | "souper"
  | "dessert"
  | "sauce"
  | "soupe"
  | "salade"
  | "dejeuner"
  | "accompagnement"
  | "bouchee"
  | "boisson";

export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  course: Course;
  // Absent des recettes écrites à la main : déduit de `course` (lib/recipeCategories.ts).
  categories?: RecipeCategory[];
  vegan: boolean;
  // Régimes compatibles, allergènes présents et appareils nécessaires :
  // servent à filtrer les recettes selon le compte (voir lib/account).
  diets: DietKey[];
  allergens: AllergenKey[];
  appliances: ApplianceKey[];
  servings?: number;
  ingredientsAvailable?: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];

  instructions: string[];
  // Page d'origine de la recette (ricardocuisine.com pour recipe_r.ts).
  sourceUrl?: string;
}
