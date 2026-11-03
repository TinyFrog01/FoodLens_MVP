const fs = require("fs");
const path = require("path");

// Turns the recipes downloaded by scripts/scrape-wikibooks-recipes.js into the
// app's Recipe format, kept in English, in app/Food/data/recipe/wikibooks-recipes.json.
// Pages already translated by hand (the sources listed in license.ts) are skipped.
//
// Allergens, diets and appliances come from keywords and err on the safe side:
// an allergen is flagged as soon as an ingredient may contain it, and a diet is
// only claimed when no ingredient contradicts it.
//
//   npm run convert:recipes

const RECIPE_DIR = path.join(__dirname, "../app/Food/data/recipe");
const INPUT_FILE = path.join(__dirname, "wikibooks-recipes.json");
const OUTPUT_FILE = path.join(RECIPE_DIR, "wikibooks-recipes.json");
const LICENSE_FILE = path.join(RECIPE_DIR, "license.ts");
const DIETARY_FILE = path.join(__dirname, "../constants/dietary.ts");

// ─────────────────────────────────────────────
// Quantities and units
// ─────────────────────────────────────────────

const FRACTIONS = {
  "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4, "⅕": 1 / 5, "⅖": 2 / 5,
  "⅗": 3 / 5, "⅘": 4 / 5, "⅙": 1 / 6, "⅚": 5 / 6, "⅛": 1 / 8, "⅜": 3 / 8, "⅝": 5 / 8, "⅞": 7 / 8,
};
const WORD_NUMBERS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30,
  forty: 40, "forty-five": 45, sixty: 60, ninety: 90, half: 0.5, "half a": 0.5, "half an": 0.5,
};
const FRACTION_CHARS = Object.keys(FRACTIONS).join("");
// "1-1/2", "1 1/2", "3/4", "1½", "1 ½", "½", "2.5"
const NUMBER = `(?:\\d+[\\s-]+\\d+\\s*/\\s*\\d+|\\d+\\s*/\\s*\\d+|\\d+(?:[.,]\\d+)?(?:\\s*[${FRACTION_CHARS}])?|[${FRACTION_CHARS}])`;
const LEADING_QUANTITY = new RegExp(`^(${NUMBER})(?:\\s*(?:-|–|—|to|or)\\s*(${NUMBER}))?\\s*`);
const WORD_QUANTITY = /^(a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|half an?|half)\s+(?!(?:few|little|bit|lot|couple)\b)/i;

// [unit stored in the recipe, plural or null when invariant, pattern]
const UNITS = [
  ["fl oz", null, /^(?:fl\.?\s*oz\.?|fluid\s+ounces?)/i],
  ["cup", "cups", /^(?:cups?|c\.)(?![a-z])/i],
  ["tbsp", null, /^(?:tablespoons?|tbsps?\.?|tbls?\.?|tbs\.?)(?![a-z])/i],
  ["tsp", null, /^(?:teaspoons?|tsps?\.?)(?![a-z])/i],
  ["tbsp", null, /^T\.?(?![a-zA-Z-])/],
  ["tsp", null, /^t\.?(?![a-zA-Z-])/],
  ["lb", null, /^(?:pounds?|lbs?\.?)(?![a-z])/i],
  ["oz", null, /^(?:ounces?|oz\.?)(?![a-z])/i],
  ["kg", null, /^(?:kilograms?|kilos?|kgs?\.?)(?![a-z])/i],
  ["mg", null, /^(?:milligrams?|mg\.?)(?![a-z])/i],
  ["g", null, /^(?:grams?|grammes?|gr?\.?)(?![a-z])/i],
  ["ml", null, /^(?:millilit(?:er|re)s?|mls?\.?)(?![a-z])/i],
  ["dl", null, /^(?:decilit(?:er|re)s?|dl\.?)(?![a-z])/i],
  ["cl", null, /^(?:centilit(?:er|re)s?|cl\.?)(?![a-z])/i],
  ["L", null, /^(?:lit(?:er|re)s?|l\.?)(?![a-z])/i],
  ["pint", "pints", /^pints?(?![a-z])/i],
  ["quart", "quarts", /^(?:quarts?|qts?\.?)(?![a-z])/i],
  ["gallon", "gallons", /^gallons?(?![a-z])/i],
  ["stick", "sticks", /^sticks?(?![a-z])/i],
  ["clove", "cloves", /^cloves?(?![a-z])/i],
  ["can", "cans", /^(?:cans?|tins?)(?![a-z])/i],
  ["package", "packages", /^(?:packages?|pkgs?\.?|packets?|packs?|sachets?|envelopes?)(?![a-z])/i],
  ["jar", "jars", /^jars?(?![a-z])/i],
  ["bottle", "bottles", /^bottles?(?![a-z])/i],
  ["box", "boxes", /^box(?:es)?(?![a-z])/i],
  ["bag", "bags", /^bags?(?![a-z])/i],
  ["slice", "slices", /^slices?(?![a-z])/i],
  ["pinch", "pinches", /^pinch(?:es)?(?![a-z])/i],
  ["dash", "dashes", /^dash(?:es)?(?![a-z])/i],
  ["drop", "drops", /^drops?(?![a-z])/i],
  ["bunch", "bunches", /^bunch(?:es)?(?![a-z])/i],
  ["sprig", "sprigs", /^sprigs?(?![a-z])/i],
  ["head", "heads", /^heads?(?![a-z])/i],
  ["stalk", "stalks", /^stalks?(?![a-z])/i],
  ["piece", "pieces", /^(?:pieces?|pcs?\.?)(?![a-z])/i],
  ["handful", "handfuls", /^handfuls?(?![a-z])/i],
  ["sheet", "sheets", /^sheets?(?![a-z])/i],
  ["scoop", "scoops", /^scoops?(?![a-z])/i],
  ["inch", "inches", /^(?:inch(?:es)?|in\.)(?![a-z])/i],
  ["cm", null, /^cm(?![a-z])/i],
  ["dessertspoon", "dessertspoons", /^dessert ?spoons?(?![a-z])/i],
  ["teacup", "teacups", /^teacups?(?![a-z])/i],
  ["", null, /^(?:ea\.?|each)(?![a-z])/i],
];
const UNIT_QUALIFIER = /^(?:heaping|heaped|level|scant|generous|rounded|good|uk|us|imperial|metric)\s+/i;
const METRIC_UNITS = new Set(["g", "kg", "ml", "dl", "cl", "L"]);
const CONTAINER_UNITS = new Set(["can", "package", "jar", "bottle", "box", "bag", "stick"]);
const METRIC_IN_PARENTHESES = /(\d+(?:[.,]\d+)?)\s*(?:[-–]\s*\d+(?:[.,]\d+)?\s*)?(kg|kilograms?|g|grams?|ml|mL|millilit(?:er|re)s?|dl|cl|l|lit(?:er|re)s?)\b/i;
const WEIGHT_IN_PARENTHESES = /(\d+(?:[.,]\d+)?)\s*(oz|ounces?|lbs?|pounds?)\b/i;
// "Dough", "For the filling:" left over from wiki tables
const GROUP_LABEL = /^(?:for the .*|dough|filling|topping|sauce|glaze|frosting|icing|garnish|marinade|batter|crust|base|assembly|optional)$/i;
// What follows the comma in "onion, chopped" (but not in "salt, pepper and paprika")
const PREPARATION = /^\s*(?:\w+ly|\w+ed|beaten|frozen|broken|torn|ground|split|cut|to|for|such|about|approx|preferably|if|plus|at|room|divided|optional|as|into|in|torn|whole|fresh|very|well|see|e\.g|i\.e|or to|any|each|use|can be|without|with|skin|bone|seeds?|stems?|tops?|ends?)\b/i;

