"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MUSCLE_GROUPS,
  type MuscleId,
  type WeekCircleTones,
} from "@/context/weekly-muscle-context";
import { useWorkoutLog } from "@/context/workout-log-context";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "Add Workout" },
  { href: "/workout-log", label: "Workout Log" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" },
];

const navBaseClass =
  "w-full rounded-md px-2 py-1 text-left text-[15px] transition hover:bg-white/5 hover:text-white";
const navActiveClass = "bg-white/10 text-white";
const navIdleClass = "text-slate-300";

function toneClass(tone: WeekCircleTones[number]) {
  switch (tone) {
    case "green":
      return "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.45)]";
    case "red":
      return "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]";
    case "muted":
      return "bg-slate-600";
    default:
      return "bg-slate-600";
  }
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function MuscleGroupCircles({
  label,
  muscleId,
  tones,
}: {
  label: string;
  muscleId: MuscleId;
  tones: WeekCircleTones;
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm text-slate-300">
      <span className="shrink-0">{label}</span>
      <div
        className="flex gap-1"
        role="img"
        aria-label={`${label}: Mon through Sun from Workout Log. Green: 3+ exercises this week; red: under 3; gray: no log that day.`}
      >
        {tones.map((tone, i) => (
          <span
            key={`${muscleId}-${i}`}
            title={DAY_NAMES[i]}
            className={`h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${toneClass(tone)}`}
          />
        ))}
      </div>
    </li>
  );
}

export function Sidebar() {
  const { muscleGroupTones } = useWorkoutLog();
  const pathname = usePathname();

  return (
    <aside
      className="flex w-[240px] shrink-0 flex-col gap-3 bg-[#121826] p-4 text-[15px] text-slate-300"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className="mb-1 block text-xl font-semibold tracking-tight text-white hover:text-emerald-200/90"
      >
        LiftTrack
      </Link>
      <nav className="flex flex-col gap-2.5">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`${navBaseClass} ${
              pathname === item.href ? navActiveClass : navIdleClass
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 border-t border-white/5 pt-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
          Muscle Groups
        </p>
        <div
          className="mb-3 space-y-0.5 text-[11px] leading-relaxed text-slate-500"
          aria-label="Circle legend"
        >
          <p className="font-medium text-slate-400">Mon-Sun (from log):</p>
          <p>
            <span className="text-emerald-400/90">Green</span> = 3+
          </p>
          <p>
            <span className="text-red-400/90">Red</span> = under 3
          </p>
          <p>
            <span className="text-slate-500">Gray</span> = no log
          </p>
        </div>
        <ul className="flex flex-col gap-2.5">
          {MUSCLE_GROUPS.map(({ id, label }) => (
            <MuscleGroupCircles
              key={id}
              muscleId={id}
              label={label}
              tones={muscleGroupTones[id]}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
}
