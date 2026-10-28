import { formatNames } from "@/lib/account/recipeFilter";

// Plan souper choisi par la personne : « Si c'est mardi à 17 h, alors
// FoodLens me propose un souper ». Formuler soi-même ce « si… alors… »
// (intention d'implémentation) aide à tenir l'habitude.
export type PlanTime = "16:30" | "17:00" | "18:00";

export type DinnerPlan = {
  // Jours comme Date.getDay() : 0 = dimanche … 6 = samedi.
  days: number[];
  time: PlanTime;
};

export const PLAN_TIMES: { value: PlanTime; label: string }[] = [
  { value: "16:30", label: "16 h 30" },
  { value: "17:00", label: "17 h" },
  { value: "18:00", label: "18 h" },
];

// La semaine commence le lundi.
export const WEEK_DAYS: { day: number; short: string; name: string }[] = [
  { day: 1, short: "Lun", name: "lundi" },
  { day: 2, short: "Mar", name: "mardi" },
  { day: 3, short: "Mer", name: "mercredi" },
  { day: 4, short: "Jeu", name: "jeudi" },
  { day: 5, short: "Ven", name: "vendredi" },
  { day: 6, short: "Sam", name: "samedi" },
  { day: 0, short: "Dim", name: "dimanche" },
];

export const timeLabel = (time: PlanTime) =>
  PLAN_TIMES.find((t) => t.value === time)?.label ?? time;

export const dayName = (day: number) => WEEK_DAYS.find((d) => d.day === day)?.name ?? "";

// « le mardi et le jeudi », « du lundi au vendredi », « tous les soirs »
export function describeDays(days: number[]) {
  const chosen = WEEK_DAYS.filter((d) => days.includes(d.day));
  if (chosen.length === 7) return "tous les soirs";
  if (chosen.length === 5 && chosen.every((d) => d.day >= 1 && d.day <= 5)) {
    return "du lundi au vendredi";
  }
  return formatNames(chosen.map((d) => `le ${d.name}`));
}

// « Le mardi et le jeudi à 17 h, FoodLens me propose un souper avec ce que j'ai. »
export function describePlan(plan: DinnerPlan) {
  const days = describeDays(plan.days);
  return `${days.charAt(0).toUpperCase()}${days.slice(1)} à ${timeLabel(plan.time)}, FoodLens me propose un souper avec ce que j'ai.`;
}

export const isPlanDay = (plan: DinnerPlan | null, date = new Date()) =>
  plan !== null && plan.days.includes(date.getDay());
