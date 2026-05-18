"use client";

import { useEffect, useId, useState } from "react";
import { useWorkoutLog } from "@/context/workout-log-context";
import {
  MUSCLE_GROUPS,
  type MuscleId,
  useWeeklyMuscle,
} from "@/context/weekly-muscle-context";

type SetRow = {
  id: string;
  reps: number;
  weight: number;
  notes: string;
};

const inputClass =
  "w-full min-w-0 rounded-md border border-white/10 bg-[#0B0F19] px-2.5 py-2 text-sm text-white tabular-nums outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";

function SetRowEditor({
  row,
  index,
  onChange,
}: {
  row: SetRow;
  index: number;
  onChange: (
    id: string,
    patch: Partial<Pick<SetRow, "reps" | "weight" | "notes">>,
  ) => void;
}) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)] items-center gap-3 text-sm">
      <span className="text-center text-slate-500 tabular-nums">{index}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        className={inputClass}
        value={Number.isFinite(row.reps) ? row.reps : ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") {
            onChange(row.id, { reps: 0 });
            return;
          }
          const n = parseInt(v, 10);
          if (!Number.isNaN(n)) onChange(row.id, { reps: n });
        }}
        aria-label={`Set ${index} reps`}
      />
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={1}
        className={inputClass}
        value={Number.isFinite(row.weight) ? row.weight : ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") {
            onChange(row.id, { weight: 0 });
            return;
          }
          const n = parseFloat(v);
          if (!Number.isNaN(n)) onChange(row.id, { weight: n });
        }}
        aria-label={`Set ${index} weight`}
      />
      <input
        type="text"
        className={inputClass}
        placeholder="—"
        value={row.notes}
        onChange={(e) => onChange(row.id, { notes: e.target.value })}
        aria-label={`Set ${index} notes`}
      />
    </div>
  );
}

const titleInputClass =
  "min-w-0 flex-1 bg-transparent pb-0.5 text-xl font-semibold text-white outline-none transition border-b border-transparent hover:border-white/10 focus:border-emerald-500/50 focus:ring-0";

const muscleSelectClass =
  "w-full max-w-[200px] rounded-md border border-white/10 bg-[#0B0F19] px-2.5 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";

function makeSetRow(reps: number, weight: number, notes = ""): SetRow {
  return { id: crypto.randomUUID(), reps, weight, notes };
}

export type ExerciseCardProps = {
  /** Stable id for weekly muscle stats (must match list key). */
  instanceId: string;
  /** First workout exercise uses sample data; added exercises start blank-ish. */
  variant?: "primary" | "additional";
  /** When set, shows “- Remove” next to “+ Add Set”. */
  onRemove?: () => void;
};

export function ExerciseCard({
  instanceId,
  variant = "primary",
  onRemove,
}: ExerciseCardProps) {
  const headingId = useId();
  const muscleFieldId = useId();
  const { syncExerciseContribution, unregisterExercise } = useWeeklyMuscle();
  const { upsertLiveExercise } = useWorkoutLog();

  const [muscle, setMuscle] = useState<MuscleId>("chest");
  const [exerciseName, setExerciseName] = useState(() =>
    variant === "primary" ? "Bench Press" : "New exercise",
  );
  const [sets, setSets] = useState<SetRow[]>(() =>
    variant === "primary"
      ? [makeSetRow(10, 135), makeSetRow(8, 155), makeSetRow(6, 175)]
      : [makeSetRow(10, 0)],
  );

  useEffect(() => {
    const hasMeaningfulWork = sets.some((s) => s.reps > 0);
    syncExerciseContribution({
      instanceId,
      muscle,
      hasMeaningfulWork,
    });
  }, [instanceId, muscle, sets, syncExerciseContribution]);

  useEffect(() => {
    upsertLiveExercise(instanceId, {
      exerciseName,
      muscle,
      sets: sets.map((s) => ({ reps: s.reps, weight: s.weight })),
    });
  }, [instanceId, exerciseName, muscle, sets, upsertLiveExercise]);

  useEffect(() => {
    return () => {
      unregisterExercise(instanceId);
    };
  }, [instanceId, unregisterExercise]);

  function updateRow(
    id: string,
    patch: Partial<Pick<SetRow, "reps" | "weight" | "notes">>,
  ) {
    setSets((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function addSet() {
    setSets((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          reps: last?.reps ?? 8,
          weight: last?.weight ?? 135,
          notes: "",
        },
      ];
    });
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-xl bg-[#121826] p-4"
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            id={headingId}
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className={titleInputClass}
            aria-label="Exercise name"
            autoComplete="off"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={muscleFieldId}
              className="text-xs font-medium text-slate-500"
            >
              Muscle group
            </label>
            <select
              id={muscleFieldId}
              value={muscle}
              onChange={(e) => setMuscle(e.target.value as MuscleId)}
              className={muscleSelectClass}
            >
              {MUSCLE_GROUPS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:pt-1">
          <button
            type="button"
            onClick={addSet}
            className="text-sm text-emerald-400 transition hover:text-emerald-300"
          >
            + Add Set
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-rose-400 transition hover:text-rose-300"
            >
              - Remove
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-b border-white/5 pb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)] gap-3">
          <span className="text-center">Set</span>
          <span>Reps</span>
          <span>Weight</span>
          <span>Notes</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sets.map((row, i) => (
          <SetRowEditor
            key={row.id}
            row={row}
            index={i + 1}
            onChange={updateRow}
          />
        ))}
      </div>
    </section>
  );
}
