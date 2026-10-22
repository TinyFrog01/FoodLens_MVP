export type Staple = {
    id: string;
    name: string;
    // Other names recipes use for the same staple.
    aliases?: string[];
  };
  
  // Classic staples — toggle off anything you tend to run out of.
  export const staples: Staple[] = [
    { id: "sel", name: "Sel" },
    { id: "poivre", name: "Poivre" },
    { id: "huile-olive", name: "Huile d'olive" },
    { id: "beurre", name: "Beurre" },
    { id: "sucre", name: "Sucre" },
    { id: "farine", name: "Farine" },
    { id: "ail-poudre", name: "Ail en poudre", aliases: ["Poudre d'ail"] },
    { id: "sauce-soja", name: "Sauce soja" },
    { id: "eau", name: "Eau" },
    { id: "vinaigre", name: "Vinaigre" },
    { id: "bicarbonate", name: "Bicarbonate de soude" },
    {
      id: "herbes-sechees",
      name: "Herbes séchées",
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