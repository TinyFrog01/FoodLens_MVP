const fs = require("fs");
const path = require("path");
const { normalize, found, parseNumber, roundQuantity, formatMinutes, keysOf, NUMBER } = require("./convert-wikibooks-recipes");

// Turns the recipes downloaded by scripts/scrape-ricardo-recipes.js into the app's
// Recipe format, kept in French, in app/Food/data/recipe/recipe_r.ts, and lists every
// ingredient they use once in app/Food/data/recipe/ingredients_r.ts.
//
// Allergens, diets and appliances come from French keywords and from Ricardo's own
// tags, and err on the safe side like the Wikibooks ones: an allergen is flagged as
// soon as an ingredient may contain it or Ricardo says the recipe does, and a diet
// is only claimed when neither an ingredient nor Ricardo's tags contradict it.
//
//   npm run convert:ricardo

const RECIPE_DIR = path.join(__dirname, "../app/Food/data/recipe");
const INPUT_FILE = path.join(__dirname, "ricardo-recipes.json");
const OUTPUT_FILE = path.join(RECIPE_DIR, "recipe_r.ts");
const INGREDIENTS_FILE = path.join(RECIPE_DIR, "ingredients_r.ts");
const CURATED_FILE = path.join(RECIPE_DIR, "recipe.ts");
const WIKIBOOKS_FILE = path.join(RECIPE_DIR, "wikibooks-recipes.json");
const DIETARY_FILE = path.join(__dirname, "../constants/dietary.ts");
const PART_SIZE = 500; // recipes per array literal in recipe_r.ts

const ENTITIES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", deg: "°", rsquo: "’",
  lsquo: "‘", laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—", eacute: "é",
  egrave: "è", agrave: "à", ccedil: "ç", oelig: "œ",
};

