const fs = require("fs");
const path = require("path");

// Downloads the recipes of the Wikibooks Cookbook (the source of the recipes in
// app/Food/data/recipe/recipe.ts) into scripts/wikibooks-recipes.json as plain
// English text: summary box, ingredients, steps, notes, source and licence.
// Then `npm run convert:recipes` turns them into the app's Recipe format.
//
//   npm run scrape:recipes
//   npm run scrape:recipes -- --from "Beef Muchomo" --limit 100

const API_URL = "https://en.wikibooks.org/w/api.php";
const OUTPUT_FILE = path.join(__dirname, "wikibooks-recipes.json");
// Wikimedia asks scripts to say how to reach whoever runs them, e.g.
// WIKIMEDIA_USER_AGENT="FoodLens-recipe-scraper/1.0 (you@example.com)".
// https://meta.wikimedia.org/wiki/User-Agent_policy
const USER_AGENT = process.env.WIKIMEDIA_USER_AGENT || "FoodLens-recipe-scraper/1.0";
const BATCH_SIZE = 50; // most pages the API returns content for in one request
const PAUSE_MS = 2000; // between requests, to stay under the rate limit
const PREFIX = "Cookbook:";
const LICENSE = "CC BY-SA 4.0";
const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";

const SECTION_KINDS = [
  ["ingredients", /^ingredients?\b/i],
  ["instructions", /^(procedures?|directions?|method|instructions?|preparation|steps)\b/i],
  ["notes", /^(notes?|tips|variations)\b/i],
];

const ENTITIES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", deg: "°",
  frac12: "½", frac13: "⅓", frac14: "¼", frac23: "⅔", frac34: "¾", ndash: "–",
  mdash: "—", times: "×", minus: "−", hellip: "…", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", eacute: "é",
};

const UNIT_TEMPLATES = new Set(["g", "kg", "mg", "ml", "l", "oz", "lb", "tsp", "tbsp", "cup"]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(params) {
  const body = new URLSearchParams({ format: "json", formatversion: "2", maxlag: "5", ...params });
  for (;;) {
    const res = await fetch(API_URL, { method: "POST", body, headers: { "User-Agent": USER_AGENT } });
    const data = res.ok ? await res.json() : null;
    if (res.status === 429 || res.status === 503 || data?.error?.code === "maxlag") {
      const seconds = Number(res.headers.get("retry-after")) || 30;
      console.log(`… Wikibooks asks to slow down, retrying in ${seconds}s`);
      await sleep(seconds * 1000);
      continue;
    }
    if (!data) throw new Error(`Wikibooks API answered HTTP ${res.status}`);
    if (data.error) throw new Error(`Wikibooks API error: ${data.error.info}`);
    return data;
  }
}

async function listRecipeTitles() {
  const titles = [];
  let next = {};
  while (next) {
    const data = await api({
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:Recipes",
      cmnamespace: "102", // Cookbook:
      cmlimit: "max",
      ...next,
    });
    titles.push(...data.query.categorymembers.map((member) => member.title));
    next = data.continue;
  }
  return titles.filter((title) => !title.startsWith(`${PREFIX}Policy/`)); // the recipe template's doc page
}

async function fetchPages(titles) {
  const data = await api({
    action: "query",
    prop: "revisions|info",
    rvprop: "content|ids|timestamp",
    rvslots: "main",
    inprop: "url",
    titles: titles.join("|"),
  });
  const pages = new Map();
  for (const page of data.query.pages) {
    const revision = page.revisions?.[0];
    if (!revision) continue;
    pages.set(page.title, {
      text: revision.slots.main.content,
      url: page.fullurl,
      revisionId: revision.revid,
      lastEdited: revision.timestamp,
    });
  }
  return pages;
}

// ─────────────────────────────────────────────
// Wikitext -> plain text
// ─────────────────────────────────────────────

// Replaces innermost matches first, so nested links and templates resolve.
function replaceNested(text, pattern, replacer) {
  let previous;
  do {
    previous = text;
    text = text.replace(pattern, replacer);
  } while (text !== previous);
  return text;
}

// Finds a template by name and returns its source with the matching "}}".
function findTemplate(text, pattern) {
  const from = text.search(pattern);
  if (from === -1) return null;
  let depth = 0;
  for (let i = from; i < text.length - 1; i++) {
    if (text.startsWith("{{", i)) depth++;
    else if (text.startsWith("}}", i)) depth--;
    else continue;
    i++;
    if (depth === 0) return text.slice(from, i + 1);
  }
  return null;
}

// Splits "a|b=[[c|d]]|e" on the pipes that are not inside links or templates.
function splitParams(text) {
  const params = [""];
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const pair = text.slice(i, i + 2);
    if (pair === "{{" || pair === "[[") depth++;
    if (pair === "}}" || pair === "]]") depth--;
    if (pair === "{{" || pair === "[[" || pair === "}}" || pair === "]]") {
      params[params.length - 1] += pair;
      i++;
    } else if (text[i] === "|" && depth === 0) {
      params.push("");
    } else {
      params[params.length - 1] += text[i];
    }
  }
  return params;
}

