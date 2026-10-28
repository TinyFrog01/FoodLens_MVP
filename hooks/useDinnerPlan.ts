import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";

import { DinnerPlan, PLAN_TIMES } from "@/lib/dinnerPlan";

const STORAGE_KEY = "foodlens.dinnerPlan.v1";

// Une seule copie pour toute l'app (comme useAlwaysOnHand) : l'accueil voit
// tout de suite le plan choisi dans la feuille. Sur l'appareil, invité compris.
let state: { plan: DinnerPlan | null; loaded: boolean } = { plan: null, loaded: false };
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

// Lecture défensive : un plan abîmé est ignoré plutôt que de faire planter l'app.
function parsePlan(raw: string | null): DinnerPlan | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const days: number[] = Array.isArray(parsed?.days)
      ? parsed.days.filter(
          (d: unknown): d is number => typeof d === "number" && Number.isInteger(d) && d >= 0 && d <= 6
        )
      : [];
    const time = PLAN_TIMES.find((t) => t.value === parsed?.time)?.value;
    return days.length > 0 && time ? { days, time } : null;
  } catch {
    return null;
  }
}

function load() {
  if (!loading) {
    loading = AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        state = { ...state, plan: parsePlan(raw) };
      })
      .catch(() => {
        // pas de plan si la lecture échoue
      })
      .finally(() => setState({ ...state, loaded: true }));
  }
  return loading;
}

// Appliqué après la lecture : sinon elle écraserait le plan tout juste choisi.
function savePlan(plan: DinnerPlan | null) {
  load().then(() => {
    setState({ ...state, plan });
    const write = plan
      ? AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
      : AsyncStorage.removeItem(STORAGE_KEY);
    write.catch(() => {});
  });
}

export function useDinnerPlan() {
  useEffect(() => {
    load();
  }, []);

  const { plan, loaded } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { plan, loaded, savePlan };
}
