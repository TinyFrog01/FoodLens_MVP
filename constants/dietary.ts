import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// ─────────────────────────────────────────────
// Régimes : une recette porte la liste des régimes auxquels elle convient.
// ─────────────────────────────────────────────
export type DietKey =
  | "vegan"
  | "vegetarian"
  | "pescatarian"
  | "gluten-free"
  | "dairy-free"
  | "pork-free"
  | "low-carb";

export const DIETS: {
  key: DietKey;
  label: string;
  description: string;
  icon: IconName;
}[] = [
  { key: "vegetarian", label: "Végétarien", description: "Sans viande ni poisson", icon: "leaf" },
  { key: "vegan", label: "Végétalien", description: "Aucun produit d'origine animale", icon: "sprout" },
  { key: "pescatarian", label: "Pescétarien", description: "Poisson oui, viande non", icon: "fish" },
  { key: "gluten-free", label: "Sans gluten", description: "Sans blé, orge, seigle ni avoine", icon: "barley-off" },
  { key: "dairy-free", label: "Sans produits laitiers", description: "Sans lait, beurre, crème ni fromage", icon: "cow-off" },
  { key: "pork-free", label: "Sans porc", description: "Sans porc, bacon, jambon ni gélatine", icon: "pig-variant-outline" },
  { key: "low-carb", label: "Faible en glucides", description: "Peu de farine, de sucre, de riz ou de pâtes", icon: "bread-slice-outline" },
];

// ─────────────────────────────────────────────
// Allergènes prioritaires (Santé Canada). Une recette porte ceux qu'elle
// contient ; elle est masquée pour toute personne qui y est allergique.
// ─────────────────────────────────────────────
export type AllergenKey =
  | "peanuts"
  | "tree-nuts"
  | "milk"
  | "eggs"
  | "fish"
  | "shellfish"
  | "soy"
  | "gluten"
  | "sesame"
  | "mustard"
  | "sulfites";

export const ALLERGENS: { key: AllergenKey; label: string; hint?: string }[] = [
  { key: "peanuts", label: "Arachides" },
  { key: "tree-nuts", label: "Noix", hint: "amandes, noix, pacanes, pignons…" },
  { key: "milk", label: "Lait et lactose" },
  { key: "eggs", label: "Œufs" },
  { key: "fish", label: "Poisson" },
  { key: "shellfish", label: "Fruits de mer", hint: "crustacés et mollusques" },
  { key: "soy", label: "Soja" },
  { key: "gluten", label: "Gluten", hint: "blé, orge, seigle, avoine" },
  { key: "sesame", label: "Sésame" },
  { key: "mustard", label: "Moutarde" },
  { key: "sulfites", label: "Sulfites" },
];

// ─────────────────────────────────────────────
// Appareils : une recette porte ceux dont elle a besoin.
// ─────────────────────────────────────────────
export type ApplianceKey =
  | "oven"
  | "stovetop"
  | "microwave"
  | "kettle"
  | "blender"
  | "stand-mixer"
  | "food-processor"
  | "grill"
  | "bread-machine"
  | "slow-cooker"
  | "pressure-cooker"
  | "air-fryer"
  | "dehydrator";

export const APPLIANCES: { key: ApplianceKey; label: string; icon: IconName }[] = [
  { key: "oven", label: "Four", icon: "stove" },
  { key: "stovetop", label: "Cuisinière", icon: "fire" },
  { key: "microwave", label: "Micro-ondes", icon: "microwave" },
  { key: "kettle", label: "Bouilloire", icon: "kettle-outline" },
  { key: "blender", label: "Mélangeur", icon: "blender-outline" },
  { key: "stand-mixer", label: "Batteur électrique", icon: "bowl-mix-outline" },
  { key: "food-processor", label: "Robot culinaire", icon: "pot-mix-outline" },
  { key: "grill", label: "Barbecue", icon: "grill-outline" },
  { key: "bread-machine", label: "Machine à pain", icon: "bread-slice-outline" },
  { key: "slow-cooker", label: "Mijoteuse", icon: "pot-steam-outline" },
  { key: "pressure-cooker", label: "Autocuiseur", icon: "pot-outline" },
  { key: "air-fryer", label: "Friteuse à air", icon: "fan" },
  { key: "dehydrator", label: "Déshydrateur", icon: "weather-windy" },
];

// Présents dans la plupart des cuisines : présélectionnés à la création du compte.
export const DEFAULT_APPLIANCES: ApplianceKey[] = ["oven", "stovetop", "microwave", "kettle"];

export const MAX_TIME_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Aucune limite" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 h" },
  { value: 120, label: "2 h" },
];

// Couleurs d'avatar proposées pour chaque membre de la famille.
export const MEMBER_COLORS = [
  "#3E9C5C",
  "#E0A458",
  "#5B8DEF",
  "#E85C41",
  "#9B6BD6",
  "#2BA3A3",
  "#D9669A",
  "#7A8B3C",
];

// Suggestions rapides pour « Aime » / « N'aime pas ».
export const FOOD_SUGGESTIONS = [
  "Oignon",
  "Ail",
  "Champignons",
  "Poivron",
  "Tomate",
  "Coriandre",
  "Céleri",
  "Piment",
  "Fromage",
  "Poisson",
  "Bœuf",
  "Poulet",
  "Porc",
  "Bacon",
  "Banane",
  "Pomme",
  "Chocolat",
  "Noix",
  "Brocoli",
  "Carotte",
  "Courgette",
  "Riz",
  "Pâtes",
  "Œufs",
  "Crème",
  "Cannelle",
  "Miel",
];

// Suggestions pour les allergies / intolérances hors liste prioritaire.
export const AVOID_SUGGESTIONS = [
  "Kiwi",
  "Fraise",
  "Banane",
  "Céleri",
  "Tomate",
  "Maïs",
  "Agrumes",
  "Ail",
  "Oignon",
  "Noix de coco",
];

export const dietLabel = (key: DietKey) =>
  DIETS.find((d) => d.key === key)?.label ?? key;

export const allergenLabel = (key: AllergenKey) =>
  ALLERGENS.find((a) => a.key === key)?.label ?? key;

export const applianceLabel = (key: ApplianceKey) =>
  APPLIANCES.find((a) => a.key === key)?.label ?? key;
