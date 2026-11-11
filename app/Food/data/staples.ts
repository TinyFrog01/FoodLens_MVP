import { tr } from "@/lib/i18n";

export type Staple = {
    id: string;
    // Nom français, comparé aux ingrédients des recettes (écrites en français).
    name: string;
    // Nom affiché, dans la langue de l'app.
    label: string;
    // Other names recipes use for the same staple.
    aliases?: string[];
  };
  
  // Classic staples — toggle off anything you tend to run out of.
  export const staples: Staple[] = [
    { id: "sel", name: "Sel", get label() { return tr("Sel", "Salt"); } },
    { id: "poivre", name: "Poivre", get label() { return tr("Poivre", "Pepper"); } },
    { id: "huile-olive", name: "Huile d'olive", get label() { return tr("Huile d'olive", "Olive oil"); } },
    { id: "beurre", name: "Beurre", get label() { return tr("Beurre", "Butter"); } },
    { id: "sucre", name: "Sucre", get label() { return tr("Sucre", "Sugar"); } },
    { id: "farine", name: "Farine", get label() { return tr("Farine", "Flour"); } },
    {
      id: "ail-poudre",
      name: "Ail en poudre",
      get label() { return tr("Ail en poudre", "Garlic powder"); },
      aliases: ["Poudre d'ail"],
    },
    { id: "sauce-soja", name: "Sauce soja", get label() { return tr("Sauce soja", "Soy sauce"); } },
    { id: "eau", name: "Eau", get label() { return tr("Eau", "Water"); } },
    { id: "vinaigre", name: "Vinaigre", get label() { return tr("Vinaigre", "Vinegar"); } },
    { id: "bicarbonate", name: "Bicarbonate de soude", get label() { return tr("Bicarbonate de soude", "Baking soda"); } },
    {
      id: "herbes-sechees",
      name: "Herbes séchées",
      get label() { return tr("Herbes séchées", "Dried herbs"); },
      aliases: [
        "Thym séché",
        "Romarin séché",
        "Origan séché",
        "Basilic séché",
        "Mélange d'herbes",
        "Herbes de Provence",
      ],
    },
  ];