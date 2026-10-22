import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";
import { staples } from "../app/Food/data/staples";

const STORAGE_KEY = "alwaysOnHand";

// One copy for the whole app: the recipe screens stay mounted while staples
// are toggled on the inventory tab, so they have to see each change live.
let state = {
  // default: everything on, user opts out of what they run out of
  activeIds: staples.map((s) => s.id),
  loaded: false,
};
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const setState = (next: typeof state) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

function load() {
  if (!loading) {
    loading = AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) state = { ...state, activeIds: JSON.parse(raw) };
      })
      .catch(() => {
        // keep defaults if storage read fails
      })
      .finally(() => setState({ ...state, loaded: true }));
  }
  return loading;
}

function toggle(id: string) {
  // Applied on top of the saved list, never the defaults: a tap before the
  // read finishes would otherwise save every staple as on.
  load().then(() => {
    const { activeIds } = state;
    const next = activeIds.includes(id)
      ? activeIds.filter((existing) => existing !== id)
      : [...activeIds, id];
    setState({ ...state, activeIds: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  });
}

export function useAlwaysOnHand() {
  useEffect(() => {
    load();
  }, []);

  const { activeIds, loaded } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
  const activeStaples = staples.filter((s) => activeIds.includes(s.id));

  return { activeIds, activeStaples, toggle, loaded };
}
