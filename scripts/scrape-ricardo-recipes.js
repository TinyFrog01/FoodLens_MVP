const fs = require("fs");
const path = require("path");

// Downloads the French recipes of RICARDO (ricardocuisine.com), used with Ricardo
// Media's permission, into scripts/ricardo-recipes.json: the schema.org Recipe data
// of each page (ingredients, steps, times, yield, tags) and the categories it is
// listed in. Then `npm run convert:ricardo` turns them into the app's Recipe format.
//
// Recipes reserved for subscribers have no ingredients or steps in their page and
// are skipped. Progress is saved as it goes: run it again to resume.
//
//   npm run scrape:ricardo
//   npm run scrape:ricardo -- --only plats-principaux/poulet --limit 20

const SITE = "https://www.ricardocuisine.com";
const OUTPUT_FILE = path.join(__dirname, "ricardo-recipes.json");
const USER_AGENT = "FoodLens-recipe-scraper/1.0";
const PAUSE_MS = 750; // between requests, about one page a second
const SAVE_EVERY = 50; // recipes
// Every recipe is listed under at least one subcategory of these.
// (/api/ is off limits in robots.txt: the listings are read from the pages.)
const ROOTS = ["plats-principaux", "desserts", "entrees"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequest = 0;

// Returns the page's HTML and final URL, or null when it does not exist.
async function fetchPage(url) {
  for (let attempt = 1; ; attempt++) {
    await sleep(Math.max(0, lastRequest + PAUSE_MS - Date.now()));
    lastRequest = Date.now();
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.status === 404) return null;
      if (res.ok) return { html: await res.text(), url: res.url };
      if (attempt >= 5 || (res.status !== 429 && res.status < 500)) {
        throw new Error(`${url} answered HTTP ${res.status}`);
      }
      const seconds = Number(res.headers.get("retry-after")) || 30 * attempt;
      console.log(`… HTTP ${res.status}, retrying in ${seconds}s`);
      await sleep(seconds * 1000);
    } catch (error) {
      if (attempt >= 5 || /answered HTTP/.test(error.message)) throw error;
      console.log(`… ${error.message}, retrying in ${30 * attempt}s`);
      await sleep(30 * attempt * 1000);
    }
  }
}

// Reads the JSON object or array that starts at `from` in a page.
function readJson(text, from) {
  let depth = 0;
  let inString = false;
  for (let i = from; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (char === "\\") i++;
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
    } else if (char === "{" || char === "[") {
      depth++;
    } else if (char === "}" || char === "]") {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(from, i + 1));
    }
  }
  throw new Error("Unterminated JSON in page");
}

// ─────────────────────────────────────────────
// Category listings
// ─────────────────────────────────────────────

async function listSubcategories() {
  const subcategories = new Set();
  for (const root of ROOTS) {
    const page = await fetchPage(`${SITE}/recettes/${root}`);
    if (!page) throw new Error(`No category page for ${root}`);
    // The menu's data: "url":"\/recettes\/desserts\/gateaux"
    for (const [, found, sub] of page.html.matchAll(/"url":"\\\/recettes\\\/([a-z-]+)\\\/([a-z0-9-]+)"/g)) {
      if (ROOTS.includes(found)) subcategories.add(`${found}/${sub}`);
    }
  }
  return [...subcategories].sort();
}

// The results the page shows: { totalFound, totalPages, currentPage, rows }
function listingResults(html) {
  const marker = '"results":{"totalFound"';
  const at = html.indexOf(marker);
  if (at === -1) throw new Error("No results in listing page");
  return readJson(html, at + '"results":'.length);
}

// id -> { url, title, exclusive, listings } for every recipe of the subcategories
async function listRecipes(subcategories) {
  const listed = new Map();
  for (const [index, subcategory] of subcategories.entries()) {
    let found = 0;
    for (let page = 1, totalPages = 1; page <= totalPages; page++) {
      const url = `${SITE}/recettes/${subcategory}${page > 1 ? `?currentPage=${page}` : ""}`;
      const result = await fetchPage(url);
      if (!result) break;
      const results = listingResults(result.html);
      totalPages = results.totalPages;
      for (const row of results.rows) {
        if (row.type !== "recipe") continue;
        const entry = listed.get(row.id) ?? { url: row.url, title: row.title, exclusive: false, listings: [] };
        entry.exclusive ||= Boolean(row.isExclusive);
        if (!entry.listings.includes(subcategory)) entry.listings.push(subcategory);
        listed.set(row.id, entry);
        found++;
      }
    }
    console.log(`… ${index + 1}/${subcategories.length} ${subcategory}: ${found} recipes (${listed.size} in all)`);
  }
  return listed;
}

