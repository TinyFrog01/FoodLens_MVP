const { parseIngredient: parseEnglishLine, normalize, NUMBER } = require("./convert-wikibooks-recipes");

// The English side of `npm run convert:ricardo`: Ricardo's own English version of a
// recipe (downloaded by scripts/scrape-ricardo-english.js) lined up with the French
// recipe the app uses. The French names stay the ones the fridge, the allergens and
// the diets work on; the English ones are only shown.
//
// Ricardo's English page lists the same ingredient lines in the same order, so line n
// of the French page is line n of the English one. Each French ingredient takes the
// English name read from its line. When the two lists clearly do not match (different
// length, or quantities that disagree line after line), the names come from what the
// other recipes translate the same French name to.

// French units that are a measure, kept as is in English ("250 ml", "1 kg").
const MEASURES = new Set(["ml", "L", "g", "kg", "lb", "oz", "c. à soupe", "c. à thé", "tasse", "tasses"]);

// English words for the French counted units (lib/recipeText.ts shows them in English).
const UNIT_WORDS = {
  pincée: "pinch|pinches", gousse: "clove|cloves", tranche: "slice|slices", brin: "sprig|sprigs",
  branche: "stalk|stalks|sprig|sprigs|rib|ribs|branch|branches", tige: "stalk|stalks|sprig|sprigs|stem|stems",
  bouquet: "bunch|bunches|bouquet", botte: "bunch|bunches", tête: "head|heads", poignée: "handful|handfuls",
  trait: "dash|dashes", goutte: "drop|drops", lanière: "strip|strips", rondelle: "slice|slices|round|rounds",
  abaisse: "pie crust|pie crusts|crust|crusts|sheet|sheets|pastry shell|shell", boule: "ball|balls|scoop|scoops",
  carré: "square|squares", cube: "cube|cubes", morceau: "piece|pieces|chunk|chunks", quartier: "wedge|wedges|quarter|quarters",
  boîte: "can|cans|box|boxes", conserve: "can|cans", canette: "can|cans", cannette: "can|cans", pot: "jar|jars|tub|tubs|container|containers",
  bocal: "jar|jars", contenant: "container|containers|tub|tubs", bouteille: "bottle|bottles", sac: "bag|bags",
  sachet: "packet|packets|package|packages|envelope|envelopes|bag|bags", enveloppe: "envelope|envelopes|packet|packets",
  paquet: "package|packages|packet|packets|box|boxes", barquette: "container|containers|package|packages|tray|trays",
  emballage: "package|packages", tube: "tube|tubes", rouleau: "roll|rolls", bloc: "block|blocks", brique: "carton|cartons|block|blocks",
  carton: "carton|cartons",
};

// English counted words worth keeping in the name when the French one has no unit:
// "2 feuilles de pâte phyllo" -> "2 sheets phyllo pastry".
const KEEP_WHEN_NO_UNIT = new Set([
  "clove", "cloves", "slice", "slices", "sprig", "sprigs", "stalk", "stalks", "bunch", "bunches", "head", "heads",
  "piece", "pieces", "sheet", "sheets", "stick", "sticks", "can", "cans", "jar", "jars", "package", "packages",
  "bottle", "bottles", "bag", "bags", "box", "boxes", "scoop", "scoops", "handful", "handfuls", "pinch", "pinches",
  "dash", "dashes", "drop", "drops",
]);

const singularFrench = (unit) => {
  const word = unit.toLowerCase();
  if (word === "morceaux") return "morceau";
  if (word === "rouleaux") return "rouleau";
  if (word === "bocaux") return "bocal";
  return UNIT_WORDS[word] ? word : word.replace(/s$/, "");
};

