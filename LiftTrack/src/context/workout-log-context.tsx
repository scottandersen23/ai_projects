"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MUSCLE_GROUPS,
  type MuscleId,
  type WeekCircleTones,
} from "@/context/weekly-muscle-context";
import { mondayThroughSundayDates, toLocalISODate } from "@/lib/muscle-week";

const STORAGE_KEY = "lifttrack-workout-log-v1";

export type SetDetail = { reps: number; weight: number };

export type WorkoutLogEntry = {
  id: string;
  date: string;
  workoutName: string;
  muscleId: MuscleId;
  muscleLabel: string;
  exerciseName: string;
  sets: number;
  reps: number;
  /** Heaviest weight used on any set (lbs) */
  maxWeightLbs: number;
  durationMin: number;
  /** Per-set reps/weight from Add Workout; older rows may omit this */
  setDetails?: SetDetail[];
};

type PersistedShape = {
  entries: WorkoutLogEntry[];
};

function muscleLabel(id: MuscleId): string {
  return MUSCLE_GROUPS.find((m) => m.id === id)?.label ?? id;
}

/** Rows without `setDetails` get an even split of total reps across set count at max weight (approximation). */
export function getSetDetailsForDisplay(row: WorkoutLogEntry): {
  inferred: boolean;
  sets: SetDetail[];
} {
  if (row.setDetails && row.setDetails.length > 0) {
    return { inferred: false, sets: row.setDetails };
  }
  const n = Math.max(1, Math.floor(row.sets) || 1);
  const total = Math.max(0, row.reps);
  const base = Math.floor(total / n);
  const rem = total - base * n;
  const w = Math.max(0, row.maxWeightLbs);
  const sets: SetDetail[] = Array.from({ length: n }, (_, i) => ({
    reps: base + (i < rem ? 1 : 0),
    weight: w,
  }));
  return { inferred: true, sets };
}

/** Sidebar circles: same rules as before, but data comes from posted Workout Log rows this week. */
function computeMuscleTonesFromLogEntries(
  entries: WorkoutLogEntry[],
  muscle: MuscleId,
  now: Date,
): WeekCircleTones {
  const weekDays = mondayThroughSundayDates(now);
  const weekSet = new Set(weekDays);
  const inWeek = entries.filter(
    (e) => e.muscleId === muscle && weekSet.has(e.date),
  );
  const exerciseCount = inWeek.length;
  const dayDates = new Set(inWeek.map((e) => e.date));

  return weekDays.map((iso) => {
    if (!dayDates.has(iso)) return "muted";
    if (exerciseCount < 3) return "red";
    return "green";
  }) as WeekCircleTones;
}

function loadEntries(): WorkoutLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedShape;
    if (!Array.isArray(parsed.entries)) return [];
    return parsed.entries.map((e) => {
      const copy = {
        ...(e as WorkoutLogEntry & { volumeLbs?: number }),
      };
      delete copy.volumeLbs;
      return copy as WorkoutLogEntry;
    });
  } catch {
    return [];
  }
}

function saveEntries(entries: WorkoutLogEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries }));
  } catch {
    /* ignore */
  }
}

type SetSnapshot = { reps: number; weight: number };

type WorkoutLogContextValue = {
  entries: WorkoutLogEntry[];
  /** Local YYYY-MM-DD for the Add Workout session; past or today only */
  sessionWorkoutDate: string;
  setSessionWorkoutDate: (iso: string) => void;
  sessionWorkoutName: string;
  setSessionWorkoutName: (v: string) => void;
  sessionDurationMin: number;
  setSessionDurationMin: (v: number) => void;
  upsertLiveExercise: (
    instanceId: string,
    payload: {
      exerciseName: string;
      muscle: MuscleId;
      sets: SetSnapshot[];
    },
  ) => void;
  removeLiveExercise: (instanceId: string) => void;
  deleteEntry: (id: string) => void;
  updateLogEntry: (
    id: string,
    patch: Partial<Omit<WorkoutLogEntry, "id" | "muscleLabel">>,
  ) => void;
  updateEntriesMetaForDate: (
    date: string,
    patch: Pick<WorkoutLogEntry, "workoutName" | "durationMin">,
  ) => void;
  /** Updates in-memory draft rows (Add Workout) when workout name or duration changes */
  updateSessionDraftMeta: (
    patch: Pick<WorkoutLogEntry, "workoutName" | "durationMin">,
  ) => void;
  /** Copies today’s session draft into the persisted log (replaces prior posted rows for today). */
  postWorkoutToLog: () => void;
  /** Rows in the current Add Workout draft (not yet posted). */
  sessionDraftCount: number;
  /** Mon–Sun circle tones per muscle, derived from Workout Log rows this week. */
  muscleGroupTones: Record<MuscleId, WeekCircleTones>;
};

const WorkoutLogContext = createContext<WorkoutLogContextValue | null>(null);

function computeAggregates(sets: SetSnapshot[]) {
  let totalReps = 0;
  let maxW = 0;
  for (const s of sets) {
    totalReps += s.reps;
    maxW = Math.max(maxW, s.weight);
  }
  return {
    totalReps,
    setsCount: sets.length,
    maxWeightLbs: maxW,
  };
}

