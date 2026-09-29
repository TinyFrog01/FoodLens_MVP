import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { staples } from "../app/Food/data/staples";

const STORAGE_KEY = "alwaysOnHand";

export function useAlwaysOnHand() {
  // default: everything on, user opts out of what they run out of
  const [activeIds, setActiveIds] = useState<string[]>(staples.map((s) => s.id));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setActiveIds(JSON.parse(raw));
      } catch {
        // keep defaults if storage read fails
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggle = useCallback((id: string) => {
    setActiveIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const activeNames = staples
    .filter((s) => activeIds.includes(s.id))
    .map((s) => s.name);

  return { activeIds, activeNames, toggle, loaded };
}