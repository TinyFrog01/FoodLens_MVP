import type { Recipe } from "@/app/Food/data/recipe/types";
import { normalizeWords, type RecipeVerdict } from "@/lib/account/recipeFilter";
import { getLanguage, type Language } from "@/lib/i18n";
import { englishIngredientNames, englishTitle } from "@/lib/recipeText";

// ─────────────────────────────────────────────
// Recherche par titre et par ingrédient
// ─────────────────────────────────────────────
// « poulet citron » : chaque mot doit se trouver dans le titre ou dans un
// ingrédient. Les accents, les majuscules et les pluriels ne comptent pas.
// En anglais, on cherche dans les titres et les noms anglais, puis français.

const STOP_WORDS = new Set(
  normalizeWords(
    "de d du des la le l les un une et ou au aux a en avec sans pour the of and or with without for in an"
  )
);

export const searchTerms = (query: string) =>
  normalizeWords(query).filter((word) => !STOP_WORDS.has(word));

// Le dernier mot est peut-être en cours de frappe : « poul », « choco »
// trouvent aussi « poulet », « chocolat ». Les mots d'avant sont complets.
type Term = { word: string; partial: boolean };

const toTerms = (terms: string[]): Term[] =>
  terms.map((word, i) => ({ word, partial: i === terms.length - 1 && word.length >= 2 }));

const exact = (words: string[], { word }: Term) => words.includes(word);

const hasTerm = (words: string[], term: Term) =>
  exact(words, term) || (term.partial && words.some((w) => w.startsWith(term.word)));

// Vrai si le texte contient l'un des mots cherchés (pour les surligner).
export function makeTermMatcher(terms: string[]) {
  const compiled = toTerms(terms);
  return (text: string) => {
    if (compiled.length === 0) return false;
    const words = normalizeWords(text);
    return compiled.some((term) => hasTerm(words, term));
  };
}

type Indexed = { title: string[]; ingredients: string[][] };
const indexes: Record<Language, WeakMap<Recipe, Indexed>> = { fr: new WeakMap(), en: new WeakMap() };

function indexOf(recipe: Recipe, language: Language) {
  let index = indexes[language].get(recipe);
  if (!index) {
    const french = {
      title: normalizeWords(recipe.title),
      ingredients: recipe.ingredients.map((ingredient) => normalizeWords(ingredient.name)),
    };
    index =
      language === "en"
        ? {
            title: [...normalizeWords(englishTitle(recipe) ?? ""), ...french.title],
            ingredients: [
              ...(englishIngredientNames(recipe) ?? []).map((name) => normalizeWords(name)),
              ...french.ingredients,
            ],
          }
        : french;
    indexes[language].set(recipe, index);
  }
  return index;
}

// Le mot exact passe avant un mot qui commence pareil (« ail » avant
// « ailes ») ; dans le titre, c'est le sujet de la recette, dans les
// ingrédients, il n'en est qu'une partie.
function termScore(index: Indexed, term: Term) {
  if (exact(index.title, term)) return 4;
  if (index.ingredients.some((words) => exact(words, term))) return 3;
  if (hasTerm(index.title, term)) return 2;
  if (index.ingredients.some((words) => hasTerm(words, term))) return 1;
  return 0;
}

export type SearchHit = { verdict: RecipeVerdict; score: number };

// Les recettes qui contiennent tous les mots, les mieux notées d'abord, puis
// dans l'ordre reçu (celui du frigo). Sans mot, toutes les recettes.
export function searchRecipes(
  verdicts: RecipeVerdict[],
  terms: string[],
  language: Language = getLanguage()
): SearchHit[] {
  if (terms.length === 0) return verdicts.map((verdict) => ({ verdict, score: 0 }));

  const compiled = toTerms(terms);
  const hits: (SearchHit & { order: number })[] = [];
  verdicts.forEach((verdict, order) => {
    const index = indexOf(verdict.recipe, language);
    let score = 0;
    for (const term of compiled) {
      const points = termScore(index, term);
      if (points === 0) return;
      score += points;
    }
    hits.push({ verdict, score, order });
  });

  return hits
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map(({ verdict, score }) => ({ verdict, score }));
}
