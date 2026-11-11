// ─────────────────────────────────────────────
// Ce qu'un aliment vu sur une photo couvre dans les recettes
// ─────────────────────────────────────────────
// Les termes s'écrivent normalement (accents, majuscules, pluriels) : ils sont
// comparés mot à mot après normalisation, comme les noms d'ingrédients des
// recettes (voir lib/fridgeMatch.ts).
//   fr : comme les recettes de Ricardo nomment l'aliment ;
//   en : ce que l'IA de détection peut renvoyer en anglais (les pluriels
//        anglais irréguliers, « tomatoes », « cherries », sont ajoutés seuls).
// Un nom plus long l'emporte : « pommes de terre » n'est pas une pomme, ni
// « oignons verts » un oignon, ni « lait de coco » du lait.

export type Terms = { fr: string[]; en: string[] };

// Morceau d'un aliment : l'aliment entier (ou sans précision) les couvre tous,
// un morceau ne couvre que lui-même.
export type Cut = Terms & {
  id: string;
  // « 250 ml de poulet cuit » : n'importe quel poulet fait l'affaire, il suffit
  // de le cuire.
  anyInRecipe?: boolean;
};

// Variante qui doit être la même des deux côtés : du bœuf haché ne remplace
// pas un rôti, et un rôti ne se hache pas sans hachoir.
export type Kind = Terms & { id: string };

export type Family = Terms & {
  id: string;
  // « fromage », « poisson » : un nom plus précis dans la recette l'emporte
  // (« fromage cheddar » est du cheddar).
  broad?: boolean;
  cuts?: Cut[];
  // Recette qui ne nomme aucun morceau :
  //   "whole"  → il faut l'aliment entier (« 1 citron », pas du jus en bouteille) ;
  //   "byUnit" → entier s'il est compté ou pesé en kg (« 1 poulet de 2 kg »),
  //              sinon c'est de la chair (« 250 ml de poulet », « 170 g de poulet »).
  plain?: "whole" | "byUnit";
  kinds?: Kind[];
};

// Morceau qui veut dire « l'aliment entier » (« poulet entier », « whole chicken »).
export const WHOLE = "entier";

const list = (terms = "") => terms.split("|").filter(Boolean);

const term = (id: string, fr: string, en?: string) => ({ id, fr: list(fr), en: list(en) });

// food("pomme de terre|patate", "potato") : le premier terme français sert d'identifiant.
const food = (fr: string, en?: string, more: Partial<Family> = {}): Family => ({
  id: list(fr)[0],
  fr: list(fr),
  en: list(en),
  ...more,
});

// ─────────────────────────────────────────────
// Produits tirés d'un aliment
// ─────────────────────────────────────────────
// Un mot de cette liste doit se retrouver des deux côtés : du poulet ne fait
// pas de bouillon de poulet, une tomate ne fait pas de pâte de tomates, des
// amandes ne font pas de poudre d'amandes. Le bouillon de poulet, lui, couvre
// « bouillon de légumes ou poulet ».
export const DERIVED: Kind[] = [
  term("bouillon", "bouillon|fond|fumet|consommé", "broth|stock|bouillon|consomme"),
  term("sauce", "sauce", "sauce"),
  term("jus", "jus", "juice"),
  term("pâte", "pâte", "paste"),
  term("purée", "purée|coulis|passata", "puree|passata"),
  term("poudre", "poudre|moulu|moulue", "powder"),
  term("séché", "séché|séchée|déshydraté|déshydratée", "dried|dry|dehydrated"),
  term("extrait", "extrait|essence|arôme", "extract|essence"),
  term("sirop", "sirop", "syrup"),
  term("confiture", "confiture|gelée|marmelade|compote", "jam|jelly|marmalade|preserves|compote"),
  term("huile", "huile", "oil"),
  term("vinaigre", "vinaigre", "vinegar"),
  term("vinaigrette", "vinaigrette|marinade", "dressing|marinade"),
  term("soupe", "soupe|potage|velouté", "soup"),
  term("farine", "farine|fécule|semoule", "flour|starch"),
  term("graine", "graine", "seed"),
  term("épice", "assaisonnement|épice", "seasoning|spice"),
  term("chips", "chips|croustille", "chips|crisps"),
  term("céréale", "céréale", "cereal"),
  term("confit", "confit|confite|mariné|marinée", "candied|pickled|confit"),
  term("alcool", "liqueur|cidre|eau-de-vie", "liqueur|cider"),
  // « sel de céleri », « sel d'oignon » ; pas le beurre demi-sel.
  term("sel", "sel de|sel d|fleur de sel", "salt"),
];