// What the line parser leaves before the name: "1 can 19 oz (540 ml) black beans",
// "1/4 to 1/3 cup ice water", "+ 2 tablespoons oil", "1 250-g container cream cheese".
const SIZE_UNIT = "(?:oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|l|lit(?:er|re)s?|inch(?:es)?|cm)";
const MEASURE_WORD = "(?:cups?|tablespoons?|tbsps?|teaspoons?|tsps?)";
const CONTAINER_WORD = "(?:cans?|containers?|packages?|jars?|tubs?|box(?:es)?|bags?|bottles?|blocks?)";
const LEFTOVERS = [
  /^(?:-?\s*about|approximately|approx\.?|-)\s+/i,
  new RegExp(`^(?:to|or|and|\\+)\\s*${NUMBER}\\s*(?:${MEASURE_WORD}|${SIZE_UNIT})?\\.?(?![a-z])\\s*`, "i"),
  new RegExp(`^${NUMBER}\\s*-?\\s*${SIZE_UNIT}\\.?(?![a-z])\\s*(?:each\\s+)?(?:${CONTAINER_WORD}\\s+)?(?:of\\s+)?`, "i"),
  new RegExp(`^${MEASURE_WORD}(?![a-z])\\s*(?:of\\s+)?`, "i"),
  // "1 2-inch piece fresh ginger": "-inch piece" once the count is gone
  /^-?\s*(?:inch(?:es)?|in\.|cm)(?![a-z])\.?\s*(?:(?:long|thick|wide)\s+)?(?:pieces?\s+(?:of\s+)?)?/i,
];

function withoutLeftovers(name) {
  let text = name;
  for (let previous; previous !== text; ) {
    previous = text;
    for (const pattern of LEFTOVERS) text = text.replace(pattern, "");
  }
  return text.trim() || name;
}

const capitalized = /^[A-Z][a-z]/;
const lowerFirst = (name) => (capitalized.test(name) ? name[0].toLowerCase() + name.slice(1) : name);

// The English name for a French ingredient, read from its English line.
function englishName(line, french) {
  const parsed = parseEnglishLine(line.replace(/⁄/g, "/")); // "1 1⁄4 cups"
  let name = withoutLeftovers(parsed.name.replace(/\s*\(optional\)$/i, "").trim());
  const frenchUnit = french.unit ? singularFrench(french.unit) : "";

  if (!french.unit && parsed.unit && KEEP_WHEN_NO_UNIT.has(parsed.unit)) {
    name = `${parsed.unit} ${name}`; // the French name holds the count noun too
  } else if (frenchUnit && !MEASURES.has(french.unit) && UNIT_WORDS[frenchUnit]) {
    // "2 garlic cloves" next to "2 gousses d'ail": the unit is shown on its own
    const words = new RegExp(`(?:^|\\s)(?:${UNIT_WORDS[frenchUnit]})(?:\\s+of)?(?=\\s|$)`, "i");
    const stripped = name.replace(words, " ").replace(/\s+/g, " ").trim();
    if (stripped) name = stripped;
  }
  name = lowerFirst(name.replace(/[\s,;:.]+$/, "").replace(/\s+/g, " ").trim());
  return name;
}

// "Salt and pepper" for the French pair "sel" + "poivre".
const PAIR_WORDS = { sel: "salt", poivre: "pepper" };
function englishPair(line, frenchPair) {
  const name = parseEnglishLine(line.replace(/⁄/g, "/")).name;
  const match = name.match(/^(salt|pepper)\s+(?:and|&)\s+(salt|pepper)(.*)$/i);
  if (match) return [match[1].toLowerCase(), match[2].toLowerCase() + match[3]];
  return frenchPair.map((ingredient) => PAIR_WORDS[ingredient.name.toLowerCase()] ?? null);
}

// "750 ml (3 tasses)" and "3 cups (750 ml)" both hold 750 ml.
const METRIC = /(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg)(?![a-zà-ÿ])/gi;
const metricAmounts = (text) =>
  new Set([...text.matchAll(METRIC)].map(([, value, unit]) => `${Number(value.replace(",", "."))}${unit.toLowerCase()}`));

// Lines whose metric amounts disagree: a sign the two lists are shifted.
function disagreements(frenchLines, englishLines) {
  let count = 0;
  frenchLines.forEach((french, i) => {
    const a = metricAmounts(french);
    const b = metricAmounts(englishLines[i] ?? "");
    if (a.size > 0 && b.size > 0 && ![...a].some((amount) => b.has(amount))) count++;
  });
  return count;
}

