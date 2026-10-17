// Mockup day letters, Monday first (docs/design/mockup/desktop-dashboards.jsx `freq`).
const letters: Record<number, string> = { 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 0: "D" };
const mondayFirst = [1, 2, 3, 4, 5, 6, 0];

/** Spanish frequency text as in the mockup: "Todos los días", "L–V" or letters joined by " · ". Weekday 0 = Sunday. */
export function formatFrequency(frequency: readonly number[]): string {
  const days = mondayFirst.filter((day) => frequency.includes(day));
  if (days.length === 7) return "Todos los días";
  if (days.length === 5 && days.every((day, index) => day === index + 1)) return "L–V";
  return days.map((day) => letters[day]).join(" · ");
}