export function WorkoutLogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<WorkoutLogEntry[]>([]);
  /** Unposted exercises from Add Workout; committed only via postWorkoutToLog */
  const [sessionDraft, setSessionDraft] = useState<
    Record<string, WorkoutLogEntry>
  >({});
  const [sessionWorkoutDate, setSessionWorkoutDateState] = useState(() =>
    toLocalISODate(new Date()),
  );
  const [sessionWorkoutName, setSessionWorkoutNameState] = useState("Push Day");
  const [sessionDurationMin, setSessionDurationMinState] = useState(45);
  const [weekRefDate] = useState(() => new Date());

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const setSessionWorkoutName = useCallback((v: string) => {
    setSessionWorkoutNameState(v);
  }, []);

  const setSessionDurationMin = useCallback((v: number) => {
    setSessionDurationMinState(v);
  }, []);

  const setSessionWorkoutDate = useCallback((iso: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
    const today = toLocalISODate(new Date());
    if (iso > today) return;

    setSessionWorkoutDateState((prev) => {
      if (iso === prev) return prev;
      return iso;
    });

    setSessionDraft((draft) => {
      if (Object.keys(draft).length === 0) return draft;
      const sample = Object.values(draft)[0];
      if (sample?.date === iso) return draft;
      const next: Record<string, WorkoutLogEntry> = {};
      for (const [oldId, row] of Object.entries(draft)) {
        const sep = oldId.indexOf("::");
        const instanceId = sep >= 0 ? oldId.slice(sep + 2) : oldId;
        const newId = `${iso}::${instanceId}`;
        next[newId] = { ...row, id: newId, date: iso };
      }
      return next;
    });
  }, []);

  const updateEntriesMetaForDate = useCallback(
    (
      date: string,
      patch: Pick<WorkoutLogEntry, "workoutName" | "durationMin">,
    ) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.date === date
            ? {
                ...e,
                ...patch,
              }
            : e,
        ),
      );
    },
    [],
  );

  const updateSessionDraftMeta = useCallback(
    (patch: Pick<WorkoutLogEntry, "workoutName" | "durationMin">) => {
      setSessionDraft((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          next[k] = { ...next[k], ...patch };
        }
        return next;
      });
    },
    [],
  );

  const upsertLiveExercise = useCallback(
    (
      instanceId: string,
      payload: { exerciseName: string; muscle: MuscleId; sets: SetSnapshot[] },
    ) => {
      const date = sessionWorkoutDate;
      const id = `${date}::${instanceId}`;
      const { totalReps, setsCount, maxWeightLbs } = computeAggregates(
        payload.sets,
      );

      const row: WorkoutLogEntry = {
        id,
        date,
        workoutName: sessionWorkoutName,
        muscleId: payload.muscle,
        muscleLabel: muscleLabel(payload.muscle),
        exerciseName: payload.exerciseName.trim() || "Exercise",
        sets: setsCount,
        reps: totalReps,
        maxWeightLbs,
        durationMin: sessionDurationMin,
        setDetails: payload.sets.map((s) => ({
          reps: s.reps,
          weight: s.weight,
        })),
      };

      setSessionDraft((prev) => ({ ...prev, [id]: row }));
    },
    [sessionWorkoutDate, sessionWorkoutName, sessionDurationMin],
  );

  const removeLiveExercise = useCallback(
    (instanceId: string) => {
      const id = `${sessionWorkoutDate}::${instanceId}`;
      setSessionDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [sessionWorkoutDate],
  );

  const postWorkoutToLog = useCallback(() => {
    setSessionDraft((draft) => {
      const draftValues = Object.values(draft);
      if (draftValues.length === 0) return draft;

      const prefix = `${sessionWorkoutDate}::`;
      setEntries((prev) => {
        const rest = prev.filter((e) => !e.id.startsWith(prefix));
        return [...rest, ...draftValues];
      });
      return draft;
    });
  }, [sessionWorkoutDate]);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateLogEntry = useCallback(
    (
      id: string,
      patch: Partial<Omit<WorkoutLogEntry, "id" | "muscleLabel">>,
    ) => {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const merged: WorkoutLogEntry = { ...e, ...patch };
          if (patch.muscleId !== undefined) {
            merged.muscleLabel = muscleLabel(patch.muscleId);
          }
          return merged;
        }),
      );
    },
    [],
  );

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          a.exerciseName.localeCompare(b.exerciseName),
      ),
    [entries],
  );

  const sessionDraftCount = useMemo(
    () => Object.keys(sessionDraft).length,
    [sessionDraft],
  );

  const muscleGroupTones = useMemo(() => {
    const out = {} as Record<MuscleId, WeekCircleTones>;
    for (const { id } of MUSCLE_GROUPS) {
      out[id] = computeMuscleTonesFromLogEntries(entries, id, weekRefDate);
    }
    return out;
  }, [entries, weekRefDate]);

  const value = useMemo(
    () => ({
      entries: sortedEntries,
      sessionWorkoutDate,
      setSessionWorkoutDate,
      sessionWorkoutName,
      setSessionWorkoutName,
      sessionDurationMin,
      setSessionDurationMin,
      upsertLiveExercise,
      removeLiveExercise,
      deleteEntry,
      updateLogEntry,
      updateEntriesMetaForDate,
      updateSessionDraftMeta,
      postWorkoutToLog,
      sessionDraftCount,
      muscleGroupTones,
    }),
    [
      sortedEntries,
      sessionWorkoutDate,
      setSessionWorkoutDate,
      sessionWorkoutName,
      setSessionWorkoutName,
      sessionDurationMin,
      setSessionDurationMin,
      upsertLiveExercise,
      removeLiveExercise,
      deleteEntry,
      updateLogEntry,
      updateEntriesMetaForDate,
      updateSessionDraftMeta,
      postWorkoutToLog,
      sessionDraftCount,
      muscleGroupTones,
    ],
  );

  return (
    <WorkoutLogContext.Provider value={value}>
      {children}
    </WorkoutLogContext.Provider>
  );
}

export function useWorkoutLog() {
  const ctx = useContext(WorkoutLogContext);
  if (!ctx) {
    throw new Error("useWorkoutLog must be used within WorkoutLogProvider");
  }
  return ctx;
}
