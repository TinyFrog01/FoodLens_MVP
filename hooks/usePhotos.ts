import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { readPhotos, StoredPhoto, subscribePhotos } from "@/lib/photoStore";

// Photos enregistrées, rechargées à chaque focus et mises à jour en direct
// quand une analyse se termine (même si l'écran est déjà affiché).
export function usePhotos() {
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      readPhotos()
        .then((stored) => active && setPhotos(stored))
        .catch(console.error);
      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => subscribePhotos(setPhotos), []);

  return photos;
}
