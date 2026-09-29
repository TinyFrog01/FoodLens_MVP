export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  ingredientsAvailable: string;
  vegan: boolean;

  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];

  instructions: string[];
}

export const recipes: Recipe[] = [
  {
    id: "soupe-asiatique",
    title: "Biscuit au miel",
    image:
      "https://www.themealdb.com/images/media/meals/yleo1y1784839077.jpg",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Miel",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Nouilles de riz",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Coriandre fraiche",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Sauce soja",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire chauffer le bouillon de legumes.",
      "Ajouter les nouilles de riz et laisser cuire 5 minutes.",
      "Assaisonner avec la sauce soja.",
      "Parsemer de coriandre fraiche avant de servir.",
    ],
  },
  {
    id: "salade-caesar-au-poulet",
    title: "Salade caesar au poulet",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Poitrine de poulet",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Laitue romaine",
        quantity: 1,
        unit: "",
      },
      {
        name: "Parmesan",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Croutons",
        quantity: 80,
        unit: "g",
      },
      {
        name: "Sauce caesar",
        quantity: 4,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Griller la poitrine de poulet puis la trancher.",
      "Laver et couper la laitue romaine.",
      "Melanger la laitue, les croutons et le parmesan.",
      "Ajouter le poulet et napper de sauce caesar.",
    ],
  },
  {
    id: "curry-de-pois-chiches",
    title: "Curry de pois chiches",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pois chiches cuits",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Lait de coco",
        quantity: 200,
        unit: "ml",
      },
      {
        name: "Tomates concassees",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Curry en poudre",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire revenir l'oignon emince.",
      "Ajouter le curry en poudre et melanger.",
      "Incorporer les tomates, le lait de coco et les pois chiches.",
      "Laisser mijoter 15 minutes et servir avec du riz.",
    ],
  },
  {
    id: "pates-a-la-carbonara",
    title: "Pates a la carbonara",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Spaghetti",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Lardons",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Parmesan",
        quantity: 60,
        unit: "g",
      },
      {
        name: "Poivre noir",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Cuire les spaghetti dans l'eau bouillante salee.",
      "Faire revenir les lardons a la poele.",
      "Melanger les oeufs et le parmesan.",
      "Egoutter les pates, ajouter les lardons puis le melange oeufs-parmesan hors du feu.",
    ],
  },
  {
    id: "buddha-bowl-quinoa",
    title: "Buddha bowl quinoa",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Quinoa",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Avocat",
        quantity: 1,
        unit: "",
      },
      {
        name: "Pois chiches cuits",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 1,
        unit: "",
      },
      {
        name: "Epinards",
        quantity: 50,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire le quinoa selon les instructions.",
      "Couper l'avocat et rapper la carotte.",
      "Disposer le quinoa, les epinards, les pois chiches, la carotte et l'avocat dans un bol.",
      "Assaisonner avec de l'huile d'olive et du citron.",
    ],
  },
  {
    id: "tacos-au-boeuf",
    title: "Tacos au boeuf",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Boeuf hache",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Tortillas",
        quantity: 6,
        unit: "",
      },
      {
        name: "Tomate",
        quantity: 2,
        unit: "",
      },
      {
        name: "Oignon rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Fromage rape",
        quantity: 100,
        unit: "g",
      },
    ],
    instructions: [
      "Faire revenir le boeuf hache avec des epices a taco.",
      "Couper la tomate et l'oignon rouge en des.",
      "Rechauffer les tortillas.",
      "Garnir les tortillas de viande, tomate, oignon et fromage.",
    ],
  },
  {
    id: "risotto-aux-champignons",
    title: "Risotto aux champignons",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Riz arborio",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Champignons de Paris",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Bouillon de legumes",
        quantity: 800,
        unit: "ml",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Parmesan",
        quantity: 50,
        unit: "g",
      },
    ],
    instructions: [
      "Faire revenir l'oignon puis les champignons.",
      "Ajouter le riz et nacrer 2 minutes.",
      "Verser le bouillon louche par louche en remuant.",
      "Incorporer le parmesan hors du feu et servir.",
    ],
  },
  {
    id: "pizza-margherita",
    title: "Pizza margherita",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Pate a pizza",
        quantity: 1,
        unit: "",
      },
      {
        name: "Sauce tomate",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Mozzarella",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Basilic frais",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Huile d'olive",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Etaler la pate a pizza sur une plaque.",
      "Napper de sauce tomate.",
      "Repartir la mozzarella en morceaux.",
      "Cuire 12 minutes puis ajouter le basilic et l'huile d'olive.",
    ],
  },
  {
    id: "ratatouille",
    title: "Ratatouille",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200",
    time: "45 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Aubergine",
        quantity: 1,
        unit: "",
      },
      {
        name: "Courgette",
        quantity: 2,
        unit: "",
      },
      {
        name: "Poivron rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Tomate",
        quantity: 3,
        unit: "",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Couper tous les legumes en des.",
      "Faire revenir l'oignon dans l'huile d'olive.",
      "Ajouter les autres legumes et laisser mijoter 30 minutes.",
      "Assaisonner avec herbes de Provence et servir.",
    ],
  },
  {
    id: "poke-bowl-saumon",
    title: "Poke bowl saumon",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Saumon frais",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Riz a sushi",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Concombre",
        quantity: 1,
        unit: "",
      },
      {
        name: "Edamame",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Cuire le riz a sushi et laisser refroidir.",
      "Couper le saumon en des.",
      "Trancher le concombre finement.",
      "Assembler le riz, le saumon, le concombre et l'edamame, puis napper de sauce soja.",
    ],
  },
  {
    id: "quiche-lorraine",
    title: "Quiche lorraine",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200",
    time: "50 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Pate brisee",
        quantity: 1,
        unit: "",
      },
      {
        name: "Lardons",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 3,
        unit: "",
      },
      {
        name: "Creme fraiche",
        quantity: 200,
        unit: "ml",
      },
      {
        name: "Gruyere rape",
        quantity: 100,
        unit: "g",
      },
    ],
    instructions: [
      "Foncer un moule avec la pate brisee.",
      "Faire revenir les lardons.",
      "Battre les oeufs avec la creme fraiche et le gruyere.",
      "Repartir les lardons sur la pate, verser l'appareil et cuire 35 minutes a 180C.",
    ],
  },
  {
    id: "chili-sin-carne",
    title: "Chili sin carne",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Haricots rouges",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Mais",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Tomates concassees",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Poivron rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire revenir l'oignon et le poivron.",
      "Ajouter les tomates concassees et laisser mijoter.",
      "Incorporer les haricots rouges et le mais.",
      "Assaisonner avec du cumin et du piment, laisser mijoter 15 minutes.",
    ],
  },
  {
    id: "wok-de-legumes-au-tofu",
    title: "Wok de legumes au tofu",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Tofu ferme",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Brocoli",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 1,
        unit: "",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Gingembre",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper le tofu en des et le faire dorer a la poele.",
      "Ajouter le brocoli et la carotte emincee.",
      "Incorporer le gingembre et la sauce soja.",
      "Faire sauter 5 minutes a feu vif et servir.",
    ],
  },
  {
    id: "burger-maison",
    title: "Burger maison",
    image:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Boeuf hache",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Pain a burger",
        quantity: 4,
        unit: "",
      },
      {
        name: "Cheddar",
        quantity: 4,
        unit: "",
      },
      {
        name: "Salade",
        quantity: 4,
        unit: "",
      },
      {
        name: "Tomate",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Former des steaks avec le boeuf hache.",
      "Cuire les steaks a la poele 4 minutes de chaque cote.",
      "Griller legerement les pains a burger.",
      "Assembler avec salade, tomate, cheddar et le steak.",
    ],
  },
  {
    id: "gaspacho",
    title: "Gaspacho",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Tomate",
        quantity: 6,
        unit: "",
      },
      {
        name: "Concombre",
        quantity: 1,
        unit: "",
      },
      {
        name: "Poivron rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Ail",
        quantity: 1,
        unit: "",
      },
      {
        name: "Huile d'olive",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper grossierement tous les legumes.",
      "Mixer avec l'ail et l'huile d'olive jusqu'a obtenir une texture lisse.",
      "Assaisonner de sel et de poivre.",
      "Refrigerer au moins 1 heure avant de servir.",
    ],
  },
  {
    id: "pad-thai",
    title: "Pad thai",
    image:
      "https://images.unsplash.com/photo-1467333849985-e9df7fe37e8f?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Nouilles de riz",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Crevettes",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Cacahuetes",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Sauce nuoc mam",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire tremper les nouilles de riz dans l'eau chaude.",
      "Faire sauter les crevettes puis pousser sur le cote et cuire les oeufs brouilles.",
      "Ajouter les nouilles egouttees et la sauce nuoc mam.",
      "Parsemer de cacahuetes concassees avant de servir.",
    ],
  },
  {
    id: "tarte-aux-legumes",
    title: "Tarte aux legumes",
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pate feuilletee",
        quantity: 1,
        unit: "",
      },
      {
        name: "Courgette",
        quantity: 1,
        unit: "",
      },
      {
        name: "Poivron",
        quantity: 1,
        unit: "",
      },
      {
        name: "Tomate",
        quantity: 2,
        unit: "",
      },
      {
        name: "Fromage de chevre",
        quantity: 100,
        unit: "g",
      },
    ],
    instructions: [
      "Etaler la pate feuilletee dans un moule.",
      "Couper les legumes en fines rondelles.",
      "Disposer les legumes sur la pate et parsemer de fromage de chevre.",
      "Cuire 30 minutes a 190C.",
    ],
  },
  {
    id: "boeuf-bourguignon",
    title: "Boeuf bourguignon",
    image:
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1200",
    time: "150 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Boeuf a braiser",
        quantity: 800,
        unit: "g",
      },
      {
        name: "Vin rouge",
        quantity: 500,
        unit: "ml",
      },
      {
        name: "Carotte",
        quantity: 3,
        unit: "",
      },
      {
        name: "Oignon",
        quantity: 2,
        unit: "",
      },
      {
        name: "Champignons de Paris",
        quantity: 200,
        unit: "g",
      },
    ],
    instructions: [
      "Faire dorer le boeuf en morceaux dans une cocotte.",
      "Ajouter les oignons et les carottes emincees.",
      "Verser le vin rouge et laisser mijoter 2 heures a feu doux.",
      "Ajouter les champignons 20 minutes avant la fin de cuisson.",
    ],
  },
  {
    id: "falafels",
    title: "Falafels",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pois chiches secs",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Persil frais",
        quantity: 20,
        unit: "g",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
      {
        name: "Cumin",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Farine de pois chiche",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Mixer les pois chiches trempes avec l'ail, le persil et le cumin.",
      "Ajouter la farine pour lier la preparation.",
      "Former des boulettes.",
      "Frire les falafels jusqu'a coloration doree.",
    ],
  },
  {
    id: "saumon-grille-et-legumes",
    title: "Saumon grille et legumes",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Filet de saumon",
        quantity: 4,
        unit: "",
      },
      {
        name: "Asperges",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
      {
        name: "Huile d'olive",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Aneth",
        quantity: 5,
        unit: "g",
      },
    ],
    instructions: [
      "Assaisonner les filets de saumon avec citron et aneth.",
      "Griller le saumon 5 minutes de chaque cote.",
      "Faire sauter les asperges a l'huile d'olive.",
      "Servir le saumon avec les asperges et un quartier de citron.",
    ],
  },
  {
    id: "couscous-vegetarien",
    title: "Couscous vegetarien",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Semoule de couscous",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Courgette",
        quantity: 1,
        unit: "",
      },
      {
        name: "Carotte",
        quantity: 2,
        unit: "",
      },
      {
        name: "Pois chiches cuits",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Raisins secs",
        quantity: 50,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire les legumes coupes en des dans un bouillon.",
      "Preparer la semoule selon les instructions.",
      "Ajouter les pois chiches et les raisins secs aux legumes.",
      "Servir la semoule surmontee des legumes et de leur bouillon.",
    ],
  },
  {
    id: "omelette-aux-champignons",
    title: "Omelette aux champignons",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Oeufs",
        quantity: 4,
        unit: "",
      },
      {
        name: "Champignons de Paris",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Persil frais",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 20,
        unit: "g",
      },
      {
        name: "Fromage rape",
        quantity: 30,
        unit: "g",
      },
    ],
    instructions: [
      "Faire revenir les champignons emincs dans le beurre.",
      "Battre les oeufs avec le persil et le fromage.",
      "Verser les oeufs sur les champignons dans la poele.",
      "Cuire a feu moyen puis plier l'omelette en deux.",
    ],
  },
  {
    id: "lasagnes-bolognaise",
    title: "Lasagnes bolognaise",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    time: "60 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Feuilles de lasagnes",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Boeuf hache",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Sauce tomate",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Bechamel",
        quantity: 400,
        unit: "ml",
      },
      {
        name: "Parmesan",
        quantity: 80,
        unit: "g",
      },
    ],
    instructions: [
      "Preparer la sauce bolognaise avec le boeuf hache et la sauce tomate.",
      "Alterner les couches de pates, bolognaise et bechamel dans un plat.",
      "Terminer par une couche de bechamel et de parmesan.",
      "Cuire 35 minutes a 200C.",
    ],
  },
  {
    id: "salade-grecque",
    title: "Salade grecque",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Tomate",
        quantity: 3,
        unit: "",
      },
      {
        name: "Concombre",
        quantity: 1,
        unit: "",
      },
      {
        name: "Feta",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Olives noires",
        quantity: 80,
        unit: "g",
      },
      {
        name: "Origan",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Couper la tomate et le concombre en morceaux.",
      "Ajouter les olives et la feta emiettee.",
      "Assaisonner d'huile d'olive et d'origan.",
      "Melanger delicatement et servir frais.",
    ],
  },
  {
    id: "poulet-roti-aux-herbes",
    title: "Poulet roti aux herbes",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "70 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Poulet entier",
        quantity: 1,
        unit: "",
      },
      {
        name: "Thym",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Romarin",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Ail",
        quantity: 4,
        unit: "",
      },
      {
        name: "Beurre",
        quantity: 50,
        unit: "g",
      },
    ],
    instructions: [
      "Preparer un beurre aux herbes et a l'ail.",
      "Enduire le poulet de ce beurre sous la peau.",
      "Enfourner a 200C pendant 1h10.",
      "Laisser reposer 10 minutes avant de decouper.",
    ],
  },
  {
    id: "curry-vert-thai",
    title: "Curry vert thai",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Lait de coco",
        quantity: 400,
        unit: "ml",
      },
      {
        name: "Pate de curry vert",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Tofu ferme",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Aubergine thai",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Basilic thai",
        quantity: 10,
        unit: "g",
      },
    ],
    instructions: [
      "Faire chauffer la pate de curry vert dans une casserole.",
      "Ajouter le lait de coco et melanger.",
      "Incorporer le tofu et l'aubergine, laisser mijoter 15 minutes.",
      "Parsemer de basilic thai avant de servir.",
    ],
  },
  {
    id: "sandwich-club",
    title: "Sandwich club",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200",
    time: "10 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Pain de mie",
        quantity: 6,
        unit: "",
      },
      {
        name: "Poulet grille",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Bacon",
        quantity: 4,
        unit: "",
      },
      {
        name: "Tomate",
        quantity: 1,
        unit: "",
      },
      {
        name: "Laitue",
        quantity: 4,
        unit: "",
      },
    ],
    instructions: [
      "Griller le pain de mie.",
      "Cuire le bacon jusqu'a ce qu'il soit croustillant.",
      "Empiler pain, poulet, bacon, tomate et laitue en plusieurs etages.",
      "Maintenir avec des piques et couper en triangles.",
    ],
  },
  {
    id: "dahl-de-lentilles-corail",
    title: "Dahl de lentilles corail",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Lentilles corail",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Lait de coco",
        quantity: 300,
        unit: "ml",
      },
      {
        name: "Curcuma",
        quantity: 1,
        unit: "tsp",
      },
      {
        name: "Cumin",
        quantity: 1,
        unit: "tsp",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire revenir l'oignon avec le cumin et le curcuma.",
      "Ajouter les lentilles rincees et couvrir d'eau.",
      "Laisser cuire 15 minutes jusqu'a ce que les lentilles soient tendres.",
      "Incorporer le lait de coco et laisser mijoter 5 minutes.",
    ],
  },
  {
    id: "crevettes-a-l-ail",
    title: "Crevettes a l'ail",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Crevettes",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Ail",
        quantity: 4,
        unit: "",
      },
      {
        name: "Persil frais",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 40,
        unit: "g",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire fondre le beurre avec l'ail emince.",
      "Ajouter les crevettes et cuire 3 minutes de chaque cote.",
      "Arroser de jus de citron.",
      "Parsemer de persil frais avant de servir.",
    ],
  },
  {
    id: "tarte-tatin",
    title: "Tarte tatin",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200",
    time: "60 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pommes",
        quantity: 6,
        unit: "",
      },
      {
        name: "Sucre",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 80,
        unit: "g",
      },
      {
        name: "Pate feuilletee",
        quantity: 1,
        unit: "",
      },
      {
        name: "Cannelle",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Faire un caramel avec le sucre et le beurre dans un moule.",
      "Disposer les pommes coupees en quartiers sur le caramel.",
      "Recouvrir de pate feuilletee en rentrant les bords.",
      "Cuire 35 minutes a 180C puis demouler a l'envers.",
    ],
  },
  {
    id: "riz-saute-aux-legumes",
    title: "Riz saute aux legumes",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Riz cuit",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Petits pois",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 1,
        unit: "",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire chauffer un wok avec un peu d'huile.",
      "Faire sauter la carotte et les petits pois.",
      "Pousser les legumes sur le cote et cuire les oeufs brouilles.",
      "Ajouter le riz et la sauce soja, bien melanger.",
    ],
  },
  {
    id: "moussaka",
    title: "Moussaka",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200",
    time: "75 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Aubergine",
        quantity: 3,
        unit: "",
      },
      {
        name: "Agneau hache",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Sauce tomate",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Bechamel",
        quantity: 400,
        unit: "ml",
      },
      {
        name: "Parmesan",
        quantity: 60,
        unit: "g",
      },
    ],
    instructions: [
      "Faire griller les tranches d'aubergine.",
      "Preparer la sauce a la viande avec l'agneau et la sauce tomate.",
      "Alterner aubergines et sauce a la viande dans un plat.",
      "Napper de bechamel, parsemer de parmesan et cuire 40 minutes a 190C.",
    ],
  },
  {
    id: "houmous-maison",
    title: "Houmous maison",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200",
    time: "10 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pois chiches cuits",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Tahini",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
      {
        name: "Ail",
        quantity: 1,
        unit: "",
      },
      {
        name: "Huile d'olive",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Mixer les pois chiches avec le tahini et l'ail.",
      "Ajouter le jus de citron et l'huile d'olive.",
      "Mixer jusqu'a obtenir une texture lisse.",
      "Servir avec un filet d'huile d'olive.",
    ],
  },
  {
    id: "poulet-tikka-masala",
    title: "Poulet tikka masala",
    image:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Poitrine de poulet",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Yaourt nature",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Sauce tomate",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Creme fraiche",
        quantity: 100,
        unit: "ml",
      },
      {
        name: "Epices tikka",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire mariner le poulet dans le yaourt et les epices.",
      "Griller le poulet marine a la poele.",
      "Ajouter la sauce tomate et laisser mijoter 15 minutes.",
      "Incorporer la creme fraiche et servir avec du riz.",
    ],
  },
  {
    id: "salade-de-quinoa-aux-legumes",
    title: "Salade de quinoa aux legumes",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Quinoa",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Tomates cerises",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Concombre",
        quantity: 1,
        unit: "",
      },
      {
        name: "Feta",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Menthe fraiche",
        quantity: 10,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire le quinoa et le laisser refroidir.",
      "Couper les tomates cerises et le concombre.",
      "Melanger le quinoa avec les legumes et la feta.",
      "Ajouter la menthe ciselee et assaisonner d'huile d'olive.",
    ],
  },
  {
    id: "croque-monsieur",
    title: "Croque monsieur",
    image:
      "https://images.unsplash.com/photo-1467333849985-e9df7fe37e8f?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Pain de mie",
        quantity: 4,
        unit: "",
      },
      {
        name: "Jambon",
        quantity: 4,
        unit: "",
      },
      {
        name: "Gruyere rape",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Bechamel",
        quantity: 100,
        unit: "ml",
      },
      {
        name: "Moutarde",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Tartiner le pain de bechamel et de moutarde.",
      "Garnir de jambon et de gruyere entre deux tranches.",
      "Recouvrir le dessus de bechamel et de fromage.",
      "Cuire au four 10 minutes a 200C jusqu'a doree.",
    ],
  },
  {
    id: "ceviche-de-poisson",
    title: "Ceviche de poisson",
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Filet de poisson blanc",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Citron vert",
        quantity: 4,
        unit: "",
      },
      {
        name: "Oignon rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Coriandre fraiche",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Piment",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Couper le poisson en petits des.",
      "Presser le jus des citrons verts sur le poisson.",
      "Ajouter l'oignon emince, le piment et la coriandre.",
      "Laisser mariner au frais 15 minutes avant de servir.",
    ],
  },
  {
    id: "galettes-de-sarrasin",
    title: "Galettes de sarrasin",
    image:
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Farine de sarrasin",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Eau",
        quantity: 500,
        unit: "ml",
      },
      {
        name: "Champignons de Paris",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Fromage rape",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 4,
        unit: "",
      },
    ],
    instructions: [
      "Preparer la pate avec la farine de sarrasin et l'eau.",
      "Faire cuire les galettes dans une poele chaude.",
      "Garnir de champignons sautes et de fromage.",
      "Ajouter un oeuf au milieu et plier les bords de la galette.",
    ],
  },
  {
    id: "minestrone",
    title: "Minestrone",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Haricots blancs cuits",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 2,
        unit: "",
      },
      {
        name: "Celeri",
        quantity: 2,
        unit: "",
      },
      {
        name: "Tomates concassees",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Pates courtes",
        quantity: 100,
        unit: "g",
      },
    ],
    instructions: [
      "Faire revenir la carotte et le celeri coupes en des.",
      "Ajouter les tomates concassees et couvrir d'eau.",
      "Laisser mijoter 20 minutes puis ajouter les pates.",
      "Incorporer les haricots blancs et cuire 10 minutes de plus.",
    ],
  },
  {
    id: "tartare-de-saumon",
    title: "Tartare de saumon",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Saumon frais",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Avocat",
        quantity: 1,
        unit: "",
      },
      {
        name: "Citron vert",
        quantity: 1,
        unit: "",
      },
      {
        name: "Ciboulette",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Sauce soja",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper le saumon en petits des.",
      "Couper l'avocat en des egalement.",
      "Melanger saumon, avocat, citron vert et sauce soja.",
      "Parsemer de ciboulette ciselee avant de servir.",
    ],
  },
  {
    id: "chou-fleur-roti-au-curry",
    title: "Chou-fleur roti au curry",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Chou-fleur",
        quantity: 1,
        unit: "",
      },
      {
        name: "Curry en poudre",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Huile d'olive",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Yaourt nature",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Coriandre fraiche",
        quantity: 10,
        unit: "g",
      },
    ],
    instructions: [
      "Couper le chou-fleur en petits bouquets.",
      "Melanger avec l'huile d'olive et le curry.",
      "Enfourner 25 minutes a 200C jusqu'a doree.",
      "Servir avec une sauce au yaourt et de la coriandre.",
    ],
  },
  {
    id: "escalope-milanaise",
    title: "Escalope milanaise",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Escalope de veau",
        quantity: 4,
        unit: "",
      },
      {
        name: "Chapelure",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Parmesan",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Battre les oeufs dans une assiette.",
      "Melanger la chapelure avec le parmesan rape.",
      "Tremper les escalopes dans l'oeuf puis la chapelure.",
      "Frire jusqu'a doree et servir avec un quartier de citron.",
    ],
  },
  {
    id: "soupe-de-potiron",
    title: "Soupe de potiron",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Potiron",
        quantity: 800,
        unit: "g",
      },
      {
        name: "Bouillon de legumes",
        quantity: 600,
        unit: "ml",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Creme fraiche",
        quantity: 100,
        unit: "ml",
      },
      {
        name: "Muscade",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Faire revenir l'oignon puis ajouter le potiron coupe en des.",
      "Couvrir de bouillon et laisser cuire 20 minutes.",
      "Mixer jusqu'a obtenir une texture lisse.",
      "Ajouter la creme et la muscade avant de servir.",
    ],
  },
  {
    id: "brochettes-de-poulet-grille",
    title: "Brochettes de poulet grille",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Poitrine de poulet",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Poivron",
        quantity: 1,
        unit: "",
      },
      {
        name: "Oignon rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Huile d'olive",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Paprika",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper le poulet et les legumes en cubes.",
      "Enfiler poulet et legumes sur des brochettes en alternant.",
      "Badigeonner d'huile d'olive et de paprika.",
      "Griller 15 minutes en retournant regulierement.",
    ],
  },
  {
    id: "riz-au-lait",
    title: "Riz au lait",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Riz rond",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Lait",
        quantity: 1,
        unit: "l",
      },
      {
        name: "Sucre",
        quantity: 80,
        unit: "g",
      },
      {
        name: "Vanille",
        quantity: 1,
        unit: "",
      },
      {
        name: "Cannelle",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Porter le lait a ebullition avec la vanille.",
      "Ajouter le riz et le sucre.",
      "Laisser cuire a feu doux 30 minutes en remuant.",
      "Saupoudrer de cannelle avant de servir tiede ou froid.",
    ],
  },
  {
    id: "wrap-au-poulet-cesar",
    title: "Wrap au poulet cesar",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Tortillas",
        quantity: 4,
        unit: "",
      },
      {
        name: "Poulet grille",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Laitue",
        quantity: 4,
        unit: "",
      },
      {
        name: "Parmesan",
        quantity: 40,
        unit: "g",
      },
      {
        name: "Sauce caesar",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Trancher le poulet grille en lanieres.",
      "Repartir la laitue sur les tortillas.",
      "Ajouter le poulet, le parmesan et la sauce caesar.",
      "Rouler fermement les wraps et couper en deux.",
    ],
  },
  {
    id: "curry-rouge-de-legumes",
    title: "Curry rouge de legumes",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Lait de coco",
        quantity: 400,
        unit: "ml",
      },
      {
        name: "Pate de curry rouge",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Poivron rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Brocoli",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Basilic thai",
        quantity: 10,
        unit: "g",
      },
    ],
    instructions: [
      "Faire chauffer la pate de curry rouge dans une casserole.",
      "Ajouter le lait de coco et bien melanger.",
      "Incorporer le poivron et le brocoli, laisser mijoter 15 minutes.",
      "Parsemer de basilic thai avant de servir.",
    ],
  },
  {
    id: "steak-frites",
    title: "Steak frites",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Steak de boeuf",
        quantity: 4,
        unit: "",
      },
      {
        name: "Pommes de terre",
        quantity: 800,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 30,
        unit: "g",
      },
      {
        name: "Persil frais",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
    ],
    instructions: [
      "Couper les pommes de terre en frites et les faire frire.",
      "Cuire les steaks a la poele selon la cuisson desiree.",
      "Faire fondre le beurre avec l'ail et le persil.",
      "Servir les steaks nappes de beurre a l'ail avec les frites.",
    ],
  },
  {
    id: "salade-de-lentilles",
    title: "Salade de lentilles",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Lentilles vertes",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 1,
        unit: "",
      },
      {
        name: "Oignon rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Persil frais",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Vinaigrette",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Cuire les lentilles dans l'eau bouillante 20 minutes.",
      "Couper la carotte et l'oignon rouge en petits des.",
      "Melanger les lentilles egouttees avec les legumes.",
      "Assaisonner de vinaigrette et de persil cisele.",
    ],
  },
  {
    id: "paella",
    title: "Paella",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200",
    time: "50 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Riz rond",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Poulet",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Crevettes",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Poivron rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Safran",
        quantity: 1,
        unit: "pinch",
      },
    ],
    instructions: [
      "Faire dorer le poulet dans une paellera.",
      "Ajouter le poivron emince et le riz.",
      "Verser le bouillon safrane et laisser cuire 20 minutes.",
      "Ajouter les crevettes 5 minutes avant la fin de cuisson.",
    ],
  },
  {
    id: "smoothie-bowl-fruits-rouges",
    title: "Smoothie bowl fruits rouges",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200",
    time: "10 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Fruits rouges surgeles",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Banane",
        quantity: 1,
        unit: "",
      },
      {
        name: "Lait d'amande",
        quantity: 150,
        unit: "ml",
      },
      {
        name: "Granola",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Graines de chia",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Mixer les fruits rouges avec la banane et le lait d'amande.",
      "Verser la preparation dans un bol.",
      "Parsemer de granola et de graines de chia.",
      "Servir immediatement bien frais.",
    ],
  },
  {
    id: "poulet-au-citron",
    title: "Poulet au citron",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Cuisses de poulet",
        quantity: 4,
        unit: "",
      },
      {
        name: "Citron",
        quantity: 2,
        unit: "",
      },
      {
        name: "Ail",
        quantity: 3,
        unit: "",
      },
      {
        name: "Thym",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Huile d'olive",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Mariner le poulet avec le jus de citron, l'ail et le thym.",
      "Faire dorer les cuisses de poulet a la poele.",
      "Enfourner 25 minutes a 190C.",
      "Servir avec les tranches de citron rotis.",
    ],
  },
  {
    id: "bibimbap",
    title: "Bibimbap",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Riz cuit",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 1,
        unit: "",
      },
      {
        name: "Epinards",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Champignons shiitake",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Sauce gochujang",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire sauter separement la carotte, les epinards et les champignons.",
      "Repartir le riz dans des bols.",
      "Disposer les legumes sautes harmonieusement sur le riz.",
      "Ajouter la sauce gochujang et melanger avant de deguster.",
    ],
  },
  {
    id: "tartiflette",
    title: "Tartiflette",
    image:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200",
    time: "50 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Pommes de terre",
        quantity: 1,
        unit: "kg",
      },
      {
        name: "Reblochon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Lardons",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Creme fraiche",
        quantity: 100,
        unit: "ml",
      },
    ],
    instructions: [
      "Cuire les pommes de terre en rondelles a l'eau.",
      "Faire revenir les lardons et l'oignon.",
      "Disposer les pommes de terre et les lardons dans un plat avec la creme.",
      "Recouvrir de reblochon coupe en deux et cuire 25 minutes a 200C.",
    ],
  },
  {
    id: "salade-de-pates-au-thon",
    title: "Salade de pates au thon",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Pates courtes",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Thon en boite",
        quantity: 160,
        unit: "g",
      },
      {
        name: "Tomates cerises",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Olives noires",
        quantity: 60,
        unit: "g",
      },
      {
        name: "Vinaigrette",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Cuire les pates et laisser refroidir.",
      "Emietter le thon egoutte.",
      "Melanger les pates avec le thon, les tomates cerises et les olives.",
      "Assaisonner de vinaigrette et servir frais.",
    ],
  },
  {
    id: "veloute-de-brocoli",
    title: "Veloute de brocoli",
    image:
      "https://images.unsplash.com/photo-1467333849985-e9df7fe37e8f?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Brocoli",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Bouillon de legumes",
        quantity: 600,
        unit: "ml",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Creme fraiche",
        quantity: 100,
        unit: "ml",
      },
      {
        name: "Ail",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire revenir l'oignon et l'ail.",
      "Ajouter le brocoli et le bouillon.",
      "Laisser cuire 15 minutes puis mixer.",
      "Incorporer la creme fraiche avant de servir.",
    ],
  },
  {
    id: "poke-bowl-vegetarien",
    title: "Poke bowl vegetarien",
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Riz complet",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Tofu ferme",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Edamame",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Avocat",
        quantity: 1,
        unit: "",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Cuire le riz complet et laisser refroidir.",
      "Couper le tofu en des et le faire dorer.",
      "Couper l'avocat en tranches.",
      "Assembler le riz, le tofu, l'edamame et l'avocat, napper de sauce soja.",
    ],
  },
  {
    id: "cassoulet",
    title: "Cassoulet",
    image:
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1200",
    time: "120 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Haricots blancs secs",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Saucisse de Toulouse",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Lardons",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Tomates concassees",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Ail",
        quantity: 3,
        unit: "",
      },
    ],
    instructions: [
      "Faire tremper les haricots la veille puis les cuire.",
      "Faire dorer les saucisses et les lardons.",
      "Ajouter les tomates concassees et l'ail.",
      "Melanger avec les haricots et laisser mijoter 1h30 au four.",
    ],
  },
  {
    id: "salade-de-betteraves-et-chevre",
    title: "Salade de betteraves et chevre",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Betteraves cuites",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Fromage de chevre",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Noix",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Roquette",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Miel",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper les betteraves en tranches.",
      "Disposer la roquette dans une assiette.",
      "Ajouter les betteraves, le chevre emiette et les noix.",
      "Arroser d'un filet de miel et d'huile d'olive.",
    ],
  },
  {
    id: "chowmein",
    title: "Chowmein",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Nouilles chinoises",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Poulet",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Chou chinois",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 1,
        unit: "",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Cuire les nouilles selon les instructions.",
      "Faire sauter le poulet emince dans un wok.",
      "Ajouter le chou et la carotte emincee.",
      "Incorporer les nouilles et la sauce soja, bien melanger.",
    ],
  },
  {
    id: "tofu-general-tao",
    title: "Tofu general tao",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Tofu ferme",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Fecule de mais",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Sucre",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
    ],
    instructions: [
      "Couper le tofu en cubes et l'enrober de fecule.",
      "Frire le tofu jusqu'a ce qu'il soit doree.",
      "Preparer la sauce avec soja, sucre et ail.",
      "Napper le tofu de sauce et faire sauter 2 minutes.",
    ],
  },
  {
    id: "blanquette-de-veau",
    title: "Blanquette de veau",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    time: "90 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Veau a blanquette",
        quantity: 800,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 3,
        unit: "",
      },
      {
        name: "Champignons de Paris",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Creme fraiche",
        quantity: 150,
        unit: "ml",
      },
      {
        name: "Bouillon de volaille",
        quantity: 800,
        unit: "ml",
      },
    ],
    instructions: [
      "Faire blanchir le veau puis le rincer.",
      "Cuire avec le bouillon, les carottes et un bouquet garni 1h.",
      "Ajouter les champignons 15 minutes avant la fin.",
      "Lier la sauce avec la creme fraiche avant de servir.",
    ],
  },
  {
    id: "salade-caprese",
    title: "Salade caprese",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    time: "10 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Tomate",
        quantity: 4,
        unit: "",
      },
      {
        name: "Mozzarella",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Basilic frais",
        quantity: 15,
        unit: "g",
      },
      {
        name: "Huile d'olive",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Vinaigre balsamique",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper les tomates et la mozzarella en tranches.",
      "Alterner les tranches de tomate et de mozzarella dans une assiette.",
      "Disposer les feuilles de basilic entre les tranches.",
      "Arroser d'huile d'olive et de vinaigre balsamique.",
    ],
  },
  {
    id: "poulet-basquaise",
    title: "Poulet basquaise",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    time: "45 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Cuisses de poulet",
        quantity: 4,
        unit: "",
      },
      {
        name: "Poivron rouge",
        quantity: 2,
        unit: "",
      },
      {
        name: "Poivron vert",
        quantity: 2,
        unit: "",
      },
      {
        name: "Tomates concassees",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire dorer le poulet dans une cocotte.",
      "Ajouter l'oignon et les poivrons emincs.",
      "Incorporer les tomates concassees.",
      "Laisser mijoter 30 minutes a couvert.",
    ],
  },
  {
    id: "granola-maison",
    title: "Granola maison",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Flocons d'avoine",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Miel",
        quantity: 80,
        unit: "g",
      },
      {
        name: "Huile de coco",
        quantity: 40,
        unit: "g",
      },
      {
        name: "Amandes",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Cranberries sechees",
        quantity: 50,
        unit: "g",
      },
    ],
    instructions: [
      "Melanger les flocons d'avoine avec les amandes.",
      "Faire fondre le miel avec l'huile de coco.",
      "Napper les flocons du melange miel-huile.",
      "Cuire 20 minutes a 160C puis ajouter les cranberries.",
    ],
  },
  {
    id: "tarte-aux-poireaux",
    title: "Tarte aux poireaux",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    time: "45 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pate brisee",
        quantity: 1,
        unit: "",
      },
      {
        name: "Poireaux",
        quantity: 4,
        unit: "",
      },
      {
        name: "Creme fraiche",
        quantity: 200,
        unit: "ml",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Gruyere rape",
        quantity: 80,
        unit: "g",
      },
    ],
    instructions: [
      "Foncer un moule avec la pate brisee.",
      "Faire fondre les poireaux emincs a la poele.",
      "Melanger les oeufs avec la creme et le gruyere.",
      "Repartir les poireaux sur la pate, verser l'appareil et cuire 30 minutes a 180C.",
    ],
  },
  {
    id: "rougail-saucisses",
    title: "Rougail saucisses",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Saucisses fumees",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Tomate",
        quantity: 4,
        unit: "",
      },
      {
        name: "Oignon",
        quantity: 2,
        unit: "",
      },
      {
        name: "Ail",
        quantity: 3,
        unit: "",
      },
      {
        name: "Piment",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire dorer les saucisses coupees en morceaux.",
      "Faire revenir l'oignon et l'ail.",
      "Ajouter les tomates et le piment.",
      "Laisser mijoter 25 minutes avec les saucisses.",
    ],
  },
  {
    id: "salade-de-riz",
    title: "Salade de riz",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Riz cuit",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Mais",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Poivron",
        quantity: 1,
        unit: "",
      },
      {
        name: "Tomate",
        quantity: 2,
        unit: "",
      },
      {
        name: "Vinaigrette",
        quantity: 3,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Laisser refroidir le riz cuit.",
      "Couper le poivron et la tomate en des.",
      "Melanger le riz avec les legumes et le mais.",
      "Assaisonner de vinaigrette et servir frais.",
    ],
  },
  {
    id: "poulet-au-curry-coco",
    title: "Poulet au curry coco",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Poitrine de poulet",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Lait de coco",
        quantity: 400,
        unit: "ml",
      },
      {
        name: "Curry en poudre",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Coriandre fraiche",
        quantity: 10,
        unit: "g",
      },
    ],
    instructions: [
      "Faire dorer le poulet coupe en morceaux.",
      "Ajouter l'oignon emince et le curry.",
      "Verser le lait de coco et laisser mijoter 20 minutes.",
      "Parsemer de coriandre fraiche avant de servir.",
    ],
  },
  {
    id: "flan-patissier",
    title: "Flan patissier",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200",
    time: "70 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Lait",
        quantity: 1,
        unit: "l",
      },
      {
        name: "Sucre",
        quantity: 180,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 4,
        unit: "",
      },
      {
        name: "Fecule de mais",
        quantity: 80,
        unit: "g",
      },
      {
        name: "Vanille",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire chauffer le lait avec la vanille.",
      "Fouetter les oeufs, le sucre et la fecule.",
      "Verser le lait chaud sur le melange en fouettant.",
      "Cuire au bain-marie 50 minutes a 160C.",
    ],
  },
  {
    id: "nems-vegetariens",
    title: "Nems vegetariens",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Feuilles de riz",
        quantity: 12,
        unit: "",
      },
      {
        name: "Vermicelles de riz",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 1,
        unit: "",
      },
      {
        name: "Champignons noirs",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Sauce nuoc mam",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire tremper les vermicelles et les champignons noirs.",
      "Rapper la carotte et melanger avec les vermicelles.",
      "Rouler la garniture dans les feuilles de riz humidifiees.",
      "Frire les nems jusqu'a ce qu'ils soient dores.",
    ],
  },
  {
    id: "osso-buco",
    title: "Osso buco",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200",
    time: "120 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Jarret de veau",
        quantity: 4,
        unit: "",
      },
      {
        name: "Tomates concassees",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Carotte",
        quantity: 2,
        unit: "",
      },
      {
        name: "Vin blanc",
        quantity: 200,
        unit: "ml",
      },
      {
        name: "Bouillon de veau",
        quantity: 400,
        unit: "ml",
      },
    ],
    instructions: [
      "Faire dorer les jarrets de veau dans une cocotte.",
      "Deglacer au vin blanc.",
      "Ajouter les tomates, les carottes et le bouillon.",
      "Laisser mijoter 1h45 a couvert a feu doux.",
    ],
  },
  {
    id: "crumble-aux-pommes",
    title: "Crumble aux pommes",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200",
    time: "45 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pommes",
        quantity: 5,
        unit: "",
      },
      {
        name: "Farine",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Sucre",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Cannelle",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Couper les pommes en morceaux et les disposer dans un plat.",
      "Melanger la farine, le beurre et le sucre du bout des doigts.",
      "Repartir la pate sableuse sur les pommes.",
      "Cuire 30 minutes a 180C jusqu'a ce que le dessus soit doree.",
    ],
  },
  {
    id: "soupe-miso",
    title: "Soupe miso",
    image:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pate miso",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Tofu soyeux",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Algues wakame",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Oignon vert",
        quantity: 2,
        unit: "",
      },
      {
        name: "Bouillon dashi",
        quantity: 600,
        unit: "ml",
      },
    ],
    instructions: [
      "Faire chauffer le bouillon dashi.",
      "Dissoudre la pate miso dans un peu de bouillon chaud.",
      "Ajouter le tofu en des et les algues rehydratees.",
      "Verser dans les bols et parsemer d'oignon vert.",
    ],
  },
  {
    id: "poulet-parmesan",
    title: "Poulet parmesan",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Escalope de poulet",
        quantity: 4,
        unit: "",
      },
      {
        name: "Chapelure",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Sauce tomate",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Mozzarella",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Parmesan",
        quantity: 50,
        unit: "g",
      },
    ],
    instructions: [
      "Paner les escalopes de poulet.",
      "Faire dorer les escalopes a la poele.",
      "Napper de sauce tomate et de mozzarella.",
      "Gratiner au four 15 minutes a 200C avec le parmesan.",
    ],
  },
  {
    id: "salade-d-edamame",
    title: "Salade d'edamame",
    image:
      "https://images.unsplash.com/photo-1467333849985-e9df7fe37e8f?w=1200",
    time: "10 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Edamame",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Sesame",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Sauce soja",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Huile de sesame",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Piment rouge",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Cuire les edamame a l'eau bouillante salee.",
      "Egoutter et laisser refroidir legerement.",
      "Assaisonner de sauce soja et d'huile de sesame.",
      "Parsemer de graines de sesame et de piment emince.",
    ],
  },
  {
    id: "chakchouka",
    title: "Chakchouka",
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Tomate",
        quantity: 5,
        unit: "",
      },
      {
        name: "Poivron rouge",
        quantity: 2,
        unit: "",
      },
      {
        name: "Oeufs",
        quantity: 4,
        unit: "",
      },
      {
        name: "Cumin",
        quantity: 1,
        unit: "tsp",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
    ],
    instructions: [
      "Faire revenir les poivrons et l'ail.",
      "Ajouter les tomates concassees et le cumin.",
      "Laisser mijoter 15 minutes jusqu'a epaississement.",
      "Creuser des puits et casser les oeufs dedans, cuire 8 minutes a couvert.",
    ],
  },
  {
    id: "filet-mignon-en-croute",
    title: "Filet mignon en croute",
    image:
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1200",
    time: "60 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Filet mignon de porc",
        quantity: 600,
        unit: "g",
      },
      {
        name: "Pate feuilletee",
        quantity: 1,
        unit: "",
      },
      {
        name: "Champignons de Paris",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Moutarde",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Oeuf",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Saisir le filet mignon de tous les cotes.",
      "Preparer une duxelles avec les champignons haches.",
      "Enrober le filet de moutarde puis de duxelles, envelopper dans la pate.",
      "Dorer a l'oeuf et cuire 30 minutes a 200C.",
    ],
  },
  {
    id: "salade-de-pois-chiches",
    title: "Salade de pois chiches",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pois chiches cuits",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Concombre",
        quantity: 1,
        unit: "",
      },
      {
        name: "Tomate",
        quantity: 2,
        unit: "",
      },
      {
        name: "Persil frais",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Rincer et egoutter les pois chiches.",
      "Couper le concombre et la tomate en des.",
      "Melanger tous les ingredients dans un saladier.",
      "Assaisonner de jus de citron, d'huile d'olive et de persil.",
    ],
  },
  {
    id: "poisson-en-papillote",
    title: "Poisson en papillote",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Filet de cabillaud",
        quantity: 4,
        unit: "",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
      {
        name: "Tomates cerises",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Courgette",
        quantity: 1,
        unit: "",
      },
      {
        name: "Huile d'olive",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper la courgette en fines rondelles.",
      "Disposer le poisson sur une feuille de papier cuisson.",
      "Ajouter les legumes, le citron et l'huile d'olive.",
      "Fermer la papillote et cuire 20 minutes a 200C.",
    ],
  },
  {
    id: "riz-cantonais",
    title: "Riz cantonais",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Riz cuit",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Jambon",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Petits pois",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Sauce soja",
        quantity: 2,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper le jambon en petits des.",
      "Faire cuire les oeufs brouilles dans un wok.",
      "Ajouter le riz, le jambon et les petits pois.",
      "Assaisonner de sauce soja et bien melanger.",
    ],
  },
  {
    id: "tofu-saute-au-sesame",
    title: "Tofu saute au sesame",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Tofu ferme",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Sesame",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Brocoli",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
    ],
    instructions: [
      "Couper le tofu en cubes et le faire dorer.",
      "Ajouter l'ail emince et le brocoli.",
      "Incorporer la sauce soja et faire sauter 5 minutes.",
      "Parsemer de graines de sesame avant de servir.",
    ],
  },
  {
    id: "cote-de-boeuf-grillee",
    title: "Cote de boeuf grillee",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    time: "30 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Cote de boeuf",
        quantity: 1,
        unit: "kg",
      },
      {
        name: "Beurre",
        quantity: 30,
        unit: "g",
      },
      {
        name: "Ail",
        quantity: 3,
        unit: "",
      },
      {
        name: "Thym",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Fleur de sel",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Sortir la viande du frigo 30 minutes avant cuisson.",
      "Griller la cote de boeuf 8 minutes de chaque cote.",
      "Laisser reposer 10 minutes sous du papier aluminium.",
      "Servir avec du beurre a l'ail, thym et fleur de sel.",
    ],
  },
  {
    id: "salade-de-fruits-exotiques",
    title: "Salade de fruits exotiques",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Mangue",
        quantity: 1,
        unit: "",
      },
      {
        name: "Ananas",
        quantity: 0.5,
        unit: "",
      },
      {
        name: "Kiwi",
        quantity: 2,
        unit: "",
      },
      {
        name: "Fruit de la passion",
        quantity: 2,
        unit: "",
      },
      {
        name: "Menthe fraiche",
        quantity: 5,
        unit: "g",
      },
    ],
    instructions: [
      "Couper la mangue, l'ananas et le kiwi en des.",
      "Melanger tous les fruits dans un saladier.",
      "Ajouter la pulpe des fruits de la passion.",
      "Parsemer de menthe fraiche ciselee avant de servir.",
    ],
  },
  {
    id: "gratin-dauphinois",
    title: "Gratin dauphinois",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "75 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pommes de terre",
        quantity: 1,
        unit: "kg",
      },
      {
        name: "Creme fraiche",
        quantity: 300,
        unit: "ml",
      },
      {
        name: "Lait",
        quantity: 200,
        unit: "ml",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
      {
        name: "Gruyere rape",
        quantity: 100,
        unit: "g",
      },
    ],
    instructions: [
      "Peler et trancher finement les pommes de terre.",
      "Frotter le plat avec l'ail.",
      "Disposer les pommes de terre en couches, napper de creme et de lait.",
      "Cuire 1h a 180C puis gratiner avec le fromage 10 minutes.",
    ],
  },
  {
    id: "poulet-a-la-moutarde",
    title: "Poulet a la moutarde",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Cuisses de poulet",
        quantity: 4,
        unit: "",
      },
      {
        name: "Moutarde",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Creme fraiche",
        quantity: 150,
        unit: "ml",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Bouillon de volaille",
        quantity: 200,
        unit: "ml",
      },
    ],
    instructions: [
      "Faire dorer le poulet a la poele.",
      "Retirer le poulet et faire revenir l'oignon.",
      "Ajouter la moutarde et le bouillon, remettre le poulet.",
      "Laisser mijoter 20 minutes puis incorporer la creme.",
    ],
  },
  {
    id: "salade-de-chou-rouge",
    title: "Salade de chou rouge",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Chou rouge",
        quantity: 0.5,
        unit: "",
      },
      {
        name: "Pomme",
        quantity: 1,
        unit: "",
      },
      {
        name: "Noix",
        quantity: 40,
        unit: "g",
      },
      {
        name: "Vinaigre de cidre",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Miel",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Emincer finement le chou rouge.",
      "Couper la pomme en fines lamelles.",
      "Melanger le chou, la pomme et les noix.",
      "Assaisonner avec le vinaigre de cidre et le miel.",
    ],
  },
  {
    id: "curry-de-crevettes",
    title: "Curry de crevettes",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Crevettes",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Lait de coco",
        quantity: 300,
        unit: "ml",
      },
      {
        name: "Pate de curry rouge",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Poivron rouge",
        quantity: 1,
        unit: "",
      },
      {
        name: "Citron vert",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire chauffer la pate de curry dans une poele.",
      "Ajouter le lait de coco et le poivron emince.",
      "Incorporer les crevettes et laisser cuire 8 minutes.",
      "Arroser de jus de citron vert avant de servir.",
    ],
  },
  {
    id: "pancakes-moelleux",
    title: "Pancakes moelleux",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Farine",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Lait",
        quantity: 300,
        unit: "ml",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Sucre",
        quantity: 30,
        unit: "g",
      },
      {
        name: "Levure chimique",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Melanger la farine, le sucre et la levure.",
      "Ajouter les oeufs et le lait, fouetter jusqu'a lissage.",
      "Cuire des petites louches de pate dans une poele chaude.",
      "Retourner des l'apparition de bulles et cuire l'autre face.",
    ],
  },
  {
    id: "boeuf-saute-au-brocoli",
    title: "Boeuf saute au brocoli",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Boeuf en lanieres",
        quantity: 350,
        unit: "g",
      },
      {
        name: "Brocoli",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Sauce soja",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
      {
        name: "Gingembre",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire mariner le boeuf avec la sauce soja.",
      "Faire sauter le boeuf a feu vif dans un wok.",
      "Ajouter le brocoli, l'ail et le gingembre.",
      "Faire sauter 5 minutes supplementaires et servir chaud.",
    ],
  },
  {
    id: "salade-tiede-de-lentilles-et-saumon",
    title: "Salade tiede de lentilles et saumon",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Lentilles vertes",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Filet de saumon",
        quantity: 2,
        unit: "",
      },
      {
        name: "Echalote",
        quantity: 1,
        unit: "",
      },
      {
        name: "Vinaigrette",
        quantity: 3,
        unit: "tbsp",
      },
      {
        name: "Persil frais",
        quantity: 5,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire les lentilles dans l'eau bouillante 20 minutes.",
      "Cuire le saumon a la poele et l'emietter.",
      "Melanger les lentilles avec l'echalote emincee.",
      "Ajouter le saumon, la vinaigrette et le persil avant de servir tiede.",
    ],
  },
  {
    id: "naan-au-fromage",
    title: "Naan au fromage",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200",
    time: "40 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Farine",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Yaourt nature",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Levure boulangere",
        quantity: 1,
        unit: "tsp",
      },
      {
        name: "Mozzarella",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 30,
        unit: "g",
      },
    ],
    instructions: [
      "Preparer une pate avec la farine, le yaourt et la levure.",
      "Laisser reposer 30 minutes.",
      "Etaler la pate, garnir de mozzarella et refermer.",
      "Cuire a la poele chaude puis badigeonner de beurre.",
    ],
  },
  {
    id: "poulet-teriyaki",
    title: "Poulet teriyaki",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Cuisses de poulet",
        quantity: 4,
        unit: "",
      },
      {
        name: "Sauce soja",
        quantity: 4,
        unit: "tbsp",
      },
      {
        name: "Miel",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Ail",
        quantity: 2,
        unit: "",
      },
      {
        name: "Gingembre",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Melanger sauce soja, miel, ail et gingembre pour la marinade.",
      "Faire mariner le poulet 15 minutes.",
      "Cuire le poulet a la poele en arrosant de marinade.",
      "Laisser caraméliser et servir avec du riz.",
    ],
  },
  {
    id: "tarte-au-citron",
    title: "Tarte au citron",
    image:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200",
    time: "60 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pate sablee",
        quantity: 1,
        unit: "",
      },
      {
        name: "Citron",
        quantity: 4,
        unit: "",
      },
      {
        name: "Sucre",
        quantity: 180,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 4,
        unit: "",
      },
      {
        name: "Beurre",
        quantity: 100,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire la pate sablee a blanc 15 minutes.",
      "Preparer la creme au citron avec jus, sucre, oeufs et beurre.",
      "Cuire la creme au bain-marie en fouettant.",
      "Verser sur le fond de tarte et laisser refroidir.",
    ],
  },
  {
    id: "salade-de-pastaqueca-a-la-feta",
    title: "Salade de pastaqueca a la feta",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pasteque",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Feta",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Menthe fraiche",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Huile d'olive",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Olives noires",
        quantity: 50,
        unit: "g",
      },
    ],
    instructions: [
      "Couper la pasteque en cubes.",
      "Emietter la feta sur la pasteque.",
      "Ajouter les olives noires et la menthe fraiche.",
      "Arroser d'huile d'olive avant de servir bien frais.",
    ],
  },
  {
    id: "poulet-a-la-creme-et-champignons",
    title: "Poulet a la creme et champignons",
    image:
      "https://images.unsplash.com/photo-1467333849985-e9df7fe37e8f?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Poitrine de poulet",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Champignons de Paris",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Creme fraiche",
        quantity: 200,
        unit: "ml",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Vin blanc",
        quantity: 100,
        unit: "ml",
      },
    ],
    instructions: [
      "Faire dorer le poulet coupe en morceaux.",
      "Ajouter l'oignon et les champignons.",
      "Deglacer au vin blanc et laisser reduire.",
      "Incorporer la creme fraiche et laisser mijoter 10 minutes.",
    ],
  },
  {
    id: "buddha-bowl-falafel",
    title: "Buddha bowl falafel",
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Falafels",
        quantity: 8,
        unit: "",
      },
      {
        name: "Houmous",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Concombre",
        quantity: 1,
        unit: "",
      },
      {
        name: "Tomates cerises",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Riz complet",
        quantity: 150,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire le riz complet.",
      "Faire chauffer les falafels au four.",
      "Couper le concombre et les tomates cerises.",
      "Assembler tous les ingredients dans un bol avec une cuillere d'houmous.",
    ],
  },
  {
    id: "rillettes-de-thon",
    title: "Rillettes de thon",
    image:
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1200",
    time: "10 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Thon en boite",
        quantity: 320,
        unit: "g",
      },
      {
        name: "Fromage frais",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Citron",
        quantity: 0.5,
        unit: "",
      },
      {
        name: "Ciboulette",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Poivre",
        quantity: 1,
        unit: "tsp",
      },
    ],
    instructions: [
      "Egoutter le thon et l'emietter.",
      "Melanger avec le fromage frais.",
      "Ajouter le jus de citron et la ciboulette.",
      "Assaisonner de poivre et reserver au frais avant de servir.",
    ],
  },
  {
    id: "curry-de-patates-douces",
    title: "Curry de patates douces",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Patate douce",
        quantity: 600,
        unit: "g",
      },
      {
        name: "Lait de coco",
        quantity: 400,
        unit: "ml",
      },
      {
        name: "Curry en poudre",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Epinards",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Faire revenir l'oignon avec le curry.",
      "Ajouter la patate douce coupee en des.",
      "Verser le lait de coco et laisser mijoter 20 minutes.",
      "Incorporer les epinards en fin de cuisson.",
    ],
  },
  {
    id: "poulet-au-four-aux-legumes-racines",
    title: "Poulet au four aux legumes racines",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "60 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Cuisses de poulet",
        quantity: 6,
        unit: "",
      },
      {
        name: "Carotte",
        quantity: 3,
        unit: "",
      },
      {
        name: "Panais",
        quantity: 2,
        unit: "",
      },
      {
        name: "Pomme de terre",
        quantity: 4,
        unit: "",
      },
      {
        name: "Romarin",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Couper les legumes racines en gros morceaux.",
      "Disposer le poulet et les legumes dans un plat.",
      "Assaisonner d'huile d'olive et de romarin.",
      "Enfourner 45 minutes a 200C en retournant a mi-cuisson.",
    ],
  },
  {
    id: "salade-de-haricots-verts",
    title: "Salade de haricots verts",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200",
    time: "15 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Haricots verts",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Amandes effilees",
        quantity: 30,
        unit: "g",
      },
      {
        name: "Echalote",
        quantity: 1,
        unit: "",
      },
      {
        name: "Vinaigrette",
        quantity: 2,
        unit: "tbsp",
      },
      {
        name: "Persil frais",
        quantity: 5,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire les haricots verts a l'eau bouillante 8 minutes.",
      "Egoutter et refroidir sous l'eau froide.",
      "Melanger avec l'echalote emincee et les amandes.",
      "Assaisonner de vinaigrette et de persil avant de servir.",
    ],
  },
  {
    id: "boeuf-stroganoff",
    title: "Boeuf stroganoff",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Boeuf en lanieres",
        quantity: 400,
        unit: "g",
      },
      {
        name: "Champignons de Paris",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Creme fraiche",
        quantity: 200,
        unit: "ml",
      },
      {
        name: "Oignon",
        quantity: 1,
        unit: "",
      },
      {
        name: "Moutarde",
        quantity: 1,
        unit: "tbsp",
      },
    ],
    instructions: [
      "Faire dorer le boeuf a feu vif puis reserver.",
      "Faire revenir l'oignon et les champignons.",
      "Remettre le boeuf et ajouter la moutarde.",
      "Incorporer la creme fraiche et laisser mijoter 5 minutes.",
    ],
  },
  {
    id: "pommes-de-terre-farcies",
    title: "Pommes de terre farcies",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    time: "45 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pommes de terre",
        quantity: 4,
        unit: "",
      },
      {
        name: "Fromage rape",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Creme fraiche",
        quantity: 80,
        unit: "ml",
      },
      {
        name: "Ciboulette",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 20,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire les pommes de terre entieres au four 40 minutes.",
      "Couper le dessus et evider la chair.",
      "Melanger la chair avec creme, fromage et ciboulette.",
      "Refarcir les pommes de terre et repasser 10 minutes au four.",
    ],
  },
  {
    id: "poisson-pane-maison",
    title: "Poisson pane maison",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    time: "25 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Filet de poisson blanc",
        quantity: 4,
        unit: "",
      },
      {
        name: "Chapelure",
        quantity: 150,
        unit: "g",
      },
      {
        name: "Farine",
        quantity: 50,
        unit: "g",
      },
      {
        name: "Oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Fariner les filets de poisson.",
      "Tremper dans l'oeuf battu puis la chapelure.",
      "Faire dorer a la poele 4 minutes de chaque cote.",
      "Servir avec un quartier de citron.",
    ],
  },
  {
    id: "salade-de-couscous-aux-herbes",
    title: "Salade de couscous aux herbes",
    image:
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200",
    time: "20 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Semoule de couscous",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Persil frais",
        quantity: 20,
        unit: "g",
      },
      {
        name: "Menthe fraiche",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Tomate",
        quantity: 2,
        unit: "",
      },
      {
        name: "Citron",
        quantity: 1,
        unit: "",
      },
    ],
    instructions: [
      "Preparer la semoule selon les instructions et laisser refroidir.",
      "Ciseler le persil et la menthe.",
      "Couper les tomates en petits des.",
      "Melanger tous les ingredients avec le jus de citron et de l'huile d'olive.",
    ],
  },
  {
    id: "poulet-coco-citronnelle",
    title: "Poulet coco citronnelle",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    time: "35 min",
    ingredientsAvailable: "Tous",
    vegan: false,
    ingredients: [
      {
        name: "Poitrine de poulet",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Lait de coco",
        quantity: 400,
        unit: "ml",
      },
      {
        name: "Citronnelle",
        quantity: 2,
        unit: "",
      },
      {
        name: "Gingembre",
        quantity: 1,
        unit: "tbsp",
      },
      {
        name: "Coriandre fraiche",
        quantity: 10,
        unit: "g",
      },
    ],
    instructions: [
      "Faire revenir le poulet coupe en morceaux.",
      "Ajouter la citronnelle ecrasee et le gingembre.",
      "Verser le lait de coco et laisser mijoter 20 minutes.",
      "Parsemer de coriandre fraiche avant de servir.",
    ],
  },
  {
    id: "tarte-aux-fraises",
    title: "Tarte aux fraises",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200",
    time: "50 min",
    ingredientsAvailable: "Tous",
    vegan: true,
    ingredients: [
      {
        name: "Pate sablee",
        quantity: 1,
        unit: "",
      },
      {
        name: "Fraises",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Creme patissiere",
        quantity: 300,
        unit: "g",
      },
      {
        name: "Sucre glace",
        quantity: 20,
        unit: "g",
      },
      {
        name: "Menthe fraiche",
        quantity: 5,
        unit: "g",
      },
    ],
    instructions: [
      "Cuire la pate sablee a blanc 15 minutes et laisser refroidir.",
      "Garnir le fond de tarte de creme patissiere.",
      "Disposer les fraises coupees en deux harmonieusement.",
      "Saupoudrer de sucre glace et decorer de menthe.",
    ],
  },
];