// Steps and ingredient lines hold bits of HTML, tabs and non-breaking spaces.
function cleanText(text) {
  return String(text)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => ENTITIES[name.toLowerCase()] ?? entity)
    .replace(/[\s  ]+/g, " ")
    .replace(/\b([dl]['’]) (?=[a-zà-ÿœæ])/gi, "$1") // "confiture d' abricots"
    .trim();
}

// ─────────────────────────────────────────────
// Quantities and units
// ─────────────────────────────────────────────

// "125 ml (1/2 tasse) de ketchup", "1 1/2 c. à soupe", "2 à 3 gousses"
const LEADING_QUANTITY = new RegExp(`^(${NUMBER})(?:\\s*(?:-|–|à|ou)\\s*(${NUMBER}))?\\s*`);
const WORD_QUANTITY = /^(une? demie?|une?|deux|trois|quatre|cinq|six|huit|dix|douze)\s+(?!peu\b)/i;
const WORD_NUMBERS = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, huit: 8, dix: 10, douze: 12,
  "un demi": 0.5, "une demi": 0.5, "une demie": 0.5,
};

const LETTER = "a-zà-ÿœæ";
// [unit stored in the recipe (null: as written), pattern]
const UNITS = [
  ["ml", new RegExp(`^(?:ml|millilitres?)(?![${LETTER}])`, "i")],
  ["L", new RegExp(`^(?:l|litres?)(?![${LETTER}'’])`, "i")],
  ["kg", new RegExp(`^(?:kg|kilos?|kilogrammes?)(?![${LETTER}])`, "i")],
  ["g", new RegExp(`^(?:g|grammes?)(?![${LETTER}])`, "i")],
  ["lb", new RegExp(`^(?:lbs?|livres?)(?![${LETTER}])`, "i")],
  ["oz", new RegExp(`^oz(?![${LETTER}])`, "i")],
  ["c. à soupe", /^(?:c\.|cuil\.|cuill[eè]res?|cuiller[ée]es?)\s*à\s*(?:soupe|s\.)/i],
  ["c. à thé", /^(?:c\.|cuil\.|cuill[eè]res?|cuiller[ée]es?)\s*à\s*(?:thé|café|t\.|c\.)/i],
  [null, new RegExp(`^(?:tasses?|pincées?|gousses?|tranches?|brins?|branches?|tiges?|bouquets?|bottes?|têtes?|poignées?|traits?|gouttes?|lanières?|rondelles?|abaisses?|boules?|carrés?|cubes?|morceaux|morceau|quartiers?)(?![${LETTER}])`, "i")],
];
const METRIC_UNITS = new Set(["ml", "L", "g", "kg", "lb", "oz"]);
// "1 boîte de 398 ml (14 oz) de tomates": the size is the quantity
const CONTAINER = new RegExp(`^(?:boîtes?|conserves?|pots?|bocal|bocaux|contenants?|bouteilles?|canettes?|cannettes?|sacs?|sachets?|enveloppes?|paquets?|barquettes?|emballages?|tubes?|rouleaux|rouleau|blocs?|briques?|cartons?)(?![${LETTER}])`, "i");
const SIZE = new RegExp(`^\\s*de\\s+(${NUMBER})\\s*(ml|l|litres?|g|kg)(?![${LETTER}])`, "i");
// "1 rôti de porc de 1,8 kg (4 lb)", "1 fromage d'environ 350 g de type brie"
const WEIGHT_AFTER_NAME = new RegExp(`^(.*?)\\s+(?:de\\s+|d['’])(?:environ\\s+)?(${NUMBER})\\s*(kg|g)(?![${LETTER}])`, "i");
const LENGTH = new RegExp(`^\\s*de\\s+${NUMBER}\\s*(?:cm|mm|po|pouces?)(?![${LETTER}])`, "i");
// "30 ml à 70 g (2 c. à soupe à 1/3 tasse) de sucre"
const RANGE_END = new RegExp(`^\\s*(?:à|-|–|ou)\\s*${NUMBER}\\s*(?:ml|l|g|kg)?(?![${LETTER}])`, "i");
// Utensils some recipes list with the ingredients (on accent-free lowercase text)
const EQUIPMENT = /^[\d\s/,.½¼¾⅓⅔]*(?:(?:environ|un|une|des|quelques)\s+)?[\d\s]*(?:jeu de \d+ )?(?:coton a fromage|emporte-pieces?|rubans? (?:d'environ|de \d|de satin|de tissu)|bandelettes|batons? (?:de bois|a sucettes|a popsicle)|batonnets? (?:de bois|a cafe|a sucettes|a popsicle)|brochettes? (?:de bois|de metal|en bois|en metal)|piques? (?:a|en) |cure-dents?|gants?|papier (?:parchemin|d'aluminium|cire|absorbant|sulfurise)|pellicule plastique|caissettes?|moules? (?:a|en|de) (?:muffins?|tartes?|tartelettes?|gateaux?|cake|pain|charniere|silicone|papier)|ficelle|thermometre|sacs? (?:a|de) (?:congelation|patisserie)|poche a douille|douilles?|accessoires|pots? (?:en verre|masson|mason)|pinceaux?)\b/;
// "aubergines d'environ 400 g chacune", "pancetta d'environ 1/2 cm d'épaisseur"
const SIZE_IN_NAME = new RegExp(`\\s+(?:de\\s+|d['’])(?:environ\\s+)?${NUMBER}\\s*(?:g|kg|ml|l|cm|mm|po)(?![${LETTER}]).*$`, "i");
// "persil plat ciselé", "chou vert haché finement", "beurre fondu": the ingredient, not how
// to prepare it, so it matches what people keep in their fridge.
const PREPARATION_TAIL = new RegExp(
  `\\s+(?:(?:très|bien)\\s+)?(?:(?:finement|grossièrement|légèrement)\\s+)?(?:ciselée?s?|émincée?s?|tranchée?s?|hachée?s?|râpée?s?|pelée?s?|coupée?s?|épépinée?s?|dénoyautée?s?|égouttée?s?|rincée?s?|parée?s?|équeutée?s?|effeuillée?s?|effilée?s?|nettoyée?s?|lavée?s?|battue?s?|fondue?s?|ramollie?s?|tempérée?s?|décongelée?s?|concassée?s?|émiettée?s?|écrasée?s?|grillée?s?|cuite?s?|tassée?s?|tamisée?s?|mou|molle|froide?s?|chaude?s?|tièdes?|en (?:dés|cubes|tronçons|julienne|lanières|rondelles|quartiers|morceaux|tranches|fines tranches|brunoise|bâtonnets|purée)|à (?:la )?température ambiante)(?![${LETTER}]).*$`,
  "i"
);
// …except where it names a product: "bœuf haché", "tomates en dés", "noix de coco râpée"
const PRODUCT = new RegExp(
  `(?:(?:b(?:œ|oe)uf|porc|veau|agneau|poulet|dinde|viande|bison|gibier|cerf|canard|sanglier|wapiti) hachée?s?|^tomates?(?: italiennes| entières| cerises)? (?:pelées|écrasées|broyées|concassées|en dés)|noix de coco râpée|pâte (?:molle|ferme|demi-ferme)|croûte (?:lavée|fleurie))(?![${LETTER}])`,
  "i"
);
// What follows the comma in "oignon, haché finement" (but not in "riesling, chasselas ou autre vin blanc")
const PREPARATION = new RegExp(
  `^\\s*(?:[${LETTER}'’-]+(?:é|ée|és|ées)(?![${LETTER}])|(?:ramolli|refroidi|rôti|cuit|confit|fondu|fendu|battu|moulu|réduit|défait|attendri|aplati|farci|blanchi|bouilli|garni|frit|dissous|tiède|froid|chaud|mou|molle|entier|entière)[${LETTER}]*|(?:en|au|aux|à|pour|sans|avec|environ|finement|grossièrement|légèrement|bien|très|idéalement|surtout|non|le|la|les|jus|zeste|partie|seulement|selon|soit|si|plus|divisé|facultatif|de préférence)(?![${LETTER}])|l['’]|ou (?:au goût|plus))`,
  "i"
);

function metricUnit(raw) {
  const unit = raw.toLowerCase();
  if (unit === "kg") return "kg";
  if (unit === "g") return "g";
  if (unit === "ml") return "ml";
  return "L";
}

function readUnit(text) {
  const rest = text.trimStart();
  for (const [unit, pattern] of UNITS) {
    const match = rest.match(pattern);
    if (match) return { unit: unit ?? match[0].toLowerCase(), rest: rest.slice(match[0].length) };
  }
  const container = rest.match(CONTAINER);
  if (container) return { unit: container[0].toLowerCase(), rest: rest.slice(container[0].length) };
  return { unit: "", rest };
}

function cleanName(text) {
  let name = text;
  for (let previous; previous !== name; ) {
    previous = name;
    name = name.replace(/\([^()]*\)/g, " ");
  }
  name = name
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:(?:chacune?s?|environ)\s+)?(?:de\s+|d['’]\s*)/i, "")
    .replace(/^(?:l['’]\s*|la\s+|le\s+|les\s+|du\s+|des\s+)/i, "")
    .replace(/\s+ou\s+(?:de\s+|d['’]\s*)/gi, " ou "); // "crème sure ou de crème 15 %"
  const comma = name.indexOf(",");
  if (comma !== -1 && PREPARATION.test(name.slice(comma + 1))) name = name.slice(0, comma);
  name = name.replace(SIZE_IN_NAME, "");
  const product = name.match(PRODUCT);
  name = name.replace(PREPARATION_TAIL, (tail, at) => (product && product.index + product[0].length > at ? tail : ""));
  name = name
    .replace(/\s+(?:au goût|facultatif|ou plus|environ)(?![a-zà-ÿ]).*$/i, "")
    .replace(/\s+pour\s+(?:la |le |l['’]|les )?(?:cuisson|friture|frire|badigeonner|saupoudrer|servir|service|garnir|garniture|décorer|décoration|graisser|beurrer|huiler|fariner|dorer|tremper|accompagner|moule|plaque|poêle|gril|grille)(?![a-zà-ÿ]).*$/i, "")
    .replace(/^(?:environ|quelques|gros|grosse|grosses|petit|petite|petits|petites|moyen|moyenne|moyens|moyennes|beau|belle|beaux|belles)\s+/i, "")
    .replace(/[\s.:;*,]+$/, "")
    .trim();
  return /^[A-ZÀ-ÖØ-Þ][a-zà-ÿ]/.test(name) ? name[0].toLowerCase() + name.slice(1) : name;
}

function parseIngredient(rawLine) {
  const line = cleanText(rawLine).replace(/^environ\s+(?=\d|[½¼¾⅓⅔])/i, "");
  const optional = /facultati/i.test(line);
  let quantity = 0;
  let unit = "";
  let rest = line;

  const leading = line.match(LEADING_QUANTITY);
  const words = line.match(WORD_QUANTITY);
  if (leading) {
    quantity = parseNumber(leading[1]);
    rest = line.slice(leading[0].length);
  } else if (words) {
    quantity = WORD_NUMBERS[words[1].toLowerCase()] ?? 0;
    rest = line.slice(words[0].length);
  }

  if (quantity > 0) {
    ({ unit, rest } = readUnit(rest));
    rest = rest.replace(RANGE_END, "");
    const size = rest.match(SIZE);
    const weight = rest.match(WEIGHT_AFTER_NAME);
    if (size && !METRIC_UNITS.has(unit)) {
      // "1 boîte de 398 ml", "1 morceau de 500 g"
      quantity *= parseNumber(size[1]);
      unit = metricUnit(size[2]);
      rest = rest.slice(size[0].length);
    } else if (!unit && quantity === 1 && weight && !weight[1].includes(",")) {
      quantity = parseNumber(weight[2]);
      unit = metricUnit(weight[3]);
      // keep "de type brie ou camembert", drop "(4 lb) avec ou sans os"
      const after = rest.slice(weight[0].length).replace(/^\s*\([^()]*\)/, "");
      rest = /^\s*(?:de|du) type\b/i.test(after) ? weight[1] + after : weight[1];
    }
    rest = rest.replace(LENGTH, ""); // "1 morceau de 2,5 cm (1 po) de gingembre"
  }

  let name = cleanName(rest);
  if (!name && unit) {
    // "2 gousses": the unit word is the ingredient
    name = unit;
    unit = "";
  }
  name ||= cleanName(line);
  if (optional && !/facultatif/.test(name)) name += " (facultatif)";
  const ingredient = { name, quantity: roundQuantity(quantity), unit };
  // "Sel et poivre" is two ingredients
  const pair = name.match(/^(sel|poivre) et (sel|poivre)(.*)$/i);
  return pair ? [{ ...ingredient, name: pair[1] }, { ...ingredient, name: pair[2] + pair[3] }] : [ingredient];
}

// ─────────────────────────────────────────────
// Allergens and diets (on accent-free lowercase text)
// ─────────────────────────────────────────────

// "bacon végétal", "fromage végétalien", "saucisse de tofu": not the animal product
const SUBSTITUTE = /\b[a-z'-]+(?: [a-z'-]+)? (?:vegetale?s?|vegetaux|vegetalienne?s?|vegetarienne?s?|veganes?|a base de plantes?)\b|\b(?:bacon|saucisses?|burgers?|boulettes|viande hachee|hache|fromage|creme|lait|beurre|yogourt|mayonnaise|oeufs?) (?:de |d'|au |aux |a la )(?:tofu|tempeh|seitan|soya|soja|lentilles|pois chiches|haricots|legumineuses|aubergines?|champignons?|chou-fleur)\b/g;
const ANIMAL_ALLERGENS = new Set(["milk", "eggs", "fish", "shellfish"]);

const MEAT = {
  match: /\b(boeuf|boeufs|veau|porc|porcelet|cochon|jambon|jambonneau|bacon|lard|lardons?|pancetta|prosciutto|guanciale|coppa|capicollo|capicolle|salami|pepperoni|chorizo|saucisses?|saucissons?|merguez|kielbasa|knackwurst|bratwurst|hot-?dogs?|wieners?|mortadelle|rillettes|cretons?|tourtieres?|cipaille|pate (?:de campagne|de foie|chinois)|foie gras|foies?|rognons?|langues?|tripes?|ris de veau|boudin|andouilles?|agneau|mouton|gibier|cerf|chevreuil|wapiti|orignal|caribou|bison|sanglier|lapin|lievre|poulets?|poularde|poussin|coquelet|chapon|dinde|dindon|canard|caneton|magrets?|oie|cailles|faisan|pintade|perdrix|pigeon|volailles?|viandes?|steaks?|bavette|onglet|entrecote|faux-filet|contre-filet|surlonge|filet mignon|tournedos|bifteck|hamburgers?|burgers?|boulettes de viande|cotes? levees|cotelettes?|carre d'agneau|gigot|jarrets?|joues? de (?:boeuf|porc|veau)|hauts? de cuisses?|pilons?|ailes de poulet|ailerons?|graisse de (?:canard|roti|bacon)|gras de canard|saindoux|suif|moelle|bouillon|fond de (?:veau|volaille|gibier)|fond brun|demi-glace|consomme|smoked meat|viande fumee|pastrami|bresaola|speck|nduja|couenne|oreilles de crisse|gesiers?|abats|paleron|macreuse|osso buco|autruche|emeu|kangourou|cheval|cuisses?|dagneau|boulettes|bolognaise|rosette de lyon|os (?:a soupe|a moelle|de (?:boeuf|veau|porc|poulet|volaille|jambon))|(?:interieur|exterieur|noix|pointe|bifteck|tranche|roti) de ronde|roti de palette|bas de cotes?)\b/,
  unless: /\b(?:bouillon|fond|fumet|consomme) (?:de |d'|aux |au )(?:legumes?|poissons?|crevettes|homard|fruits de mer|champignons?|algues|kombu|dashi|mais)\b|\bcourt-bouillon\b|\bboulettes (?:de |aux )(?:pois chiches|lentilles|legumes|riz|tofu|quinoa|haricots|fromage|chocolat|noix de coco|pommes de terre)\b|\bbolognaise (?:sans viande|vegetarienne|vegetalienne|aux lentilles|de lentilles)\b|\b(?:assaisonnements?|epices|melanges? d'epices|sauces?|marinades?) (?:a |pour |au |de )(?:steak|poulet|boeuf|porc|volaille|burger|hamburger|viande|bbq|cotes levees|gibier|roti)s?\b|\bpains? (?:a |pour |de )(?:hamburger|burger|hot-?dog)s?\b|\blangues?[- ]de[- ]chat\b|\boeufs? de cailles?\b|\bsans[- ]viande\b|\bsubstitut de viande\b|\ba cheval\b|\bsteaks? de (?:chou-fleur|thon|saumon|espadon|portobello|tofu|celeri-rave|chou)\b|\bburgers? (?:de |aux |au )(?:legumes|haricots|lentilles|pois chiches|tofu|champignons|quinoa|saumon|thon|poisson|crevettes)\b|\brillettes de (?:saumon|truite|thon|maquereau|poisson)\b/g,
};
const PORK = {
  match: /\b(porc|porcelet|cochon|jambon|jambonneau|bacon|lard|lardons?|pancetta|prosciutto|guanciale|coppa|capicollo|capicolle|salami|pepperoni|chorizo|saucisses?|saucissons?|kielbasa|knackwurst|bratwurst|hot-?dogs?|wieners?|mortadelle|rillettes|cretons?|tourtieres?|cipaille|pate de campagne|pate de foie|andouilles?|boudin|couenne|oreilles de crisse|graisse de (?:roti|bacon)|saindoux|speck|nduja|chair a saucisse|gelatine|guimauves?|jell-?o|viandes?|boulettes|bolognaise|rosette de lyon)\b/,
  unless: MEAT.unless,
};
const GELATIN = /\b(gelatine|guimauves?|jell-?o|aspic|jujubes|oursons en gelee)\b/;
const OTHER_ANIMAL = /\b(miel|gelee royale|cire d'abeille|carmin|cochenille)\b/;
const HIGH_CARB = {
  match: /\b(sucres?|cassonade|miel|sirops?|melasse|confitures?|gelees?|marmelade|bonbons?|chocolats?|cacao|farines?|pains?|baguettes?|croissants?|brioches?|bagels?|pitas?|naans?|muffins?|crepes?|gaufres?|pancakes?|pates|pate (?:brisee|feuilletee|phyllo|filo|sablee|a [a-z]+)|nouilles|vermicelles|spaghettis?|spaghettinis?|macaronis?|pennes?|fettuccines?|fettucines?|linguines?|lasagnes?|tagliatelles?|pappardelles?|farfalles?|fusillis?|rotinis?|rigatonis?|ziti|orecchiettes?|cannellonis?|manicottis?|orzo|gnocchis?|tortellinis?|raviolis?|udon|ramen|soba|riz|pommes? de terre|patates?|mais|ble d'inde|polenta|semoule|gruau|avoine|cereales|granola|haricots|feves|lentilles|pois chiches|pois|quinoa|couscous|boulgour|orge|tortillas?|craquelins?|biscuits?|gateaux?|bananes?|plantains?|ignames?|manioc|taro|dattes?|raisins?|fruits?|jus|bieres?|vins?|lait concentre|chapelure|panko|fecule|mangues?|ananas|oranges?|pommes?|poires?|peches?|cerises?|bleuets?|fraises?|framboises?|mures?|canneberges?|courges? musquees?|courges? butternut|citrouilles?|potirons?|compotes?|nectars?|sorbets?|croustilles|creme glacee|ketchup|sauce (?:bbq|barbecue|chili|aigre-douce|hoisin|teriyaki))\b/,
  unless: /\bjus (?:de |d')(?:[\d/½ ]+ )?(?:citrons?|limes?|cuisson)\b|\bcourges? spaghetti\b|\bsans sucre\b|\bpois (?:mange-tout|sucres)\b|\bharicots (?:verts|jaunes|fins)\b|\bfarine (?:d'amandes?|de noix de coco)\b|\briz de chou-fleur\b|\bmais miniatures?\b|\bfruits de mer\b/g,
};

const ALLERGENS = {
  peanuts: {
    match: /\b(arachides?|darachides?|cacahuetes?|cacahouetes?|satay|noix)\b/,
    unless: /\bnoix (?:de |du |d')(?:coco|muscade|beurre|veau|ronde|saint-jacques|grenoble|cajou|pecan|pin|bresil|macadam|macadamia)\b/g,
  },
  "tree-nuts": {
    match: /\b(amandes?|damandes?|noix|noisettes?|avelines?|pacanes?|pecanes?|pistaches?|cajous?|macadamias?|pignons?|pralines?|pralin|massepain|frangipane|amaretti|amaretto|frangelico|nutella|gianduja|marrons?|chataignes?|nougat|pesto|dukkah|baklava|orgeat|financiers?|macarons?)\b/,
    unless: /\bnoix (?:de |d')(?:coco|muscade|beurre|veau|ronde|saint-jacques)\b|\b(?:beurre|pommes?) noisettes?\b|\bnoisettes? de beurre\b|\bchataignes? d'eau\b/g,
  },
  milk: {
    match: /\b(lait|laits|babeurre|beurre|beurres|ghee|creme|cremes|fromages?|cheddar|mozzarella|mozzarina|bocconcini|burrata|stracciatella|parmesan|parmigiano|reggiano|grana padano|pecorino|romano|ricotta|feta|brie|camembert|gouda|edam|gruyere|emmental|emmenthal|jarlsberg|mascarpone|paneer|halloumi|provolone|fontina|asiago|manchego|monterey jack|havarti|munster|stilton|gorgonzola|roquefort|cottage|quark|labneh|skyr|kefir|petit-lait|lactoserum|caseine|caseinate|lactose|yogourts?|yaourts?|tzatziki|raita|lassi|queso|cotija|oka|raclette|reblochon|comte|tomme|scamorza|taleggio|chevre|cheez|velveeta|dulce de leche|caramels?|butterscotch|fudge|chocolat blanc|chocolat au lait|nutella|smarties|m&m'?s?|pesto|bechamel|alfredo|hollandaise|bearnaise|margarine|gelato)\b/,
    unless: /\b(?:lait|laits|creme|cremes|beurre|yogourts?|fromage) (?:de |d'|au |aux )(?:coco|noix de coco|amandes?|soya|soja|avoine|riz|cajou|noix|chanvre|arachides?|darachides?|cacahuetes?|sesame|cacao|pommes?|erable|karite|tournesol|graines|citrouille|noisettes?|pistaches?|marrons|tartre|cassis|menthe|mais)\b|\bcreme balsamique\b|\bmais en creme\b|\bfromage de tete\b|\b(?:veau|porcelet|cochon|agneau|cochonnet) de lait\b|\bsans (?:beurre|lait|creme)(?: (?:ni|et|ou) (?:beurre|lait|creme))*\b/g,
  },
  eggs: {
    match: /\b(oeufs?|doeufs?|mayonnaise|mayo|aioli|meringues?|creme anglaise|creme patissiere|flan|custard|sabayon|zabaglione|lait de poule|hollandaise|bearnaise|sauce tartare|cesar|creme glacee|gelato|creme brulee|quiche|frittata|omelettes?|brioches?|challah|boudoirs|doigts? de dame|langues?-de-chat|langues de chat|quatre-quarts|madeleines?|biscuits a la cuillere|savoiardi|nougat|pate a choux|crepes?|gaufres?|pain dore|macarons?)\b/,
    unless: /\boeufs? de (?:poisson|saumon|truite|lompe|lump|capelan|hareng|cabillaud|morue|esturgeon)\b|\bsans oeufs?\b/g,
  },
  fish: {
    match: /\b(poissons?|saumons?|thon|morue|aiglefin|eglefin|fletan|truites?|ombles?|raies?|sardines?|anchois|maquereaux?|harengs?|tilapia|sole|turbot|bar raye|filets? de bar|filets? de dore|dore jaune|perchaude|brochet|carpe|espadon|mahi-mahi|lotte|anguilles?|caviar|oeufs de (?:poisson|saumon|truite|lompe|lump|capelan|hareng)|tobiko|masago|bonite|katsuobushi|dashi|worcestershire|nuoc-?mam|nam pla|sauce (?:de |au |aux )poisson|tarama|brandade|merlu|merluche|goberge|vivaneau|rouget|esturgeon|sebaste|loup de mer|dorade|daurade|pangasius|basa|eperlan|capelan|surimi|bottarga|garum|cesar|fumet de poisson|fruits de mer|bacalao|stockfish|gravlax|lox|bouillabaisse)\b/,
  },
  shellfish: {
    match: /\b(crevettes?|crabes?|homards?|langoustes?|langoustines?|ecrevisses?|petoncles?|saint-jacques|moules|huitres?|palourdes?|bulots?|calmars?|calamars?|encornets?|pieuvres?|poulpes?|seiches?|escargots?|oursins?|buccins?|bigorneaux|couteaux de mer|fruits de mer|bisque|surimi|goberge|krill|clams?|mactres)\b/,
  },
  soy: {
    match: /\b(soya|soja|tofu|tempeh|miso|edamames?|tamari|teriyaki|hoisin|natto|tvp|proteines? vegetales? texturees?|lecithine|haricots noirs fermentes|sauce aux haricots noirs|doenjang|gochujang|doubanjiang|ponzu|sauce (?:aux |d')huitres?|maggi|kikkoman|chocolats?|nutella|pate de haricots)\b/,
  },
  gluten: {
    match: /\b(ble|farines?|pains?|chapelure|panure|panko|croutons?|pates|pate (?:brisee|feuilletee|phyllo|filo|sablee|levee|de pain|a [a-z]+)|phyllo|filo|spaghettis?|spaghettinis?|macaronis?|pennes?|fettuccines?|fettucines?|linguines?|lasagnes?|tagliatelles?|pappardelles?|farfalles?|fusillis?|rotinis?|rigatonis?|ziti|orecchiettes?|cannellonis?|manicottis?|coquillettes|coquilles|vermicelles?|orzo|gnocchis?|tortellinis?|raviolis?|nouilles|udon|ramen|soba|spaetzle|pierogis?|wontons?|won tons?|gyozas?|dumplings?|couscous|boulgour|bulgur|semoule|seitan|gluten|epeautre|kamut|farro|freekeh|seigle|orge|malt|maltee?|avoine|gruau|granola|muesli|bieres?|ale|lager|stout|sauce soya|sauce soja|teriyaki|hoisin|sauce (?:aux |d')huitres?|cubes? de bouillon|bouillon en (?:cubes?|poudre)|poudre de bouillon|base de bouillon|fond de veau|demi-glace|sauce brune|sauces? (?:pour |a )steak|sauce hp|roux|biscuits?|craquelins?|biscottes?|gaufrettes?|gateaux?|brownies?|cornets?|graham|sables|boudoirs|doigts de dame|savoiardi|abaisses?|croutes?|tortillas?|wraps?|pitas?|naans?|chapatis?|bagels?|croissants?|brioches?|baguettes?|ciabatta|focaccia|muffins?|crepes?|gaufres?|pancakes?|scones?|matzah?|cereales|cornflakes|rice krispies|smarties|tempura|taboule|fregola|levure de biere|beignes?|beignets?|pretzels?|bretzels?|melba|panettone|pain dore|quatre-quarts|madeleines?|langues?-de-chat|langues de chat|doigts? de dame)\b/,
    unless: /\bble d'inde\b|\bble noir\b|\b(?:farines?|pates|nouilles|vermicelles|semoule|tortillas?|craquelins?|crepes|biscuits?|chapelure|gateaux?) (?:de |d'|au |aux |a la )(?:riz|mais|ble d'inde|amandes?|noix de coco|coco|sarrasin|pois chiches|tapioca|pommes? de terre|manioc|quinoa|millet|teff|sorgho|chataignes?|lentilles|pois|haricots|haricot mungo|soya|soja|banane|arrow-?root|noisettes?|lin|patates? douces?|konjac|verre)\b|\b(?:melanges? de )?(?:farines?|pates|pains?|chapelure|biscuits?|craquelins?|tortillas?|nouilles|cereales|flocons d'avoine|avoine)[^,\n(]{0,40}\bsans gluten\b|\bsans gluten\b|\bcourges? spaghetti\b|\bcoquilles? (?:a |pour |de )(?:tacos|mais)\b|\bcroutes? (?:fleurie|lavee|naturelle|mixte)s?\b|\bcouscous de chou-fleur\b|\bpates? (?:a sucre|a modeler|a tartiner|d'amandes?|de (?:tomates?|fruits|curry|cari|piments?|chili|crevettes|tamarin|sesame|haricots|miso|gingembre|ail|harissa|coings?|dattes|figues|amandes|noisettes|pistaches|arachides|olives?))\b|\bvermicelles (?:de chocolat|au chocolat|multicolores|arc-en-ciel|de couleur)\b|\bnouilles (?:shirataki|de verre)\b|\bcoquilles saint-jacques\b|\bcroutes? de (?:parmesan|fromage|brie)\b|\bsucre roux\b|\bbiere (?:de gingembre|d'epinette)\b|\bginger ale\b|\bcroustilles de mais\b/g,
  },
  sesame: {
    match: /\b(sesame|tahini|tahin|tahina|halva|halvah|gomasio|furikake|za'?atar|zaatar|dukkah|hoummos|houmous|hummus|humus|baba ganousch|baba ganoush|baba ghanouj|shichimi|togarashi)\b/,
  },
  mustard: {
    match: /\b(moutardes?|dijon|dijonnaise|mayonnaise|mayo|cari|curry|epices (?:a|pour) marinades?|piccalilli|ras el hanout|panch phoron|vadouvan|kasundi|chaat masala|sambar)\b/,
  },
  sulfites: {
    match: /\b(vins?|porto|xeres|madere|marsala|vermouth|champagne|mousseux|prosecco|cava|sake|mirin|shaoxing|bieres?|ale|lager|stout|cidres?|pineau|sherry|cognac|brandy|calvados|balsamique|raisins secs|raisins de corinthe|sultanas?|pruneaux|(?:abricots?|figues?|canneberges?|cerises?|bleuets?|mangues?|peches?|poires?|pommes?|ananas|papayes?|fraises?|dattes?|fruits?|tomates?|gingembre) (?:sechee?s?|deshydratee?s?|confite?s?)|confite?s?|marasquin|melasse|flocons de pommes de terre|cornichons?|marinee?s?|achards|choucroute|relish|chutney|noix de coco (?:rapee|sechee|en flocons|deshydratee|non sucree)|coco rape|jus de raisin)\b/,
    unless: /\bvinaigre de (?:cidre|riz|vin de riz|malt|alcool)\b|\bbiere (?:de gingembre|d'epinette|sans alcool)\b|\bginger ale\b|\bvin (?:sans alcool|desalcoolise)\b/g,
  },
};

// What Ricardo's tags say the recipe contains (its tags are on every recipe).
const TAG_ALLERGENS = [
  ["milk", /^ingredient_regime_(?:dairy|lactose)$|^ingredient_dairy\b/],
  ["eggs", /^ingredient_regime_egg$|^ingredient_eggs\b/],
  ["gluten", /^ingredient_regime_gluten$/],
  ["peanuts", /^ingredient_regime_groundnut$|^ingredient_(?:nuts_peanut|peanut-butter)\b/],
  ["tree-nuts", /^ingredient_regime_nuts$|^ingredient_nuts_(?:almond|hazelnut|pecan|pistachio|walnut|pine-nut|cashew|macadamia|brazil-nut)\b/],
  ["fish", /^ingredient_fish\b/],
  ["shellfish", /^ingredient_seafood\b/],
  ["sesame", /^ingredient_nuts_sesame-seed\b/],
  ["mustard", /^ingredient_(?:dijon-)?mustard\b/],
];
const TAG_MEAT = /^ingredient_regime_not-vegetarian$|^food-habit_carnivorous$|^ingredient_meat\b/;
const TAG_NOT_VEGAN = /^ingredient_regime_not-vegan$/;

function tagsOf({ lines, steps, tags, course }) {
  const text = normalize(lines.join("\n"));
  const animalText = text.replace(SUBSTITUTE, " ");
  const tagged = (pattern) => tags.some((tag) => pattern.test(tag));

  const allergens = Object.keys(ALLERGENS).filter(
    (key) =>
      found(ANIMAL_ALLERGENS.has(key) ? animalText : text, ALLERGENS[key]) ||
      TAG_ALLERGENS.some(([allergen, pattern]) => allergen === key && tagged(pattern))
  );
  const meat = found(animalText, MEAT) || tagged(/^ingredient_meat\b/);
  const gelatin = found(animalText, GELATIN) || tagged(/^ingredient_gelatin\b/);
  const seafood = allergens.includes("fish") || allergens.includes("shellfish");
  const notVegetarian = meat || seafood || gelatin || tagged(TAG_MEAT);

  const diets = [];
  if (!notVegetarian && !allergens.includes("milk") && !allergens.includes("eggs") && !found(animalText, OTHER_ANIMAL) && !tagged(TAG_NOT_VEGAN)) {
    diets.push("vegan");
  }
  if (!notVegetarian) diets.push("vegetarian");
  if (!meat && !gelatin) diets.push("pescatarian");
  if (!allergens.includes("gluten")) diets.push("gluten-free");
  if (!allergens.includes("milk")) diets.push("dairy-free");
  if (!found(animalText, PORK)) diets.push("pork-free");
  if (course !== "dessert" && !found(text, HIGH_CARB)) diets.push("low-carb");

  return { allergens, diets, appliances: appliancesOf(normalize(steps.join("\n"))) };
}

// ─────────────────────────────────────────────
// Course, appliances, time, servings
// ─────────────────────────────────────────────

// Subcategories of "Entrées" that are not dishes of their own
const BASIC_LISTINGS = /^entrees\/(?:boissons|conserves|epices|marinades|mayonnaises|sauces|pains-sales|trempettes)/;

function courseOf(page) {
  const listings = page.listings ?? [];
  if (listings.some((l) => l === "plats-principaux/dejeuners-brunch" || l === "desserts/crepes-et-pancakes")) return "breakfast";
  if (listings.some((l) => l.startsWith("plats-principaux/"))) return "main";
  if (listings.some((l) => l.startsWith("desserts/") && l !== "desserts/confitures-et-tartinades-sucrees")) return "dessert";
  if (listings.some((l) => l.startsWith("entrees/") && !BASIC_LISTINGS.test(l))) return "side";
  if (listings.length > 0) return "basic";
  return { "Plats principaux": "main", Desserts: "dessert", "Entrées": "side" }[page.category] ?? "main";
}

// Rarer appliances only count when a step needs them, not in
// "Au mélangeur ou au robot, réduire en purée".
const ALTERNATIVE = /\b(ou|sinon|si desire|au choix|facultati\w*|si vous|si on|on peut|a defaut)\b/;

function appliancesOf(steps) {
  const text = steps
    .replace(/\bfour a micro-?ondes\b/g, " micro-ondes ")
    .replace(/\b(?:sauce|assaisonnement|epices|marinade) (?:bbq|barbecue)\b/g, " ");
  const sentences = text.split(/(?<=[.!?;])\s+|\n/).filter((sentence) => !ALTERNATIVE.test(sentence));
  const found = [];
  const add = (key, pattern) => pattern.test(text) && found.push(key);
  const addIfNeeded = (key, pattern) => sentences.some((sentence) => pattern.test(sentence)) && found.push(key);
  add("oven", /\b(four|enfourner|enfourne|lechefrite|plaque de cuisson|plaque a biscuits|broil)\b/);
  add("stovetop", /\b(poeles?|poelons?|casseroles?|chaudrons?|marmites?|cocottes?|faitout|woks?|sauteuses?|plaque chauffante|cuisiniere|feu (?:doux|moyen|vif|eleve|moyen-vif|moyen-doux|moyen-eleve)|a feu|ebullition|bouillir|mijoter|frire|bain-marie|eau bouillante|friteuse(?! a air))\b/);
  add("microwave", /\bmicro-?ondes?\b/);
  add("kettle", /\bbouilloire\b/);
  addIfNeeded("blender", /\b(melangeur|mixeur|pied-mixeur|blender)\b/);
  if (!found.includes("blender")) addIfNeeded("food-processor", /\brobot(?! sur socle)\b/);
  addIfNeeded("stand-mixer", /\b(batteur|robot sur socle|malaxeur|crochet petrisseur|kitchenaid)\b/);
  addIfNeeded("grill", /\b(barbecue|bbq|charbon de bois|fumoir|copeaux de bois)\b/);
  addIfNeeded("slow-cooker", /\bmijoteuse\b/);
  addIfNeeded("pressure-cooker", /\b(autocuiseur|cocotte-minute|instant pot|multicuiseur)\b/);
  addIfNeeded("air-fryer", /\b(friteuse a air(?: chaud)?|air fryer)\b/);
  addIfNeeded("bread-machine", /\bmachine a pain\b/);
  if (!found.includes("oven")) addIfNeeded("dehydrator", /\bdeshydrateur\b/);
  return found;
}

// "PT1H30M" -> 90
function isoMinutes(duration) {
  const match = duration?.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 1440 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

function timeOf(page) {
  const minutes = isoMinutes(page.totalTime) || isoMinutes(page.prepTime) + isoMinutes(page.cookTime);
  return minutes > 0 ? formatMinutes(minutes) : "";
}

// "8 portion(s)", "6 à 8 portions", "24 biscuits"; not "1 litre (4 tasses)"
function servingsOf(text) {
  if (!text) return undefined;
  const portions = text.match(/(\d+)\s*(?:à\s*\d+\s*)?portion/i);
  if (portions) return Number(portions[1]) || undefined;
  if (/\b(?:ml|l|litres?|tasses?|g|kg|lb|oz)\b/i.test(text)) return undefined;
  const count = Number(text.match(/\d+/)?.[0]);
  return count > 0 && count <= 500 ? count : undefined;
}

// ─────────────────────────────────────────────
// Recipe
// ─────────────────────────────────────────────

function convert(page) {
  const title = cleanText(page.title);
  const lines = page.ingredients.map(cleanText).filter((line) => line && !EQUIPMENT.test(normalize(line)));
  const ingredients = lines.flatMap(parseIngredient).filter((ingredient) => ingredient.name);
  // One part of the method per titled section ("Glaçage : …"), except the one named after the recipe.
  const titled = page.instructions.length > 1;
  const instructions = page.instructions.flatMap(({ group, items }) => {
    const name = group ? cleanText(group) : "";
    const label = titled && name && normalize(name) !== normalize(title) ? name : "";
    return items
      .map(cleanText)
      .filter(Boolean)
      .map((step, index) => (label && index === 0 ? `${label} : ${step}` : step));
  });

  const course = courseOf(page);
  const { allergens, diets, appliances } = tagsOf({ lines, steps: instructions, tags: page.tags, course });
  const recipe = {
    id: page.sourceUrl.replace(/^.*\/recettes\/\d+-/, ""),
    title,
    image: page.image,
    time: timeOf(page),
    course,
    vegan: diets.includes("vegan"),
    diets,
    allergens,
    appliances,
  };
  const servings = servingsOf(page.yield);
  if (servings) recipe.servings = servings;
  return { ...recipe, ingredients, instructions, sourceUrl: page.sourceUrl };
}

// ─────────────────────────────────────────────
// recipe_r.ts, written like recipe.ts
// ─────────────────────────────────────────────

const HEADER = `import type { Recipe } from "./types";

// Recettes de RICARDO (ricardocuisine.com), en français, utilisées avec la permission
// de Ricardo Media. Fichier généré par « npm run convert:ricardo »
// (scripts/convert-ricardo-recipes.js) : modifier le script plutôt que ce fichier.
// Régimes, allergènes et appareils y sont détectés par mots-clés et par les étiquettes
// de Ricardo. Chaque recette garde l'adresse de sa page (sourceUrl), à citer.
`;

function recipeSource(recipe) {
  const text = JSON.stringify;
  const lines = ["{"];
  for (const key of ["id", "title", "image", "time", "course"]) lines.push(`  ${key}: ${text(recipe[key])},`);
  lines.push(`  vegan: ${recipe.vegan},`);
  for (const key of ["diets", "allergens", "appliances"]) lines.push(`  ${key}: [${recipe[key].map(text).join(", ")}],`);
  if (recipe.servings) lines.push(`  servings: ${recipe.servings},`);
  lines.push("  ingredients: [");
  for (const { name, quantity, unit } of recipe.ingredients) {
    lines.push(`    { name: ${text(name)}, quantity: ${quantity}, unit: ${text(unit)} },`);
  }
  lines.push("  ],");
  lines.push("  instructions: [");
  for (const step of recipe.instructions) lines.push(`    ${text(step)},`);
  lines.push("  ],");
  lines.push(`  sourceUrl: ${text(recipe.sourceUrl)},`);
  lines.push("},");
  return lines.join("\n");
}

// ─────────────────────────────────────────────
// ingredients_r.ts: every ingredient once
// ─────────────────────────────────────────────

const INGREDIENTS_HEADER = `// Tous les ingrédients des recettes de recipe_r.ts, une seule fois chacun, écrits comme
// les recettes les écrivent le plus souvent, en ordre alphabétique, avec le nombre de
// recettes qui les utilisent. Fichier généré par « npm run convert:ricardo ».
`;

// "Œufs", "oeufs" and "oeufs (facultatif)" are the same ingredient.
function ingredientsOf(recipes) {
  const spellings = new Map(); // key -> Map(spelling -> times used)
  const recipeCounts = new Map(); // key -> recipes using it
  for (const recipe of recipes) {
    const keys = new Set();
    for (const { name } of recipe.ingredients) {
      const spelling = name.replace(/\s*\(facultatif\)$/, "");
      const key = spelling.toLowerCase().replace(/œ/g, "oe").replace(/’/g, "'");
      const counts = spellings.get(key) ?? new Map();
      counts.set(spelling, (counts.get(spelling) ?? 0) + 1);
      spellings.set(key, counts);
      keys.add(key);
    }
    for (const key of keys) recipeCounts.set(key, (recipeCounts.get(key) ?? 0) + 1);
  }
  return [...spellings]
    .map(([key, counts]) => ({ name: [...counts].sort((a, b) => b[1] - a[1])[0][0], recipes: recipeCounts.get(key) }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function ingredientsSource(ingredients) {
  const lines = ingredients.map(({ name, recipes }) => `  ${JSON.stringify(name)}, // ${recipes} recette${recipes > 1 ? "s" : ""}`);
  return `${INGREDIENTS_HEADER}export const ricardoIngredients = new Set<string>([\n${lines.join("\n")}\n]);\n`;
}

function main() {
  const pages = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

  // Ids stay unique next to the other recipes of the app, while their files exist.
  const ids = new Set();
  if (fs.existsSync(CURATED_FILE)) {
    for (const [, id] of fs.readFileSync(CURATED_FILE, "utf8").matchAll(/^\s*id: "([^"]+)"/gm)) ids.add(id);
  }
  if (fs.existsSync(WIKIBOOKS_FILE)) {
    for (const recipe of JSON.parse(fs.readFileSync(WIKIBOOKS_FILE, "utf8"))) ids.add(recipe.id);
  }

  const recipes = [];
  let skippedEmpty = 0;
  for (const page of pages) {
    const recipe = convert(page);
    if (recipe.ingredients.length === 0 || recipe.instructions.length === 0) {
      skippedEmpty++;
      continue;
    }
    const base = recipe.id;
    for (let n = 2; ids.has(recipe.id); n++) recipe.id = `${base}-${n}`;
    ids.add(recipe.id);
    recipes.push(recipe);
  }
  recipes.sort((a, b) => a.title.localeCompare(b.title, "fr"));

  // Same keys as constants/dietary.ts, or the filters would silently ignore them.
  const dietary = fs.readFileSync(DIETARY_FILE, "utf8");
  for (const [field, type] of [["diets", "DietKey"], ["allergens", "AllergenKey"], ["appliances", "ApplianceKey"]]) {
    const allowed = new Set(keysOf(type, dietary));
    const unknown = recipes.flatMap((r) => r[field]).filter((key) => !allowed.has(key));
    if (unknown.length > 0) throw new Error(`Unknown ${field}: ${[...new Set(unknown)].join(", ")}`);
  }

  // One literal of 8,000+ recipes is "too complex to represent" for TypeScript: write blocks of them.
  const parts = [];
  for (let i = 0; i < recipes.length; i += PART_SIZE) {
    parts.push(`const part${parts.length + 1}: Recipe[] = [\n${recipes.slice(i, i + PART_SIZE).map(recipeSource).join("\n")}\n];\n`);
  }
  const all = `export const ricardoRecipes: Recipe[] = [\n${parts.map((_, i) => `  ...part${i + 1},`).join("\n")}\n];\n`;
  fs.writeFileSync(OUTPUT_FILE, `${HEADER}\n${parts.join("\n")}\n${all}`);
  console.log(`✓ Converted ${recipes.length} recipes into ${OUTPUT_FILE}`);
  console.log(`  skipped ${skippedEmpty} without ingredients or steps`);

  const ingredients = ingredientsOf(recipes);
  fs.writeFileSync(INGREDIENTS_FILE, ingredientsSource(ingredients));
  console.log(`✓ Listed ${ingredients.length} different ingredients in ${INGREDIENTS_FILE}`);
}

if (require.main === module) main();

module.exports = { convert, parseIngredient, tagsOf };
