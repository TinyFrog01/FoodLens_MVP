import { useMemo } from "react";

import { staples } from "@/app/Food/data/staples";
import { makeOnHandCheck } from "@/app/Food/data/utils/ingredients";
import { collectIngredients } from "@/lib/photoStore";

import { useAlwaysOnHand } from "./useAlwaysOnHand";
import { usePhotos } from "./usePhotos";

// Ce que tu as pour cuisiner : les essentiels « toujours là » activés et les
// aliments confirmés sur tes photos (ceux « à vérifier » ne comptent qu'une
// fois gardés). `loaded` : les essentiels sont lus, le classement ne bougera
// plus sous les yeux de l'utilisateur.
export function useOnHand() {
  const { activeIds, loaded } = useAlwaysOnHand();
  const photos = usePhotos();

  // Une chaîne plutôt qu'un tableau : relire les mêmes photos au retour sur
  // l'écran ne refait pas le classement des milliers de recettes.
  const scannedKey = useMemo(
    () =>
      collectIngredients(photos)
        .confirmed.map((ingredient) => ingredient.name)
        .sort()
        .join("\n"),
    [photos]
  );

  const isOnHand = useMemo(
    () =>
      makeOnHandCheck(
        staples.filter((s) => activeIds.includes(s.id)),
        scannedKey ? scannedKey.split("\n") : []
      ),
    [activeIds, scannedKey]
  );

  return { isOnHand, loaded };
}
