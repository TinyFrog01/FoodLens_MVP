const fs = require("fs");
const path = require("path");
const { SITE, fetchPage, recipeData, instructionGroups } = require("./scrape-ricardo-recipes");

// Downloads Ricardo's own English version of every recipe in scripts/ricardo-recipes.json
// (same permission as the French scrape) into scripts/ricardo-recipes-en.json. The
// English page has the same ingredient lines and steps, in the same order, so
// `npm run convert:ricardo` can line them up with the French recipe.
//
// /en/recipes/<id>-x redirects to the English page of recipe <id>, whatever the slug.
// Recipes Ricardo never translated answer 404 and are noted as missing, so a second
// run does not ask again. Progress is saved as it goes: run it again to resume.
//
//   npm run scrape:ricardo:en
//   npm run scrape:ricardo:en -- --limit 20

const INPUT_FILE = path.join(__dirname, "ricardo-recipes.json");
const OUTPUT_FILE = path.join(__dirname, "ricardo-recipes-en.json");
const SAVE_EVERY = 50; // recipes

function readOption(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function parseEnglish(id, page) {
  const data = recipeData(page.html);
  if (!data?.recipeIngredient?.length || !data.recipeInstructions) return null;
  return {
    id,
    title: data.name,
    sourceUrl: page.url,
    yield: data.recipeYield ?? null,
    ingredients: data.recipeIngredient,
    instructions: instructionGroups(data.recipeInstructions),
  };
}

function save(state) {
  const list = [...state.recipes.values()].sort((a, b) => a.id - b.id);
  const missing = [...state.missing].sort((a, b) => a - b);
  // One recipe per line, written whole so an interrupted run never leaves half a file.
  fs.writeFileSync(
    `${OUTPUT_FILE}.tmp`,
    `{"missing":${JSON.stringify(missing)},\n"recipes":[\n${list.map((r) => JSON.stringify(r)).join(",\n")}\n]}\n`
  );
  fs.renameSync(`${OUTPUT_FILE}.tmp`, OUTPUT_FILE);
}

async function main() {
  const limit = Number(readOption("limit")) || Infinity;
  const french = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

  const state = { recipes: new Map(), missing: new Set() };
  if (fs.existsSync(OUTPUT_FILE)) {
    const saved = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    for (const recipe of saved.recipes) state.recipes.set(recipe.id, recipe);
    for (const id of saved.missing) state.missing.add(id);
    console.log(`… resuming: ${state.recipes.size} downloaded, ${state.missing.size} without English`);
  }

  const todo = french
    .map((recipe) => recipe.id)
    .filter((id) => !state.recipes.has(id) && !state.missing.has(id))
    .slice(0, limit);
  console.log(`… ${todo.length} English pages to download`);

  for (const [index, id] of todo.entries()) {
    const page = await fetchPage(`${SITE}/en/recipes/${id}-x`);
    const recipe = page && parseEnglish(id, page);
    if (recipe) state.recipes.set(id, recipe);
    else state.missing.add(id);
    if ((index + 1) % SAVE_EVERY === 0 || index + 1 === todo.length) {
      save(state);
      console.log(`… ${index + 1}/${todo.length} pages (${state.missing.size} without English)`);
    }
  }

  save(state);
  console.log(`✓ ${state.recipes.size} English recipes in ${OUTPUT_FILE}, ${state.missing.size} without English`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
