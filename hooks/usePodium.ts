import { useMemo } from "react";

import { buildPodium } from "@/lib/podium";

import { useOnHand } from "./useOnHand";
import { useRecipeFeed } from "./useRecipeFeed";

// Or, argent et bronze pour les personnes choisies, selon ce que tu as.
// `loaded` : les essentiels « toujours là » sont lus, le classement ne
// bougera plus sous les yeux de l'utilisateur.
export function usePodium() {
  const { visible } = useRecipeFeed();
  const { isOnHand, loaded } = useOnHand();

  const podium = useMemo(() => buildPodium(visible, isOnHand), [visible, isOnHand]);

  return { ...podium, loaded };
}
