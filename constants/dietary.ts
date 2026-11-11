import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getLanguage, tr } from "@/lib/i18n";

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
  {
    key: "vegetarian",
    get label() { return tr("Végétarien", "Vegetarian"); },
    get description() { return tr("Sans viande ni poisson", "No meat or fish"); },
    icon: "leaf",
  },
  {
    key: "vegan",
    get label() { return tr("Végétalien", "Vegan"); },
    get description() { return tr("Aucun produit d'origine animale", "No animal products"); },
    icon: "sprout",
  },
  {
    key: "pescatarian",
    get label() { return tr("Pescétarien", "Pescatarian"); },
    get description() { return tr("Poisson oui, viande non", "Fish yes, meat no"); },
    icon: "fish",
  },
  {
    key: "gluten-free",
    get label() { return tr("Sans gluten", "Gluten-free"); },
    get description() { return tr("Sans blé, orge, seigle ni avoine", "No wheat, barley, rye or oats"); },
    icon: "barley-off",
  },
  {
    key: "dairy-free",
    get label() { return tr("Sans produits laitiers", "Dairy-free"); },
    get description() { return tr("Sans lait, beurre, crème ni fromage", "No milk, butter, cream or cheese"); },
    icon: "cow-off",
  },
  {
    key: "pork-free",
    get label() { return tr("Sans porc", "Pork-free"); },
    get description() { return tr("Sans porc, bacon, jambon ni gélatine", "No pork, bacon, ham or gelatin"); },
    icon: "pig-variant-outline",
  },
  {
    key: "low-carb",
    get label() { return tr("Faible en glucides", "Low-carb"); },
    get description() { return tr("Peu de farine, de sucre, de riz ou de pâtes", "Little flour, sugar, rice or pasta"); },
    icon: "bread-slice-outline",
  },
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
  { key: "peanuts", get label() { return tr("Arachides", "Peanuts"); } },
  {
    key: "tree-nuts",
    get label() { return tr("Noix", "Tree nuts"); },
    get hint() { return tr("amandes, noix, pacanes, pignons…", "almonds, walnuts, pecans, pine nuts…"); },
  },
  { key: "milk", get label() { return tr("Lait et lactose", "Milk and lactose"); } },
  { key: "eggs", get label() { return tr("Œufs", "Eggs"); } },
  { key: "fish", get label() { return tr("Poisson", "Fish"); } },
  {
    key: "shellfish",
    get label() { return tr("Fruits de mer", "Shellfish"); },
    get hint() { return tr("crustacés et mollusques", "crustaceans and molluscs"); },
  },
  { key: "soy", get label() { return tr("Soja", "Soy"); } },
  {
    key: "gluten",
    get label() { return "Gluten"; },
    get hint() { return tr("blé, orge, seigle, avoine", "wheat, barley, rye, oats"); },
  },
  { key: "sesame", get label() { return tr("Sésame", "Sesame"); } },
  { key: "mustard", get label() { return tr("Moutarde", "Mustard"); } },
  { key: "sulfites", get label() { return "Sulfites"; } },
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
  { key: "oven", get label() { return tr("Four", "Oven"); }, icon: "stove" },
  { key: "stovetop", get label() { return tr("Cuisinière", "Stovetop"); }, icon: "fire" },
  { key: "microwave", get label() { return tr("Micro-ondes", "Microwave"); }, icon: "microwave" },
  { key: "kettle", get label() { return tr("Bouilloire", "Kettle"); }, icon: "kettle-outline" },
  { key: "blender", get label() { return tr("Mélangeur", "Blender"); }, icon: "blender-outline" },
  { key: "stand-mixer", get label() { return tr("Batteur électrique", "Electric mixer"); }, icon: "bowl-mix-outline" },
  { key: "food-processor", get label() { return tr("Robot culinaire", "Food processor"); }, icon: "pot-mix-outline" },
  { key: "grill", get label() { return "Barbecue"; }, icon: "grill-outline" },
  { key: "bread-machine", get label() { return tr("Machine à pain", "Bread machine"); }, icon: "bread-slice-outline" },
  { key: "slow-cooker", get label() { return tr("Mijoteuse", "Slow cooker"); }, icon: "pot-steam-outline" },
  { key: "pressure-cooker", get label() { return tr("Autocuiseur", "Pressure cooker"); }, icon: "pot-outline" },
  { key: "air-fryer", get label() { return tr("Friteuse à air", "Air fryer"); }, icon: "fan" },
  { key: "dehydrator", get label() { return tr("Déshydrateur", "Dehydrator"); }, icon: "weather-windy" },
];

// Présents dans la plupart des cuisines : présélectionnés à la création du compte.
export const DEFAULT_APPLIANCES: ApplianceKey[] = ["oven", "stovetop", "microwave", "kettle"];

export const MAX_TIME_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, get label() { return tr("Aucune limite", "No limit"); } },
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

// Suggestions rapides pour « Aime » / « N'aime pas », dans la langue de l'app
// (les goûts tapés en anglais trouvent aussi les recettes, voir recipeFilter).
const FOOD_SUGGESTIONS_FR = [
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
const FOOD_SUGGESTIONS_EN = [
  "Onion",
  "Garlic",
  "Mushrooms",
  "Bell pepper",
  "Tomato",
  "Cilantro",
  "Celery",
  "Chili pepper",
  "Cheese",
  "Fish",
  "Beef",
  "Chicken",
  "Pork",
  "Bacon",
  "Banana",
  "Apple",
  "Chocolate",
  "Walnuts",
  "Broccoli",
  "Carrot",
  "Zucchini",
  "Rice",
  "Pasta",
  "Eggs",
  "Cream",
  "Cinnamon",
  "Honey",
];
export const foodSuggestions = () => (getLanguage() === "en" ? FOOD_SUGGESTIONS_EN : FOOD_SUGGESTIONS_FR);

// Suggestions pour les allergies / intolérances hors liste prioritaire.
const AVOID_SUGGESTIONS_FR = [
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
const AVOID_SUGGESTIONS_EN = [
  "Kiwi",
  "Strawberry",
  "Banana",
  "Celery",
  "Tomato",
  "Corn",
  "Citrus",
  "Garlic",
  "Onion",
  "Coconut",
];
export const avoidSuggestions = () => (getLanguage() === "en" ? AVOID_SUGGESTIONS_EN : AVOID_SUGGESTIONS_FR);

export const dietLabel = (key: DietKey) =>
  DIETS.find((d) => d.key === key)?.label ?? key;

export const allergenLabel = (key: AllergenKey) =>
  ALLERGENS.find((a) => a.key === key)?.label ?? key;

export const applianceLabel = (key: ApplianceKey) =>
  APPLIANCES.find((a) => a.key === key)?.label ?? key;
