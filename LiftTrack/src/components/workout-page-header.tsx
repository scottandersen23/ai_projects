"use client";

import { useMemo } from "react";
import { useWorkoutLog } from "@/context/workout-log-context";
import { toLocalISODate } from "@/lib/muscle-week";

const durationInputClass =
  "w-16 rounded-md border border-white/10 bg-[#0B0F19] px-2 py-1 text-sm text-slate-200 tabular-nums outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";

const textInputClass =
  "max-w-xs rounded-md border border-white/10 bg-[#0B0F19] px-2.5 py-1.5 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";

export function WorkoutPageHeader() {
  const {
    sessionWorkoutDate,
    setSessionWorkoutDate,
    sessionWorkoutName,
    setSessionWorkoutName,
    sessionDurationMin,
    setSessionDurationMin,
    updateEntriesMetaForDate,
    updateSessionDraftMeta,
  } = useWorkoutLog();

  const todayMax = toLocalISODate(new Date());

  const selectedDate = useMemo(() => {
    const [y, m, d] = sessionWorkoutDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [sessionWorkoutDate]);

  const dayName = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const dateStr = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-white">
        {dayName}
      </h1>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-4 sm:gap-y-2">
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor="workout-date" className="text-xs text-slate-500">
            Workout date
          </label>
          <input
            id="workout-date"
            type="date"
            max={todayMax}
            value={sessionWorkoutDate}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              const cap = toLocalISODate(new Date());
              setSessionWorkoutDate(v > cap ? cap : v);
            }}
            className={`${textInputClass} max-w-[200px] scheme-dark`}
            aria-label="Workout date (today or earlier)"
          />
          <span className="text-xs text-slate-600">
            {dateStr} · Past or today only
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor="workout-name" className="text-xs text-slate-500">
            Workout name
          </label>
          <input
            id="workout-name"
            type="text"
            value={sessionWorkoutName}
            onChange={(e) => {
              const v = e.target.value;
              setSessionWorkoutName(v);
              updateSessionDraftMeta({
                workoutName: v,
                durationMin: sessionDurationMin,
              });
              updateEntriesMetaForDate(sessionWorkoutDate, {
                workoutName: v,
                durationMin: sessionDurationMin,
              });
            }}
            className={textInputClass}
            placeholder="e.g. Push Day"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
          <label htmlFor="workout-duration" className="text-slate-400">
            Duration:
          </label>
          <input
            id="workout-duration"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={sessionDurationMin}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                setSessionDurationMin(0);
                updateSessionDraftMeta({
                  workoutName: sessionWorkoutName,
                  durationMin: 0,
                });
                updateEntriesMetaForDate(sessionWorkoutDate, {
                  workoutName: sessionWorkoutName,
                  durationMin: 0,
                });
                return;
              }
              const n = parseInt(v, 10);
              if (!Number.isNaN(n)) {
                const next = Math.max(0, n);
                setSessionDurationMin(next);
                updateSessionDraftMeta({
                  workoutName: sessionWorkoutName,
                  durationMin: next,
                });
                updateEntriesMetaForDate(sessionWorkoutDate, {
                  workoutName: sessionWorkoutName,
                  durationMin: next,
                });
              }
            }}
            className={durationInputClass}
            aria-label="Workout duration in minutes"
          />
          <span className="text-slate-500">min</span>
        </div>
      </div>
    </header>
  );
}
