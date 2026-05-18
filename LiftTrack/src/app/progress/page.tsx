"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sidebar } from "@/components/sidebar";
import {
  useWorkoutLog,
  type WorkoutLogEntry,
} from "@/context/workout-log-context";
import { MUSCLE_GROUPS, type MuscleId } from "@/context/weekly-muscle-context";

const shellBg = "flex min-h-0 flex-1 flex-col bg-[#1a1d26]";
const panelBg = "rounded-lg border border-white/10 bg-[#121826]";
const controlClass =
  "min-h-[40px] rounded-md border border-white/10 bg-[#242834] px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";
const btnPrimary =
  "rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600";

const DATE_RANGES = [
  { id: "month" as const, label: "This Month" },
  { id: "3m" as const, label: "Last 3 Months" },
  { id: "6m" as const, label: "Last 6 Months" },
  { id: "1y" as const, label: "Last Year" },
  { id: "all" as const, label: "All Time" },
];

type RangeId = (typeof DATE_RANGES)[number]["id"];

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfRange(id: RangeId, now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (id) {
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "3m":
      d.setMonth(d.getMonth() - 3);
      return d;
    case "6m":
      d.setMonth(d.getMonth() - 6);
      return d;
    case "1y":
      d.setFullYear(d.getFullYear() - 1);
      return d;
    case "all":
      return new Date(2000, 0, 1);
    default:
      return d;
  }
}

