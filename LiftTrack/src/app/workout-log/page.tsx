"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import {
  getSetDetailsForDisplay,
  useWorkoutLog,
  type WorkoutLogEntry,
} from "@/context/workout-log-context";
import { MUSCLE_GROUPS, type MuscleId } from "@/context/weekly-muscle-context";

const PAGE_SIZE = 10;

const shellBg = "flex min-h-0 flex-1 flex-col bg-[#1a1d26]";
const panelBg = "rounded-lg bg-[#242834]";
const controlClass =
  "min-h-[40px] rounded-md border border-white/10 bg-[#242834] px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";
const btnPrimary =
  "rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600";

const cellInput =
  "w-full min-w-0 rounded border border-white/10 bg-[#1a1d26] px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNum(n: number) {
  return n.toLocaleString("en-US");
}

function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function WorkoutLogPage() {
  const { entries, deleteEntry } = useWorkoutLog();

  const defaultTo = useMemo(() => {
    const t = new Date();
    return t.toISOString().slice(0, 10);
  }, []);
  const defaultFrom = useMemo(() => {
    const t = new Date();
    t.setFullYear(t.getFullYear() - 1);
    return t.toISOString().slice(0, 10);
  }, []);

  const [draftWorkout, setDraftWorkout] = useState("all");
  const [draftMuscle, setDraftMuscle] = useState<string>("all");
  const [draftExercise, setDraftExercise] = useState("all");
  const [draftFrom, setDraftFrom] = useState(defaultFrom);
  const [draftTo, setDraftTo] = useState(defaultTo);

  const [appliedWorkout, setAppliedWorkout] = useState("all");
  const [appliedMuscle, setAppliedMuscle] = useState<string>("all");
  const [appliedExercise, setAppliedExercise] = useState("all");
  const [appliedFrom, setAppliedFrom] = useState(defaultFrom);
  const [appliedTo, setAppliedTo] = useState(defaultTo);

  const [page, setPage] = useState(1);

  const workoutOptions = useMemo(() => {
    const u = [...new Set(entries.map((e) => e.workoutName))].filter(Boolean);
    u.sort((a, b) => a.localeCompare(b));
    return u;
  }, [entries]);

  const exerciseOptions = useMemo(() => {
    const u = [...new Set(entries.map((e) => e.exerciseName))].filter(Boolean);
    u.sort((a, b) => a.localeCompare(b));
    return u;
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (appliedWorkout !== "all" && e.workoutName !== appliedWorkout)
        return false;
      if (appliedMuscle !== "all" && e.muscleId !== appliedMuscle) return false;
      if (appliedExercise !== "all" && e.exerciseName !== appliedExercise)
        return false;
      if (e.date < appliedFrom || e.date > appliedTo) return false;
      return true;
    });
  }, [
    entries,
    appliedWorkout,
    appliedMuscle,
    appliedExercise,
    appliedFrom,
    appliedTo,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const applyFilters = useCallback(() => {
    setAppliedWorkout(draftWorkout);
    setAppliedMuscle(draftMuscle);
    setAppliedExercise(draftExercise);
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
    setPage(1);
  }, [draftWorkout, draftMuscle, draftExercise, draftFrom, draftTo]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(1, totalPages)));
  }, [totalPages]);

  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className={shellBg}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Workout Log</h1>
            <p className="mt-1 text-sm text-[#a0aec0]">
              Review past sessions and filter by workout, muscle, exercise, or
              date.
            </p>
          </div>

          <div
            className={`flex flex-wrap items-end gap-3 p-4 ${panelBg}`}
            role="search"
            aria-label="Filter workouts"
          >
            <div className="flex min-w-[140px] flex-col gap-1">
              <label className="text-xs text-[#a0aec0]">Workout Type</label>
              <select
                className={controlClass}
                value={draftWorkout}
                onChange={(e) => setDraftWorkout(e.target.value)}
              >
                <option value="all">All</option>
                {workoutOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[140px] flex-col gap-1">
              <label className="text-xs text-[#a0aec0]">Muscle Group</label>
              <select
                className={controlClass}
                value={draftMuscle}
                onChange={(e) => setDraftMuscle(e.target.value)}
              >
                <option value="all">All</option>
                {MUSCLE_GROUPS.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[140px] flex-col gap-1">
              <label className="text-xs text-[#a0aec0]">Exercise</label>
              <select
                className={controlClass}
                value={draftExercise}
                onChange={(e) => setDraftExercise(e.target.value)}
              >
                <option value="all">All</option>
                {exerciseOptions.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-1 sm:min-w-[260px]">
              <label className="text-xs text-[#a0aec0]">Date range</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className={`${controlClass} min-w-0 flex-1`}
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                />
                <span className="text-[#a0aec0]">–</span>
                <input
                  type="date"
                  className={`${controlClass} min-w-0 flex-1`}
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                />
              </div>
            </div>
            <button type="button" className={btnPrimary} onClick={applyFilters}>
              Filter
            </button>
          </div>

          <div className={`overflow-hidden ${panelBg}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[#a0aec0]">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Workout</th>
                    <th className="px-4 py-3 font-medium">Muscle Group</th>
                    <th className="px-4 py-3 font-medium">Exercise</th>
                    <th className="px-4 py-3 font-medium">Sets</th>
                    <th className="px-4 py-3 font-medium">Reps</th>
                    <th
                      className="px-4 py-3 font-medium"
                      title="Heaviest weight used on any set"
                    >
                      Weight (lbs)
                    </th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-[#a0aec0]"
                      >
                        No rows match these filters.{" "}
                        <Link
                          href="/"
                          className="text-emerald-400 hover:underline"
                        >
                          Add a workout
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    pageSlice.map((row) => (
                      <WorkoutRow
                        key={row.id}
                        row={row}
                        onDelete={() => deleteEntry(row.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#a0aec0]">
            <p>
              Showing {showingFrom}-{showingTo} of {filtered.length}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function WorkoutRow({
  row,
  onDelete,
}: {
  row: WorkoutLogEntry;
  onDelete: () => void;
}) {
  const { updateLogEntry } = useWorkoutLog();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row);
  const [expanded, setExpanded] = useState(false);
  const mainRowRef = useRef<HTMLTableRowElement>(null);
  const detailRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!editing) setDraft(row);
  }, [row, editing]);

  useEffect(() => {
    if (!expanded) return;
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (
        mainRowRef.current?.contains(t) ||
        detailRowRef.current?.contains(t)
      ) {
        return;
      }
      setExpanded(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [expanded]);

  function startEdit() {
    setExpanded(false);
    setDraft({ ...row });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(row);
    setEditing(false);
  }

  function saveEdit() {
    const perSetDataInvalidated =
      draft.sets !== row.sets ||
      draft.reps !== row.reps ||
      draft.maxWeightLbs !== row.maxWeightLbs ||
      draft.muscleId !== row.muscleId;

    updateLogEntry(row.id, {
      date: draft.date,
      workoutName: draft.workoutName.trim() || "Workout",
      muscleId: draft.muscleId,
      exerciseName: draft.exerciseName.trim() || "Exercise",
      sets: Math.max(0, Math.floor(Number(draft.sets)) || 0),
      reps: Math.max(0, Math.floor(Number(draft.reps)) || 0),
      maxWeightLbs: Math.max(0, Number(draft.maxWeightLbs) || 0),
      durationMin: Math.max(0, Math.floor(Number(draft.durationMin)) || 0),
      ...(perSetDataInvalidated ? { setDetails: undefined } : {}),
    });
    setEditing(false);
  }

  const detailSets = expanded ? getSetDetailsForDisplay(row) : null;

  return (
    <>
      <tr
        ref={mainRowRef}
        className="border-b border-white/5 text-slate-200 last:border-0 hover:bg-white/[0.02]"
      >
        <td className="whitespace-nowrap px-4 py-3 align-top text-[#a0aec0]">
          {editing ? (
            <input
              type="date"
              className={cellInput}
              value={draft.date}
              onChange={(e) =>
                setDraft((d) => ({ ...d, date: e.target.value }))
              }
              aria-label="Date"
            />
          ) : (
            formatDisplayDate(row.date)
          )}
        </td>
        <td className="px-4 py-3 align-top font-medium text-white">
          {editing ? (
            <input
              type="text"
              className={`${cellInput} font-medium`}
              value={draft.workoutName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, workoutName: e.target.value }))
              }
              aria-label="Workout name"
            />
          ) : (
            row.workoutName
          )}
        </td>
        <td className="px-4 py-3 align-top">
          {editing ? (
            <select
              className={cellInput}
              value={draft.muscleId}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  muscleId: e.target.value as MuscleId,
                }))
              }
              aria-label="Muscle group"
            >
              {MUSCLE_GROUPS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            row.muscleLabel
          )}
        </td>
        <td className="px-4 py-3 align-top">
          {editing ? (
            <input
              type="text"
              className={cellInput}
              value={draft.exerciseName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, exerciseName: e.target.value }))
              }
              aria-label="Exercise name"
            />
          ) : (
            <button
              type="button"
              className={`text-left font-medium text-slate-100 underline decoration-white/25 decoration-1 underline-offset-2 transition hover:text-white hover:decoration-emerald-500/60 ${
                expanded ? "text-emerald-200" : ""
              }`}
              aria-expanded={expanded}
              aria-controls={`exercise-detail-${row.id}`}
              id={`exercise-trigger-${row.id}`}
              onClick={() => setExpanded((v) => !v)}
            >
              {row.exerciseName}
            </button>
          )}
        </td>
        <td className="px-4 py-3 align-top tabular-nums">
          {editing ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className={cellInput}
              value={draft.sets}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  sets: Number(e.target.value) || 0,
                }))
              }
              aria-label="Sets"
            />
          ) : (
            row.sets
          )}
        </td>
        <td className="px-4 py-3 align-top tabular-nums">
          {editing ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className={cellInput}
              value={draft.reps}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  reps: Number(e.target.value) || 0,
                }))
              }
              aria-label="Reps"
            />
          ) : (
            formatNum(row.reps)
          )}
        </td>
        <td className="px-4 py-3 align-top tabular-nums">
          {editing ? (
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              className={cellInput}
              value={draft.maxWeightLbs}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  maxWeightLbs: Number(e.target.value) || 0,
                }))
              }
              aria-label="Weight lbs"
            />
          ) : row.maxWeightLbs > 0 ? (
            `${formatNum(Math.round(row.maxWeightLbs))} lbs`
          ) : (
            "—"
          )}
        </td>
        <td className="whitespace-nowrap px-4 py-3 align-top">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className={`${cellInput} max-w-[4.5rem]`}
                value={draft.durationMin}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    durationMin: Number(e.target.value) || 0,
                  }))
                }
                aria-label="Duration minutes"
              />
              <span className="text-[#a0aec0]">min</span>
            </div>
          ) : (
            `${row.durationMin} min`
          )}
        </td>
        <td className="px-4 py-3 align-top">
          <div className="flex justify-end gap-1 text-[#a0aec0]">
            {editing ? (
              <>
                <button
                  type="button"
                  className="rounded p-1.5 text-emerald-400 transition hover:bg-emerald-500/15 hover:text-emerald-300"
                  title="Save"
                  aria-label="Save changes"
                  onClick={saveEdit}
                >
                  <CheckIcon />
                </button>
                <button
                  type="button"
                  className="rounded p-1.5 transition hover:bg-white/10 hover:text-white"
                  title="Cancel"
                  aria-label="Cancel editing"
                  onClick={cancelEdit}
                >
                  <CloseIcon />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded p-1.5 transition hover:bg-white/10 hover:text-white"
                  title="Edit row"
                  aria-label="Edit row"
                  onClick={startEdit}
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  className="rounded p-1.5 text-rose-400/90 transition hover:bg-rose-500/10 hover:text-rose-300"
                  title="Delete row"
                  aria-label="Delete log row"
                  onClick={onDelete}
                >
                  <TrashIcon />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded && !editing ? (
        <tr
          ref={detailRowRef}
          id={`exercise-detail-${row.id}`}
          role="region"
          aria-labelledby={`exercise-trigger-${row.id}`}
          className="border-b border-white/5 bg-[#0d111c]"
        >
          <td colSpan={9} className="px-4 pb-4 pt-0">
            <div className="rounded-md border border-white/10 bg-[#121826] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {row.muscleLabel} · {row.workoutName}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {row.exerciseName}
              </p>
              {detailSets?.inferred ? (
                <p className="mt-2 text-xs text-amber-200/90">
                  Per-set log wasn&apos;t stored for this row; showing an
                  estimate from totals (reps split evenly, weight from max).
                </p>
              ) : null}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[280px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[#a0aec0]">
                      <th className="py-2 pr-4 font-medium">Set</th>
                      <th className="py-2 pr-4 font-medium">Reps</th>
                      <th className="py-2 font-medium">Weight (lbs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailSets?.sets.map((s, i) => (
                      <tr
                        key={`${row.id}-set-${i}`}
                        className="border-b border-white/5 text-slate-200 last:border-0"
                      >
                        <td className="py-2 pr-4 tabular-nums text-[#a0aec0]">
                          {i + 1}
                        </td>
                        <td className="py-2 pr-4 tabular-nums">{s.reps}</td>
                        <td className="py-2 tabular-nums">
                          {s.weight > 0
                            ? `${formatNum(Math.round(s.weight * 10) / 10)} lbs`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages: (number | "ellipsis")[] = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages];
    }
    if (page >= totalPages - 2) {
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
  }, [page, totalPages]);

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        className="rounded border border-white/10 px-2 py-1.5 text-[#a0aec0] transition hover:bg-white/5 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(1)}
        aria-label="First page"
      >
        «
      </button>
      <button
        type="button"
        className="rounded border border-white/10 px-2 py-1.5 text-[#a0aec0] transition hover:bg-white/5 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-[#a0aec0]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`min-w-[36px] rounded border px-2 py-1.5 tabular-nums transition ${
              p === page
                ? "border-emerald-600 bg-emerald-700 text-white"
                : "border-white/10 text-[#a0aec0] hover:bg-white/5"
            }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="rounded border border-white/10 px-2 py-1.5 text-[#a0aec0] transition hover:bg-white/5 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        ›
      </button>
      <button
        type="button"
        className="rounded border border-white/10 px-2 py-1.5 text-[#a0aec0] transition hover:bg-white/5 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPageChange(totalPages)}
        aria-label="Last page"
      >
        »
      </button>
    </nav>
  );
}
