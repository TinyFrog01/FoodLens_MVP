export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  vegan: boolean;
  servings?: number;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];

  instructions: string[];
}

export const recipes: Recipe[] = [

{
  id: "une-tasse-de-the",
  title: "Une bonne tasse de thé",
  image: "app/Food/data/recipe/photos/une-tasse-de-the.jpeg",
  time: "15 min",
  vegan: true,
  servings: 1,

  ingredients: [
    {
      name: "eau",
      quantity: 250,
      unit: "mL"
    },
    {
      name: "thé en feuilles",
      quantity: 2,
      unit: "g"
    },
    /**
     facultatif
     
     {
      name: "sucre",
      quantity: 0,
      unit: "au goût"
    },
    {
      name: "miel",
      quantity: 0,
      unit: "au goût"
    },
    {
      name: "lait",
      quantity: 0,
      unit: "au goût"
    },
    {
      name: "jus de citron",
      quantity: 0,
      unit: "au goût"
    } **/
  ],

  instructions: [
    "Verser 1 litre d'eau fraîche dans une bouilloire et la chauffer jusqu'à la température souhaitée.",
    "Verser un peu d'eau chaude dans la théière et laisser reposer quelques secondes à une minute afin de la préchauffer. Vider ensuite l'eau.",
    "Si vous utilisez du thé en feuilles, le placer dans un infuseur puis dans la théière. Si vous utilisez des sachets, les placer directement dans la théière.",
    "Lorsque l'eau atteint la température souhaitée, la verser dans la théière en évitant de la verser directement sur les feuilles, particulièrement pour les thés verts et blancs.",
    "Laisser le thé infuser tranquillement sans remuer ni agiter la théière. Retirer l'infuseur ou les sachets lorsque le temps d'infusion souhaité est atteint.",
    "Verser le thé dans la tasse. Ajouter du sucre, du miel, du lait ou du jus de citron selon le goût.",
    "Ne pas mélanger le lait et le citron dans la même tasse afin d'éviter que le lait ne caille."
  ]
},
{
  id: "couscous-algerien-viande-legumes",
  title: "Couscous algérien à la viande et aux légumes",
  image: "...",
  time: "3 h",
  vegan: false,
  servings: 6,
  
  ingredients: [
  {
  name: "couscous fin ou moyen",
  quantity: 500,
  unit: "g"
  },
  {
  name: "huile d'olive",
  quantity: 30,
  unit: "ml"
  },
  {
  name: "eau",
  quantity: 750,
  unit: "ml"
  },
  {
  name: "sel",
  quantity: 5,
  unit: "g"
  },
  {
    name: "poivre",
    quantity: 5,
    unit: "g"
    },
  {
  name: "agneau", /**poulet ou boeuf */
  quantity: 500,
  unit: "g"
  },
  {
  name: "oignons",
  quantity: 2,
  unit: ""
  },
  {
  name: "ail",
  quantity: 3,
  unit: "gousses"
  },
  {
  name: "concentré de tomate",
  quantity: 30,
  unit: "ml"
  },
  {
  name: "cumin moulu",
  quantity: 5,
  unit: "ml"
  },
  {
  name: "coriandre moulue",
  quantity: 5,
  unit: "ml"
  },
  {
  name: "paprika",
  quantity: 5,
  unit: "ml"
  },
  {
  name: "curcuma moulu",
  quantity: 2.5,
  unit: "ml"
  },
  {
  name: "cannelle moulue",
  quantity: 2.5,
  unit: "ml"
  },
  {
  name: "bouillon", /**eau */
  quantity: 1.5,
  unit: "L"
  },
  {
  name: "carottes",
  quantity: 2,
  unit: ""
  },
  {
  name: "courgettes",
  quantity: 2,
  unit: ""
  },
  {
  name: "pommes de terre",
  quantity: 2,
  unit: ""
  },
  {
  name: "navet",
  quantity: 1,
  unit: ""
  },
  {
  name: "courge ou citrouille",
  quantity: 240,
  unit: "g"
  },
  {
  name: "pois chiches cuits",
  quantity: 165,
  unit: "g"
  },
  {
  name: "poivron vert",
  quantity: 1,
  unit: ""
  }
  ],
  
  instructions: [
  "Verser le couscous dans un grand saladier. Ajouter l'huile d'olive et une petite quantité de sel, puis frotter les grains entre les mains afin de les enrober uniformément d'huile.",
  "Ajouter progressivement 500 ml d'eau tiède tout en mélangeant afin d'humidifier le couscous. Laisser reposer pendant 10 minutes pour permettre aux grains d'absorber l'eau.",
  "Transférer le couscous dans un couscoussier ou dans un panier vapeur à mailles fines. Faire cuire à la vapeur au-dessus d'une eau frémissante pendant 20 minutes. Égrener le couscous avec une fourchette toutes les 10 minutes afin d'éviter qu'il ne forme des amas.",
  "Après la première cuisson à la vapeur, remettre le couscous dans le grand saladier.",
  "Mélanger 250 ml d'eau avec le sel, puis verser progressivement cette eau salée sur le couscous tout en séparant les grains avec les mains ou une fourchette.",
  "Laisser refroidir le couscous pendant 10 à 15 minutes afin que les grains absorbent l'eau salée.",
  "Dans une grande marmite, chauffer l'huile d'olive à feu moyen. Ajouter la viande et la faire dorer sur toutes ses faces. Retirer la viande et la réserver.",
  "Dans la même marmite, ajouter les oignons hachés et l'ail émincé. Faire revenir jusqu'à ce qu'ils soient tendres et légèrement dorés.",
  "Ajouter le concentré de tomate, le cumin, la coriandre, le paprika, le curcuma et la cannelle facultative. Faire cuire pendant 2 à 3 minutes afin de libérer les arômes des épices.",
  "Remettre la viande dans la marmite. Ajouter 1,5 L d'eau ou de bouillon, puis assaisonner avec du sel et du poivre. Porter à ébullition, réduire le feu, couvrir et laisser mijoter pendant environ 1 heure ou jusqu'à ce que la viande soit tendre.",
  "Après 30 minutes de cuisson de la viande, ajouter les carottes, le navet et les pommes de terre. Poursuivre la cuisson pendant 15 minutes.",
  "Remettre le couscous dans le couscoussier et le faire cuire à la vapeur pendant 20 minutes supplémentaires. Égrener avec une fourchette toutes les 10 minutes.",
  "Ajouter les courgettes, la courge et les pois chiches dans la marmite. Poursuivre la cuisson pendant 15 à 20 minutes, jusqu'à ce que les légumes soient tendres sans être trop cuits.",
  "Lorsque la deuxième cuisson à la vapeur du couscous est terminée, le transférer dans un grand plat de service. Verser une louche de bouillon de la marmite sur le couscous et l'égrener délicatement avec une fourchette.",
  "Disposer le couscous dans un grand plat. Répartir la viande et les légumes par-dessus, puis verser une partie du bouillon sur l'ensemble avant de servir."
  ]
  },
  {
    id: "biscuits-anzac",
    title: "Biscuits ANZAC",
    image: "",
    time: "35 min",
    vegan: false,
    servings: 25,
  
    ingredients: [
      {
        name: "Farine",
        quantity: 250,
        unit: "g",
      },
      {
        name: "Cassonade",/*sucre brun*/
        quantity: 200,
        unit: "g",
      },
      {
        name: "Flocons d'avoine",
        quantity: 180,
        unit: "g",
      },
      {
        name: "Noix de coco râpée",
        quantity: 90,
        unit: "g",
      },
      {
        name: "Sirop doré",
        quantity: 60,
        unit: "ml",
      },
      {
        name: "Beurre",
        quantity: 225,
        unit: "g",
      },
      {
        name: "Bicarbonate de soude",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Eau",
        quantity: 30,
        unit: "ml",
      },
    ],
  
    instructions: [
      "Préchauffer le four à 150 °C.",
      "Mélanger la farine, le sucre, les flocons d'avoine et la noix de coco dans un grand bol.",
      "Faire fondre le beurre avec le sirop doré dans une casserole.",
      "Mélanger le bicarbonate de soude avec l'eau puis l'ajouter au mélange de beurre fondu.",
      "Verser les ingrédients liquides sur les ingrédients secs et mélanger jusqu'à obtenir une pâte homogène.",
      "Former de petites boules de pâte et les déposer sur une plaque de cuisson.",
      "Aplatir légèrement chaque boule.",
      "Cuire environ 20 minutes jusqu'à ce que les biscuits soient dorés.",
      "Laisser refroidir avant de servir."
    ]
  },
  {
    id: "gateau-aux-pommes",
    title: "Gâteau aux pommes",
    image: "",
    time: "45 min",
    vegan: false,
    servings: 6,
  
    ingredients: [
      {
        name: "Beurre",
        quantity: 108,
        unit: "g",
      },
      {
        name: "Sucre",
        quantity: 225,
        unit: "g",
      },
      {
        name: "oeufs",
        quantity: 2,
        unit: "",
      },
      {
        name: "Farine",
        quantity: 110,
        unit: "g",
      },
      {
        name: "Bicarbonate de soude",
        quantity: 5,
        unit: "g",
      },
      {
        name: "Cannelle",/*moulue*/
        quantity: 3,
        unit: "g",
      },
      {
        name: "Muscade", /*moulue*/
        quantity: 1.5,
        unit: "g",
      },
      {
        name: "Pommes",
        quantity: 227,
        unit: "g",
      },
      /* facultatif
      
        name: "Crème fouettée",
        quantity: 0,
        unit: "",
      },*/
    ],
  
    instructions: [
      "Préchauffer le four à 177 °C.",
      "Battre le beurre et le sucre jusqu'à obtenir un mélange léger et mousseux.",
      "Ajouter les oeufs et bien mélanger.",
      "Mélanger la farine, le bicarbonate de soude, la cannelle et la muscade.",
      "Incorporer les ingrédients secs à la préparation.",
      "Ajouter délicatement les pommes hachées.",
      "Verser la pâte dans un moule beurré.",
      "Cuire au four pendant 45 minutes.",
      "Servir tiède avec de la crème fouettée."
    ]
  },
  {
    id: "croustade-aux-pommes",
    title: "Croustade aux pommes",
    image: "",
    time: "30 min",
    vegan: false,
  
    ingredients: [
      {
        name: "Pommes",
        quantity: 6,
        unit: "",
      },
      {
        name: "Farine",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Cassonade",
        quantity: 10,
        unit: "g",
      },
      {
        name: "Flocons d'avoine",
        quantity: 100,
        unit: "g",
      },
      {
        name: "Cannelle", /*moulue*/
        quantity: 3,
        unit: "g",
      },
      {
        name: "Beurre", /*froid*/
        quantity: 75,
        unit: "g",
      },
      {
        name: "Cassonade",
        quantity: 135,
        unit: "g",
      },
    ],
  
    instructions: [
      "Préchauffer le four à 190 °C.",
      "Dans un bol, mélanger la farine, la cassonade et les flocons d'avoine. Si la température ambiante est élevée, placer le mélange au réfrigérateur.",
      "Peler, épépiner et trancher les pommes. Les disposer dans un plat de cuisson carré d'environ 23 cm.",
      "Ajouter le beurre froid au mélange de farine. Le travailler rapidement en petits morceaux à l'aide de deux couteaux, sans le faire fondre.",
      "Ajouter la cannelle au mélange croustillant.",
      "Répartir uniformément la garniture sur les pommes et l'aplatir légèrement.",
      "Cuire au four à 190 °C pendant environ 30 minutes.",
      "Poursuivre la cuisson jusqu'à ce que la garniture soit bien dorée et croustillante.",
      "Laisser légèrement refroidir avant de servir."
    ]
  },
  {
    id: "tarte-aux-pommes",
    title: "Tarte aux pommes",
    image: "",
    time: "1 h 45 min",
    vegan: false,
    servings: 8,
  
    ingredients: [
      {
        name: "Farine",
        quantity: 255,
        unit: "g",
      },
      {
        name: "Margarine",
        quantity: 110,
        unit: "g",
      },
      {
        name: "Saindoux",
        quantity: 55,
        unit: "g",
      },
      {
        name: "Sel",
        quantity: 1,
        unit: "pincée",
      },
      {
        name: "Eau",
        quantity: 30,
        unit: "ml",
      },
      {
        name: "Pommes",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Jus de citron",
        quantity: 30,
        unit: "ml",
      },
      {
        name: "Beurre",/*salé*/
        quantity: 28,
        unit: "g",
      },
      {
        name: "Sucre",
        quantity: 500,
        unit: "g",
      },
      {
        name: "Fécule de maïs",
        quantity: 20,
        unit: "g",
      },
      {
        name: "Cannelle",/*moulue*/
        quantity: 2,
        unit: "g",
      },
      {
        name: "Muscade", /*moulue*/
        quantity: 1,
        unit: "g",
      },
      {
        name: "Lait",
        quantity: 15,
        unit: "ml",
      },
    ],
  
    instructions: [
      "Préparer la pâte en mélangeant la farine, la margarine, le saindoux et le sel jusqu'à obtenir une texture semblable à de fines miettes.",
      "Ajouter l'eau froide et mélanger jusqu'à obtenir une pâte souple mais ferme.",
      "Étaler la pâte sur une surface farinée et former deux abaisses de la taille du moule.",
      "Déposer la première abaisse dans un moule à tarte.",
      "Peler et trancher les pommes en morceaux d'environ 5 mm d'épaisseur.",
      "Ajouter le jus de citron aux pommes.",
      "Mélanger les pommes avec 100 g de sucre et quelques pincées de cannelle.",
      "Retirer l'excédent de jus des pommes, puis les répartir dans le moule.",
      "Mélanger le reste du sucre avec la cannelle, la muscade, la farine et la fécule de maïs.",
      "Répartir ce mélange sur les pommes.",
      "Répartir le beurre en petites noisettes sur la garniture.",
      "Recouvrir avec la deuxième abaisse de pâte.",
      "Sceller les bords avec les doigts ou une fourchette.",
      "Découper quelques ouvertures en forme de coeur ou de losange dans la pâte supérieure.",
      "Badigeonner la pâte avec le lait et saupoudrer de sucre et de cannelle.",
      "Cuire au four à 180 °C pendant environ 60 minutes, jusqu'à ce que la pâte soit bien dorée.",
      "Sortir la tarte du four et la laisser refroidir légèrement avant de la servir.",
      "Servir tiède avec de la crème glacée ou de la crème anglaise."
    ]
  },
  {
    id: "strudel-aux-pommes",
    title: "Strudel aux pommes",
    image: "",
    time: "1 h 20 min",
    vegan: false,
    servings: 10,
  
    ingredients: [
      {
        name: "Farine de blé",
        quantity: 200,
        unit: "g",
      },
      {
        name: "Eau", /*tiède*/
        quantity: 63,
        unit: "g",
      },
      {
        name: "Huile",
        quantity: 20,
        unit: "g",
      },
      {
        name: "Sel",
        quantity: 0.5,
        unit: "g",
      },
      {
        name: "Pommes",
        quantity: 1500,
        unit: "g",
      },
      {
        name: "Beurre",
        quantity: 120,
        unit: "g",
      },
      {
        name: "Chapelure", /*chapelure grillée*/
        quantity: 80,
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
        unit: "",
      },
      {
        name: "Raisins secs",
        quantity: 60,
        unit: "g",
      },
      {
        name: "Noix",
        quantity: 60,
        unit: "g",
      },
      /*{
        name: "Sucre glace",
        quantity: 1,
        unit: "",
      },*/
    ],
  
    instructions: [
      "Mélanger la farine et le sel, puis former un puits au centre.",
      "Ajouter progressivement l'eau tiède et l'huile tout en incorporant la farine.",
      "Pétrir jusqu'à obtenir une pâte lisse qui ne colle plus aux mains ni au plan de travail.",
      "Placer la pâte dans un bol légèrement fariné et la badigeonner d'un peu d'huile.",
      "Couvrir avec un linge humide et laisser reposer pendant 30 minutes.",
      "Fariner un grand linge propre et y déposer la pâte.",
      "Étaler et étirer délicatement la pâte avec les mains jusqu'à ce qu'elle soit très fine.",
      "Retirer les bords épais de la pâte.",
      "Répartir la chapelure sur environ deux tiers de la pâte.",
      "Disposer les pommes tranchées sur la chapelure.",
      "Saupoudrer les pommes avec le sucre, la cannelle, les raisins secs et les noix.",
      "Badigeonner le tiers restant de la pâte avec une partie du beurre fondu.",
      "Rabattre légèrement les côtés vers le centre.",
      "Rouler délicatement le strudel à l'aide du linge.",
      "Déposer le strudel sur une plaque de cuisson.",
      "Badigeonner entièrement le strudel avec le reste du beurre fondu, y compris les extrémités.",
      "Cuire au four préchauffé à 180 °C pendant environ 35 minutes.",
      "Badigeonner le strudel de beurre fondu deux ou trois fois pendant les 15 premières minutes de cuisson.",
      "Retirer du four lorsque le strudel est bien doré et cuit.",
      "Laisser refroidir légèrement.",
      "Couper en portions et saupoudrer de sucre glace (facultatif) avant de servir."
    ]
  },


{
  id: "arancini",
  title: "Arancini",
  image: "",
  time: "1 h",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "Riz arborio",
      quantity: 450,
      unit: "g",
    },
    {
      name: "Mozzarella",
      quantity: 115,
      unit: "g",
    },
    {
      name: "Parmesan",
      quantity: 25,
      unit: "g",
    },
    {
      name: "Poivre",
      quantity: 0.5,
      unit: "g",
    },
    {
      name: "Jambon",
      quantity: 115,
      unit: "g",
    },
    {
      name: "Beurre",
      quantity: 15,
      unit: "g",
    },
    {
      name: "Chapelure",
      quantity: 180,
      unit: "g",
    },
    {
      name: "Farine tout usage",
      quantity: 125,
      unit: "g",
    },
    {
      name: "oeufs",
      quantity: 2,
      unit: "",
    },
    {
      name: "Huile d'olive",
      quantity: 0,
      unit: "",
    },
    {
      name: "Huile végétale",
      quantity: 0,
      unit: "",
    },
    /**{
      name: "Sauce marinara",
      quantity: 500,
      unit: "ml",
    },**/
  ],

  instructions: [
    "Faire cuire le riz dans de l'eau salée jusqu'à ce qu'il soit tendre, puis bien l'égoutter.",
    "Ajouter la mozzarella râpée, le parmesan et le poivre noir fraîchement moulu.",
    "Laisser le mélange de riz refroidir.",
    "Mélanger le jambon haché avec le beurre pour préparer la garniture.",
    "Déposer la chapelure dans une assiette et la farine dans une autre.",
    "Battre légèrement les oeufs dans un bol.",
    "Prendre une cuillerée de riz refroidi dans la main et former un creux au centre.",
    "Ajouter un peu de garniture au centre, puis refermer avec le riz pour former une boulette.",
    "Continuer à former les boulettes avec le reste du riz et de la garniture.",
    "Rouler chaque boulette dans la farine.",
    "Tremper les boulettes dans les oeufs battus.",
    "Rouler les boulettes dans la chapelure afin de les enrober complètement.",
    "Chauffer l'huile végétale dans une grande poêle.",
    "Faire frire les arancini en les retournant régulièrement jusqu'à ce qu'ils soient bien dorés.",
    "Déposer les arancini sur du papier absorbant pour retirer l'excédent d'huile.",
    "Réchauffer la sauce marinara.",
    "Servir 3 à 4 arancini par assiette avec la sauce marinara."
  ]
},
{
  id: "arroz-con-pollo",
  title: "Arroz con pollo",
  image: "",
  time: "1 h",
  vegan: false,
  servings: 6,

  ingredients: [
    {
      name: "Poulet",
      quantity: 1500,
      unit: "g",
    },
    {
      name: "Sel",
      quantity: 0.5,
      unit: "g",
    },
    {
      name: "Poivre",
      quantity: 0.5,
      unit: "1",
    },
    {
      name: "Huile d'olive",
      quantity: 0,
      unit: "",
    },
    {
      name: "Ail",
      quantity: 4,
      unit: "gousses",
    },
    {
      name: "Oignon",
      quantity: 1,
      unit: "",
    },
    {
      name: "Poivron rouge",
      quantity: 225,
      unit: "g",
    },
    {
      name: "Tomates",
      quantity: 425,
      unit: "g",
    },
    {
      name: "Paprika doux",
      quantity: 7.5,
      unit: "g",
    },
    {
      name: "Coriandre",
      quantity: 14,
      unit: "g",
    },
    {
      name: "Bouillon de poulet",
      quantity: 1400,
      unit: "ml",
    },
    {
      name: "Safran",
      quantity: 8,
      unit: "filaments",
    },
    {
      name: "Riz",
      quantity: 370,
      unit: "g",
    },
    {
      name: "Petits pois",
      quantity: 225,
      unit: "g",
    },
  ],

  instructions: [
    "Assaisonner le poulet avec du sel et du poivre.",
    "Verser suffisamment d'huile d'olive dans une grande poêle pour couvrir légèrement le fond.",
    "Faire revenir le poulet dans l'huile jusqu'à ce qu'il soit bien doré.",
    "Retirer le poulet de la poêle ou le laisser dans celle-ci.",
    "Faire revenir l'ail jusqu'à ce qu'il soit doré, en faisant attention à ne pas le brûler.",
    "Ajouter l'oignon, le poivron rouge, les tomates et le paprika.",
    "Faire revenir les légumes jusqu'à ce qu'ils soient tendres.",
    "Transférer les ingrédients dans une grande casserole.",
    "Ajouter la coriandre, le bouillon de poulet et le safran.",
    "Porter le mélange à ébullition.",
    "Ajouter le riz et bien mélanger.",
    "Laisser mijoter à feu moyen jusqu'à ce que le riz soit cuit et que le liquide soit absorbé.",
    "Ajouter un peu de bouillon ou d'eau si le liquide s'évapore avant que le riz soit complètement cuit.",
    "Remettre le poulet dans la casserole s'il a été retiré précédemment.",
    "Recouvrir le poulet avec le riz.",
    "Laisser chauffer pendant 2 à 3 minutes.",
    "Répartir les petits pois sur le riz.",
    "Servir chaud."
  ]
},
{
  id: "magrets-de-canard-grilles-a-lasiatique",
  title: "Magrets de canard grillés à l'asiatique",
  image: "",
  time: "1 h 20 min",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "Magrets de canard",
      quantity: 4,
      unit: "",
    },
    {
      name: "Sel",
      quantity: 4,
      unit: "g",
    },
    {
      name: "Poivre noir",
      quantity: 4,
      unit: "g",
    },
    {
      name: "Gingembre moulu",
      quantity: 5,
      unit: "ml",
    },
    {
      name: "Piment rouge broyé",
      quantity: 7.5,
      unit: "ml",
    },
    {
      name: "Anis étoilé",
      quantity: 1,
      unit: "gousse",
    },
    {
      name: "Curry en poudre",
      quantity: 10,
      unit: "ml",
    },
    {
      name: "Cannelle moulue",
      quantity: 2.5,
      unit: "ml",
    },
    {
      name: "Basilic séché",
      quantity: 5,
      unit: "ml",
    },
    {
      name: "Ail en poudre",
      quantity: 10,
      unit: "ml",
    },
    {
      name: "Quartiers de mandarines au sirop",
      quantity: 120,
      unit: "ml",
    },
    {
      name: "Sauce soja",
      quantity: 15,
      unit: "ml",
    },
    {
      name: "Miel",
      quantity: 30,
      unit: "ml",
    },
    {
      name: "Pâte de piment",
      quantity: 22.5,
      unit: "ml",
    },
  ],

  instructions: [
    "Mélanger le sel, le poivre, le gingembre, les flocons de piment rouge, l'anis étoilé, le curry, la cannelle, le basilic et l'ail en poudre.",
    "Entailler la peau des magrets de canard en formant un motif en losanges, sans couper la chair.",
    "Frotter les deux côtés de chaque magret avec le mélange d'épices.",
    "Placer les magrets au réfrigérateur pendant au moins 1 heure.",
    "Préchauffer le gril à feu moyen-élevé.",
    "Mixer les quartiers de mandarines, la sauce soja, le miel et la pâte de piment jusqu'à obtenir une préparation lisse.",
    "Verser la préparation dans une grande casserole.",
    "Porter à ébullition à feu moyen-élevé.",
    "Faire cuire jusqu'à ce que la sauce ait réduit de moitié.",
    "Laisser refroidir la sauce avant de l'utiliser.",
    "Faire griller les magrets pendant 4 à 5 minutes en les badigeonnant généreusement de sauce une ou deux fois.",
    "Retourner les magrets et poursuivre la cuisson pendant 3 à 4 minutes en les badigeonnant encore de sauce une ou deux fois.",
    "Cuire jusqu'à obtenir une cuisson à point saignante.",
    "Porter à nouveau le reste de la sauce à ébullition.",
    "Verser la sauce dans un petit bol.",
    "Servir la sauce en accompagnement des magrets."
  ]
},