function endOfToday(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatMMDDYYYY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m.padStart(2, "0")}-${d.padStart(2, "0")}-${y}`;
}

function monthLabel(ym: string): string {
  const [y, mo] = ym.split("-").map(Number);
  const dt = new Date(y, mo - 1, 1);
  return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function TrophyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-amber-400"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M7 4h10v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Zm10 4h3a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1.2A7 7 0 0 1 12 22a7 7 0 0 1-5.8-8H5a3 3 0 0 1-3-3V10a2 2 0 0 1 2-2h3"
        opacity="0.9"
      />
    </svg>
  );
}

export default function ProgressPage() {
  const { entries } = useWorkoutLog();
  const now = useMemo(() => new Date(), []);

  const [draftMuscle, setDraftMuscle] = useState<"all" | MuscleId>("all");
  const [draftExercise, setDraftExercise] = useState("");
  const [draftRange, setDraftRange] = useState<RangeId>("3m");

  const [appliedMuscle, setAppliedMuscle] = useState<"all" | MuscleId>("all");
  const [appliedExercise, setAppliedExercise] = useState("");
  const [appliedRange, setAppliedRange] = useState<RangeId>("3m");

  const applyFilters = useCallback(() => {
    setAppliedMuscle(draftMuscle);
    setAppliedExercise(draftExercise);
    setAppliedRange(draftRange);
  }, [draftMuscle, draftExercise, draftRange]);

  const rangeBounds = useMemo(() => {
    const from = startOfRange(appliedRange, now);
    const to = endOfToday(now);
    return { from, to };
  }, [appliedRange, now]);

  const draftRangeBounds = useMemo(() => {
    const from = startOfRange(draftRange, now);
    const to = endOfToday(now);
    return { from, to };
  }, [draftRange, now]);

  function filterEntries(
    list: WorkoutLogEntry[],
    muscle: "all" | MuscleId,
    from: Date,
    to: Date,
  ) {
    const t0 = from.getTime();
    const t1 = to.getTime();
    return list.filter((e) => {
      const t = parseISODate(e.date).getTime();
      if (t < t0 || t > t1) return false;
      if (muscle !== "all" && e.muscleId !== muscle) return false;
      return true;
    });
  }

  const baseFiltered = useMemo(
    () =>
      filterEntries(entries, appliedMuscle, rangeBounds.from, rangeBounds.to),
    [entries, rangeBounds, appliedMuscle],
  );

  const draftFilteredForExerciseList = useMemo(
    () =>
      filterEntries(
        entries,
        draftMuscle,
        draftRangeBounds.from,
        draftRangeBounds.to,
      ),
    [entries, draftMuscle, draftRangeBounds],
  );

  const exerciseOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of draftFilteredForExerciseList) set.add(e.exerciseName);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [draftFilteredForExerciseList]);

  const appliedExerciseOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of baseFiltered) set.add(e.exerciseName);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [baseFiltered]);

  const strengthExercise =
    appliedExercise && appliedExerciseOptions.includes(appliedExercise)
      ? appliedExercise
      : (appliedExerciseOptions[0] ?? "");

  const strengthSeries = useMemo(() => {
    if (!strengthExercise) return [];
    const byDay = new Map<string, number>();
    for (const e of baseFiltered) {
      if (e.exerciseName !== strengthExercise) continue;
      const prev = byDay.get(e.date) ?? 0;
      byDay.set(e.date, Math.max(prev, e.maxWeightLbs));
    }
    const rows = Array.from(byDay.entries())
      .map(([date, weight]) => ({
        date,
        weight,
        label: parseISODate(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return rows;
  }, [baseFiltered, strengthExercise]);

  const workoutsOverTime = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const e of baseFiltered) {
      const key = e.date.slice(0, 7);
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    return Array.from(byMonth.entries())
      .map(([ym, count]) => ({
        ym,
        label: monthLabel(ym),
        count,
      }))
      .sort((a, b) => a.ym.localeCompare(b.ym));
  }, [baseFiltered]);

  const personalRecords = useMemo(() => {
    const best = new Map<string, WorkoutLogEntry>();
    for (const e of baseFiltered) {
      const cur = best.get(e.exerciseName);
      if (
        !cur ||
        e.maxWeightLbs > cur.maxWeightLbs ||
        (e.maxWeightLbs === cur.maxWeightLbs && e.date > cur.date)
      ) {
        best.set(e.exerciseName, e);
      }
    }
    return Array.from(best.values())
      .sort((a, b) => b.maxWeightLbs - a.maxWeightLbs)
      .slice(0, 8);
  }, [baseFiltered]);

  const frequencyMatrix = useMemo(() => {
    const monthKeys: string[] = [];
    const seen = new Set<string>();
    for (const e of baseFiltered) {
      const mk = e.date.slice(0, 7);
      if (!seen.has(mk)) {
        seen.add(mk);
        monthKeys.push(mk);
      }
    }
    monthKeys.sort((a, b) => a.localeCompare(b));

    const counts = new Map<string, number>();
    let maxC = 0;
    for (const e of baseFiltered) {
      const d = parseISODate(e.date);
      const mk = e.date.slice(0, 7);
      const dow = d.getDay();
      const key = `${mk}-${dow}`;
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      maxC = Math.max(maxC, n);
    }

    const rows = monthKeys.map((ym) => {
      const [y, m] = ym.split("-").map(Number);
      const label = new Date(y, m - 1, 1).toLocaleDateString("en-US", {
        month: "short",
      });
      const cells = Array.from({ length: 7 }, (_, dow) => {
        const c = counts.get(`${ym}-${dow}`) ?? 0;
        return { dow, count: c };
      });
      return { ym, label, cells };
    });

    return { rows, maxC };
  }, [baseFiltered]);

  function heatColor(count: number, max: number): string {
    if (count === 0) return "rgba(15, 23, 42, 0.9)";
    const t = max > 0 ? count / max : 0;
    const g = 80 + Math.round(120 * t);
    return `rgba(5, ${g}, 72, 0.95)`;
  }

  return (
    <div className={shellBg}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Progress</h1>
            <p className="mt-1 text-sm text-[#a0aec0]">
              Trends and records from your workout log. Updates when you post or
              edit log entries.
            </p>
          </div>

          <div
            className={`flex flex-wrap items-end gap-3 p-4 ${panelBg}`}
            role="search"
            aria-label="Filter progress"
          >
            <div className="flex min-w-[140px] flex-col gap-1">
              <label className="text-xs text-[#a0aec0]">Muscle Group</label>
              <select
                className={controlClass}
                value={draftMuscle}
                onChange={(e) =>
                  setDraftMuscle(
                    e.target.value === "all"
                      ? "all"
                      : (e.target.value as MuscleId),
                  )
                }
              >
                <option value="all">All</option>
                {MUSCLE_GROUPS.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[160px] flex-col gap-1">
              <label className="text-xs text-[#a0aec0]">Exercise</label>
              <select
                className={controlClass}
                value={draftExercise}
                onChange={(e) => setDraftExercise(e.target.value)}
              >
                <option value="">
                  All (strength chart uses first exercise in range)
                </option>
                {exerciseOptions.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[180px] flex-col gap-1">
              <label className="text-xs text-[#a0aec0]">Date Range</label>
              <select
                className={controlClass}
                value={draftRange}
                onChange={(e) => setDraftRange(e.target.value as RangeId)}
              >
                {DATE_RANGES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className={btnPrimary} onClick={applyFilters}>
              Filter
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className={`${panelBg} flex flex-col p-5`}>
              <h2 className="border-b border-white/10 pb-3 text-lg font-medium text-white">
                Strength Progress
              </h2>
              <p className="mt-2 text-xs text-[#a0aec0]">
                Max weight (lbs) over time for{" "}
                <span className="text-slate-200">
                  {strengthExercise || "—"}
                </span>
              </p>
              <div className="mt-4 h-[280px] w-full min-h-0">
                {strengthSeries.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-[#a0aec0]">
                    No data for this exercise in the selected filters.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={strengthSeries}
                      margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="strengthFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "#475569" }}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "#475569" }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload as {
                            date: string;
                            weight: number;
                          };
                          return (
                            <div className="rounded-lg border border-slate-600 bg-[#0f172a] px-3 py-2 text-sm shadow-xl">
                              <p className="font-medium text-white">
                                {strengthExercise}: {p.weight} lbs
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatMMDDYYYY(p.date)}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#strengthFill)"
                        dot={{ r: 4, fill: "#10b981" }}
                        activeDot={{ r: 6 }}
                        name={strengthExercise}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              {strengthSeries.length > 0 ? (
                <div className="mt-2 flex items-center gap-2 text-xs text-[#a0aec0]">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  <span>{strengthExercise}</span>
                </div>
              ) : null}
            </section>

            <section className={`${panelBg} flex flex-col p-5`}>
              <h2 className="border-b border-white/10 pb-3 text-lg font-medium text-white">
                Workouts Over Time
              </h2>
              <p className="mt-2 text-xs text-[#a0aec0]">
                Logged sets per month for the selected muscle and date range.
              </p>
              <div className="mt-4 h-[280px] w-full min-h-0">
                {workoutsOverTime.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-[#a0aec0]">
                    No workouts in this range.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={workoutsOverTime}
                      margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={{ stroke: "#475569" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "#475569" }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const row = payload[0].payload as {
                            label: string;
                            count: number;
                          };
                          return (
                            <div className="rounded-lg border border-slate-600 bg-[#0f172a] px-3 py-2 text-sm shadow-xl">
                              <p className="text-slate-300">{row.label}</p>
                              <p className="font-medium text-white">
                                {row.count} logged rows
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className={`${panelBg} flex flex-col p-5`}>
              <h2 className="border-b border-white/10 pb-3 text-lg font-medium text-white">
                Personal Records
              </h2>
              <p className="mt-2 text-xs text-[#a0aec0]">
                Best weight (lbs) per exercise in this range.
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {personalRecords.length === 0 ? (
                  <li className="text-sm text-[#a0aec0]">No records yet.</li>
                ) : (
                  personalRecords.map((e) => (
                    <li
                      key={`${e.exerciseName}-${e.id}`}
                      className="flex items-start gap-3 rounded-md border border-white/5 bg-[#242834]/80 px-3 py-2.5"
                    >
                      <TrophyIcon />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {e.exerciseName}
                        </p>
                        <p className="text-sm text-slate-300">
                          {e.maxWeightLbs} lbs × {e.reps} ·{" "}
                          {formatMMDDYYYY(e.date)}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className={`${panelBg} flex flex-col p-5`}>
              <h2 className="border-b border-white/10 pb-3 text-lg font-medium text-white">
                Frequency
              </h2>
              <p className="mt-2 text-xs text-[#a0aec0]">
                Workout log rows by weekday and month (brighter = more).
              </p>
              {frequencyMatrix.rows.length === 0 ? (
                <p className="mt-8 text-center text-sm text-[#a0aec0]">
                  No data for this range.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <div
                    className="inline-grid gap-1"
                    style={{
                      gridTemplateColumns: `auto repeat(7, minmax(28px, 1fr))`,
                    }}
                  >
                    <div />
                    {DAY_HEADERS.map((d, i) => (
                      <div
                        key={`day-h-${i}`}
                        className="text-center text-[11px] font-medium text-[#a0aec0]"
                      >
                        {d}
                      </div>
                    ))}
                    {frequencyMatrix.rows.map((row) => (
                      <div key={row.ym} className="contents">
                        <div className="flex items-center pr-2 text-xs text-[#a0aec0]">
                          {row.label}
                        </div>
                        {row.cells.map((cell) => (
                          <div
                            key={`${row.ym}-${cell.dow}`}
                            title={`${row.label} · ${DAY_HEADERS[cell.dow]}: ${cell.count}`}
                            className="aspect-square min-h-[28px] rounded-sm border border-white/5"
                            style={{
                              backgroundColor: heatColor(
                                cell.count,
                                frequencyMatrix.maxC,
                              ),
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 text-[10px] text-[#a0aec0]">
                    <span>0</span>
                    <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-slate-900 via-emerald-900 to-emerald-400" />
                    <span>{frequencyMatrix.maxC || 0}+</span>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
