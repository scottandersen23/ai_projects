"use client";

import { useCallback, useState } from "react";
import { ExerciseCard } from "@/components/exercise-card";
import { useWorkoutLog } from "@/context/workout-log-context";

function newExerciseKey() {
  return crypto.randomUUID();
}

export function WorkoutExerciseList() {
  const [exerciseKeys, setExerciseKeys] = useState(() => [newExerciseKey()]);
  const { removeLiveExercise } = useWorkoutLog();

  const addExercise = useCallback(() => {
    setExerciseKeys((keys) => [...keys, newExerciseKey()]);
  }, []);

  const removeExercise = useCallback(
    (key: string) => {
      removeLiveExercise(key);
      setExerciseKeys((keys) => keys.filter((k) => k !== key));
    },
    [removeLiveExercise],
  );

  return (
    <>
      {exerciseKeys.map((key, index) => (
        <ExerciseCard
          key={key}
          instanceId={key}
          variant={index === 0 ? "primary" : "additional"}
          onRemove={
            exerciseKeys.length > 1 ? () => removeExercise(key) : undefined
          }
        />
      ))}

      <button
        type="button"
        onClick={addExercise}
        className="flex h-12 items-center justify-center rounded-lg border border-[#1F2937] text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-white/5 hover:text-white"
      >
        + Add Exercise
      </button>
    </>
  );
}
