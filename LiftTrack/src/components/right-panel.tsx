"use client";

import { useMemo } from "react";
import type { InsightItem, MuscleId } from "@/context/weekly-muscle-context";
import { MUSCLE_GROUPS } from "@/context/weekly-muscle-context";
import { useWorkoutLog } from "@/context/workout-log-context";
import { mondayThroughSundayDates } from "@/lib/muscle-week";

/** Same rules as legacy weekly store: missed if none; frequency only if 3+ log rows for that muscle this week. */
function insightsFromPostedLog(
  weekDays: string[],
  entries: { date: string; muscleId: MuscleId }[],
): InsightItem[] {
  const weekSet = new Set(weekDays);
  const items: InsightItem[] = [];
  for (const { id, label } of MUSCLE_GROUPS) {
    const inWeek = entries.filter(
      (e) => e.muscleId === id && weekSet.has(e.date),
    );
    const exerciseCount = inWeek.length;
    if (exerciseCount === 0) {
      items.push({ kind: "missed", muscleLabel: label });
    } else if (exerciseCount >= 3) {
      items.push({
        kind: "frequency",
        muscleLabel: label,
        exerciseCount,
      });
    }
  }
  return items;
}

export function RightPanel() {
  const { entries } = useWorkoutLog();

  const insights = useMemo(() => {
    const weekDays = mondayThroughSundayDates(new Date());
    return insightsFromPostedLog(weekDays, entries);
  }, [entries]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <aside
      className="flex w-[320px] shrink-0 flex-col gap-4 bg-[#121826] p-4 text-sm text-slate-300"
      aria-label="Insights from posted workout log"
    >
      <section className="rounded-xl bg-[#0B0F19]/60 p-4 ring-1 ring-white/5">
        <h3 className="mb-3 font-medium text-white">Insights</h3>
        <p className="mb-3 text-xs text-slate-500">
          Based on workouts posted to your log (this calendar week).
        </p>
        <ul className="flex flex-col gap-2.5">
          {insights.map((item, i) =>
            item.kind === "missed" ? (
              <li
                key={`missed-${item.muscleLabel}-${i}`}
                className="text-amber-200/90"
              >
                ⚠ No {item.muscleLabel} training logged this week
              </li>
            ) : (
              <li
                key={`freq-${item.muscleLabel}-${i}`}
                className="text-emerald-200/90"
              >
                ✓ {item.muscleLabel}: {item.exerciseCount} exercises logged this
                week
              </li>
            ),
          )}
        </ul>
      </section>
    </aside>
  );
}
