import type { AllergenKey, ApplianceKey, DietKey } from "@/constants/dietary";

// Moment du repas : seuls les plats principaux sont proposés pour le souper
// (podium de l'accueil, portions par défaut selon le profil).
export type Course = "main" | "side" | "breakfast" | "dessert" | "basic";

export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  course: Course;
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