function linkText(inner) {
  const [target, ...label] = inner.split("|");
  if (/^\s*(file|image|media|category)\s*:/i.test(target)) return "";
  if (label.length === 0 && /^\s*[a-z]{2,3}(-[a-z]+)?\s*:/i.test(target)) return ""; // [[fr:Livre de cuisine/…]] language link
  const text = label.join("|").trim();
  return text || target.replace(/^\s*:?\s*(cookbook|w|wikipedia|wikt|wiktionary)\s*:/i, "").replace(/#.*/, "").trim();
}

// {{convert|350|F|C}} -> "350 °F", {{convert|2|-|3|cm|in}} -> "2–3 cm"
function convertText(args) {
  const parts = [];
  for (const arg of args) {
    parts.push(arg === "-" ? "–" : arg);
    if (!/^([\d.,/½¼¾⅓⅔⅛]+|-|–|to|and|or|x|×|by)$/i.test(arg)) break;
  }
  return parts.join(" ").replace(/ – /g, "–").replace(/ ([FC])$/, " °$1");
}

function templateText(inner) {
  const [name, ...params] = inner.split("|").map((part) => part.trim());
  const args = params.filter((param) => !/^[\w-]+\s*=/.test(param)); // drop options such as abbr=on
  switch (name.toLowerCase()) {
    case "convert":
    case "convert/3":
      return convertText(args);
    case "#invoke:temperature":
      return args[1] ? `${args[1]} °${args[0].toUpperCase()}` : "";
    case "frac":
    case "fraction":
      if (args.length >= 3) return `${args[0]} ${args[1]}/${args[2]}`;
      return args.length === 2 ? `${args[0]}/${args[1]}` : `1/${args[0]}`;
    case "cb":
    case "w":
      return args[1] ?? args[0] ?? "";
    case "lang":
      return args[1] ?? "";
    case "!":
      return "|";
    default:
      return UNIT_TEMPLATES.has(name.toLowerCase()) ? name : "";
  }
}

function expandMarkup(text) {
  const withoutLinks = replaceNested(text, /\[\[([^[\]]*)\]\]/g, (_, inner) => linkText(inner));
  return replaceNested(withoutLinks, /\{\{([^{}]*)\}\}/g, (_, inner) => templateText(inner));
}

function cleanLine(text) {
  return text
    .replace(/\[https?:\/\/[^\s\]]+\s*([^\]]*)\]/g, "$1") // [http://url label] -> label
    .replace(/'{2,}/g, "") // ''italic'', '''bold'''
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z0-9]+);/gi, (entity, name) => ENTITIES[name] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

// ─────────────────────────────────────────────
// Recipe page -> JSON
// ─────────────────────────────────────────────

function parseSummary(template) {
  const summary = {};
  if (!template) return summary;
  for (const param of splitParams(template.slice(2, -2)).slice(1)) {
    const equals = param.indexOf("=");
    if (equals === -1) continue;
    const key = param.slice(0, equals).trim().toLowerCase();
    const raw = param.slice(equals + 1).trim();
    const value =
      key === "image"
        ? (raw.match(/(?:file|image):([^|\]]+)/i)?.[1] ?? raw).trim()
        : cleanLine(expandMarkup(raw));
    if (value) summary[key] = value;
  }
  return summary;
}

function sectionKind(title) {
  return SECTION_KINDS.find(([, pattern]) => pattern.test(title))?.[0] ?? null;
}

function tableCells(line) {
  return line
    .slice(1)
    .split("||")
    .map((cell) => cleanLine(cell.replace(/^[^|]*=[^|]*\|/, ""))) // drop cell attributes: | style="…" | text
    .filter(Boolean);
}

function parseRecipe(title, page) {
  let text = page.text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref[^>]*?\/>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<gallery[^>]*>[\s\S]*?<\/gallery>/gi, "")
    .replace(/__[A-Z]+__/g, "");

  const summaryTemplate = findTemplate(text, /\{\{\s*recipe ?summary/i);
  if (summaryTemplate) text = text.replace(summaryTemplate, "");
  const categories = [...text.matchAll(/\[\[\s*category\s*:\s*([^|\]]+)/gi)].map((m) => m[1].replace(/_/g, " ").trim());

  // "{{recipe}} | [[Cookbook:Cuisine of X|X Cuisine]]" breadcrumb
  text = expandMarkup(text.replace(/\{\{\s*recipe\s*\}\}(\s*\|\s*\[\[[^\]]*\]\])*/gi, ""));

  const description = [];
  const sections = { ingredients: [], instructions: [], notes: [] };
  const headings = []; // title of the open heading at each level
  let kind = null;
  let kindLevel = 0;
  let group = null;
  let row = null; // cells of the table row being read

  const startGroup = (name) => {
    group = { group: name, items: [] };
    sections[kind].push(group);
  };
  const addItem = (item) => {
    if (!item) return;
    // "For the sauce:" on its own line names the items that follow
    if (kind !== "notes" && /^[^\d]{1,40}:$/.test(item)) startGroup(item.slice(0, -1));
    else group.items.push(item);
  };

  for (const line of text.split("\n")) {
    const heading = line.match(/^(={2,6})\s*(.*?)\s*\1\s*$/);
    if (heading) {
      const level = heading[1].length;
      const name = cleanLine(heading[2]);
      headings[level] = name;
      headings.length = level + 1;
      const headingKind = sectionKind(name);
      if (kind && level > kindLevel && (!headingKind || headingKind === kind)) {
        startGroup(name); // "=== Sauce ===" under "== Ingredients =="
      } else if (headingKind) {
        // "=== Ingredients ===" under "== Dough ==": the parent names the group
        const parent = headings.slice(0, level).filter(Boolean).pop();
        kind = headingKind;
        kindLevel = level;
        startGroup(parent && !sectionKind(parent) ? parent : null);
      } else {
        kind = null;
      }
      continue;
    }

    if (!kind) {
      if (headings.length === 0 && !/^[{|!]/.test(line)) description.push(cleanLine(line));
      continue;
    }

    // Ingredient tables: one item per row, whether cells share a line or not.
    if (/^:*\{\|/.test(line)) {
      row = [];
      continue;
    }
    if (row) {
      if (/^\|[-}]/.test(line)) {
        addItem(row.join(" "));
        row = line.startsWith("|}") ? null : [];
      } else if (/^\|[^+]/.test(line)) {
        row.push(...tableCells(line));
      }
      continue;
    }

    const marker = line.match(/^[*#:;]+/)?.[0] ?? "";
    const item = cleanLine(line.slice(marker.length));
    if (!item) continue;
    if (marker.startsWith(";")) startGroup(item.replace(/:$/, ""));
    else if (marker.length > 1 && marker.endsWith(":") && group.items.length > 0) {
      group.items[group.items.length - 1] += ` ${item}`; // "#:" continues the previous step
    } else addItem(item);
  }

  const groups = (list) => list.filter((g) => g.items.length > 0);
  return {
    title: title.slice(PREFIX.length),
    sourceUrl: page.url,
    revisionId: page.revisionId,
    lastEdited: page.lastEdited,
    license: LICENSE,
    licenseUrl: LICENSE_URL,
    summary: parseSummary(summaryTemplate),
    description: description.filter(Boolean).join("\n"),
    ingredients: groups(sections.ingredients),
    instructions: groups(sections.instructions),
    notes: sections.notes.flatMap((g) => g.items),
    categories,
  };
}

function readOption(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const from = readOption("from");
  const limit = Number(readOption("limit")) || Infinity;

  let titles = await listRecipeTitles();
  if (from) {
    const start = titles.findIndex((t) => t.slice(PREFIX.length).toLowerCase().startsWith(from.toLowerCase()));
    if (start === -1) throw new Error(`No recipe title starts with "${from}"`);
    titles = titles.slice(start);
  }
  titles = titles.slice(0, limit);

  const recipes = [];
  for (let i = 0; i < titles.length; i += BATCH_SIZE) {
    const batch = titles.slice(i, i + BATCH_SIZE);
    const pages = await fetchPages(batch);
    for (const title of batch) {
      if (pages.has(title)) recipes.push(parseRecipe(title, pages.get(title)));
    }
    console.log(`… ${Math.min(i + BATCH_SIZE, titles.length)}/${titles.length} pages`);
    if (i + BATCH_SIZE < titles.length) await sleep(PAUSE_MS);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(recipes, null, 2));
  console.log(`✓ Scraped ${recipes.length} recipes into ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { parseRecipe };