// ─────────────────────────────────────────────
// Morceaux et variantes
// ─────────────────────────────────────────────
const GROUND = term("haché", "haché|hachée", "ground|minced");

// Poitrines, cuisses, pilons, ailes : un poulet entier couvre tout, des
// poitrines ne couvrent que les recettes aux poitrines (ou au poulet cuit).
const POULTRY_CUTS: Cut[] = [
  term("poitrine", "poitrine|demi-poitrine|escalope|suprême|magret|filet", "breast|cutlet|tender|tenderloin|fillet|filet"),
  term("cuisse", "cuisse|haut de cuisse", "thigh|leg|quarter"),
  term("pilon", "pilon", "drumstick"),
  term("aile", "aile|aileron", "wing"),
  term(WHOLE, "entier|entière", "whole"),
  {
    ...term("cuit", "cuit|cuite|effiloché|effilochée", "cooked|rotisserie|roasted|grilled|shredded|leftover"),
    anyInRecipe: true,
  },
];

const POULTRY_KINDS: Kind[] = [
  GROUND,
  term("abats", "foie|gésier|coeur", "liver|gizzard|heart"),
  term("gras", "gras|graisse", "fat"),
];

const MEAT_KINDS: Kind[] = [
  GROUND,
  term("abats", "foie|rognon|langue|coeur|ris|moelle", "liver|kidney|tongue|heart|marrow|sweetbread"),
];

const FISH_KINDS: Kind[] = [term("fumé", "fumé|fumée|gravlax", "smoked|lox")];

const poultry = { cuts: POULTRY_CUTS, kinds: POULTRY_KINDS, plain: "byUnit" } as const;
const meat = { kinds: MEAT_KINDS };
const fish = { kinds: FISH_KINDS };

// Un citron entier donne son jus et son zeste ; du jus en bouteille ne donne
// ni zeste ni quartiers.
const citrus: Partial<Family> = {
  cuts: [term("jus", "jus", "juice"), term("zeste", "zeste", "zest|peel")],
  plain: "whole",
};