{
  id: "salade-de-poulet-asiatique",
  title: "Salade de poulet asiatique",
  image: "",
  time: "15 min",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "Brocoli",
      quantity: 135,
      unit: "g",
    },
    {
      name: "Pois mange-tout",
      quantity: 40,
      unit: "g",
    },
    {
      name: "Salade",
      quantity: 300,
      unit: "g",
    },
    {
      name: "Chou napa",
      quantity: 160,
      unit: "g",
    },
    {
      name: "Carottes",
      quantity: 55,
      unit: "g",
    },
    {
      name: "Poulet",
      quantity: 170,
      unit: "g",
    },
    {
      name: "Vinaigrette à salade",
      quantity: 180,
      unit: "ml",
    },
    {
      name: "Mangue",
      quantity: 1,
      unit: "",
    },
   /**  {
      name: "Craquelins au sésame",
      quantity: 0,
      unit: "",
    },*/
  ],

  instructions: [
    "Plonger rapidement le brocoli et les pois mange-tout dans une grande casserole d'eau bouillante pendant 30 secondes.",
    "Égoutter les légumes, puis les rincer rapidement à l'eau froide et bien les égoutter.",
    "Mélanger dans un grand saladier le brocoli, les pois mange-tout, la salade , le chou napa et les carottes.",
    "Ajouter le poulet grillé coupé en lanières.",
    "Verser la vinaigrette sur la salade et mélanger pour bien enrober tous les ingrédients.",
    "Répartir la salade dans quatre assiettes.",
    "Garnir chaque portion de mangue finement tranchée, si désiré.",
    "Servir avec des craquelins au sésame."
  ]
},
{
  id: "baguette",
  title: "Baguette",
  image: "",
  time: "7 h",
  vegan: true,
  servings: 1,

  ingredients: [
    {
      name: "farine",
      quantity: 500,
      unit: "g",
    },
    {
      name: "eau",
      quantity: 355,
      unit: "mL",
    },
    {
      name: "levure",/*levure sèche active*/
      quantity: 5,
      unit: "g",
    },
    {
      name: "sel",
      quantity: 13.5,
      unit: "g",
    },
    /* facultatif demandé dans la recette mais replacable par autre aliments
    {
      name: "huile végétale",
      quantity: 5,
      unit: "mL",
    },
    {
      name: "semoule de maïs",
      quantity: 10,
      unit: "g",
    },
    */
  ],

  instructions: [
    "Mélanger la levure avec 60 mL d'eau et laisser reposer pendant 3 minutes.",
    "Mélanger la farine et le sel dans un grand bol.",
    "Ajouter le reste de l'eau ainsi que le mélange de levure, puis mélanger jusqu'à obtenir une pâte homogène.",
    "Déposer la pâte sur un plan de travail légèrement fariné et la pétrir pendant 5 minutes, jusqu'à ce qu'elle soit souple et élastique.",
    "Couvrir la pâte avec un linge propre ou une pellicule plastique et laisser reposer pendant 25 minutes.",
    "Pétrir de nouveau la pâte pendant 6 à 8 minutes, jusqu'à ce qu'elle soit lisse et extensible.",
    "Déposer la pâte dans un bol légèrement huilé (facultatif), couvrir et laisser lever de 1 h 30 à 2 h, jusqu'à ce qu'elle double de volume.",
    "Dégonfler délicatement la pâte, la replier sur elle-même et former une boule.",
    "Couvrir et laisser lever pendant 1 h 15.",
    "Dégonfler une seconde fois, reformer une boule et laisser lever encore 1 heure.",
    "Déposer la pâte sur un plan de travail fariné et la diviser en trois portions égales d'environ 290 g chacune.",
    "Façonner chaque portion en rectangle, puis replier la pâte plusieurs fois sur elle-même en scellant les jointures afin de former un boudin.",
    "Laisser les pâtons reposer quelques minutes, puis les rouler délicatement jusqu'à obtenir des baguettes d'environ 35 cm de longueur.",
    "Déposer les baguettes sur une plaque recouverte de papier cuisson ou sur un moule à baguettes. Saupoudrer de semoule de maïs si désiré.",
    "Couvrir les baguettes et laisser lever pendant 30 à 40 minutes.",
    "Préchauffer le four à 260 °C environ 30 minutes avant la cuisson. Placer un récipient vide résistant à la chaleur dans le bas du four.",
    "Inciser le dessus de chaque baguette avec 3 à 5 entailles obliques.",
    "Enfourner les baguettes et verser environ 250 mL d'eau dans le récipient chaud afin de produire de la vapeur. Refermer rapidement la porte.",
    "Cuire pendant 12 minutes.",
    "Réduire la température du four à 200 °C et poursuivre la cuisson pendant 25 à 30 minutes, jusqu'à ce que les baguettes soient bien dorées et croustillantes.",
    "Déposer les baguettes sur une grille et laisser refroidir avant de servir."
  ]
},

