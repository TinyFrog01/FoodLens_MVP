import { useMemo } from "react";

import { recipes } from "@/app/Food/data/recipe/recipe";
import { useAccount } from "@/context/AccountContext";
import { buildFeed } from "@/lib/account/recipeFilter";

// Recettes visibles / masquées selon le compte et les personnes pour qui on
// cuisine. En mode invité, tout est visible et rien n'est filtré.
export function useRecipeFeed() {
  const { account } = useAccount();
  return useMemo(() => buildFeed(recipes, account), [account]);
}