// ─────────────────────────────────────────────
// Aliments
// ─────────────────────────────────────────────
export const FAMILIES: Family[] = [
  // Volailles et viandes
  food("poulet", "chicken", poultry),
  food("dinde", "turkey", poultry),
  food("canard", "duck", poultry),
  food(
    "boeuf|bavette|bifteck|surlonge|contre-filet|faux-filet|entrecôte|filet mignon|tournedos|rosbif|onglet",
    "beef|steak|sirloin|ribeye|brisket",
    meat
  ),
  food("veau", "veal", meat),
  food("porc", "pork", meat),
  food("agneau", "lamb", meat),
  food("viande hachée", "ground meat|minced meat"),
  food("bacon", "bacon"),
  food("jambon", "ham"),
  food("prosciutto", "prosciutto"),
  food("pancetta", "pancetta"),
  food("lardon", "lardon"),
  food("saucisse", "sausage|hot dog"),
  food("chorizo", "chorizo"),
  food("pepperoni", "pepperoni"),
  food("salami|saucisson", "salami"),

  // Poissons et fruits de mer
  food("poisson|poisson blanc", "fish|white fish", { ...fish, broad: true }),
  food("saumon", "salmon", fish),
  food("truite", "trout", fish),
  food("maquereau", "mackerel", fish),
  food("thon", "tuna"),
  food("morue|cabillaud", "cod"),
  food("aiglefin", "haddock"),
  food("tilapia", "tilapia"),
  food("sardine", "sardine"),
  food("anchois", "anchovy"),
  food("crevette", "shrimp|prawn"),
  food("pétoncle", "scallop"),
  food("moule", "mussel"),
  food("homard", "lobster"),
  food("crabe", "crab"),
  food("calmar", "squid|calamari"),

  // Œufs et produits laitiers
  food("oeuf", "egg"),
  food("lait", "milk"),
  food("lait de coco", "coconut milk"),
  food("lait concentré|lait condensé", "condensed milk"),
  food("lait évaporé", "evaporated milk"),
  food("lait de beurre|babeurre", "buttermilk"),
  food("lait d'amande|boisson d'amande", "almond milk"),
  food("lait d'avoine|boisson d'avoine", "oat milk"),
  food("lait de soya|lait de soja|boisson de soya|boisson de soja", "soy milk|soya milk"),
  food("lait au chocolat", "chocolate milk"),
  food("crème", "cream|heavy cream|whipping cream"),
  food("crème sure", "sour cream"),
  food("crème fraîche", "creme fraiche"),
  food("crème glacée", "ice cream"),
  food("crème de tartre", "cream of tartar"),
  food("crème de coco", "coconut cream"),
  food("crème irlandaise", "irish cream"),
  food("crème de cassis"),
  food("crème de menthe"),
  food("crème de marrons"),
  food("crème de pistaches"),
  food("crème de cacao"),
  food("crème de champignons", "cream of mushroom"),
  food("yogourt|yaourt|yogurt", "yogurt|yoghurt"),
  food("beurre", "butter"),
  food("beurre d'arachide", "peanut butter"),
  food("beurre d'amande", "almond butter"),
  food("beurre de cajou", "cashew butter"),
  food("beurre de noisette", "hazelnut butter"),
  food("beurre d'érable", "maple butter"),
  food("beurre de pomme", "apple butter"),
  food("beurre de cacao", "cocoa butter"),
  food("fromage", "cheese", { broad: true }),
  food("fromage à la crème", "cream cheese"),
  food("cheddar", "cheddar"),
  food("mozzarella", "mozzarella"),
  food("bocconcini", "bocconcini"),
  food("burrata", "burrata"),
  food("parmesan|parmigiano", "parmesan|parmigiano"),
  food("pecorino", "pecorino"),
  food("feta", "feta"),
  food("ricotta", "ricotta"),
  food("gruyère", "gruyere"),
  food("emmental|emmenthal", "emmental|swiss cheese"),
  food("mascarpone", "mascarpone"),
  food("fromage de chèvre|chèvre", "goat cheese"),
  food("fromage cottage|cottage", "cottage cheese"),
  food("fromage bleu|gorgonzola|roquefort", "blue cheese|gorgonzola"),
  food("fromage en grains", "cheese curds"),
  food("halloumi", "halloumi"),
  food("brie", "brie"),
  food("camembert", "camembert"),
  food("provolone", "provolone"),
  food("raclette", "raclette"),
  food("monterey jack", "monterey jack"),
  food("oka", "oka"),

  // Légumes
  food("oignon", "onion"),
  food("oignon vert|échalote verte", "green onion|spring onion|scallion"),
  food("échalote", "shallot"),
  food("ail", "garlic"),
  food("poireau", "leek"),
  food("ciboulette", "chive"),
  food("tomate", "tomato"),
  food("pomme de terre|patate", "potato"),
  food("patate douce", "sweet potato|yam"),
  food("carotte", "carrot"),
  food("céleri", "celery"),
  food("céleri-rave", "celeriac|celery root"),
  food("poivron", "bell pepper|pepper|capsicum"),
  food(
    "piment|jalapeño",
    "chili|chile|chili pepper|hot pepper|jalapeno|jalapeno pepper|serrano|serrano pepper|habanero"
  ),
  food("flocons de piment|piment broyé", "chili flakes|red pepper flakes|crushed red pepper"),
  food("piment de Cayenne|poivre de Cayenne|cayenne", "cayenne"),
  food("piment de la Jamaïque", "allspice"),
  food("piment d'Espelette"),
  food("poivre", "black pepper|peppercorn"),
  food("concombre", "cucumber"),
  food("courgette|zucchini", "zucchini|courgette"),
  food("aubergine", "eggplant|aubergine"),
  food("champignon", "mushroom"),
  food("brocoli", "broccoli"),
  food("chou-fleur", "cauliflower"),
  food("chou", "cabbage"),
  food("chou frisé|kale", "kale"),
  food("chou de Bruxelles", "brussels sprout"),
  food("bok choy|pak choï|chou chinois|chou nappa", "bok choy|pak choi|napa cabbage"),
  food("laitue|romaine|mesclun", "lettuce|romaine"),
  food("roquette", "arugula|rocket"),
  food("épinard", "spinach"),
  food("maïs", "corn"),
  food("maïs éclaté|maïs soufflé", "popcorn"),
  food("maïs en crème", "creamed corn"),
  food("pois|petits pois", "pea|green pea"),
  food("pois chiche", "chickpea|garbanzo"),
  food("pois mange-tout|pois sucré", "snow pea|snap pea|sugar snap"),
  food("haricot vert", "green bean|string bean"),
  food("haricot noir", "black bean"),
  food("haricot rouge", "kidney bean|red bean"),
  food("haricot blanc", "white bean|navy bean|cannellini"),
  food("lentille", "lentil"),
  food("edamame", "edamame"),
  food("fève germée|germe de soya", "bean sprout"),
  food("asperge", "asparagus"),
  food("avocat", "avocado"),
  food("betterave", "beet|beetroot"),
  food("radis", "radish"),
  food("navet", "turnip"),
  food("rutabaga", "rutabaga"),
  food("panais", "parsnip"),
  food("fenouil", "fennel"),
  food("courge|citrouille|potiron", "squash|pumpkin|butternut"),
  food("gingembre", "ginger"),
  food("artichaut", "artichoke"),
  food("olive", "olive"),
  food("câpre", "caper"),

  // Fines herbes
  food("persil", "parsley"),
  food("coriandre", "cilantro|coriander"),
  food("basilic", "basil"),
  food("menthe", "mint"),
  food("aneth", "dill"),
  food("thym", "thyme"),
  food("romarin", "rosemary"),
  food("origan", "oregano"),
  food("sauge", "sage"),
  food("estragon", "tarragon"),
  food("citronnelle", "lemongrass"),

  // Fruits
  food("pomme", "apple"),
  food("poire", "pear"),
  food("banane", "banana"),
  food("orange", "orange", citrus),
  food("citron", "lemon", citrus),
  food("lime|citron vert", "lime", citrus),
  food("pamplemousse", "grapefruit", citrus),
  food("clémentine|mandarine", "clementine|mandarin|tangerine", citrus),
  food("fraise", "strawberry"),
  food("framboise", "raspberry"),
  food("bleuet|myrtille", "blueberry"),
  food("mûre", "blackberry"),
  food("canneberge", "cranberry"),
  food("raisin", "grape"),
  // Pas « raisin » en anglais : c'est aussi le raisin frais en français.
  food("raisin sec|raisin de Corinthe", "dried grape"),
  food("cerise", "cherry"),
  food("pêche", "peach"),
  food("nectarine", "nectarine"),
  food("prune", "plum"),
  food("pruneau"),
  food("abricot", "apricot"),
  food("ananas", "pineapple"),
  food("mangue", "mango"),
  food("melon|cantaloup", "melon|cantaloupe|honeydew"),
  food("melon d'eau|pastèque", "watermelon"),
  food("kiwi", "kiwi"),
  food("figue", "fig"),
  food("datte", "date"),
  food("grenade", "pomegranate"),
  food("rhubarbe", "rhubarb"),
  food("noix de coco|coco", "coconut"),
  food("fruit de la passion", "passion fruit"),
  food("papaye", "papaya"),
  food("litchi", "lychee"),

  // Noix
  food("amande", "almond"),
  food("noix de Grenoble|noix", "walnut", { broad: true }),
  food("noix de cajou|cajou", "cashew"),
  food("pacane", "pecan"),
  food("noisette", "hazelnut"),
  food("arachide|cacahuète", "peanut"),
  food("pistache", "pistachio"),
  food("noix de pin|pignon", "pine nut"),
  food("muscade|noix de muscade", "nutmeg"),

  // Pains et céréales
  food("pain", "bread"),
  food("tortilla", "tortilla|wrap"),
  food("riz", "rice"),
  food("nouille|vermicelle", "noodle|vermicelli"),
  food("papier de riz", "rice paper"),
  food("avoine|flocons d'avoine", "oat|oatmeal"),
  food("quinoa", "quinoa"),
  food("couscous", "couscous"),
  food("orge", "barley"),

  // Le reste du frigo
  food("tofu", "tofu"),
  food("tempeh", "tempeh"),
  food("miel", "honey"),
  food("sirop d'érable", "maple syrup"),
  food("moutarde", "mustard"),
  food("ketchup", "ketchup"),
  food("mayonnaise", "mayonnaise|mayo"),
  food("sauce soya|sauce soja|tamari", "soy sauce|tamari"),
  food("salsa", "salsa"),
  food("pesto", "pesto"),
  food("houmous|hummus", "hummus"),
  food("chocolat", "chocolate"),
  food("vin", "wine", { broad: true }),
  food("vin blanc", "white wine"),
  food("vin rouge", "red wine"),
  food("bière", "beer"),
];