// The method, titled parts and all, like the French one ("Glaze: …").
function englishSteps(englishPage, cleanText) {
  const title = cleanText(englishPage.title);
  const titled = englishPage.instructions.length > 1;
  return englishPage.instructions.flatMap(({ group, items }) => {
    const name = group ? cleanText(group) : "";
    const label = titled && name && normalize(name) !== normalize(title) ? name : "";
    return items
      .map(cleanText)
      .filter(Boolean)
      .map((step, index) => (label && index === 0 ? `${label}: ${step}` : step));
  });
}

// ─────────────────────────────────────────────
// Lists that do not line up
// ─────────────────────────────────────────────
// An English line added ("Salt and pepper"), merged or moved: each French line takes
// the English line that most clearly holds the same ingredient, if any.

const wordsOf = (text) => normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
const variants = (word) => [word, `${word}s`, `${word}es`, word.replace(/e?s$/, "")];
const hasWord = (set, word) => variants(word).some((variant) => set.has(variant));

function similarity(frenchLine, frenchName, englishLine, dictionary) {
  let score = 0;
  const a = metricAmounts(frenchLine);
  const b = metricAmounts(englishLine);
  if (a.size > 0 && b.size > 0) {
    score += [...a].some((amount) => b.has(amount)) ? 3 : -3;
  } else {
    // "6 betteraves moyennes" / "6 medium beets"
    const x = frenchLine.match(/^\s*(\d+)/)?.[1];
    const y = englishLine.match(/^\s*(\d+)/)?.[1];
    if (x && y) score += x === y ? 1 : -1;
  }
  const english = new Set(wordsOf(englishLine));
  // What other recipes call it: "beurre" -> "butter"
  const known = dictionary.get(frenchName.replace(/\s*\(facultatif\)$/, ""));
  const knownWords = known ? wordsOf(known) : [];
  if (knownWords.length > 0 && knownWords.every((word) => hasWord(english, word))) score += 2;
  // The same word in both languages: "mayonnaise", "paprika", "Boston"
  if (wordsOf(frenchName).some((word) => word.length >= 4 && !/^\d+$/.test(word) && hasWord(english, word))) score += 1.5;
  return score;
}

const MATCH_SCORE = 2;

// French line -> English line, for the lines that can be told apart.
function matchLines(frenchLines, englishLines, frenchNames, dictionary) {
  const candidates = [];
  frenchNames.forEach((name, line) => {
    englishLines.forEach((englishLine, j) => {
      // About the same place in both lists: a small nudge, never enough on its own.
      const place = Math.abs(line / frenchLines.length - j / englishLines.length) < 0.15 ? 0.5 : 0;
      const score = similarity(frenchLines[line], name, englishLine, dictionary) + place;
      if (score >= MATCH_SCORE) candidates.push({ line, j, score });
    });
  });
  candidates.sort((x, y) => y.score - x.score || Math.abs(x.line - x.j) - Math.abs(y.line - y.j));
  const matches = new Map();
  const taken = new Set();
  for (const { line, j } of candidates) {
    if (matches.has(line) || taken.has(j)) continue;
    matches.set(line, j);
    taken.add(j);
  }
  return matches;
}

