import type { AllergenKey, ApplianceKey, DietKey } from "@/constants/dietary";

// Une personne pour qui on cuisine : le titulaire du compte (id "self") ou
// un membre de sa famille.
export type Member = {
  id: string;
  name: string;
  color: string;
  diets: DietKey[];
  allergens: AllergenKey[];
  // Allergies / intolérances hors liste prioritaire (ex. « kiwi ») : toute
  // recette dont un ingrédient correspond est masquée.
  avoid: string[];
  // Aime : recettes mises en avant. N'aime pas : recettes reléguées et signalées.
  likes: string[];
  dislikes: string[];
};

// Ajustements personnels d'une recette, propres au compte.
export type RecipeCustomization = {
  servings?: number;
  note?: string;
  removed?: string[];
  // nom d'ingrédient d'origine -> remplacement choisi
  swaps?: Record<string, string>;
};

export type Account = {
  id: string;
  email: string;
  createdAt: string;
  onboarded: boolean;
  self: Member;
  members: Member[];
  appliances: ApplianceKey[];
  // false : les recettes demandant un appareil absent sont masquées.
  showMissingAppliances: boolean;
  maxMinutes: number | null;
  // ids des personnes pour qui on cuisine en ce moment (inclut "self").
  cookingFor: string[];
  favorites: string[];
  customizations: Record<string, RecipeCustomization>;
};

export const SELF_ID = "self";

export type AuthResult = { ok: true } | { ok: false; error: string };