function parseNumber(text) {
  const clean = text.replace(/,/g, ".").trim();
  const mixed = clean.match(/^(\d+)[\s-]+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = clean.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const unicode = clean.match(new RegExp(`^(\\d+(?:\\.\\d+)?)?\\s*([${FRACTION_CHARS}])?$`));
  if (unicode) return Number(unicode[1] ?? 0) + (unicode[2] ? FRACTIONS[unicode[2]] : 0);
  return Number(clean) || 0;
}

const roundQuantity = (value) => Math.round(value * 1000) / 1000;

function readUnit(text) {
  const qualifier = text.match(UNIT_QUALIFIER)?.[0] ?? "";
  for (const candidate of qualifier ? [qualifier, ""] : [""]) {
    const rest = text.slice(candidate.length);
    for (const [unit, plural, pattern] of UNITS) {
      const match = rest.match(pattern);
      if (match) return { unit, plural, rest: rest.slice(match[0].length) };
    }
  }
  return { unit: "", plural: null, rest: text };
}

function metricUnit(raw) {
  const unit = raw.toLowerCase();
  if (unit.startsWith("k")) return "kg";
  if (unit.startsWith("g")) return "g";
  if (unit.startsWith("d")) return "dl";
  if (unit.startsWith("c")) return "cl";
  if (unit.startsWith("m")) return "ml";
  return "L";
}

function cleanName(text) {
  let name = text;
  for (let previous; previous !== name; ) {
    previous = name;
    name = name.replace(/\([^()]*\)/g, " ");
  }
  name = name.replace(/^\s*(?:of|x)\s+/i, "").split(/;|\s[–—]\s/)[0];
  const comma = name.indexOf(",");
  if (comma !== -1 && PREPARATION.test(name.slice(comma + 1))) name = name.slice(0, comma);
  name = name
    .replace(/\s+(?:to taste|as needed|as required|if desired|or more|optional)\b.*$/i, "")
    .replace(/\s+for\s+(?:serving|garnish(?:ing)?|frying|deep[- ]frying|greasing|dusting|brushing|decoration|the pan|cooking)\b.*$/i, "")
    .replace(/[\s.:*]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return /^[A-Z][a-z]/.test(name) ? name[0].toLowerCase() + name.slice(1) : name;
}

function parseIngredient(line, optionalGroup) {
  const optional = optionalGroup || /\boptional\b/i.test(line);
  let quantity = 0;
  let unit = "";
  let plural = null;
  let rest = line;

  const leading = line.match(LEADING_QUANTITY);
  const words = line.match(WORD_QUANTITY);
  if (leading) {
    quantity = parseNumber(leading[1]);
    rest = line.slice(leading[0].length);
  } else if (/%\s*$/.test(line) && /\d/.test(line)) {
    // Baking tables: "Water 1½ cups 375 g 68%"
    const firstNumber = line.search(new RegExp(NUMBER));
    const name = line.slice(0, firstNumber);
    const metric = line.slice(firstNumber).match(METRIC_IN_PARENTHESES);
    if (metric) return { name: cleanName(name) + (optional ? " (optional)" : ""), quantity: roundQuantity(parseNumber(metric[1])), unit: metricUnit(metric[2]) };
    const amount = line.slice(firstNumber).match(LEADING_QUANTITY);
    const read = readUnit(line.slice(firstNumber + amount[0].length));
    return { name: cleanName(name) + (optional ? " (optional)" : ""), quantity: roundQuantity(parseNumber(amount[1])), unit: read.unit };
  } else if (words) {
    quantity = WORD_NUMBERS[words[1].toLowerCase()] ?? 0;
    rest = line.slice(words[0].length);
  }

  if (quantity > 0) {
    // "2 x 400 g cans chickpeas"
    const times = rest.match(new RegExp(`^[x×]\\s*(${NUMBER})\\s*`, "i"));
    if (times) {
      quantity *= parseNumber(times[1]);
      rest = rest.slice(times[0].length);
    }
    ({ unit, plural, rest } = readUnit(rest.trimStart()));
    rest = rest.replace(/^\s*of\s+/i, "");
    // "1 lb (450 g) beef" -> 450 g, "1 can (14 oz) tomatoes" -> 14 oz
    const parentheses = rest.match(/^\s*\(([^()]*)\)/);
    if (parentheses && unit && !METRIC_UNITS.has(unit)) {
      const metric = parentheses[1].match(METRIC_IN_PARENTHESES);
      const weight = parentheses[1].match(WEIGHT_IN_PARENTHESES);
      if (metric) {
        quantity = parseNumber(metric[1]) * (CONTAINER_UNITS.has(unit) ? quantity : 1);
        unit = metricUnit(metric[2]);
        plural = null;
      } else if (weight && CONTAINER_UNITS.has(unit)) {
        quantity = parseNumber(weight[1]) * quantity;
        unit = /^l|p/i.test(weight[2]) ? "lb" : "oz";
        plural = null;
      }
    }
    if (plural && quantity > 1) unit = plural;
  }

  let name = cleanName(rest);
  if (!name && unit) {
    // "4 cloves": the unit word is the ingredient
    name = unit;
    unit = "";
  }
  name ||= cleanName(line);
  return { name: name + (optional && !/optional/.test(name) ? " (optional)" : ""), quantity: roundQuantity(quantity), unit };
}

// ─────────────────────────────────────────────
// Allergens and diets
// ─────────────────────────────────────────────

// "vegan butter", "tofu bacon": not the animal product the keyword names
const SUBSTITUTE = /\b(?:vegan|vegetarian|veggie|meatless|plant[- ]based|dairy[- ]free|non[- ]dairy|egg[- ]free) [a-z'-]+(?: [a-z'-]+)?\b|\b(?:tofu|tempeh|seitan|soy|soya|facon) (?:bacon|sausages?|burgers?|meat|chicken|ham|jerky|chorizo|crumbles|mince)\b/g;
const ANIMAL_ALLERGENS = new Set(["milk", "eggs", "fish", "shellfish"]);

const MEAT = {
  match: /\b(beef|steaks?|veal|pork|ham|hams|bacon|lard|pancetta|prosciutto|guanciale|salami|pepperoni|chorizo|sausages?|hot ?dogs?|frankfurters?|wieners?|bratwursts?|kielbasa|lamb|mutton|goat|venison|bison|buffalo|elk|moose|caribou|boar|rabbit|hare|squirrel|kangaroo|chickens?|turkey|turkeys|ducks?|duckling|goose|quail|pheasant|partridge|grouse|pigeons?|squab|guinea fowl|poultry|hens?|capons?|fowl|meats?|meaty|meatballs?|meatloaf|mincemeat|mince|minced (?:beef|meat|lamb|pork|chicken)|ground (?:beef|meat|lamb|pork|chicken|turkey|veal)|liver|livers|liverwurst|kidneys?|tripe|tongue|hearts?|oxtail|bone marrow|marrow ?bones?|bones?|giblets?|gizzards?|offal|sweetbreads|chitterlings|trotters|hocks?|shanks?|brisket|ribs|spareribs|loin|tenderloin|sirloin|chuck|rump|flank|roasts?|cutlets?|chops?|jerky|biltong|pastrami|corned|bresaola|mortadella|foie gras|confit|stocks?|broths?|bouillon|consomme|gravy|suet|tallow|drippings?|schmaltz|oxo|bovril|haggis|spam|bologna|andouille|boudin|merguez|nduja|capicola|coppa|soppressata|speck|lardons?|fatback|cracklings?|chicharrones?|chicharron|pork rinds?|scrapple|head cheese|blood sausage|black pudding|hamburgers?|burgers?|wings?|wingettes?|drumsticks?|thighs?|suya|shaki|ponmo|kpomo|cow ?skin)\b/,
  unless: /\b(?:coconut|crab|lobster|nut|nuts|imitation|mock|soy|soya) meats?\b|\bmeat[- ]?(?:less|free|substitute|alternative|tenderi[sz]er|thermometer|mallet|grinder)\b|\bnutmeats?\b|\bhearts? of (?:palm|romaine|celery|lettuce)\b|\b(?:artichoke|celery|romaine|lettuce|palm) hearts?\b|\bcelery ribs?\b|\bribs? (?:of )?celery\b|\bkidney beans?\b|\b(?:goat|goats|goat's|buffalo) (?:cheese|milk|yogh?urt|butter|curd|mozzarella)\b|\bbuffalo (?:sauce|wing sauce|style)\b|\b(?:duck|quail|hen's?) eggs?\b|\bduck sauce\b|\bhen of the woods\b|\b(?:cauliflower|tuna|salmon|swordfish|halibut|cod|fish|portobello|mushroom|celeriac|cabbage) steaks?\b|\b(?:vegetable|veggie|mushroom|kombu|seaweed|miso|tomato|corn|onion|garlic|herb|potato|bean|fish|shrimp|prawn|seafood|lobster|crab|clam|mussel|dashi|court) (?:stocks?|broths?|bouillon(?: cubes?)?|stock cubes?|consomme|gravy)\b|\b(?:onion|tomato|garlic|lemon|fruit|fig|shallot) confit\b|\b(?:burger|hamburger|hot ?dog) (?:buns?|rolls?|bread)\b|\b(?:bean|black bean|mushroom|lentil|quinoa|chickpea|broccoli) burgers?\b|\bvegetable marrow\b/g,
};
const PORK = {
  match: /\b(pork|ham|hams|bacon|lard|lardo|pancetta|prosciutto|guanciale|salami|pepperoni|chorizo|sausages?|hot ?dogs?|frankfurters?|wieners?|bratwursts?|kielbasa|mortadella|capicola|coppa|soppressata|speck|lardons?|fatback|salt pork|cracklings?|chicharrones?|chicharron|pork rinds?|scrapple|head cheese|andouille|boudin|nduja|liverwurst|blood sausage|black pudding|chitterlings|trotters|pigs?|piglet|suckling|spam|bologna|char siu|lap cheong|lup cheong|tocino|longganisa|jamon|iberico|canadian bacon|back bacon|peameal|gelatine?|marshmallows?|jell-?o|jello|aspic|meats?|mince|minced meat|ground meat|meatballs?|meatloaf|mincemeat|drippings?)\b/,
  unless: MEAT.unless,
};
const GELATIN = /\b(gelatine?|marshmallows?|jell-?o|jello|aspic|isinglass|jelly crystals|gumm(?:y|ies))\b/;
const OTHER_ANIMAL = /\b(honey|honeycomb|royal jelly|beeswax|carmine|cochineal|shellac|lanolin)\b/;
const HIGH_CARB = {
  match: /\b(sugars?|honey|syrups?|molasses|treacle|jams?|jelly|jellies|marmalade|preserves|cand(?:y|ies)|chocolate|cocoa|flour|breads?|pasta|noodles?|rice|potato|potatoes|corn|maize|polenta|cornmeal|grits|oats?|oatmeal|cereal|granola|beans?|lentils?|chickpeas?|peas|quinoa|couscous|bulgh?ur|barley|tortillas?|crackers?|biscuits?|cakes?|cookies?|bananas?|plantains?|yams?|cassava|sweet potato(?:es)?|taro|dates|raisins?|dried fruits?|juice|soda|cola|beers?|wines?|condensed milk|doughs?|pastry|crusts?|starch|cornstarch|breadcrumbs?|panko|dumplings?|pies?|fruits?|apples?|mangos?|mangoes|pineapples?|grapes?|oranges?|peaches|pears?|berries|cherries|semolina|gnocchi|buns?|rolls?|pitas?|naan|chapatis?|rotis?|garri|gari|fufu|eba|amala|semovita|ogi|akamu|tuwo|butternut|acorn squash|kabocha|hubbard|pumpkins?)\b/,
  unless: /\b(?:lemon|lime) juice\b|\bsugar[- ]free\b|\b(?:green|snow|sugar snap|snap) peas\b|\b(?:green|string|french|wax|runner) beans?\b|\b(?:coconut|almond) flour\b|\bcauliflower rice\b|\bbaby corn\b/g,
};

const ALLERGENS = {
  peanuts: {
    match: /\b(peanuts?|groundnuts?|arachis|satay|goobers?|monkey nuts?|nuts)\b/,
    unless: /\b(?:pine|brazil|macadamia|kola|cashew|tiger|candle|betel|pistachio|cob) nuts\b/g,
  },
  "tree-nuts": {
    match: /\b(almonds?|walnuts?|pecans?|cashews?|pistachios?|hazelnuts?|filberts?|macadamias?|brazil nuts?|pine nuts?|pine kernels?|pignoli|pignolia|pinon|pralines?|marzipan|frangipane|amaretti|amaretto|frangelico|nutella|gianduja|chestnuts?|candlenuts?|kemiri|nougat|pesto|dukkah|baklava|orgeat|nuts?|nut (?:butter|oil|meal|flour|milk))\b/,
    unless: /\bwater chestnuts?\b|\bchestnut mushrooms?\b/g,
  },
  milk: {
    match: /\b(milk|milks|buttermilk|butter|buttered|buttery|ghee|cream|creams|creamer|cheese|cheeses|cheddar|mozzarella|parmesan|parmigiano|grana padano|pecorino|romano|ricotta|feta|brie|camembert|gouda|edam|gruyere|emmental|emmenthal|jarlsberg|mascarpone|paneer|halloumi|provolone|fontina|asiago|manchego|monterey jack|colby|havarti|muenster|munster|stilton|gorgonzola|roquefort|quark|labneh|labne|skyr|kefir|curds?|whey|casein|caseinate|lactose|yogh?urts?|yoghourt|dahi|raita|lassi|tzatziki|kulfi|khoa|khoya|mawa|malai|chhena|chenna|rabri|queso|crema|custards?|ice cream|gelato|dulce de leche|evaporated|condensed|half[- ]and[- ]half|creme fraiche|smetana|kaymak|clotted|caramels?|toffee|butterscotch|fudge|white chocolate|milk chocolate|nutella|pesto|bechamel|alfredo|hollandaise|bearnaise|margarine|dairy)\b/,
    unless: /\b(?:coconut|almond|soy|soya|oat|rice|cashew|hemp|nut) (?:milk|milks|cream|butter|yogh?urts?|cheese|creamer)\b|\b(?:peanut|cocoa|cacao|apple|pumpkin|shea|nut|almond|cashew|sunflower|seed) butter\b|\bbutter ?beans?\b|\bbutternut\b|\bcream of tartar\b|\bcream (?:sherry|soda)\b|\bhead cheese\b|\bbean curds?\b|\bswiss chard\b|\bice cream (?:salt|scoop)\b/g,
  },
  eggs: {
    match: /\b(eggs?|egg ?yolks?|yolks?|egg ?whites?|albumen|albumin|meringues?|mayonnaise|mayo|aioli|hollandaise|bearnaise|custards?|eggnog|lemon curd|zabaglione|sabayon|frittata|quiche|omelets?|omelettes?|ice cream|gelato)\b/,
    unless: /\begg[- ]?(?:free|less|replacer)\b|\beggless\b/g,
  },
  fish: {
    match: /\b(fish|fishes|anchov(?:y|ies)|salmon|tuna|cod|haddock|halibut|trout|sardines?|mackerel|herrings?|tilapia|catfish|snapper|bass|sole|flounder|plaice|pollock|pollack|perch|pike|carp|swordfish|mahi[- ]?mahi|monkfish|eels?|caviar|roe|bonito|katsuobushi|dashi|worcestershire|nam pla|nuoc mam|patis|bacalao|bacalhau|stockfish|whitebait|kippers?|surimi|bottarga|garum|grouper|hake|pilchards?|smelts?|sprats?|whiting|turbot|lingcod|barramundi|bream|mullet|shad|sturgeon|dory|gurnard|conger|scorpionfish|sea robin|lox|gravlax|caesar|colatura|omena|bonga|kapenta|seafood)\b/,
  },
  shellfish: {
    match: /\b(shrimps?|prawns?|crabs?|crabmeat|lobsters?|crayfish|crawfish|langoustines?|langostinos?|scampi|scallops?|clams?|mussels?|oysters?|cockles?|whelks?|abalone|squids?|calamari|octopus|octopi|cuttlefish|snails?|escargots?|sea urchins?|conch|periwinkles?|winkles?|krill|shellfish|seafood|belacan|blachan|kapi|terasi|trassi|bagoong|shrimp paste|oyster sauce|surimi|imitation crab|ebi)\b/,
    unless: /\bcrab ?apples?\b|\bcrabapples?\b/g,
  },
  soy: {
    match: /\b(soy|soya|soybeans?|soyabeans?|tofu|tempeh|miso|edamame|tamari|shoyu|teriyaki|hoisin|natto|okara|yuba|tvp|textured (?:vegetable|soy) protein|bean curds?|kecap|ketjap|black bean (?:sauce|paste)|doenjang|gochujang|douchi|fermented black beans|lecithin|ponzu|oyster sauce|maggi|kikkoman|bragg|chocolates?|tauco|doubanjiang|bean paste|sweet bean sauce)\b/,
  },
  gluten: {
    match: /\b(wheat|flour|flours|breads?|breadcrumbs?|crumbs|panko|croutons?|pasta|spaghetti|macaroni|penne|fettuccine|fettucine|linguine|lasagnas?|lasagnes?|tagliatelle|pappardelle|farfalle|fusilli|rotini|rigatoni|ziti|orecchiette|cannelloni|manicotti|ditalini|conchiglie|capellini|angel hair|vermicelli|orzo|gnocchi|tortellini|ravioli|noodles?|udon|ramen|soba|lo mein|chow mein|spaetzle|spatzle|pierogi|pierogies|perogies|dumplings?|wontons?|gyoza|wrappers?|couscous|bulgh?ur|burghul|semolina|suji|sooji|rava|maida|atta|farina|durum|spelt|kamut|farro|freekeh|einkorn|emmer|triticale|barley|rye|malt|malted|oats?|oatmeal|oatcakes?|granola|muesli|bran|seitan|gluten|beers?|ales?|lagers?|stouts?|porter|soy sauce|shoyu|teriyaki|hoisin|oyster sauce|maggi|bouillon cubes?|stock cubes?|oxo|gravy (?:mix|granules|browning)|roux|stuffing|biscuits?|crackers?|cookies?|cakes?|cupcakes?|brownies?|wafers?|cones?|graham|digestives?|shortbread|shortcake|ladyfingers|savoiardi|sponge|pastry|pastries|phyllo|filo|fillo|yufka|crusts?|doughs?|batter|pizzas?|focaccia|ciabatta|challah|pumpernickel|brioche|baguettes?|croissants?|bagels?|buns?|rolls?|pitas?|naan|chapatis?|chapattis?|parathas?|puris?|bhatura|kulcha|rotis?|lavash|tortillas?|wraps?|matzo|matzah|matzoh|crepes?|pancakes?|waffles?|muffins?|scones?|toast|rusks?|zwieback|breadsticks|grissini|melba|cereals?|cornflakes|corn flakes|self[- ]raising|self[- ]rising|bisquick|baking mix|sourdough|yeast extract|marmite|vegemite|bovril|cream of wheat|wheat germ|cornbread|steak sauce|brown sauce|hp sauce|gravy)\b/,
    unless: /\bwheat[- ]free\b|\b(?:rice|corn|maize|buckwheat|almond|coconut|chickpea|gram|garbanzo|tapioca|potato|cassava|manioc|sorghum|teff|millet|quinoa|amaranth|arrowroot|soy|soya|banana|plantain|yam|besan|chestnut|hazelnut|lentil|pea|bean|masa|cornmeal|acorn|sweet potato) (?:flour|flours|starch|noodles?|pasta|spaghetti|tortillas?|crackers?|cakes?|paper|wrappers?|vermicelli|sticks)\b|\bgluten[- ]free\b|\b(?:glass|cellophane|bean thread|mung bean|shirataki|kelp|zucchini|konjac) noodles\b|\bzoodles\b|\bginger (?:ales?|beers?)\b|\broot beers?\b|\btamari\b|\b(?:tortilla|corn) chips\b|\bcornflour\b|\brice bran(?: oil)?\b|\blettuce wraps?\b/g,
  },
  sesame: {
    match: /\b(sesame|tahini|tahina|halva|halvah|halawa|benne|gomasio|gomashio|furikake|za'?atar|zaatar|dukkah|hummus|houmous|hummous|humus|baba gh?anou?sh|gingelly)\b/,
  },
  mustard: {
    match: /\b(mustards?|curry powder|curry paste|panch phoron|panch puran|panch phoran|mayonnaise|mayo|piccalilli|chow chow|pickling spice|sambar powder|sambhar powder|rasam powder|chaat masala|colman'?s|dijon|ras el hanout|kasundi|vadouvan)\b/,
  },
  sulfites: {
    match: /\b(wines?|sherry|port|madeira|marsala|vermouth|champagne|prosecco|cava|sake|mirin|shaoxing|beers?|ales?|lagers?|stouts?|cider|balsamic|raisins?|sultanas?|currants|dried (?:apricots?|figs?|fruits?|cranberries|cherries|mangos?|mangoes|peaches|pears|apples?|blueberries|papaya|pineapple)|prunes|candied|glace|maraschino|mixed peel|crystalli[sz]ed|molasses|treacle|instant potato(?:es)?|potato flakes|dehydrated potato(?:es)?|pickles?|pickled|sauerkraut|relish|chutney|desiccated coconut)\b/,
    unless: /\b(?:(?:apple )?cider|rice|rice wine|malt|white|distilled|coconut|cane|spirit) vinegar\b|\bnon[- ]alcoholic (?:wines?|beers?)\b|\bginger (?:ales?|beers?)\b|\broot beers?\b/g,
  },
};

// Categories of baked goods and pasta: no gluten-free claim unless the page says so.
const GLUTEN_CATEGORY = /\b(bread|cake|cookie|pastr(?:y|ies)|pasta|pies? and tarts?|pizza|dumpling|noodle|pancake|waffle|muffin|biscuit|cracker|sandwich|flatbread|dough|fritter|batter|crepe)/;

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’`]/g, "'");

function found(text, rule) {
  const pattern = rule.match ?? rule;
  return pattern.test(rule.unless ? text.replace(rule.unless, " ") : text);
}

// ─────────────────────────────────────────────
// Course, appliances, time, servings
// ─────────────────────────────────────────────

const COURSE_RULES = [
  ["dessert", /dessert/],
  ["breakfast", /breakfast|pancake|waffle|porridge|\begg recipes|omelet|crepe/],
  ["main", /main course|main dish/],
  ["side", /side dish|appetizer|snack|salad|fritter|swallow|vegetable recipes|potato recipes/],
  ["sweet", /cake|cookie|confection|cand(?:y|ies)|\bsweet|pudding|pies? and tarts?|pastr(?:y|ies)|ice cream|frosting|icing|fudge|brownie|muffin|custard/],
  ["basic", /beverage|drink|cocktail|smoothie|juice|sauce|condiment|spice|seasoning|\brub|dressing|marinade|\bdips?\b|\bpastes?\b|chutney|relish|\bjams?\b|jell(?:y|ies)|preserve|pickl|spread|syrup|\bstocks?\b|bread|dough|batter|technique/],
];

// The summary box's category comes first, then the page's other categories.
function courseOf(summaryCategory, pageCategories, hasMeat) {
  for (const text of [summaryCategory, pageCategories]) {
    const course = COURSE_RULES.find(([, pattern]) => pattern.test(text))?.[0];
    if (course === "sweet") return hasMeat ? "main" : "dessert"; // savoury pies and pastries
    if (course) return course;
  }
  return "main";
}

// Rarer appliances only count when a step needs them, not in
// "or 10 minutes if using a pressure cooker".
const ALTERNATIVE = /\b(or|alternatively|if (?:you|using|available|desired)|optional(?:ly)?|instead)\b/;

function appliancesOf(steps) {
  const text = steps.replace(/\bpastry blender\b/g, " ").replace(/\bgrill pan\b/g, " skillet ");
  const sentences = text.split(/(?<=[.!?;])\s+|\n/).filter((sentence) => !ALTERNATIVE.test(sentence));
  const found = [];
  const add = (key, pattern) => pattern.test(text) && found.push(key);
  const addIfNeeded = (key, pattern) => sentences.some((sentence) => pattern.test(sentence)) && found.push(key);
  add("oven", /\b(oven|bake|baked|bakes|baking (?:sheet|dish|pan|tray|tin)|broil(?:er|ed|ing)?|preheat|under (?:a |the )?(?:hot |preheated )?grill|gas mark)\b/);
  add("stovetop", /\b(stove|stovetop|stove-top|hob|burner|saucepan|sauce pan|skillet|frying pan|wok|pot|fry|fried|frying|saute|sauteed|simmer|simmering|boil|boiling|steam|stir-fry|deep-fry|griddle|over (?:low|medium|high|moderate)|(?:low|medium|high|moderate) heat|heat the oil|melt the)\b/);
  add("microwave", /\bmicrowave/);
  add("kettle", /\bkettle\b/);
  addIfNeeded("blender", /\b(blender|liquidi[sz]er|liquidi[sz]e)\b/);
  if (!found.includes("blender")) addIfNeeded("food-processor", /\bfood[- ]processor\b/);
  addIfNeeded("stand-mixer", /\b((?:stand|electric|hand|kitchen|tabletop) mixer|mixer|kitchenaid|dough hook|paddle attachment|whisk attachment)\b/);
  addIfNeeded("grill", /\b(barbecue|bbq|charcoal|outdoor grill|gas grill|grill grates?|smoker|(?:wood|hickory|mesquite|applewood) chips|on (?:a|the) (?:\w+ ){0,2}grill)\b/);
  addIfNeeded("slow-cooker", /\b(slow[- ]cooker|crock[- ]?pot)\b/);
  addIfNeeded("pressure-cooker", /\b(pressure[- ]cooker|instant pot|instapot)\b/);
  addIfNeeded("air-fryer", /\bair[- ]fryer\b/);
  addIfNeeded("bread-machine", /\b(bread machine|bread maker|breadmaker)\b/);
  if (!found.includes("oven")) addIfNeeded("dehydrator", /\bdehydrator\b/);
  return found;
}

const DURATION = new RegExp(
  `(?<![a-z0-9])(${NUMBER}|half an?|an?|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|forty-five|forty|sixty|ninety)(?:\\s*(?:-|–|—|to)\\s*(${NUMBER}))?\\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?)\\b|\\b(overnight)\\b`,
  "gi"
);
const UNIT_MINUTES = { s: 1 / 60, m: 1, h: 60, d: 1440, w: 10080 };

function minutesIn(text) {
  let total = 0;
  for (const match of text.matchAll(DURATION)) {
    if (match[4]) {
      total += 8 * 60;
      continue;
    }
    const value = (raw) => WORD_NUMBERS[raw.toLowerCase()] ?? parseNumber(raw);
    // a range counts at its upper end
    total += (match[2] ? value(match[2]) : value(match[1])) * UNIT_MINUTES[match[3][0].toLowerCase()];
  }
  return total;
}

function formatMinutes(minutes) {
  const rounded = Math.ceil(minutes / 5) * 5;
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function timeOf(summaryTime, steps) {
  if (summaryTime) {
    const total = summaryTime.match(/total[^a-z0-9]*(.*)$/i);
    const minutes = minutesIn(total ? total[1] : summaryTime);
    if (minutes > 0) return formatMinutes(minutes);
  }
  // No summary: add up the durations in the steps, plus a little preparation.
  const minutes = minutesIn(steps);
  return minutes > 0 ? formatMinutes(minutes + 10) : "";
}

function servingsOf(summary) {
  const text = summary.servings || summary.yield || "";
  if (/\b(cups?|ml|g|oz|lit(?:er|re)s?|quarts?|pints?|gallons?|tbsp|tsp|kg|lbs?)\b/i.test(text)) return undefined;
  const count = Number(text.match(/\d+/)?.[0]);
  return count > 0 && count <= 500 ? count : undefined;
}

// ─────────────────────────────────────────────
// Recipe
// ─────────────────────────────────────────────

const slugify = (title) =>
  normalize(title)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function convert(page) {
  const ingredients = page.ingredients.flatMap(({ group, items }) =>
    items
      .filter((line) => !/^total\b/i.test(line) && !GROUP_LABEL.test(line.trim().replace(/:$/, "")))
      .map((line) => parseIngredient(line, /optional/i.test(group ?? "")))
      .filter((ingredient) => ingredient.name)
  );
  const instructions = page.instructions.flatMap(({ group, items }) =>
    items.map((step, index) => (group && index === 0 ? `${group}: ${step}` : step))
  );

  // Every ingredient line counts, optional ones included, plus the
  // "Recipes using …" categories. Dish categories ("Recipes for stuffing")
  // only decide the course.
  const pageCategories = normalize(page.categories.filter((c) => !/^recipes (?:using|with)\b/i.test(c)).join(" | "));
  const usedIngredients = page.categories.filter((c) => /^recipes using\b/i.test(c)).map((c) => c.replace(/^recipes using\s+/i, ""));
  const text = normalize([...page.ingredients.flatMap((g) => [g.group ?? "", ...g.items]), ...usedIngredients].join("\n"));
  const animalText = text.replace(SUBSTITUTE, " ");
  const steps = normalize(instructions.join("\n"));

  const allergens = Object.keys(ALLERGENS).filter((key) => found(ANIMAL_ALLERGENS.has(key) ? animalText : text, ALLERGENS[key]));
  const meat = found(animalText, MEAT);
  const gelatin = found(animalText, GELATIN);
  const seafood = allergens.includes("fish") || allergens.includes("shellfish");
  const course = courseOf(normalize(page.summary.category ?? ""), pageCategories, meat);

  const diets = [];
  if (!meat && !seafood && !gelatin && !allergens.includes("milk") && !allergens.includes("eggs") && !found(animalText, OTHER_ANIMAL)) diets.push("vegan");
  if (!meat && !seafood && !gelatin) diets.push("vegetarian");
  if (!meat && !gelatin) diets.push("pescatarian");
  const categoryText = `${normalize(page.summary.category ?? "")} | ${pageCategories}`;
  if (!allergens.includes("gluten") && (!GLUTEN_CATEGORY.test(categoryText) || /gluten[- ]free/.test(categoryText))) diets.push("gluten-free");
  if (!allergens.includes("milk")) diets.push("dairy-free");
  if (!found(animalText, PORK)) diets.push("pork-free");
  if (course !== "dessert" && !found(text, HIGH_CARB)) diets.push("low-carb");

  const recipe = {
    id: slugify(page.title),
    title: page.title,
    image: "",
    time: timeOf(page.summary.time, steps),
    course,
    vegan: diets.includes("vegan"),
    diets,
    allergens,
    appliances: appliancesOf(steps),
  };
  const servings = servingsOf(page.summary);
  if (servings) recipe.servings = servings;
  return { ...recipe, ingredients, instructions, sourceUrl: page.sourceUrl };
}

// ─────────────────────────────────────────────

function keysOf(type, source) {
  return [...source.match(new RegExp(`type ${type} =([^;]+);`))[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

function main() {
  const pages = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  const license = fs.readFileSync(LICENSE_FILE, "utf8");
  const translated = new Set([...license.matchAll(/sourceUrl:\s*"([^"]+)"/g)].map((m) => decodeURI(m[1])));

  const recipes = [];
  const curated = fs.readFileSync(path.join(RECIPE_DIR, "recipe.ts"), "utf8");
  const ids = new Set([...curated.matchAll(/^\s*id: "([^"]+)"/gm)].map((m) => m[1]));
  let skippedTranslated = 0;
  let skippedEmpty = 0;
  for (const page of pages) {
    if (translated.has(decodeURI(page.sourceUrl))) {
      skippedTranslated++;
      continue;
    }
    const recipe = convert(page);
    if (recipe.ingredients.length === 0 || recipe.instructions.length === 0) {
      skippedEmpty++;
      continue;
    }
    for (let n = 2; ids.has(recipe.id); n++) recipe.id = `${slugify(page.title)}-${n}`;
    ids.add(recipe.id);
    recipes.push(recipe);
  }

  // Same keys as constants/dietary.ts, or the filters would silently ignore them.
  const dietary = fs.readFileSync(DIETARY_FILE, "utf8");
  for (const [field, type] of [["diets", "DietKey"], ["allergens", "AllergenKey"], ["appliances", "ApplianceKey"]]) {
    const allowed = new Set(keysOf(type, dietary));
    const unknown = recipes.flatMap((r) => r[field]).filter((key) => !allowed.has(key));
    if (unknown.length > 0) throw new Error(`Unknown ${field}: ${[...new Set(unknown)].join(", ")}`);
  }

  // One recipe per line: compact, and diffs stay readable.
  fs.writeFileSync(OUTPUT_FILE, `[\n${recipes.map((r) => JSON.stringify(r)).join(",\n")}\n]\n`);
  console.log(`✓ Converted ${recipes.length} recipes into ${OUTPUT_FILE}`);
  console.log(`  skipped ${skippedTranslated} already translated, ${skippedEmpty} without ingredients or steps`);
}

if (require.main === module) main();

// The generic helpers are shared with scripts/convert-ricardo-recipes.js.
module.exports = { convert, parseIngredient, normalize, found, parseNumber, roundQuantity, formatMinutes, keysOf, NUMBER };
