import { useDeferredValue, useMemo } from "react";

import { ricardoRecipes as recipes } from "@/app/Food/data/recipe/recipe_r";
import { useAccount } from "@/context/AccountContext";
import { buildFeed, type RecipeFeed } from "@/lib/account/recipeFilter";
import type { Account } from "@/lib/account/types";

// Seuls les champs du compte qui changent le fil : les personnes, leurs goûts,
// les appareils et le temps maximum. Les favoris et les notes n'y sont pas,
// sinon chaque « J'aime » refaisait le tri des milliers de recettes.
const feedKey = (account: Account | null) =>
  account &&
  JSON.stringify([
    account.self,
    account.members,
    account.cookingFor,
    account.appliances,
    account.showMissingAppliances,
    account.maxMinutes,
  ]);

// Un seul calcul pour tous les écrans ouverts (fil, profil, mes recettes) :
// chacun refaisait le sien à chaque personne cochée.
let last: { key: string | null; feed: RecipeFeed } | null = null;

function feedFor(account: Account | null, key: string | null) {
  if (!last || last.key !== key) last = { key, feed: buildFeed(recipes, account) };
  return last.feed;
}

// Recettes visibles / masquées selon le compte et les personnes pour qui on
// cuisine. En mode invité, tout est visible et rien n'est filtré.
export function useRecipeFeed() {
  const { account } = useAccount();
  // Le fil suit le compte un rendu plus tard : la personne cochée s'affiche
  // tout de suite, puis les recettes se refont sans bloquer le toucher.
  const deferred = useDeferredValue(account);
  const key = feedKey(deferred);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => feedFor(deferred, key), [key]);
}