// ─────────────────────────────────────────────
// Recipe page -> JSON
// ─────────────────────────────────────────────

function recipeData(html) {
  for (const [, json] of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      continue;
    }
    const items = Array.isArray(data) ? data : [data, ...(data["@graph"] ?? [])];
    const recipe = items.find((item) => item["@type"] === "Recipe");
    if (recipe) return recipe;
  }
  return null;
}

// [{ group, items }]: one group per titled part of the method ("Glaçage", …)
function instructionGroups(instructions) {
  if (typeof instructions === "string") return [{ group: null, items: [instructions] }];
  const groups = [];
  let loose = null;
  for (const item of instructions ?? []) {
    if (item["@type"] === "HowToSection") {
      groups.push({ group: item.name ?? null, items: (item.itemListElement ?? []).map((step) => step.text ?? "") });
    } else {
      if (!loose) groups.push((loose = { group: null, items: [] }));
      loose.items.push(item.text ?? String(item));
    }
  }
  return groups;
}

function parseRecipe(id, entry, page) {
  const data = recipeData(page.html);
  if (!data?.recipeIngredient?.length || !data.recipeInstructions) return null; // reserved for subscribers
  const images = [data.image ?? []].flat();
  return {
    id,
    title: data.name,
    sourceUrl: `${SITE}/recettes/${entry.url}`,
    datePublished: data.datePublished,
    description: data.description ?? "",
    image: images.find((image) => image.includes("crop/4:3")) ?? images[0] ?? "",
    prepTime: data.prepTime ?? null,
    cookTime: data.cookTime ?? null,
    totalTime: data.totalTime ?? null,
    yield: data.recipeYield ?? null,
    ingredients: data.recipeIngredient,
    instructions: instructionGroups(data.recipeInstructions),
    category: data.recipeCategory ?? null,
    subCategories: data.recipeSubCategories ?? [],
    tags: data.tags ?? [],
    keywords: data.keywords ?? "",
    listings: entry.listings,
  };
}

// ─────────────────────────────────────────────

function readOption(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function save(recipes) {
  const list = [...recipes.values()].sort((a, b) => a.id - b.id);
  // One recipe per line, written whole so an interrupted run never leaves half a file.
  fs.writeFileSync(`${OUTPUT_FILE}.tmp`, `[\n${list.map((r) => JSON.stringify(r)).join(",\n")}\n]\n`);
  fs.renameSync(`${OUTPUT_FILE}.tmp`, OUTPUT_FILE);
}

async function main() {
  const only = readOption("only");
  const limit = Number(readOption("limit")) || Infinity;

  const recipes = new Map();
  if (fs.existsSync(OUTPUT_FILE)) {
    for (const recipe of JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"))) recipes.set(recipe.id, recipe);
    console.log(`… resuming: ${recipes.size} recipes already downloaded`);
  }

  const subcategories = only ? only.split(",") : await listSubcategories();
  const listed = await listRecipes(subcategories);

  const todo = [...listed].filter(([id, entry]) => !entry.exclusive && !recipes.has(id)).slice(0, limit);
  for (const [id, entry] of listed) {
    if (recipes.has(id)) recipes.get(id).listings = entry.listings;
  }
  const exclusive = [...listed.values()].filter((entry) => entry.exclusive).length;
  console.log(`… ${listed.size} recipes listed, ${exclusive} for subscribers only, ${todo.length} to download`);

  let skipped = 0;
  for (const [index, [id, entry]] of todo.entries()) {
    const page = await fetchPage(`${SITE}/recettes/${entry.url}`);
    const recipe = page && parseRecipe(id, entry, page);
    if (recipe) recipes.set(id, recipe);
    else skipped++;
    if ((index + 1) % SAVE_EVERY === 0 || index + 1 === todo.length) {
      save(recipes);
      console.log(`… ${index + 1}/${todo.length} pages (${skipped} without ingredients or steps)`);
    }
  }

  save(recipes);
  console.log(`✓ ${recipes.size} recipes in ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { parseRecipe, recipeData };
