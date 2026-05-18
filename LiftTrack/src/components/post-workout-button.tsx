"use client";

import { useWorkoutLog } from "@/context/workout-log-context";

export function PostWorkoutButton() {
  const { postWorkoutToLog, sessionDraftCount } = useWorkoutLog();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={sessionDraftCount === 0}
        onClick={postWorkoutToLog}
        className="flex h-12 w-full max-w-md items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
      >
        Post workout to log
      </button>
      <p className="max-w-md text-xs text-slate-500">
        Your exercises stay in this session until you post. Only posted workouts
        appear in the Workout Log.
      </p>
    </div>
  );
}
