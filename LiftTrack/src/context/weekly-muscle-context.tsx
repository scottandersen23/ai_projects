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
  mondayThroughSundayDates,
  toLocalISODate,
  weekKeyFromDate,
} from "@/lib/muscle-week";

export type MuscleId = "chest" | "back" | "legs" | "shoulders" | "arms";

export const MUSCLE_GROUPS: { id: MuscleId; label: string }[] = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "legs", label: "Legs" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
];

const STORAGE_KEY = "lifttrack-weekly-muscle-v2";

export type CircleTone = "green" | "red" | "muted";

/** One tone per calendar day Mon–Sun */
export type WeekCircleTones = [
  CircleTone,
  CircleTone,
  CircleTone,
  CircleTone,
  CircleTone,
  CircleTone,
  CircleTone,
];

type InstanceEntry = {
  muscle: MuscleId;
  /** Local ISO dates (YYYY-MM-DD) when this exercise had logged work */
  dates: string[];
};

type WeekData = {
  instances: Record<string, InstanceEntry>;
};

type PersistedStore = {
  weeks: Record<string, WeekData>;
};

function cloneStore(raw: PersistedStore): PersistedStore {
  const weeks: PersistedStore["weeks"] = {};
  for (const [wk, data] of Object.entries(raw.weeks)) {
    weeks[wk] = {
      instances: {},
    };
    for (const [id, entry] of Object.entries(data.instances ?? {})) {
      weeks[wk].instances[id] = {
        muscle: entry.muscle,
        dates: [...entry.dates],
      };
    }
  }
  return { weeks };
}

function loadStore(): PersistedStore {
  if (typeof window === "undefined") return { weeks: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { weeks: {} };
    const parsed = JSON.parse(raw) as PersistedStore;
    if (!parsed?.weeks || typeof parsed.weeks !== "object")
      return { weeks: {} };
    return cloneStore(parsed);
  } catch {
    return { weeks: {} };
  }
}

function persistStore(store: PersistedStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

function ensureWeek(store: PersistedStore, weekKey: string): WeekData {
  if (!store.weeks[weekKey]) {
    store.weeks[weekKey] = { instances: {} };
  }
  return store.weeks[weekKey];
}

function deriveMuscle(
  store: PersistedStore,
  weekKey: string,
  muscle: MuscleId,
): { exerciseCount: number; dayDates: Set<string> } {
  const wk = store.weeks[weekKey]?.instances;
  if (!wk) return { exerciseCount: 0, dayDates: new Set() };

  const dayDates = new Set<string>();
  let exerciseCount = 0;

  for (const entry of Object.values(wk)) {
    if (entry.muscle !== muscle) continue;
    exerciseCount++;
    entry.dates.forEach((d) => dayDates.add(d));
  }

  return { exerciseCount, dayDates };
}

function computeTonesForMuscle(
  weekKey: string,
  muscle: MuscleId,
  store: PersistedStore,
  now: Date,
): WeekCircleTones {
  const weekDays = mondayThroughSundayDates(now);
  const { exerciseCount, dayDates } = deriveMuscle(store, weekKey, muscle);

  return weekDays.map((iso) => {
    if (!dayDates.has(iso)) return "muted";
    if (exerciseCount < 3) return "red";
    return "green";
  }) as WeekCircleTones;
}

/** Used by the Add Workout right panel (insights from posted Workout Log only). */
export type InsightItem =
  | {
      kind: "frequency";
      muscleLabel: string;
      /** Distinct exercises logged for this muscle this week */
      exerciseCount: number;
    }
  | { kind: "missed"; muscleLabel: string };

type WeeklyMuscleContextValue = {
  tonesByMuscle: Record<MuscleId, WeekCircleTones>;
  syncExerciseContribution: (payload: {
    instanceId: string;
    muscle: MuscleId;
    hasMeaningfulWork: boolean;
  }) => void;
  unregisterExercise: (instanceId: string) => void;
};

const WeeklyMuscleContext = createContext<WeeklyMuscleContextValue | null>(
  null,
);

export function WeeklyMuscleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, setStore] = useState<PersistedStore>({ weeks: {} });
  const [now] = useState(() => new Date());

  useEffect(() => {
    setStore(loadStore());
  }, []);

  useEffect(() => {
    persistStore(store);
  }, [store]);

  const weekKey = useMemo(() => weekKeyFromDate(now), [now]);

  const syncExerciseContribution = useCallback(
    (payload: {
      instanceId: string;
      muscle: MuscleId;
      hasMeaningfulWork: boolean;
    }) => {
      const { instanceId, muscle, hasMeaningfulWork } = payload;
      const today = toLocalISODate(now);

      setStore((prev) => {
        const next = cloneStore(prev);
        const wk = ensureWeek(next, weekKey);
        const prevEntry = wk.instances[instanceId];
        const dates = new Set(prevEntry?.dates ?? []);

        if (hasMeaningfulWork) dates.add(today);
        else dates.delete(today);

        if (dates.size === 0) {
          delete wk.instances[instanceId];
        } else {
          wk.instances[instanceId] = {
            muscle,
            dates: [...dates].sort(),
          };
        }

        return next;
      });
    },
    [now, weekKey],
  );

  const unregisterExercise = useCallback(
    (instanceId: string) => {
      setStore((prev) => {
        const next = cloneStore(prev);
        const wk = next.weeks[weekKey];
        if (wk?.instances[instanceId]) {
          delete wk.instances[instanceId];
        }
        return next;
      });
    },
    [weekKey],
  );

  const tonesByMuscle = useMemo(() => {
    const out = {} as Record<MuscleId, WeekCircleTones>;
    for (const { id } of MUSCLE_GROUPS) {
      out[id] = computeTonesForMuscle(weekKey, id, store, now);
    }
    return out;
  }, [store, weekKey, now]);

  const value = useMemo(
    () => ({
      tonesByMuscle,
      syncExerciseContribution,
      unregisterExercise,
    }),
    [tonesByMuscle, syncExerciseContribution, unregisterExercise],
  );

  return (
    <WeeklyMuscleContext.Provider value={value}>
      {children}
    </WeeklyMuscleContext.Provider>
  );
}

export function useWeeklyMuscle() {
  const ctx = useContext(WeeklyMuscleContext);
  if (!ctx) {
    throw new Error("useWeeklyMuscle must be used within WeeklyMuscleProvider");
  }
  return ctx;
}
