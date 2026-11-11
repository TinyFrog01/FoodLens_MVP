import { formatNames, tr } from "@/lib/i18n";

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
  { value: "16:30", get label() { return tr("16 h 30", "4:30 p.m."); } },
  { value: "17:00", get label() { return tr("17 h", "5 p.m."); } },
  { value: "18:00", get label() { return tr("18 h", "6 p.m."); } },
];

// La semaine commence le lundi.
const day = (n: number, short: string, name: string, shortEn: string, nameEn: string) => ({
  day: n,
  get short() { return tr(short, shortEn); },
  get name() { return tr(name, nameEn); },
});
export const WEEK_DAYS: { day: number; short: string; name: string }[] = [
  day(1, "Lun", "lundi", "Mon", "Monday"),
  day(2, "Mar", "mardi", "Tue", "Tuesday"),
  day(3, "Mer", "mercredi", "Wed", "Wednesday"),
  day(4, "Jeu", "jeudi", "Thu", "Thursday"),
  day(5, "Ven", "vendredi", "Fri", "Friday"),
  day(6, "Sam", "samedi", "Sat", "Saturday"),
  day(0, "Dim", "dimanche", "Sun", "Sunday"),
];

export const timeLabel = (time: PlanTime) =>
  PLAN_TIMES.find((t) => t.value === time)?.label ?? time;

export const dayName = (day: number) => WEEK_DAYS.find((d) => d.day === day)?.name ?? "";

// « le mardi et le jeudi », « du lundi au vendredi », « tous les soirs »
// (« on Tuesdays and Thursdays », « Monday to Friday », « every evening »)
export function describeDays(days: number[]) {
  const chosen = WEEK_DAYS.filter((d) => days.includes(d.day));
  if (chosen.length === 7) return tr("tous les soirs", "every evening");
  if (chosen.length === 5 && chosen.every((d) => d.day >= 1 && d.day <= 5)) {
    return tr("du lundi au vendredi", "Monday to Friday");
  }
  return tr(
    formatNames(chosen.map((d) => `le ${d.name}`)),
    `on ${formatNames(chosen.map((d) => `${d.name}s`))}`
  );
}

// « Le mardi et le jeudi à 17 h, FoodLens me propose un souper avec ce que j'ai. »
export function describePlan(plan: DinnerPlan) {
  const days = describeDays(plan.days);
  const Days = `${days.charAt(0).toUpperCase()}${days.slice(1)}`;
  return tr(
    `${Days} à ${timeLabel(plan.time)}, FoodLens me propose un souper avec ce que j'ai.`,
    `${Days} at ${timeLabel(plan.time)}, FoodLens suggests a dinner with what I have.`
  );
}

export const isPlanDay = (plan: DinnerPlan | null, date = new Date()) =>
  plan !== null && plan.days.includes(date.getDay());
