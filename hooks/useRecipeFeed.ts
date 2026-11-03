import { useMemo } from "react";

import { ricardoRecipes as recipes } from "@/app/Food/data/recipe/recipe_r";
import { useAccount } from "@/context/AccountContext";
import { buildFeed } from "@/lib/account/recipeFilter";
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

// Recettes visibles / masquées selon le compte et les personnes pour qui on
// cuisine. En mode invité, tout est visible et rien n'est filtré.
export function useRecipeFeed() {
  const { account } = useAccount();
  const key = feedKey(account);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => buildFeed(recipes, account), [key]);
}