{
  id: "baklava-i",
  title: "Baklava",
  image: "",
  time: "2 h",
  vegan: false,

  ingredients: [
    {
      name: "pâte phyllo",
      quantity: 454,
      unit: "g",
    },
    {
      name: "noix",
      quantity: 500,
      unit: "g",
    },
    {
      name: "sucre",
      quantity: 700,
      unit: "g",
    },
    {
      name: "clous de girofle moulus",
      quantity: 0.5,
      unit: "g",
    },
    {
      name: "cannelle moulue",
      quantity: 2.5,
      unit: "g",
    },
    {
      name: "beurre",
      quantity: 340,
      unit: "g",
    },
    {
      name: "eau",
      quantity: 590,
      unit: "mL",
    },
    {
      name: "jus de citron",
      quantity: 15,
      unit: "mL",
    },
    {
      name: "extrait de vanille",
      quantity: 5,
      unit: "mL",
    },
  ],

  instructions: [
    "Préchauffer le four à 150 °C.",
    "Hacher grossièrement les noix.",
    "Mélanger les noix, 100 g de sucre, la cannelle moulue et les clous de girofle moulus.",
    "Faire fondre le beurre.",
    "Beurrer généreusement un moule d'environ 36 × 27 cm.",
    "Déposer une feuille de pâte phyllo dans le fond du moule et replier l'excédent si nécessaire.",
    "Badigeonner la pâte de beurre fondu.",
    "Répéter l'opération jusqu'à obtenir six couches de pâte.",
    "Répartir uniformément une partie du mélange de noix sur la sixième feuille.",
    "Continuer à alterner les couches de pâte phyllo beurrées et le mélange de noix jusqu'à épuisement de la garniture.",
    "Terminer par six feuilles de pâte phyllo, chacune badigeonnée de beurre fondu.",
    "Découper le baklava en losanges à l'aide d'un couteau bien aiguisé.",
    "Cuire au four pendant environ 1 h 30, jusqu'à ce que le dessus soit légèrement doré.",
    "Pendant la cuisson, verser l'eau, le reste du sucre, le jus de citron et l'extrait de vanille dans une casserole.",
    "Porter à ébullition puis laisser mijoter pendant 10 minutes.",
    "Laisser refroidir le sirop.",
    "À la sortie du four, verser uniformément le sirop refroidi sur le baklava encore chaud.",
    "Laisser reposer jusqu'à absorption complète du sirop avant de servir."
  ]
},
{
  id: "gateau-aux-bananes",
  title: "Gâteau aux bananes",
  image: "",
  time: "1 h 30 min",
  vegan: false,
  servings: 9,

  ingredients: [
    {
      name: "farine",
      quantity: 250,
      unit: "g",
    },
    {
      name: "levure", /*chimique*/
      quantity: 6,
      unit: "g",
    },
    {
      name: "bicarbonate de soude",
      quantity: 2.5,
      unit: "g",
    },
    {
      name: "sel",
      quantity: 2.5,
      unit: "g",
    },
    {
      name: "cannelle", /*moulue*/
      quantity: 1.5,
      unit: "g",
    },
    {
      name: "beurre",
      quantity: 115,
      unit: "g",
    },
    {
      name: "sucre",
      quantity: 200,
      unit: "g",
    },
    {
      name: "oeufs",
      quantity: 2,
      unit: "",
    },
    {
      name: "extrait de vanille",
      quantity: 7.5,
      unit: "mL",
    },
    {
      name: "bananes",
      quantity: 3,
      unit: "",
    },
    {
      name: "babeurre",
      quantity: 120,
      unit: "mL",
    },
  ],

  instructions: [
    "Préchauffer le four à 175 °C. Beurrer et fariner un moule à gâteau rond d'environ 23 cm.",
    "Mélanger la farine, la levure chimique, le bicarbonate de soude, le sel et la cannelle moulue dans un bol.",
    "Battre le beurre et le sucre jusqu'à obtenir un mélange léger et mousseux.",
    "Ajouter les oeufs, un à la fois, puis incorporer l'extrait de vanille.",
    "Écraser les bananes et les incorporer au mélange.",
    "Ajouter progressivement les ingrédients secs en alternant avec le babeurre, en commençant et en terminant par les ingrédients secs. Mélanger juste assez pour obtenir une pâte homogène.",
    "Verser la pâte dans le moule et lisser la surface.",
    "Cuire au four pendant 45 à 50 minutes, ou jusqu'à ce qu'un cure-dent inséré au centre en ressorte propre.",
    "Laisser refroidir le gâteau dans le moule pendant 10 minutes.",
    "Démouler sur une grille et laisser refroidir complètement avant de servir."
    /* facultatif
    "Servir nature ou garnir d'un glaçage au fromage à la crème ou de sucre glace."
    */
  ]
},
{
  id: "muffins-aux-bananes-et-aux-pepites-de-chocolat",
  title: "Muffins bananes et pepites de chocolat",
  image: "",
  time: "30",
  vegan: false,
  servings: 12,

  ingredients: [
    {
      name: "farine",
      quantity: 250,
      unit: "g",
    },
    {
      name: "sucre",
      quantity: 110,
      unit: "g",
    },
    {
      name: "levure",/*chimique*/
      quantity: 15,
      unit: "g",
    },
    {
      name: "pepites de chocolat ",/*mi-sucré*/
      quantity: 40,
      unit: "g",
    },
    {
      name: "oeuf",
      quantity: 1,
      unit: "",
    },
    {
      name: "huile végétale",
      quantity: 60,
      unit: "mL",
    },
    {
      name: "lait",
      quantity: 60,
      unit: "mL",
    },
    {
      name: "bananes",
      quantity: 250,
      unit: "g",
    },
  ],

  instructions: [
    "Préchauffer le four à 205 °C.",
    "Mélanger la farine, le sucre, la levure chimique et les pepites de chocolat dans un grand bol. Former un puits au centre.",
    "Battre l'oeuf dans un petit bol jusqu'à ce qu'il soit mousseux.",
    "Ajouter l'huile de cuisson, le lait et les bananes écrasées à l'oeuf, puis mélanger.",
    "Verser le mélange liquide dans le puits des ingrédients secs.",
    "Mélanger juste assez pour humidifier les ingrédients. La pâte doit rester légèrement grumeleuse.",
    "Répartir la pâte dans des moules à muffins graissés en les remplissant aux trois quarts.",
    "Cuire au four pendant 15 à 20 minutes.",
    "Laisser légèrement refroidir et servir, de préférence encore chaud."
  ]
},
{
  id: "muffins-aux-bananes-et-aux-noix",
  title: "Muffins aux bananes et aux noix",
  image: "",
  time: "40 min",
  vegan: false,
  servings: 20,

  ingredients: [
    {
      name: "œufs",
      quantity: 2,
      unit: "",
    },
    {
      name: "miel", // ou mélasse ou sucre
      quantity: 15,
      unit: "mL",
    },
    {
      name: "lait", // ou boisson de soya
      quantity: 250,
      unit: "mL",
    },
    {
      name: "huile végétale",
      quantity: 60,
      unit: "mL",
    },
    {
      name: "bananes",
      quantity: 2,
      unit: "",
    },
    {
      name: "farine blanche",
      quantity: 160,
      unit: "g",
    },
    {
      name: "farine de blé entier",
      quantity: 320,
      unit: "g",
    },
    {
      name: "sel",
      quantity: 2.5,
      unit: "g",
    },
    {
      name: "levure chimique",
      quantity: 10,
      unit: "g",
    },
    {
      name: "noix", // par exemple des noix de Grenoble
      quantity: 120,
      unit: "g",
    },

    /* Facultatif
    {
      name: "sucre",
      quantity: 0,
      unit: "au goût",
    },*/
  ],

  instructions: [
    "Préchauffer le four à 200 °C.",
    "Graisser un moule à muffins.",
    "Écraser les bananes.",
    "Mélanger les œufs, le miel, le lait, l'huile végétale et les bananes.",
    "Mélanger la farine blanche, la farine de blé entier, le sel et la levure chimique.",
    "Incorporer les ingrédients secs aux ingrédients liquides en mélangeant délicatement. La pâte peut rester légèrement grumeleuse.",
    "Ajouter les noix et mélanger délicatement.",
    "Ajouter du sucre au goût, si désiré.",
    "Répartir la pâte dans les moules à muffins en les remplissant aux trois quarts.",
    "Cuire au four de 20 à 25 minutes.",
    "Laisser refroidir avant de servir.",
  ],
},
{
  id: "poulet-roti-aux-40-gousses-dail",
  title: "Poulet rôti aux 40 gousses d'ail",
  image: "",
  time: "2 h",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "poulet entier",
      quantity: 1,
      unit: "",
    },
    {
      name: "mélange d'épices pour poulet", /*see Assaisonnement pour poulet rôti*/
      quantity: 60,
      unit: "mL",
    },
    {
      name: "ail",
      quantity: 40,
      unit: "",
    },
    {
      name: "huile d'olive",
      quantity: 0,
      unit: "",
    },
    {
      name: "citron",
      quantity: 1,
      unit: "",
    },
    {
      name: "thym",
      quantity: 0.5,
      unit: "branche",
    },
    {
      name: "romarin",
      quantity: 5,
      unit: "brins",
    },
    {
      name: "persil", 
      quantity: 20, /*un demi bouquet*/
      unit: "g",
    },
  ],

  instructions: [
    "Soulever délicatement la peau du poulet et répartir l'assaisonnement pour poulet rôti sous la peau.",
    "Réfrigérer le poulet pendant au moins 1 heure.",
    "Attacher les cuisses du poulet avec de la ficelle de cuisine et replier les extrémités des ailes sous le dos.",
    "Écraser les gousses d'ail.",
    "Chauffer l'ail au micro-ondes à faible puissance pendant 6 minutes.",
    "Placer rapidement l'ail dans la cavité du poulet.",
    "Enrober le poulet d'huile d'olive.",
    "Trancher finement le citron.",
    "Placer le thym, le romarin et le persil au fond d'un plat à rôtir, puis déposer les tranches de citron par-dessus.",
    "Déposer le poulet dans le plat, poitrine vers le haut.",
    "Cuire au four à 190 °C pendant 45 minutes.",
    "Augmenter la température du four à 220 °C et poursuivre la cuisson pendant environ 45 minutes.",
    "Vérifier que la température interne atteint 75 °C dans la partie la plus épaisse de la cuisse et de la poitrine et que les jus sont clairs.",
    "Laisser reposer le poulet pendant 10 minutes avant de le servir.",
  ],
},
{
  id: "assaisonnement-pour-poulet-roti",
  title: "Assaisonnement pour poulet rôti",
  image: "",
  time: "10 min",
  vegan: true,
  servings: 0,

  ingredients: [
    {
      name: "paprika",
      quantity: 250,
      unit: "mL",
    },
    {
      name: "sel",
      quantity: 62.5,
      unit: "mL",
    },
    {
      name: "poivre au citron",
      quantity: 62.5,
      unit: "mL",
    },
    {
      name: "romarin séché",
      quantity: 62.5,
      unit: "mL",
    },
    {
      name: "thym séché",
      quantity: 62.5,
      unit: "mL",
    },
    {
      name: "poudre de chipotle",
      quantity: 62.5,
      unit: "mL",
    },
  ],

  instructions: [
    "Mélanger le paprika, le sel, le poivre au citron, le romarin séché, le thym séché et la poudre de chipotle.",
    "Transférer le mélange dans un contenant hermétique.",
  ],
},
{
  id: "macaroni-au-fromage",
  title: "Macaroni au fromage",
  image: "",
  time: "30 min",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "macaroni",
      quantity: 227,
      unit: "g",
    },
    {
      name: "crème",
      quantity: 170,
      unit: "g",
    },
    {
      name: "sel",
      quantity: 2.5,
      unit: "mL",
    },
    {
      name: "fontina",
      quantity: 60,
      unit: "g",
    },
    {
      name: "gruyère",
      quantity: 60,
      unit: "g",
    },
    {
      name: "mascarpone",
      quantity: 150,
      unit: "g",
    },
    {
      name: "fromage à la crème",
      quantity: 150,
      unit: "g",
    },
    {
      name: "fromage suisse",
      quantity: 4,
      unit: "",
    },
    {
      name: "beurre non salé",
      quantity: 150,
      unit: "g",
    },
    {
      name: "farine",
      quantity: 30,
      unit: "mL",
    },
    /*{
      name: "sauce Tabasco",
      quantity: 5,
      unit: "mL",
    },*/
  ],

  instructions: [
    "Porter de l'eau salée à ébullition.",
    "Cuire les macaronis dans l'eau bouillante jusqu'à ce qu'ils soient al dente.",
    "Égoutter les macaronis et les rincer à l'eau froide.",
    "Faire fondre 30 g de beurre dans une casserole à fond épais à feu moyen.",
    "Lorsque le beurre cesse de bouillonner, incorporer la farine en fouettant continuellement.",
    "Cuire en fouettant jusqu'à ce que le mélange soit légèrement doré.",
    "Ajouter la crème, le sel, la fontina, le gruyère, le mascarpone, le fromage à la crème, le fromage suisse.",
    "Faire fondre les fromages en remuant jusqu'à obtenir une sauce lisse.",
    "Ajouter progressivement le reste du beurre en fouettant continuellement jusqu'à ce qu'il soit complètement fondu.",
    "Incorporer délicatement les macaronis à la sauce.",
    "Servir chaud.",
  ],
},
{
  id: "pain-afghan",
  title: "Pain afghan",
  image: "",
  time: "2 h 30 min",
  vegan: false,
  servings: 8,

  ingredients: [
    {
      name: "eau",
      quantity: 390,
      unit: "g",
    },
    {
      name: "levure sèche",
      quantity: 7,
      unit: "g",
    },
    {
      name: "sucre",
      quantity: 14,
      unit: "g",
    },
    {
      name: "farine",
      quantity: 550,
      unit: "g",
    },
    {
      name: "sel",
      quantity: 18,
      unit: "g",
    },
    {
      name: "bicarbonate de soude",
      quantity: 7,
      unit: "g",
    },
    {
      name: "huile de maïs",
      quantity: 55,
      unit: "g",
    },
    {
      name: "jaune d'œuf",
      quantity: 1,
      unit: "",
    },
    {
      name: "graines de cumin noir",
      quantity: 30,
      unit: "g",
    },
  ],

  instructions: [
    "Mélanger 125 g d'eau, la levure et le sucre.",
    "Laisser reposer pendant 10 minutes, jusqu'à ce que le mélange devienne mousseux.",
    "Verser la farine dans un grand bol et incorporer le sel et le bicarbonate de soude.",
    "Creuser un puits au centre et y verser l'huile de maïs ainsi que le mélange de levure.",
    "Ajouter progressivement le reste de l'eau jusqu'à obtenir une pâte souple pouvant être façonnée.",
    "Pétrir la pâte pendant 5 minutes.",
    "Couvrir la pâte et la laisser lever pendant 1 h 30.",
    "Mélanger le jaune d'œuf avec 15 g d'eau pour préparer la dorure.",
    "Diviser la pâte en 8 portions et façonner chacune en boule.",
    "Abaisser chaque boule pour former un pain ovale d'environ 20 cm de long.",
    "Faire des entailles longitudinales sur le dessus de chaque pain.",
    "Badigeonner les pains de dorure.",
    "Parsemer de graines de cumin noir.",
    "Préchauffer le four à 175 °C.",
    "Cuire les pains pendant environ 25 minutes, jusqu'à ce qu'ils soient dorés.",
  ],
},
{
  id: "ragoût-africain-au-chou",
  title: "Ragoût africain au chou",
  image: "",
  time: "30 min",
  vegan: false,
  ingredients: [
    {
      name: "huile d'avocat",
      quantity: 30,
      unit: "g",
    },
    {
      name: "oignon",
      quantity: 2,
      unit: "",
    },
    {
      name: "ail",
      quantity: 4,
      unit: "",
    },
    {
      name: "céleri",
      quantity: 3,
      unit: "",
    },
    {
      name: "chou",
      quantity: 1,
      unit: "",
    },
    {
      name: "pomme de terre",
      quantity: 2,
      unit: "",
    },
    {
      name: "carotte",
      quantity: 3,
      unit: "",
    },
    {
      name: "assaisonnement italien",
      quantity: 5,
      unit: "g",
    },
    {
      name: "oignon en poudre",
      quantity: 5,
      unit: "g",
    },
    {
      name: "ail en poudre",
      quantity: 6,
      unit: "g",
    },
    {
      name: "cube de bouillon de poulet",
      quantity: 1,
      unit: "",
    },
    {
      name: "paprika fumé",
      quantity: 2,
      unit: "g",
    },
    {
      name: "eau",
      quantity: 250,
      unit: "ml",
    },
  ],

  instructions: [
    "Chauffer l'huile d'avocat dans une grande casserole à feu moyen.",
    "Ajouter les oignons hachés et cuire pendant environ 2 minutes, jusqu'à ce qu'ils soient tendres.",
    "Ajouter l'ail et le céleri, puis cuire jusqu'à ce qu'ils soient parfumés.",
    "Ajouter le chou, les pommes de terre, les carottes, l'assaisonnement italien, l'oignon en poudre, l'ail en poudre, le bouillon de poulet, le paprika fumé et l'eau.",
    "Couvrir la casserole et porter à ébullition.",
    "Réduire le feu et laisser mijoter pendant environ 20 minutes, jusqu'à ce que les légumes soient tendres.",
    "Goûter et ajuster l'assaisonnement si nécessaire.",
    "Retirer du feu et servir chaud.",
  ],
},
{
  id: "akabenz",
  title: "Akabenz",
  image: "",
  time: "30 min",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "farine",
      quantity: 125,
      unit: "g",
    },
    {
      name: "sel",
      quantity: 5,
      unit: "g",
    },
    {
      name: "poivre",
      quantity: 2,
      unit: "g",
    },
    {
      name: "paprika",
      quantity: 2,
      unit: "g",
    },
    {
      name: "ail en poudre",
      quantity: 3,
      unit: "g",
    },
    {
      name: "oignon en poudre",
      quantity: 3,
      unit: "g",
    },
    {
      name: "thym séché",
      quantity: 1,
      unit: "g",
    },
    {
      name: "origan séché",
      quantity: 1,
      unit: "g",
    },
    {
      name: "poulet",
      quantity: 900,
      unit: "g",
    },
    {
      name: "huile végétale",
      quantity: 500,
      unit: "ml",
    },
  ],

  instructions: [
    "Mélanger la farine, le sel, le poivre noir, le paprika, l'ail en poudre, l'oignon en poudre, le thym séché et l'origan séché dans un grand bol.",
    "Enrober chaque morceau de poulet du mélange de farine assaisonnée en retirant l'excédent.",
    "Chauffer l'huile végétale dans une grande poêle à feu moyen-vif jusqu'à ce qu'elle soit chaude, sans la laisser fumer.",
    "Déposer délicatement les morceaux de poulet dans l'huile chaude sans surcharger la poêle. Cuire en plusieurs fois si nécessaire.",
    "Faire frire le poulet pendant 6 à 8 minutes de chaque côté, jusqu'à ce qu'il soit bien doré et complètement cuit.",
    "Vérifier que la température interne du poulet atteint 74 °C.",
    "Déposer le poulet cuit sur une assiette recouverte de papier absorbant afin d'éliminer l'excédent d'huile.",
    "Servir immédiatement, pendant que le poulet est encore chaud et croustillant.",
  ],
},
{
  id: "qofte-boulettes-de-viande-frites-albanaises",
  title: "Qofte (Boulettes de viande frites albanaises)",
  image: "",
  time: "30 min",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "pain ",/*rassis*/
      quantity: 1,
      unit: "",
    },
    {
      name: "viande hachée",
      quantity: 454,
      unit: "g",
    },
    {
      name: "oignon",
      quantity: 1,
      unit: "",
    },
    {
      name: "feta",
      quantity: 30,
      unit: "g",
    },
    {
      name: "chapelure",
      quantity: 15,
      unit: "g",
    },
    {
      name: "huile", /*beurre fondu*/
      quantity: 30,
      unit: "g",
    },
    {
      name: "persil",
      quantity: 4,
      unit: "g",
    },
    {
      name: "sel",
      quantity: 2,
      unit: "g",
    },
    {
      name: "poivre",
      quantity: 1,
      unit: "g",
    },
    {
      name: "menthe",
      quantity: 2,
      unit: "g",
    },
    {
      name: "origan",
      quantity: 1,
      unit: "g",
    },
    {
      name: "farine",
      quantity: 125,
      unit: "g",
    },
    {
      name: "huile d'olive",
      quantity: 250,
      unit: "ml",
    },
  ],

  instructions: [
    "Faire tremper le pain dans l'eau, puis bien l'essorer.",
    "Mélanger le pain essoré, la viande hachée, la chapelure, l'huile ou le beurre fondu, l'oignon râpé, la feta, le persil, le sel, le poivre et la menthe.",
    "Mélanger soigneusement jusqu'à obtenir une préparation homogène.",
    "Façonner la préparation en galettes d'environ 2,5 cm d'épaisseur.",
    "Assaisonner les galettes avec du sel, du poivre et de l'origan.",
    "Enrober chaque galette de farine.",
    "Chauffer l'huile d'olive dans une grande poêle.",
    "Faire frire les galettes dans l'huile chaude jusqu'à ce qu'elles soient bien dorées et complètement cuites.",
    "Servir chaud, accompagné de frites ou de purée de pommes de terre.",
  ],
},
{
  id: "gjelle-me-arra",
  title: "Gjellë me arra (Viande aux noix)",
  image: "",
  time: "30 min",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "farine",
      quantity: 16,
      unit: "g",
    },
    {
      name: "noix",
      quantity: 15,
      unit: "",
    },
    {
      name: "jaunes d'œufs",
      quantity: 2,
      unit: "",
    },
    {
      name: "ail",
      quantity: 1,
      unit: "",
    },
    {
      name: "beurre",
      quantity: 113,
      unit: "g",
    },
    {
      name: "veau", /*poulet*/
      quantity: 1134,
      unit: "g",
    },
  ],

  instructions: [
    "Placer le veau ou le poulet dans une casserole et cuire à feu moyen jusqu'à ce que la viande soit tendre.",
    "Retirer la viande et la réserver dans un plat en conservant le jus de cuisson dans la casserole.",
    "Dans une autre casserole, faire chauffer la farine en remuant jusqu'à ce qu'elle soit légèrement dorée, sans la faire brûler.",
    "Ajouter la moitié du beurre et mélanger.",
    "Ajouter les noix, l'ail et les jaunes d'œufs battus en remuant constamment.",
    "Ajouter progressivement le jus de cuisson de la viande et mélanger jusqu'à ce que la préparation épaississe.",
    "Retirer immédiatement du feu pour éviter que les jaunes d'œufs ne coagulent.",
    "Incorporer délicatement la viande à la préparation.",
    "Faire fondre le reste du beurre dans une poêle jusqu'à ce qu'il soit doré.",
    "Verser le beurre doré sur la préparation avant de servir.",
  ],
},
{
  id: "hoshaf-me-fiq-te-thate",
  title: "Hoshaf me fiq të thatë",
  image: "",
  time: "15 min",
  vegan: false,
  servings: 4,

  ingredients: [
    {
      name: "sucre",
      quantity: 240,
      unit: "g",
    },
    {
      name: "lait",
      quantity: 900,
      unit: "ml",
    },
    {
      name: "figues sèches",
      quantity: 240,
      unit: "g",
    },
    {
      name: "cannelle", /*moulue*/
      quantity: 1,
      unit: "g",
    },
  ],

  instructions: [
   "Râper finement les figues sèches.",
    "Verser le lait dans une casserole et ajouter le sucre.",
    "Porter le lait à ébullition en remuant pour dissoudre complètement le sucre.",
    "Retirer la casserole du feu.",
    "Ajouter progressivement les figues sèches râpées tout en remuant continuellement.",
    "Répartir la préparation dans 4 petits plats allant au four.",
    "Préchauffer le four à 180 °C.",
    "Cuire pendant 10 minutes.",
    "Laisser refroidir, puis placer au réfrigérateur jusqu'à ce que le dessert soit bien froid.",
    "Saupoudrer de cannelle moulue.",
    "Servir froid.",
  ],
},
{
  id: "gateau-aux-amandes",
  title: "Gâteau aux amandes",
  image: "",
  time: "1 h 30 min",
  vegan: false,
  servings: 1,

  ingredients: [
    {
      name: "beurre non salé",
      quantity: 227,
      unit: "g",
    },
    {
      name: "sucre",
      quantity: 300,
      unit: "g",
    },
    {
      name: "œufs",
      quantity: 6,
      unit: "",
    },
    {
      name: "extrait de vanille",
      quantity: 5,
      unit: "g",
    },
    {
      name: "poudre d'amandes",
      quantity: 300,
      unit: "g",
    },
    {
      name: "farine",
      quantity: 105,
      unit: "g",
    },
    /*{
      name: "sucre glace",
      quantity: 20,
      unit: "g",
    },*/
  ],

  instructions: [
    "Préchauffer le four à 180 °C.",
    "Laisser le beurre et les œufs revenir à température ambiante.",
    "Crémer le beurre et le sucre à vitesse moyenne-élevée jusqu'à obtenir une préparation légère et aérienne, en raclant régulièrement les parois du bol.",
    "Fouetter les œufs avec l'extrait de vanille.",
    "Incorporer progressivement les œufs au mélange de beurre et de sucre afin d'éviter que la préparation ne tranche.",
    "Incorporer la poudre d'amandes à basse vitesse.",
    "Ajouter la farine et l'incorporer délicatement sans trop mélanger.",
    "Chemiser le fond d'un moule carré de 20 à 23 cm de côté avec du papier cuisson, puis graisser légèrement le papier et les parois.",
    "Verser la pâte dans le moule et lisser la surface.",
    "Cuire au four pendant environ 30 à 40 minutes, jusqu'à ce que le gâteau soit doré et qu'une lame ou une brochette plantée au centre ressorte propre.",
    "Laisser refroidir complètement le gâteau dans le moule.",
    "Détacher délicatement les bords avec un couteau, puis démouler le gâteau et retirer le papier cuisson.",
    "Saupoudrer le dessus de sucre glace avant de servir.",
  ],
},
{
  id: "brownies-fondants-aux-amandes",
  title: "Brownies fondants aux amandes",
  image: "",
  time: "40 minutes",
  vegan: false,
  servings: 8,
  ingredients: [
    { name: "beurre", quantity: 170, unit: "g" },
    { name: "sucre blanc", quantity: 200, unit: "g" },
    { name: "huile de canola", quantity: 22, unit: "ml" },
    { name: "lait", quantity: 80, unit: "ml" },
    { name: "œufs", quantity: 2, unit: "" },
    { name: "cacao ", quantity: 30, unit: "g" },
    { name: "farine", quantity: 90, unit: "g" },
    { name: "extrait d’amande", quantity: 2.5, unit: "ml" },
    { name: "extrait de vanille", quantity: 5, unit: "ml" }
  ],
  instructions: [
    "Préchauffer le four à 175 °C.",
    "Crémer le beurre avec le sucre jusqu’à obtenir une préparation homogène et légèrement mousseuse.",
    "Incorporer l’huile et le lait, puis bien mélanger.",
    "Ajouter les œufs un à un en mélangeant bien après chaque ajout.",
    "Incorporer l’extrait de vanille et l’extrait d’amande.",
    "Ajouter le cacao en poudre et la farine tamisée, puis mélanger juste assez pour obtenir une pâte homogène.",
    "Verser la pâte dans un moule rectangulaire légèrement graissé.",
    "Cuire pendant 28 à 30 minutes, jusqu’à ce qu’un cure-dent inséré au centre ressorte avec seulement quelques miettes humides.",
    "Laisser les brownies refroidir complètement avant de les découper."
  ]
},
{
  id: "sauce-alfredo-americaine",
  title: "Sauce Alfredo américaine",
  image: "",
  time: "25 minutes",
  vegan: false,
  servings: 6,
  ingredients: [
    { name: "crème 35%", quantity: 400, unit: "ml" },
    { name: "beurre non salé", quantity: 85, unit: "g" },
    { name: "parmesan", quantity: 240, unit: "g" },
    { name: "sel", quantity: 5, unit: "g" },
    { name: "poivre", quantity: 1, unit: "g" },
    { name: "noix de muscade", quantity: 0.5, unit: "g" }
  ],
  instructions: [
    "Dans une grande casserole, verser 300 ml de crème 35% et ajouter le beurre.",
    "Faire chauffer à feu doux en remuant régulièrement, jusqu'à ce que le beurre soit complètement fondu et que la crème commence tout juste à frémir.",
    "Retirer la casserole du feu lorsque le beurre est parfaitement incorporé à la crème.",
    "Pendant ce temps, cuire les pâtes dans une grande quantité d'eau salée jusqu'à ce qu'elles soient légèrement moins cuites qu'al dente.",
    "Égoutter les pâtes.",
    "Remettre les pâtes dans la casserole avec les 100 ml de crème restants, le parmesan râpé, le sel, la noix de muscade et quelques tours de moulin à poivre.",
    "Faire chauffer à feu doux pendant 1 à 2 minutes en mélangeant continuellement, jusqu'à ce que le parmesan soit fondu et que la sauce épaississe légèrement.",
    "Servir immédiatement."
  ]
},
{
  id: "pain-a-lanis-penia",
  title: "Pain à l'anis (Penia)",
  image: "",
  time: "14 h 45 min",
  vegan: false,
  servings: 7,
  ingredients: [
    { name: "œufs", quantity: 6, unit: "" },
    { name: "sucre blanc", quantity: 200, unit: "g" },
    { name: "beurre", quantity: 120, unit: "g" },
    { name: "levure de boulanger", quantity: 25.5, unit: "g" },
    { name: "eau", quantity: 59, unit: "ml" },
    { name: "citron", quantity: 2, unit: "" },
    { name: "extrait d'anis", quantity: 30, unit: "ml" },
    { name: "graines d'anis", quantity: 40, unit: "g" },
    { name: "sel", quantity: 6, unit: "g" },
    { name: "farine de blé", quantity: 688, unit: "g" }
  ],
  instructions: [
    "Dissoudre la levure de boulanger dans l'eau tiède, puis laisser reposer quelques minutes.",
    "Battre les œufs jusqu'à ce qu'ils deviennent mousseux.",
    "Ajouter le sucre et continuer à battre.",
    "Ajouter le beurre fondu et le sel, puis bien mélanger.",
    "Ajouter le jus et le zeste des citrons, ainsi que l'extrait d'anis et les graines d'anis.",
    "Ajouter le mélange de levure et d'eau, puis mélanger jusqu'à obtenir une préparation homogène.",
    "Ajouter progressivement la farine et mélanger jusqu'à obtenir une pâte suffisamment ferme pour être pétrie.",
    "Pétrir soigneusement jusqu'à ce que la pâte reprenne sa forme lorsqu'on appuie dessus avec le doigt.",
    "Couvrir la pâte et la laisser lever pendant environ 12 heures, ou jusqu'à ce qu'elle ait doublé de volume.",
    "Diviser la pâte en 7 portions égales.",
    "Façonner chaque portion en forme de poupée.",
    "Couvrir et laisser lever pendant 2 à 3 heures.",
    "Préchauffer le four à 150 °C.",
    "Cuire pendant 15 à 20 minutes, jusqu'à ce que les pains soient légèrement dorés."
  ]
},
{
  id: "gelee-de-pommes",
  title: "Gelée de pommes",
  image: "",
  time: "3h",
  vegan: false,
  servings: 6,
  ingredients: [
    { name: "pommes", quantity: 450, unit: "g" },
    { name: "sucre blanc", quantity: 85, unit: "g" },
    { name: "eau", quantity: 270, unit: "ml" },
    { name: "citron", quantity: 1, unit: "" },
    { name: "gélatine", quantity: 14, unit: "g" }
  ],
  instructions: [
    "Éplucher et couper les pommes en tranches.",
    "Mettre les pommes dans une casserole avec le sucre, 240 ml d'eau, le jus et le zeste du citron.",
    "Faire mijoter jusqu'à ce que les pommes soient tendres.",
    "Passer la préparation à travers une passoire fine afin d'obtenir une préparation lisse.",
    "Faire tremper les feuilles de gélatine dans 30 ml d'eau froide pendant quelques minutes.",
    "Faire fondre la gélatine hydratée, puis la filtrer.",
    "Incorporer la gélatine fondue à la préparation aux pommes.",
    "Verser la préparation dans un moule.",
    "Placer au réfrigérateur pendant quelques heures, jusqu'à ce que la gelée soit complètement prise."
  ]
},
{
  id: "pudding-aux-pommes",
  title: "Pudding aux pommes",
  image: "",
  time: "1 h",
  vegan: false,
  servings: 8,
  ingredients: [
    { name: "sucre blanc", quantity: 150, unit: "g" },
    { name: "œuf", quantity: 1, unit: "" },
    { name: "farine de blé", quantity: 30, unit: "g" },
    { name: "levure chimique", quantity: 5, unit: "g" },
    { name: "sel", quantity: 1, unit: "g" },
    { name: "vanille", quantity: 5, unit: "ml" },
    { name: "noix", quantity: 120, unit: "g" },
    { name: "pommes", quantity: 60, unit: "g" }
  ],
  instructions: [
    "Préchauffer le four à 160 °C.",
    "Battre le sucre et l'œuf jusqu'à obtenir une préparation lisse.",
    "Incorporer la farine, la levure chimique, le sel et la vanille.",
    "Ajouter les noix et les pommes, puis mélanger délicatement.",
    "Verser la préparation dans un moule graissé de 23 × 23 cm.",
    "Cuire pendant environ 30 minutes, jusqu'à ce que le pudding soit cuit au centre.",
    "Laisser légèrement refroidir avant de servir."
  ]
},
{
  id: "soupe-dasperges",
  title: "Soupe d'asperges",
  image: "",
  time: "1 h",
  vegan: false,
  servings: 4,
  ingredients: [
    {
      name: "asperges",
      quantity: 12,
      unit: ""
    },
    {
      name: "eau",
      quantity: 500,
      unit: "ml"
    },
    {
      name: "échalote",
      quantity: 1,
      unit: ""
    },
    {
      name: "beurre",
      quantity: 45,
      unit: "g"
    },
    {
      name: "crème",
      quantity: 60,
      unit: "ml"
    },
    {
      name: "sel",
      quantity: 3,
      unit: "g"
    },
    {
      name: "poivre",
      quantity: 3,
      unit: "g"
    },
    {
      name: "piment de Cayenne",
      quantity: 3,
      unit: "g"
    }
  ],
  instructions: [
    "Casser ou couper les extrémités fibreuses des asperges.",
    "Porter l'eau à ébullition dans une casserole moyenne et la saler légèrement. Ajouter les asperges et cuire à petits bouillons pendant 10 minutes. Retirer les asperges et réserver l'eau de cuisson.",
    "Faire fondre le beurre dans une grande casserole. Ajouter l'échalote et la faire cuire doucement jusqu'à ce qu'elle soit tendre sans la laisser colorer. Ajouter les asperges cuites et 250 ml d'eau de cuisson. Porter à ébullition, puis cuire à petits bouillons pendant 5 minutes.",
    "Retirer du feu et filtrer la préparation à travers une passoire à mailles moyennes en conservant le liquide.",
    "Mixer les asperges avec suffisamment de liquide réservé pour obtenir une purée lisse.",
    "Passer la purée à travers la passoire dans la casserole en la pressant avec une spatule souple ou une cuillère en bois. Jeter les fibres restées dans la passoire.",
    "Ajouter la crème et suffisamment d'eau de cuisson restante pour obtenir la consistance souhaitée. Assaisonner avec du sel, du poivre noir fraîchement moulu et du piment de Cayenne.",
    "Réchauffer doucement à feu doux sans laisser bouillir.",
    "Servir chaud ou froid. Pour une version froide, laisser refroidir puis réfrigérer jusqu'à ce que la soupe soit complètement froide."
  ]
},
{
  id: "cotes-levees-de-porc-au-four",
  title: "Côtes levées de porc au four",
  image: "",
  time: "7 h 30 min",
  vegan: false,

  ingredients: [
    { name: "côtes levées de porc", quantity: 2, unit: "" },
    { name: "paprika fumé", quantity: 25, unit: "g" },
    { name: "poudre d'ail", quantity: 16, unit: "g" },
    { name: "poudre de chili", quantity: 16, unit: "g" },
    { name: "poivre de Cayenne", quantity: 16, unit: "g" },
    { name: "pâte de tomate", quantity: 360, unit: "g" },
    { name: "mélasse", quantity: 85, unit: "g" },
    { name: "cassonade", quantity: 100, unit: "g" },
    { name: "vinaigre de cidre", quantity: 60, unit: "ml" },
    { name: "sel", quantity: 18, unit: "g" },
    { name: "poivre noir", quantity: 7, unit: "g" }
  ],
  instructions: [
    "Retirer la membrane située sur la face intérieure des côtes levées.",
    "Mélanger 50 g de cassonade avec le paprika fumé, la poudre de chili, la poudre d'ail, le poivre de Cayenne, le sel et le poivre noir.",
    "Frotter généreusement les côtes levées avec le mélange d'épices.",
    "Couvrir et réfrigérer pendant au moins 1 heure.",
    "Mélanger le reste de la cassonade avec la pâte de tomate, la mélasse et le vinaigre de cidre dans une casserole.",
    "Porter à ébullition à feu vif, puis laisser cuire jusqu'à ce que la sauce ait réduit de moitié. Réserver.",
    "Préchauffer le four à 120 °C.",
    "Déposer les côtes levées dans un plat à rôtir, côté viande vers le haut.",
    "Couvrir hermétiquement le plat avec du papier aluminium.",
    "Cuire au four pendant 5 heures.",
    "Retirer le papier aluminium et badigeonner généreusement les côtes avec la sauce.",
    "Augmenter la température du four à 180 °C et poursuivre la cuisson pendant 30 minutes en badigeonnant les côtes avec la sauce toutes les 10 minutes.",
    "Passer les côtes sous le gril pendant 2 à 5 minutes, jusqu'à ce que la sauce soit caramélisée et que la surface soit bien dorée.",
    "Laisser reposer les côtes pendant 10 minutes.",
    "Découper les côtes en portions individuelles et servir avec le reste de la sauce."
  ]
},
{
  id: "ragout-de-poisson-du-celibataire",
  title: "Ragoût de poisson du célibataire",
  image: "",
  time: "20 minutes",
  vegan: false,
  servings: 2,
  ingredients: [
    { name: "haricots en conserve", quantity: 240, unit: "g" },
    { name: "tomates en conserve", quantity: 400, unit: "g" },
    { name: "maquereau en sauce tomate", quantity: 120, unit: "g" },
    { name: "curry en poudre", quantity: 5, unit: "g" },
    { name: "sel", quantity: 2, unit: "g" },
    { name: "poivre", quantity: 2, unit: "g" }
  ],
  instructions: [
    "Égoutter les haricots en conserve.",
    "Verser les haricots, les tomates et le maquereau dans une casserole.",
    "Ajouter le curry en poudre, puis assaisonner avec du sel et du poivre.",
    "Porter le mélange à ébullition à feu moyen.",
    "Couvrir et laisser mijoter pendant 5 à 10 minutes en remuant occasionnellement, jusqu’à ce que le ragoût soit bien chaud.",
    "Servir immédiatement."
  ]
},
{
  id: "tourte-au-bacon-et-aux-oeufs",
  title: "Tourte au bacon et aux œufs",
  image: "",
  time: "55 minutes",
  vegan: false,
  servings: 4,
  ingredients: [
    { name: "pâte brisée", quantity: 225, unit: "g" },
    { name: "bacon", quantity: 225, unit: "g" },
    { name: "œufs", quantity: 3, unit: "" },
    { name: "sel", quantity: 2, unit: "g" },
    { name: "poivre", quantity: 2, unit: "g" },
    { name: "mélange d'herbes", quantity: 2, unit: "g" },
    { name: "lait", quantity: 0, unit: "" }
  ],
  instructions: [
    "Préchauffer le four à 190 °C.",
    "Diviser la pâte brisée en deux portions égales. Abaisser une portion et en garnir un moule de 20 cm de diamètre allant au four.",
    "Retirer la couenne du bacon et le couper en petits morceaux.",
    "Battre les œufs dans un bol, puis incorporer le bacon, le sel, le poivre et les herbes mélangées.",
    "Verser la préparation aux œufs et au bacon dans le moule.",
    "Humidifier légèrement les bords de la pâte, puis couvrir avec la seconde portion de pâte abaissée.",
    "Presser les bords pour bien sceller la tourte. Faire une petite ouverture au centre pour permettre à la vapeur de s’échapper.",
    "Badigeonner la surface avec un peu de lait ou d’œuf battu pour favoriser la coloration.",
    "Cuire au four pendant 35 à 40 minutes, jusqu’à ce que la pâte soit bien dorée et que la garniture soit cuite.",
    "Laisser reposer quelques minutes avant de servir."
  ]
},
{
  id: "tomates-farcies-au-bacon-et-aux-oeufs",
  title: "Tomates farcies au bacon et aux œufs",
  image: "",
  time: "30 minutes",
  vegan: false,
  servings: 6,
  ingredients: [
    { name: "tomates", quantity: 6, unit: "" },
    { name: "bacon", quantity: 6, unit: "tranches" },
    { name: "céleri", quantity: 180, unit: "ml" },
    { name: "œufs durs", quantity: 6, unit: "" },
    { name: "mayonnaise", quantity: 80, unit: "ml" },
    { name: "persil", quantity: 10, unit: "ml" }, /*frais*/
    { name: "sel", quantity: 1.25, unit: "ml" },
    { name: "poivre", quantity: 1.25, unit: "ml" },
    { name: "paprika", quantity: 0, unit: "" }
  ],
  instructions: [
    "Cuire les œufs dans l’eau bouillante pendant 9 à 10 minutes, puis les refroidir dans l’eau froide. Les écaler.",
    "Cuire le bacon jusqu’à ce qu’il soit croustillant, puis l’émietter.",
    "Couper le dessus des tomates et évider délicatement l’intérieur en conservant les coquilles intactes.",
    "Hacher la chair des tomates et bien égoutter les coquilles.",
    "Assaisonner l’intérieur des tomates avec du sel et du poivre.",
    "Hacher les œufs durs et couper le céleri en petits dés.",
    "Dans un bol, mélanger la chair des tomates, le bacon, le céleri, les œufs, la mayonnaise, le persil, le sel et le poivre.",
    "Mélanger jusqu’à obtenir une préparation homogène.",
    "Répartir la préparation dans les tomates évidées.",
    "Saupoudrer légèrement de paprika avant de servir."
  ]
},
{
  id: "bouchées-soufflées-au-bacon-et-au-cheddar",
  title: "Bouchées soufflées au bacon et au cheddar",
  image: "",
  time: "1 heure",
  vegan: false,
  servings: 6,
  ingredients: [
    {
      name: "Lait",
      quantity: 122,
      unit: "g"
    },
    {
      name: "Œuf",
      quantity: 1,
      unit: ""
    },
    {
      name: "Cheddar",
      quantity: 226,
      unit: "g"
    },
    {
      name: "Bacon",
      quantity: 100,
      unit: "g"
    },
    {
      name: "Oignon",
      quantity: 140,
      unit: "g"
    },
    { name: "Farine", quantity: 125, unit: "g" },
    { name: "Levure chimique", quantity: 5, unit: "g" },    
    {
      name: "Moutarde de Dijon",
      quantity: 5,
      unit: "g"
    }
  ],
  instructions: [
    "Préchauffer le four à 200 °C.",
    "Battre le lait et l'œuf dans un bol jusqu'à obtenir un mélange homogène.",
    "Ajouter le cheddar râpé, le bacon haché, l'oignon finement haché, la farine et la moutarde de Dijon. Mélanger jusqu'à obtenir une préparation homogène.",
    "Déposer des cuillerées de pâte sur une plaque recouverte de papier cuisson, en les espaçant suffisamment.",
    "Cuire au four pendant environ 15 minutes, jusqu'à ce que les bouchées soient bien dorées.",
    "Laisser légèrement refroidir et servir chaudes ou froides."
  ]
},
{
  id: "omelette-au-bacon-et-au-fromage",
  title: "Omelette au bacon et au fromage",
  image: "",
  time: "10 min",
  vegan: false,
  servings: 1,
  ingredients: [
    {
      name: "Œuf",
      quantity: 3,
      unit: ""
    },
    {
      name: "Bacon",
      quantity: 57,
      unit: "g"
    },
    {
      name: "Fromage",
      quantity: 40,
      unit: "g"
    },
    {
      name: "Beurre",
      quantity: 14,
      unit: "g"
    }
  ],
  instructions: [
    "Couper le bacon en morceaux d'environ 2,5 cm.",
    "Couper le fromage en lanières.",
    "Faire fondre le beurre dans une poêle antiadhésive à feu vif en veillant à bien en couvrir le fond.",
    "Lorsque la moitié du beurre est fondue, réduire à feu moyen.",
    "Battre les œufs jusqu'à obtenir une préparation homogène.",
    "Verser les œufs dans la poêle et faire tourner la poêle afin de répartir les œufs sur toute la surface.",
    "Lorsque les bords commencent à prendre, soulever délicatement les parties cuites avec une spatule pour permettre à l'œuf encore liquide du centre de couler dessous. Continuer jusqu'à ce que la majeure partie de l'œuf soit cuite.",
    "Déposer le fromage sur un côté du centre de l'omelette.",
    "Répartir le bacon sur le fromage.",
    "Rabattre délicatement le côté de l'omelette sans garniture sur le bacon et le fromage afin de former une demi-lune.",
    "Réduire à feu doux et poursuivre la cuisson jusqu'à ce que le fromage soit fondu.",
    "Servir immédiatement."
  ]
},
{
  id: "brie-en-croute",
  title: "Brie en croûte",
  image: "",
  time: "30 minutes",
  vegan: false,
  servings: 6,
  ingredients: [
    {
      name: "Brie",
      quantity: 283,
      unit: "g"
    },
    {
      name: "Pâte feuilletée",
      quantity: 250,
      unit: "g"
    },
    {
      name: "Œuf",
      quantity: 1,
      unit: ""
    },
    {
      name: "Sel",
      quantity: 5,
      unit: "g"
    },
    {
      name: "Poivre",
      quantity: 2,
      unit: "g"
    }
  ],
  instructions: [
    "Préchauffer le four à 190 °C.",
    "Déposer le Brie au centre de la pâte feuilletée.",
    "Couper l'excédent de pâte, puis rabattre la pâte sur le Brie en le recouvrant complètement.",
    "À la dernière fermeture, badigeonner le bord de pâte avec l'œuf battu afin de bien sceller la pâte.",
    "Badigeonner toute la surface de la pâte avec l'œuf battu.",
    "Cuire au four pendant environ 15 minutes, jusqu'à ce que la pâte soit bien dorée et croustillante.",
    "Laisser refroidir pendant 10 minutes avant de servir."
  ]
},
{
  id: "poitrines-de-poulet-au-four",
  title: "Poitrines de poulet au four",
  image: "",
  time: "30 minutes",
  vegan: false,
  servings: 4,
  ingredients: [
    { name: "Poitrines de poulet", quantity: 4, unit: "" },
    { name: "Sel", quantity: 2, unit: "g" },
    { name: "Poivre", quantity: 1, unit: "g" },
    { name: "Huile d'olive", quantity: 15, unit: "ml" },
    { name: "Zeste de citron", quantity: 5, unit: "g" }
  ],
  instructions: [
    "Préchauffer le four à 200 °C.",
    "Badigeonner les deux côtés des poitrines de poulet avec l'huile d'olive.",
    "Assaisonner généreusement les deux côtés avec le sel, le poivre et le zeste de citron.",
    "Déposer les poitrines de poulet dans un plat de cuisson.",
    "Cuire au centre du four jusqu'à ce que la température interne du poulet atteigne 75 °C, soit environ 20 à 30 minutes selon l'épaisseur des poitrines.",
    "Retirer du four et laisser reposer 5 minutes avant de servir."
  ]
},
{
  id: "flan-au-four",
  title: "Flan au four",
  image: "",
  time: "50 minutes",
  vegan: false,
  servings: 6,
  ingredients: [
    { name: "Œufs", quantity: 4, unit: "" },
    { name: "Sucre", quantity: 120, unit: "g" },
    { name: "Sel", quantity: 1, unit: "g" },
    { name: "Extrait de vanille", quantity: 5, unit: "ml" },
    { name: "Lait", quantity: 946, unit: "ml" },
    { name: "Beurre", quantity: 10, unit: "g" }
  ],
  instructions: [
    "Préchauffer le four à 155 °C.",
    "Fouetter les œufs avec le sucre, le sel et l'extrait de vanille jusqu'à obtenir un mélange homogène.",
    "Faire chauffer le lait jusqu'à ce qu'il soit très chaud sans le faire bouillir.",
    "Verser progressivement le lait chaud dans le mélange d'œufs en fouettant constamment afin de ne pas cuire les œufs.",
    "Beurrer un plat de cuisson ou plusieurs petits moules résistants à la chaleur.",
    "Verser la préparation dans le plat ou les moules.",
    "Placer le plat ou les moules dans un grand plat de cuisson et verser de l'eau chaude autour pour créer un bain-marie.",
    "Cuire au four pendant 30 à 40 minutes, jusqu'à ce que la crème soit prise.",
    "Vérifier la cuisson en insérant la pointe d'un couteau au centre : elle doit ressortir propre.",
    "Laisser refroidir avant de servir."
  ]
},
{
  id: "gruau-au-four",
  title: "Gruau au four",
  image: "",
  time: "40–45 minutes",
  vegan: false,
  ingredients: [
    { name: "Flocons d'avoine", quantity: 720, unit: "g" },
    { name: "Cassonade", quantity: 240, unit: "g" },
    { name: "Levure chimique", quantity: 8, unit: "g" },
    { name: "Cannelle", quantity: 3, unit: "g" },
    { name: "Sel", quantity: 6, unit: "g" },
    { name: "Lait", quantity: 240, unit: "ml" },
    { name: "Beurre", quantity: 120, unit: "g" },
    { name: "Œufs", quantity: 2, unit: "" }
  ],
  instructions: [
    "Mélanger tous les ingrédients, puis verser la préparation dans un moule de 20 cm.",
    "Cuire au four à 175 °C pendant 40 à 45 minutes.",
    "Servir chaud ou froid, avec ou sans lait."
  ]
},
{
  id: "penne-au-four",
  title: "Penne au four",
  image: "",
  time: "1 heure",
  vegan: false,
  servings: 4,
  ingredients: [
    { name: "Penne", quantity: 125, unit: "g" },
    { name: "Ricotta", quantity: 300, unit: "g" },
    { name: "Œufs", quantity: 4, unit: "" },
    { name: "Beurre", quantity: 125, unit: "g" },
    { name: "Crème de tartre", quantity: 0.5, unit: "g" },
    { name: "Sel", quantity: 1, unit: "g" },
    { name: "Poivre", quantity: 0.5, unit: "g" },
    { name: "Ail", quantity: 3, unit: "g" },
    { name: "Persil", quantity: 4, unit: "g" },
    { name: "Mozzarella", quantity: 60, unit: "g" },
    { name: "Concentré de tomate", quantity: 400, unit: "g" },
    { name: "Basilic", quantity: 2, unit: "g" }
  ],
  instructions: [
    "Préchauffer le four à 191 °C.",
    "Faire cuire les penne dans de l'eau salée jusqu'à ce qu'elles soient al dente. Égoutter, rincer à l'eau froide et réserver.",
    "Mélanger la ricotta, les jaunes d'œufs, le beurre, le sel, le poivre, l'ail, le persil et le concentré de tomate. Incorporer les pâtes cuites.",
    "Dans un bol métallique parfaitement propre, fouetter les blancs d'œufs avec la crème de tartre jusqu'à obtenir des pics fermes. Incorporer délicatement les blancs à la préparation.",
    "Verser dans un plat de cuisson profond recouvert de papier cuisson. Parsemer de mozzarella et couvrir de papier aluminium. Cuire au centre du four pendant 15 minutes.",
    "Retirer le papier aluminium et réduire la température à 177 °C. Poursuivre la cuisson pendant 30 minutes, jusqu'à ce que le dessus soit doré et bouillonnant.",
    "Servir chaud et garnir de basilic."
  ]
},
{
  id: "cotelettes-de-porc-au-four",
  title: "Côtelettes de porc au four",
  image: "",
  time: "1 heure",
  vegan: false,
  ingredients: [
    { name: "Côtelettes de porc", quantity: 4, unit: "" },
    { name: "Pomme", quantity: 1, unit: "" },
    { name: "Oignon", quantity: 1, unit: "" },
    { name: "Miel", quantity: 15, unit: "ml" },
    { name: "Graines de carvi", quantity: 15, unit: "ml" },
    { name: "Sel d'ail", quantity: 2, unit: "g" },
    { name: "Poivre noir", quantity: 1, unit: "g" },
    { name: "Moutarde de Dijon", quantity: 15, unit: "g" }
  ],
  instructions: [
    "Préchauffer le four à 180 °C.",
    "Disposer l'oignon et la pomme tranchés dans un plat de cuisson pouvant être couvert. Arroser de miel et parsemer de la moitié des graines de carvi.",
    "Assaisonner les côtelettes de porc avec le sel d'ail et le poivre, puis étaler la moutarde de Dijon sur le dessus.",
    "Parsemer les côtelettes avec le reste des graines de carvi.",
    "Couvrir le plat et cuire au four pendant 1 heure."
  ]
},
{
  id: "vinaigrette-balsamique",
  title: "Vinaigrette balsamique",
  image: "",
  time: "5 min",
  vegan: true,
  ingredients: [
    {
      name: "vinaigre balsamique",
      quantity: 30,
      unit: "ml"
    },
    {
      name: "huile d'olive",
      quantity: 90,
      unit: "ml"
    },
    {
      name: "sel",
      quantity: 2,
      unit: "g"
    },
    {
      name: "poivre",
      quantity: 2,
      unit: "g"
    },
    
  ],
  instructions: [
    "Fouetter le vinaigre balsamique avec le sel et le poivre.",
    "Ajouter progressivement l'huile d'olive tout en fouettant jusqu'à obtenir une vinaigrette homogène.",
    "Verser sur la salade verte mélangée et servir."
  ]
},
{
  id: "glacage-balsamique",
  title: "Glaçage balsamique",
  image: "",
  time: "30 min",
  vegan: false,
  ingredients: [
    {
      name: "vinaigre balsamique",
      quantity: 60,
      unit: "ml"
    },
    {
      name: "miel",
      quantity: 15,
      unit: "ml"
    },
    {
      name: "ail",
      quantity: 5,
      unit: "g"
    },
    {
      name: "gingembre",
      quantity: 5,
      unit: "g"
    },
    {
      name: "huile d'olive",
      quantity: 5,
      unit: "ml"
    },
    {
      name: "tomate",
      quantity: 1,
      unit: ""
    },
    {
      name: "sel",
      quantity: 0,
      unit: ""
    },
    {
      name: "poivre",
      quantity: 0,
      unit: ""
    }
  ],
  instructions: [
    "Mixer le vinaigre balsamique, le miel, l'ail, le gingembre, l'huile d'olive et la tomate jusqu'à obtenir une préparation presque lisse.",
    "Verser la préparation dans une casserole antiadhésive.",
    "Porter à ébullition, puis réduire immédiatement à feu moyen.",
    "Cuire en remuant régulièrement jusqu'à ce que la préparation épaississe légèrement et devienne sirupeuse.",
    "Goûter et ajouter un peu de miel si le glaçage est trop acide.",
    "Saler et poivrer selon le goût.",
    "Verser sur des légumes cuits et servir immédiatement, ou conserver au réfrigérateur pendant 3 jours maximum.",
    "Réchauffer le glaçage avant de l'utiliser."
  ]
},
{
  id: "paninis-au-steak-et-brie-balsamique",
  title: "Paninis au steak et au brie balsamique",
  image: "",
  time: "30 min",
  vegan: false,
  ingredients: [
    {
      name: "entrecôte",
      quantity: 2,
      unit: "oz"
    },
    {
      name: "vinaigre balsamique",
      quantity: 5,
      unit: "ml"
    },
    {
      name: "sel",
      quantity: 2,
      unit: "g"
    },
    {
      name: "poivre",
      quantity: 2,
      unit: "g"
    },
    {
      name: "beurre",
      quantity: 15,
      unit: "ml"
    },
    {
      name: "pain blanc",
      quantity: 2,
      unit: "tranches"
    },
    {
      name: "brie",
      quantity: 1,
      unit: "tranches"
    }
  ],
  instructions: [
    "Badigeonner les steaks de vinaigre balsamique, puis les assaisonner généreusement de sel et de poivre.",
    "Griller les steaks à couvert en les retournant régulièrement jusqu'à la cuisson désirée : 60 °C pour une cuisson saignante, 68 °C pour une cuisson à point et 74 °C pour une cuisson bien cuite.",
    "Retirer les steaks du gril et les laisser reposer pendant 10 minutes. Les trancher finement dans le sens contraire des fibres, puis arroser les tranches d'un peu de vinaigre balsamique.",
    "Déposer une tranche de brie sur la moitié des tranches de pain. Ajouter suffisamment de tranches de steak pour couvrir le fromage, puis refermer avec les autres tranches de pain.",
    "Badigeonner de beurre les faces extérieures des pains.",
    "Chauffer une poêle-gril ou une plaque de cuisson à feu moyen-vif pendant 4 à 5 minutes.",
    "Cuire les paninis par lots si nécessaire jusqu'à ce que le pain soit doré des deux côtés et que le brie soit fondu.",
    "Servir chaud."
  ]
},
{
  id: "pancakes-aux-bananes",
  title: "Pancakes aux bananes",
  image: "",
  time: "30 min",
  vegan: false,
  ingredients: [
    {
      name: "beurre",
      quantity: 40,
      unit: "g"
    },
    {
      name: "bananes",
      quantity: 3,
      unit: ""
    },
    {
      name: "œufs",
      quantity: 3,
      unit: ""
    },
    {
      name: "lait entier",
      quantity: 375,
      unit: "ml"
    },
    {
      name: "farine",
      quantity: 300,
      unit: "g"
    },
    {
      name: "levure",
      quantity: 5,
      unit: "g"
    },
    {
      name: "cannelle", /*moulue*/
      quantity: 5,
      unit: "ml"
    },
    {
      name: "sel",
      quantity: 2,
      unit: "g"
    },
    {
      name: "cassonade",
      quantity: 45,
      unit: "ml"
    }
  ],
  instructions: [
    "Faire fondre le beurre dans un bol résistant à la chaleur.",
    "Ajouter les bananes et les écraser avec le beurre à l'aide d'un presse-purée.",
    "Ajouter les œufs et continuer à écraser jusqu'à obtenir une préparation lisse.",
    "Incorporer progressivement le lait à l'aide d'une cuillère en bois.",
    "Dans un grand bol séparé, fouetter ensemble la farine, la cannelle, le sel et la cassonade.",
    "Incorporer progressivement les ingrédients liquides aux ingrédients secs jusqu'à obtenir une pâte homogène.",
    "Chauffer une poêle antiadhésive à feu moyen.",
    "Graisser légèrement la poêle avec un peu de beurre. Verser environ 80 ml de pâte par pancake en veillant à les espacer.",
    "Cuire à feu moyen-doux pendant environ 3 minutes, jusqu'à ce que le dessous soit légèrement doré et que des bulles apparaissent à la surface.",
    "Retourner les pancakes avec une spatule et poursuivre la cuisson pendant environ 3 minutes.",
    "Retirer les pancakes de la poêle et répéter avec le reste de la pâte."
  ]
},
{
  id: "pain-aux-bananes-et-aux-pacanes",
  title: "Pain aux bananes et aux pacanes",
  image: "",
  time: "1h30",
  vegan: false,
  servings: 8,
  ingredients: [
    { name: "farine", quantity: 250, unit: "g" },
    { name: "levure ", quantity: 15, unit: "ml" },
    { name: "sel", quantity: 3, unit: "g" },
    { name: "beurre", quantity: 115, unit: "g" },
    { name: "sucre", quantity: 200, unit: "g" },
    { name: "œufs", quantity: 2, unit: "" },
    { name: "bananes", quantity: 2, unit: "" },
    { name: "jus de citron", quantity: 5, unit: "ml" },
    { name: "pacanes", quantity: 110, unit: "g" }
  ],
  instructions: [
    "Préchauffer le four à 163 °C. Graisser un moule à cake.",
    "Tamiser ensemble la farine, la levure chimique et le sel.",
    "Dans un bol, battre le beurre, le sucre et les œufs à vitesse moyenne jusqu’à obtenir une préparation crémeuse.",
    "Ajouter les bananes et le jus de citron, puis mélanger jusqu’à obtenir une préparation homogène.",
    "Ajouter les ingrédients secs aux ingrédients liquides et mélanger juste assez pour les incorporer.",
    "Arrêter le mélangeur et racler les parois du bol. Reprendre à vitesse moyenne et mélanger pendant 1 minute supplémentaire.",
    "Ajouter les pacanes et mélanger pendant environ 20 secondes.",
    "Verser la pâte dans le moule préparé.",
    "Cuire au four à 163 °C pendant 60 à 75 minutes, jusqu’à ce qu’un couteau inséré au centre ressorte propre.",
    "Laisser refroidir avant de démouler et de servir."
  ]
},
{
  id: "banana-split",
  title: "Banana split",
  image: "",
  time: "5 min",
  vegan: false,
  servings: 1,
  ingredients: [
    { name: "banane", quantity: 1, unit: "" },
    { name: "crème glacée à la vanille", quantity: 1, unit: "boule" },
    { name: "crème glacée à la fraise", quantity: 1, unit: "boule" },
    { name: "crème glacée au chocolat", quantity: 1, unit: "boule" },
    { name: "sauce au chocolat", quantity: 30, unit: "ml" },
    { name: "crème fouettée", quantity: 30, unit: "ml" }
  ],
  instructions: [
    "Couper la banane en deux dans le sens de la longueur et placer les deux moitiés côte à côte dans un plat.",
    "Déposer la boule de crème glacée à la vanille au centre, puis les boules de crème glacée à la fraise et au chocolat de chaque côté.",
    "Napper les crèmes glacées de sauce au chocolat.",
    "Ajouter la crème fouettée sur le dessus, si désiré.",
    "Servir immédiatement."
  ]
},
{
  id: "sauce-barbecue-kansas-city",
  title: "Sauce barbecue à la Kansas City",
  image: "",
  time: "20 min",
  vegan: false,
  servings: 8,
  ingredients: [
    { name: "ketchup", quantity: 235, unit: "ml" },
    { name: "sauce Worcestershire", quantity: 90, unit: "ml" },
    { name: "beurre", quantity: 60, unit: "ml" },
    { name: "vinaigre blanc", quantity: 45, unit: "ml" },
    { name: "moutarde", quantity: 15, unit: "ml" },
    { name: "oignon jaune", quantity: 45, unit: "ml" },
    { name: "fumée liquide", quantity: 20, unit: "ml" },
    { name: "sauce au piment rouge", quantity: 1, unit: "ml" },
    { name: "cassonade", quantity: 110, unit: "g" },
    { name: "sucre", quantity: 12, unit: "g" },
    { name: "sel", quantity: 5, unit: "g" }
  ],
  instructions: [
    "Mettre tous les ingrédients dans une casserole.",
    "Bien mélanger.",
    "Faire mijoter à feu doux pendant 20 minutes en remuant occasionnellement.",
    "Laisser refroidir, puis conserver au réfrigérateur.",
    "Ajouter la sauce à la viande vers la fin de la cuisson ou après la cuisson afin d'éviter qu'elle ne brûle en raison de sa teneur en sucre."
  ]
},
{
  id: "pate-a-pain-de-base",
  title: "Pâte à pain de base",
  image: "",
  time: "3h",
  vegan: true,
  servings: 1,
  ingredients: [
    { name: "Eau", quantity: 237, unit: "g" },
    { name: "Sucre", quantity: 8.4, unit: "g" },
    { name: "Sel", quantity: 6, unit: "g" },
    { name: "Farine", quantity: 274, unit: "g" },
    { name: "Levure sèche active", quantity: 4, unit: "g" },
    { name: "Miel", quantity: 7, unit: "g" }
  ],
  instructions: [
    "Ajouter les ingrédients dans une machine à pain d'une capacité de 900 g, dans l'ordre indiqué, puis sélectionner le programme pâte et démarrer.",
    "Retirer la pâte lorsque le programme est terminé.",
    "Préchauffer le four à 200 °C.",
    "Déposer la pâte sur une surface légèrement farinée et lui donner la forme souhaitée. La placer sur une plaque de cuisson ou une pierre à pizza.",
    "Cuire pendant 20 à 40 minutes, jusqu'à ce que le pain soit légèrement doré et ferme.",
    "Laisser refroidir avant de servir."
  ]
},
{
  id: "cobbler-de-base",
  title: "Cobbler de base",
  image: "",
  time: "45 min",
  vegan: false,
  servings: 6,
  ingredients: [
    { name: "Beurre", quantity: 115, unit: "g" },
    { name: "Sel", quantity: 1, unit: "g" },
    { name: "Levure chimique", quantity: 4, unit: "g" },
    { name: "Farine ", quantity: 125, unit: "g" },
    { name: "Lait", quantity: 240, unit: "ml" },
    { name: "Sucre", quantity: 200, unit: "g" },
    { name: "Cerise", quantity: 150, unit: "g" } /* 1 tasse de fruit frais*/
  ],
  instructions: [
    "Préchauffer le four à 175 °C.",
    "Déposer le beurre dans un plat de cuisson profond d'environ 24 × 30 cm. Placer le plat dans le four pour faire fondre le beurre pendant la préparation des autres ingrédients. Si le beurre est non salé, ajouter le sel.",
    "Mélanger légèrement la farine, la levure chimique et le sucre dans un bol. Former un puits au centre, verser le lait et fouetter jusqu'à obtenir une pâte homogène.",
    "Retirer le plat du four. Verser la pâte sur le beurre fondu sans mélanger.",
    "Répartir les fruits frais uniformément sur la pâte sans mélanger.",
    "Cuire à découvert jusqu'à ce que le cobbler soit bien doré."
  ]
},
{
  id: "flapjacks-de-base",
  title: "Flapjacks de base",
  image: "",
  time: "1 h",
  vegan: false,
  servings: 10,
  ingredients: [
    { name: "Cassonade", quantity: 110, unit: "g" },
    { name: "Beurre", quantity: 175, unit: "g" },
    { name: "Sirop de sucre", quantity: 15, unit: "ml" },
    { name: "Flocons d'avoine", quantity: 175, unit: "g" }
  ],
  instructions: [
    "Préchauffer le four à 150 °C.",
    "Mettre le sucre roux, le beurre et le sirop de sucre dans une casserole et chauffer jusqu'à ce que le beurre soit fondu.",
    "Retirer la casserole du feu et incorporer les flocons d'avoine.",
    "Répartir et presser le mélange au fond d'un moule carré de 19 cm légèrement beurré.",
    "Cuire au centre du four pendant 40 minutes.",
    "Laisser refroidir dans le moule pendant 10 à 15 minutes, puis découper en barres rectangulaires.",
    "Laisser refroidir complètement avant de retirer les flapjacks du moule et de les conserver dans une boîte hermétique."
  ]
},
{
  id: "lasagne-de-base",
  title: "Lasagne de base",
  image: "",
  time: "1 h",
  vegan: false,
  servings: 6,
  ingredients: [
    { name: "œufs", quantity: 6, unit: "" },
    { name: "ricotta", quantity: 500, unit: "g" },
    { name: "sel", quantity: 1, unit: "g" },
    { name: "poivre", quantity: 0.5, unit: "g" },
    { name: "crème à 35 %", quantity: 120, unit: "ml" },
    { name: "pâtes à lasagne", quantity: 1000, unit: "g" },
    { name: "sauce tomate", quantity: 360, unit: "ml" }
  ],
  instructions: [
    "Cuire les pâtes à lasagne selon les indications sur l’emballage, puis les égoutter.",
    "Séparer les blancs des jaunes d’œufs.",
    "Monter les blancs d’œufs en neige ferme dans un grand bol parfaitement propre.",
    "Dans un autre bol, mélanger les jaunes d’œufs, la ricotta, le sel, le poivre blanc et la crème.",
    "Incorporer délicatement les blancs d’œufs montés au mélange de fromage.",
    "Déposer la moitié des pâtes à lasagne cuites au fond d’un plat de cuisson.",
    "Ajouter une couche de sauce tomate, puis une couche du mélange de fromage.",
    "Répéter avec le reste des pâtes, de la sauce tomate et du mélange de fromage. Terminer par une couche de fromage.",
    "Couvrir le plat de papier d’aluminium et cuire à 190 °C pendant 15 minutes.",
    "Retirer le papier d’aluminium et poursuivre la cuisson pendant 20 minutes.",
    "Retirer du four et laisser reposer pendant 10 minutes avant de servir."
  ]
},
{
  id: "mayonnaise",
  title: "Mayonnaise",
  image: "",
  time: "10 min",
  vegan: false,
  ingredients: [
    { name: "jaunes d'œufs", quantity: 2, unit: "" },
    { name: "jus de citron", quantity: 12.5, unit: "ml" }, /*vinagire*/
    { name: "moutarde de Dijon", quantity: 2.5, unit: "ml" },
    { name: "sel", quantity: 1, unit: "ml" },
    { name: "huile", quantity: 180, unit: "ml" }
  ],
  instructions: [
    "Dans un grand bol, fouetter les jaunes d'œufs pendant environ 1 minute.",
    "Ajouter la moutarde, le sel et la moitié du jus de citron ou du vinaigre. Fouetter pendant encore 1 minute, jusqu'à ce que le mélange épaississe légèrement.",
    "Ajouter très lentement la moitié de l'huile tout en fouettant constamment. Commencer goutte à goutte, en incorporant chaque goutte avant d'ajouter la suivante, puis augmenter progressivement le débit.",
    "Continuer à fouetter jusqu'à ce que toute l'huile soit incorporée.",
    "Ajouter le reste du jus de citron ou du vinaigre et fouetter pour bien mélanger.",
    "Ajouter progressivement le reste de l'huile de la même manière, tout en fouettant constamment.",
    "Continuer jusqu'à ce que toute l'huile soit incorporée et que la mayonnaise soit épaisse et homogène.",
    "Si désiré, incorporer des aromates comme de l'ail écrasé ou utiliser la mayonnaise comme base pour d'autres sauces."
  ]
},
{
  id: "omelette-de-base",
  title: "Omelette de base",
  image: "",
  time: "10 min",
  vegan: false,
  servings: 1,
  ingredients: [
    { name: "œufs", quantity: 2, unit: "" },
    { name: "blancs d'œufs", quantity: 2, unit: "" },
    { name: "huile", quantity: 10, unit: "ml" }
  ],
  instructions: [
    "Préparer la garniture de votre choix en la coupant en morceaux. Si elle nécessite une cuisson, la cuire avant de commencer l'omelette.",
    "Casser les œufs et les blancs d'œufs dans un bol, puis les battre jusqu'à obtenir un mélange homogène.",
    "Verser les œufs dans une poêle froide.",
    "Chauffer la poêle à feu moyen en remuant constamment les œufs.",
    "Dès que l'œuf commence à coaguler, arrêter de remuer.",
    "À mesure que l'œuf se solidifie, décoller délicatement les bords à l'aide d'une spatule.",
    "Continuer à décoller les bords jusqu'à ce que l'omelette puisse glisser librement dans la poêle.",
    "Retourner délicatement l'omelette à l'aide d'une spatule.",
    "Déposer la garniture sur l'omelette.",
    "Lorsque l'œuf est complètement cuit, replier l'omelette sur la garniture et servir immédiatement."
  ]
},
{
  id: "melange-depices-pour-boissons-chaudes",
  title: "Mélange d'épices pour boissons chaudes",
  image: "",
  time: "5 min",
  vegan: true,
  servings: 1,
  ingredients: [
    { name: "bâtons de cannelle", quantity: 6, unit: "" },
    { name: "noix de muscade", quantity: 1, unit: "" },
    { name: "clous de girofle", quantity: 60, unit: "g" },
    { name: "piment de la Jamaïque", quantity: 60, unit: "g" },
    { name: "zeste d'orange", quantity: 1, unit: "" }
  ],
  instructions: [
    "Placer les bâtons de cannelle et la noix de muscade entière dans un sac hermétique.",
    "À l'aide d'un marteau ou d'un ustensile lourd, écraser les épices en morceaux grossiers.",
    "Mélanger les épices concassées avec les clous de girofle et le piment de la Jamaïque.",
    "Ajouter le zeste d'orange râpé, puis bien mélanger.",
    "Conserver le mélange dans un récipient hermétique."
  ]
},
{
  id: "pate-a-pizza-de-base",
  title: "Pâte à pizza de base",
  image: "",
  time: "8 heures",
  vegan: true,
  servings: 8,
  ingredients: [
    { name: "Eau", quantity: 237, unit: "g" },
    { name: "Levure sèche", quantity: 24, unit: "g" },
    { name: "Miel", quantity: 42, unit: "g" },
    { name: "Sel", quantity: 6, unit: "g" },
    { name: "Farine", quantity: 438, unit: "g" },
    { name: "Huile d’olive", quantity: 54, unit: "g" }
  ],
  instructions: [
    "Mélanger l’eau tiède, le sel, l’huile d’olive et le miel dans un grand bol jusqu’à ce que le sel et le miel soient complètement dissous. L’eau doit être tiède, entre 35 et 43 °C.",
    "Ajouter la levure sèche active, mélanger, puis laisser reposer pendant 5 minutes.",
    "Ajouter 125 g de farine et mélanger jusqu’à obtenir une préparation homogène.",
    "Ajouter progressivement le reste de la farine en mélangeant jusqu’à ce qu’une pâte se forme et qu’elle ne soit plus collante.",
    "Pétrir la pâte pendant environ 1 minute, puis couvrir le bol.",
    "Laisser lever la pâte pendant 1 heure à température ambiante.",
    "Dégazer la pâte en appuyant dessus, puis la laisser lever de nouveau pendant 1 h 30 à 5 heures.",
    "Préchauffer le four à 245 °C. Si une pierre à pizza est utilisée, la placer dans le four et prévoir environ 20 minutes supplémentaires de préchauffage.",
    "Diviser la pâte en 2 portions et les étaler pour former deux fonds de pizza d’environ 40 cm de diamètre.",
    "Ajouter les garnitures de votre choix.",
    "Cuire les pizzas pendant 15 à 25 minutes, jusqu’à ce que la pâte soit bien dorée et croustillante."
  ]
},
{
  id: "polenta-de-base",
  title: "Polenta de base",
  image: "",
  time: "1 h",
  vegan: false,
  servings: 4,
  ingredients: [
    { name: "Eau", quantity: 750, unit: "ml" },/*lait*/
    { name: "Semoule de maïs", quantity: 250, unit: "g" },
    { name: "Huile d’olive", quantity: 30, unit: "ml" }, /*beurre*/
    { name: "Sel", quantity: 1, unit: "ml" },
  ],
  instructions: [
    "Porter l’eau ou le lait à ébullition dans une casserole à fond épais. Si vous utilisez du lait, surveiller attentivement pour éviter qu’il ne déborde.",
    "Lorsque le liquide bout, ajouter une pincée de sel.",
    "Verser progressivement la semoule de maïs en remuant fréquemment pour éviter la formation de grumeaux.",
    "Couvrir la casserole et cuire à feu doux en remuant occasionnellement. Ajouter un peu de liquide si nécessaire.",
    "Poursuivre la cuisson pendant environ 45 minutes, jusqu’à ce que la polenta soit tendre et crémeuse.",
    "Ajouter le beurre ou l’huile d’olive selon le goût.",
    "Incorporer du parmesan selon le goût, puis servir chaud."
  ]
},
{
  id: "oeufs-brouilles-de-base",
  title: "Œufs brouillés de base",
  image: "",
  time: "10 minutes",
  vegan: false,
  servings: 1,
  ingredients: [
    { name: "Oeufs", quantity: 3, unit: "" },
    { name: "Lait", quantity: 30, unit: "ml" },
    { name: "Beurre", quantity: 30, unit: "g" },
    { name: "Sel", quantity: 1, unit: "g" },
    { name: "Poivre", quantity: 0.5, unit: "g" }
  ],
  instructions: [
    "Casser les œufs dans un bol.",
    "Ajouter le lait et le sel, puis fouetter avec une fourchette ou un fouet jusqu’à ce que le mélange soit mousseux.",
    "Faire fondre le beurre dans une poêle à feu moyen.",
    "Verser les œufs dans la poêle.",
    "Remuer les œufs pendant la cuisson afin de former des morceaux. Remuer rapidement pour obtenir de petits morceaux ou plus lentement pour obtenir de plus gros morceaux.",
    "Cuire jusqu’à ce que les œufs soient presque complètement pris. Retirer du feu juste avant qu’ils ne soient complètement cuits, car ils continueront à cuire avec la chaleur résiduelle.",
    "Transférer immédiatement les œufs dans une assiette.",
    "Assaisonner avec le poivre noir.",
    "Servir immédiatement, nature ou accompagné de sauce tomate, de salsa ou de pain grillé."
  ]
},
{
  id: "burger-de-haricots",
  title: "Burger de haricots",
  image: "",
  time: "20 min",
  vegan: false,
  servings: 6,
  ingredients: [
    { name: "oignon", quantity: 1, unit: "" },
    { name: "poivron rouge ", quantity: 1, unit: "" },
    { name: "cumin", quantity: 2, unit: "g" }, /*moulu*/
    { name: "coriandre", quantity: 2, unit: "g" }, /*moulue*/
    { name: "piment", quantity: 2, unit: "g" },/*doux moulue*/
    { name: "paprika", quantity: 2, unit: "g" },
    { name: "curcuma", quantity: 2, unit: "g" },
    { name: "haricots", quantity: 480, unit: "g" },
    { name: "carottes", quantity: 3, unit: "" },
    { name: "flocons d'avoine", quantity: 40, unit: "g" },
    { name: "œuf", quantity: 1, unit: "" },
    { name: "huile", quantity: 15, unit: "ml" },
    { name: "farine", quantity: 20, unit: "g" }
  ],
  instructions: [
    "Hacher finement l'oignon et le poivron. Râper les carottes.",
    "Faire chauffer l'huile dans une poêle. Faire revenir l'oignon et le poivron avec le cumin, la coriandre moulue, le piment doux, le paprika et le curcuma pendant quelques minutes. Laisser refroidir.",
    "Égoutter les haricots et les écraser grossièrement dans un grand bol.",
    "Ajouter les carottes râpées, l'oignon, le poivron et les flocons d'avoine. Mélanger jusqu'à obtenir une préparation homogène.",
    "Battre légèrement l'œuf puis l'incorporer progressivement. Ajouter seulement la quantité nécessaire pour obtenir une préparation qui se tient sans être trop collante.",
    "Façonner la préparation en 6 à 8 galettes. Fariner légèrement chaque côté.",
    "Faire chauffer un peu d'huile dans une poêle et cuire les galettes quelques minutes de chaque côté, jusqu'à ce qu'elles soient bien dorées.",
    "Servir chaud."
  ]
},
{
  id: "haricots-et-riz",
  title: "Haricots et riz",
  image: "",
  time: "2h30",
  vegan: true,
  servings: 4,
  ingredients: [
    { name: "haricots" , quantity: 454, unit: "g" },
    { name: "oignon", quantity: 1, unit: "" },
    { name: "poivron", quantity: 1, unit: "" },
    { name: "céleri", quantity: 1, unit: "branche" },
    { name: "ail", quantity: 1, unit: "bulbe" },
    { name: "feuille de laurier", quantity: 2, unit: "" },
    { name: "cumin", quantity: 2, unit: "g" },/*moulue*/
    { name: "poudre de chili", quantity: 2, unit: "g" },
    { name: "basilic", quantity: 2, unit: "g" }, /*moulue*/
    { name: "huile d'olive", quantity: 15, unit: "ml" },
    { name: "sel", quantity: 3, unit: "g" },
    { name: "poivre", quantity: 1, unit: "g" },
    { name: "piment fort", quantity: 2, unit: "" },
    { name: "riz", quantity: 250, unit: "g" }
  ],
  instructions: [
    "Faire tremper les haricots dans l'eau pendant une nuit. Pour une méthode plus rapide, les porter à ébullition puis les laisser reposer pendant 1 heure.",
    "Émincer l'oignon, le poivron et le céleri. Hacher finement l'ail.",
    "Faire chauffer l'huile d'olive dans une grande casserole à feu moyen. Faire revenir l'oignon et l'ail jusqu'à ce que l'oignon soit translucide.",
    "Ajouter le poivron et le céleri. Faire revenir pendant quelques minutes.",
    "Ajouter les haricots égouttés, puis suffisamment d'eau pour couvrir complètement les ingrédients.",
    "Ajouter le laurier, le cumin, la poudre de chili, le basilic, le sel, le poivre et les piments forts.",
    "Porter à ébullition, puis réduire le feu. Couvrir et laisser mijoter pendant 1 à 2 heures, en remuant occasionnellement, jusqu'à ce que les haricots soient tendres.",
    "Pour le riz, mettre le riz dans une casserole avec deux fois son volume d'eau.",
    "Porter à forte ébullition et cuire jusqu'à ce que l'eau atteigne presque le niveau du riz.",
    "Réduire à feu doux, couvrir et cuire pendant 20 minutes.",
    "Servir les haricots sur le riz."
  ]
},
{
  id: "ragoût-de-boeuf-à-lorge",
  title: "ragoût de boeuf à l'orge",
  image: "",
  time: "2 heures",
  vegan: false,
  servings: 12,
  ingredients: [
    { name: "bœuf", quantity: 1250, unit: "g" },
    { name: "oignon", quantity: 1, unit: "" },
    { name: "pommes de terre", quantity: 4, unit: "" },
    { name: "orge", quantity: 240, unit: "g" },
    { name: "farine", quantity: 60, unit: "g" },
    { name: "concentré de tomate", quantity: 1, unit: "" },
    { name: "tomates en dés", quantity: 1, unit: "" },
    { name: "sauce Worcestershire", quantity: 1, unit: "" },
    { name: "persil", quantity: 1, unit: "" },
    { name: "sel", quantity: 1, unit: "" },
    { name: "poivre", quantity: 1, unit: "" },
    { name: "paprika", quantity: 1, unit: "" },
    { name: "thym", quantity: 5, unit: "ml" },
    { name: "marjolaine", quantity: 10, unit: "ml" },
    { name: "huile végétale", quantity: 30, unit: "ml" },
    { name: "bouillon de bœuf", quantity: 2, unit: "" },
    { name: "champignons", quantity: 450, unit: "g" },
    { name: "haricots verts", quantity: 1, unit: "" },
    { name: "ail", quantity: 3, unit: "" },
    { name: "céleri", quantity: 3, unit: "" },
    { name: "carottes", quantity: 4, unit: "" },
    { name: "eau", quantity: 1, unit: "" }
  ],
  instructions: [
    "Enrober légèrement les morceaux de bœuf de farine, puis les faire dorer dans l’huile végétale.",
    "Transférer le bœuf dans une grande casserole. Déglacer la poêle avec le bouillon de bœuf et verser le liquide dans la casserole.",
    "Faire revenir brièvement le céleri, l’ail et l’oignon, puis les ajouter au bœuf. Laisser mijoter pendant 1 heure 30.",
    "Ajouter l’orge et poursuivre la cuisson pendant 30 minutes.",
    "Ajouter les pommes de terre, les champignons tranchés, les haricots verts surgelés, les tomates en dés et le concentré de tomate.",
    "Ajouter la sauce Worcestershire, le thym, la marjolaine, le paprika, le sel et le poivre. Ajouter suffisamment d’eau pour couvrir les ingrédients.",
    "Laisser mijoter pendant environ 1 heure supplémentaire, jusqu’à ce que le bœuf soit tendre et que les légumes soient cuits.",
    "Hacher le persil et l’incorporer au ragoût juste avant de servir."
  ]
},
{
  id: "sauce-de-boeuf-et-gésiers",
  title: "Sauce de bœuf et gésiers",
  image: "",
  time: "",
  vegan: false,
  ingredients: [
    { name: "gésiers de poulet", quantity: 1000, unit: "g" },
    { name: "sel", quantity: 15, unit: "ml" },
    { name: "oignon", quantity: 1, unit: "" },
    { name: "bouillon de bœuf", quantity: 2, unit: "" },
    { name: "curry", quantity: 15, unit: "ml" },
    { name: "thym", quantity: 15, unit: "ml" },
    { name: "bœuf", quantity: 1000, unit: "g" },
    { name: "huile végétale", quantity: 1, unit: "" },
    { name: "poivrons", quantity: 3, unit: "" },
    { name: "piments habanero", quantity: 6, unit: "" },
    { name: "tomates", quantity: 5, unit: "" },
    { name: "oignons verts", quantity: 60, unit: "ml" }
  ],
  instructions: [
    "Cuire les gésiers avec le sel, l'oignon, le bouillon de bœuf, le curry et le thym. Ajouter de l'eau et cuire jusqu'à ce que les gésiers soient tendres.",
    "Cuire le bœuf avec le sel, l'oignon, le bouillon de bœuf, le curry et le thym. Laisser cuire dans son propre jus, puis ajouter de l'eau et poursuivre la cuisson jusqu'à ce que le bœuf soit tendre.",
    "Chauffer l'huile végétale dans une poêle. Ajouter le bœuf cuit et le faire dorer. Retirer le bœuf de l'huile.",
    "Ajouter les gésiers cuits dans l'huile chaude et les faire frire jusqu'à ce qu'ils soient dorés. Retirer les gésiers de l'huile.",
    "Chauffer un peu d'huile dans une casserole. Ajouter les oignons hachés, les poivrons mixés grossièrement, les tomates, le sel, le bouillon de bœuf, le curry et le thym.",
    "Faire revenir la sauce pendant 10 à 12 minutes.",
    "Ajouter le bœuf et les gésiers dorés, puis bien mélanger.",
    "Ajouter les oignons verts et laisser mijoter pendant 2 minutes.",
    "Retirer du feu et servir."
  ]
},
{
  id: "carpaccio-de-boeuf",
  title: "Carpaccio de bœuf",
  image: "",
  time: "30 minutes",
  vegan: false,
  ingredients: [
    { name: "filet de bœuf", quantity: 400, unit: "g" },
    { name: "huile d'olive", quantity: 90, unit: "ml" },
    { name: "pignons de pin", quantity: 1, unit: "" },
    { name: "parmesan", quantity: 50, unit: "g" },
    { name: "huile de truffe", quantity: 1, unit: "" },
    { name: "sel", quantity: 1, unit: "" },
    { name: "poivre", quantity: 1, unit: "" }
  ],
  instructions: [
    "Couper le filet de bœuf en tranches extrêmement fines d'environ 2 mm d'épaisseur.",
    "Déposer les tranches de bœuf entre deux feuilles de film alimentaire, puis les aplatir délicatement avec le dos d'un couteau.",
    "Verser un peu d'huile d'olive sur une grande assiette et y déposer une couche de bœuf. Assaisonner de sel et de poivre, puis répéter jusqu'à utiliser tout le bœuf.",
    "Couvrir l'assiette de film alimentaire et laisser mariner pendant 30 minutes.",
    "Pendant ce temps, faire griller les pignons de pin à sec dans une poêle.",
    "Répartir le bœuf dans des assiettes individuelles.",
    "Garnir de pignons de pin grillés et de copeaux de parmesan, puis arroser d'un filet d'huile de truffe si désiré."
  ]
},
{
  id: "curry-de-boeuf",
  title: "Curry de bœuf",
  image: "",
  time: "1 h 30",
  vegan: false,
  servings: 4,
  ingredients: [
    { name: "Bœuf haché", quantity: 450, unit: "g" },
    { name: "Oignon", quantity: 1, unit: "" },
    { name: "Poivron", quantity: 1, unit: "" },
    { name: "Curry en poudre", quantity: 5, unit: "g" },
    { name: "Cube de bouillon de bœuf", quantity: 1, unit: "" },
    { name: "Purée de tomate", quantity: 30, unit: "g" },
    { name: "Riz", quantity: 280, unit: "g" },
    { name: "Eau", quantity: 650, unit: "ml" },
    { name: "Citron", quantity: 1, unit: "" },
   
  ],
  instructions: [
    "Éplucher et hacher l’oignon et le poivron.",
    "Faire dorer le bœuf haché dans une poêle, puis ajouter le curry en poudre.",
    "Ajouter l’oignon et le poivron hachés et faire revenir pendant 1 minute.",
    "Ajouter le cube de bouillon émietté et la purée de tomate. Mélanger.",
    "Ajouter suffisamment d’eau pour couvrir la préparation.",
    "Porter à ébullition, puis laisser mijoter pendant 1 heure en remuant toutes les 10 minutes.",
    "Pendant ce temps, porter le riz et l’eau à ébullition.",
    "Pour obtenir un riz jaune, ajouter une petite quantité de curcuma.",
    "Couvrir immédiatement, réduire le feu au minimum et cuire pendant 10 minutes.",
    "Éteindre le feu et laisser reposer le riz pendant 10 minutes.",
    "Ajouter le jus du citron au riz.",
    "Égrener le riz avec une fourchette.",
    "Servir le riz dans une assiette et déposer le curry de bœuf par-dessus."
  ]
},
{
  id: "jerky-de-boeuf",
  title: "Jerky de bœuf",
  image: "",
  time: "8 h 30",
  vegan: false,
  ingredients: [
    { name: "Sel", quantity: 4, unit: "g" },
    { name: "Poivre", quantity: 0.5, unit: "g" },
    { name: "Cassonade", quantity: 12, unit: "g" },
    { name: "Ail", quantity: 0.5, unit: "g" },
    { name: "Sauce Worcestershire", quantity: 30, unit: "ml" },
    { name: "Fumée liquide", quantity: 1.25, unit: "ml" },
    { name: "Bavette", quantity: 450, unit: "g" } /*steak de flanc*/
  ],
  instructions: [
    "Mélanger le sel, le poivre, la cassonade, l’ail, la sauce Worcestershire et la fumée liquide pour préparer la marinade.",
    "Couper le bœuf en lanières d’environ 6 mm d’épaisseur. Il est également possible d’utiliser de petits morceaux de bœuf d’environ 2 cm. Si possible, couper la viande dans le sens des fibres plutôt que perpendiculairement. Placer la viande au congélateur pendant un court moment peut faciliter la découpe.",
    "Faire mariner le bœuf pendant au moins 1 à 2 heures, idéalement toute une nuit.",
    "Déposer les morceaux de viande sur des grilles et les faire sécher dans un déshydrateur à 63 °C pendant 6 à 8 heures.",
    "Pour une cuisson au four, placer la viande sur des grilles recouvertes de papier aluminium et sécher à 65 °C. Retourner la viande après 3 à 4 heures, puis réduire la température à 55 °C et poursuivre le séchage.",
    "Le bœuf séché est prêt lorsqu’il peut se plier sans se casser."
  ]
}


























  


]