/** Monday 00:00 local time, as YYYY-MM-DD */
export function mondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** YYYY-MM-DD in local calendar */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekKeyFromDate(d: Date): string {
  return toLocalISODate(mondayOfWeek(d));
}

/** Mon–Fri dates for the week containing `d` */
export function mondayThroughFridayDates(d: Date): string[] {
  const mon = mondayOfWeek(d);
  return [0, 1, 2, 3, 4].map((i) => toLocalISODate(addDays(mon, i)));
}

/** Mon–Sun dates for the week containing `d` (ISO week starting Monday). */
export function mondayThroughSundayDates(d: Date): string[] {
  const mon = mondayOfWeek(d);
  return [0, 1, 2, 3, 4, 5, 6].map((i) => toLocalISODate(addDays(mon, i)));
}