// { title, ingredients, instructions, sourceUrl, aligned } for one recipe, or null
// when Ricardo has no English version. `sources[i]` is the French line ingredient i
// comes from: { line, part, of } (part 1 of 2 for "sel et poivre"). Without a
// `dictionary`, lists that do not line up get no names (first pass); with one, their
// lines are matched one by one.
// `shifted`: the lists have the same length but other recipes show their names do not
// match line for line (see oddNames).
function englishVersion({ page, englishPage, recipe, sources, cleanText, dictionary, shifted = false }) {
  if (!englishPage) return null;
  const frenchLines = page.ingredients.map(cleanText);
  const englishLines = englishPage.ingredients.map(cleanText);
  const sameLength = frenchLines.length === englishLines.length;
  const wrong = sameLength ? disagreements(frenchLines, englishLines) : Infinity;
  // One odd line is a translation detail ("1 lb (450 g)" next to "500 g"); more is a shift.
  const aligned = !shifted && sameLength && wrong <= Math.max(1, Math.floor(frenchLines.length / 6));

  let lineOf = (line) => line;
  if (!aligned && dictionary) {
    const frenchNames = new Map();
    recipe.ingredients.forEach((ingredient, i) => {
      if (!frenchNames.has(sources[i].line)) frenchNames.set(sources[i].line, ingredient.name);
    });
    const matches = matchLines(frenchLines, englishLines, frenchNames, dictionary);
    lineOf = (line) => matches.get(line);
  }

  const pairs = new Map();
  let ingredients = recipe.ingredients.map((french, i) => {
    if (!aligned && !dictionary) return null;
    const { line, part, of } = sources[i];
    const englishLine = englishLines[lineOf(line)];
    if (!englishLine) return null;
    if (of === 2) {
      if (!pairs.has(line)) pairs.set(line, englishPair(englishLine, recipe.ingredients.slice(i, i + 2)));
      return pairs.get(line)[part] || null;
    }
    return englishName(englishLine, french) || null;
  });

  ingredients = ingredients.map((name, i) =>
    name && /\(facultatif\)$/.test(recipe.ingredients[i].name) && !/optional/i.test(name) ? `${name} (optional)` : name
  );

  return {
    title: cleanText(englishPage.title),
    ingredients,
    instructions: englishSteps(englishPage, cleanText),
    sourceUrl: englishPage.sourceUrl,
    aligned,
  };
}

// French name -> { name, share, total }: the English name recipes most often give it,
// the share of recipes that agree and how many recipes use it.
function nameStats(pairs) {
  const counts = new Map();
  for (const [french, english] of pairs) {
    const key = french.replace(/\s*\(facultatif\)$/, "");
    const value = english.replace(/\s*\(optional\)$/, "");
    const forName = counts.get(key) ?? new Map();
    forName.set(value, (forName.get(value) ?? 0) + 1);
    counts.set(key, forName);
  }
  const stats = new Map();
  for (const [french, options] of counts) {
    const total = [...options.values()].reduce((sum, n) => sum + n, 0);
    const [name, count] = [...options].sort((a, b) => b[1] - a[1])[0];
    stats.set(french, { name, share: count / total, total });
  }
  return stats;
}

const STOP_WORDS = new Set(["of", "and", "or", "the", "with", "for", "a", "an", "to", "in", "into"]);
const contentWords = (text) =>
  new Set(
    normalize(text)
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
      .map((word) => word.replace(/(?:es|s)$/, ""))
  );

// Ingredients whose English name has nothing in common with what most recipes call the
// same French ingredient: "vermicelles de blé" read as "garlic", "soda tonique" as "A
// few ice cubes". One is a slip; two or more mean the English list is shifted.
function oddNames(recipe, names, stats) {
  return recipe.ingredients.map((ingredient, i) => {
    const english = names[i];
    const known = stats.get(ingredient.name.replace(/\s*\(facultatif\)$/, ""));
    if (!english || !known || known.total < 3 || known.share < 0.6) return false;
    const usual = contentWords(known.name);
    return ![...contentWords(english)].some((word) => usual.has(word));
  });
}

// French name -> the English name other recipes most often give it.
function nameDictionary(pairs) {
  const counts = new Map();
  for (const [french, english] of pairs) {
    const key = french.replace(/\s*\(facultatif\)$/, "");
    const value = english.replace(/\s*\(optional\)$/, "");
    const forName = counts.get(key) ?? new Map();
    forName.set(value, (forName.get(value) ?? 0) + 1);
    counts.set(key, forName);
  }
  const dictionary = new Map();
  for (const [french, options] of counts) {
    dictionary.set(french, [...options].sort((a, b) => b[1] - a[1])[0][0]);
  }
  return dictionary;
}

module.exports = { englishVersion, nameDictionary, nameStats, oddNames };
