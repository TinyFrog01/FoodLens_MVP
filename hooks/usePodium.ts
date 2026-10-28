import { useMemo } from "react";

import { staples } from "@/app/Food/data/staples";
import { buildPodium } from "@/lib/podium";

import { useAlwaysOnHand } from "./useAlwaysOnHand";
import { useRecipeFeed } from "./useRecipeFeed";

// Or, argent et bronze pour les personnes choisies, selon ce que tu as.
// `loaded` : les essentiels « toujours là » sont lus, le classement ne
// bougera plus sous les yeux de l'utilisateur.
export function usePodium() {
  const { visible } = useRecipeFeed();
  const { activeIds, loaded } = useAlwaysOnHand();

  const podium = useMemo(
    () => buildPodium(visible, staples.filter((s) => activeIds.includes(s.id))),
    [visible, activeIds]
  );

  return { ...podium, loaded };
}
