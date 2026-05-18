"use client";

import { useRef, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  initialsFromDisplayName,
  useProfileAvatar,
} from "@/context/profile-avatar-context";

const shellBg = "flex min-h-0 flex-1 flex-col bg-[#1a1d26]";
const cardClass =
  "rounded-lg border border-white/10 bg-[#242834] p-6 shadow-sm";
const labelClass = "mb-1.5 block text-sm text-[#a0aec0]";
const inputClass =
  "w-full rounded-md border border-white/10 bg-[#1a1d26] px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/25";
const btnSave =
  "rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600";
const btnSecondary =
  "rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function Toggle({
  enabled,
  onChange,
  id,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        enabled ? "bg-emerald-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const {
    avatarDataUrl,
    setAvatarDataUrl,
    displayName,
    setDisplayName,
    email,
    setEmail,
  } = useProfileAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [units, setUnits] = useState<"metric" | "imperial">("metric");

  const [defaultDuration, setDefaultDuration] = useState(60);
  const [weightIncrement, setWeightIncrement] = useState<"2.5" | "5">("2.5");
  const [restTimer, setRestTimer] = useState(90);
  const [warmUp, setWarmUp] = useState<"disabled" | "enabled">("disabled");

  const [reminders, setReminders] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [missedAlerts, setMissedAlerts] = useState(true);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  function onAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be 2 MB or smaller.");
      return;
    }
    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setAvatarDataUrl(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={shellBg}>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 min-h-0">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col gap-8 p-6">
          <h1 className="text-3xl font-semibold text-white">Settings</h1>

          <section className={cardClass}>
            <h2 className="mb-6 text-lg font-medium text-white">
              Account settings
            </h2>
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex shrink-0 flex-col items-center gap-3">
                <div className="relative">
                  {avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
                    <img
                      src={avatarDataUrl}
                      alt=""
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-600 text-2xl font-semibold text-white ring-2 ring-white/10"
                      aria-hidden
                    >
                      {initialsFromDisplayName(displayName)}
                    </div>
                  )}
                </div>
                <span className="max-w-[200px] truncate text-center text-sm text-[#a0aec0]">
                  {displayName}
                </span>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  aria-label="Upload profile photo"
                  onChange={onAvatarFile}
                />
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    Upload photo
                  </button>
                  {avatarDataUrl ? (
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => {
                        setAvatarDataUrl(null);
                        setAvatarError(null);
                      }}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                {avatarError ? (
                  <p className="max-w-[220px] text-center text-xs text-amber-200/90">
                    {avatarError}
                  </p>
                ) : (
                  <p className="max-w-[220px] text-center text-xs text-slate-500">
                    Shown in the header. Max 2 MB. Saved on this device.
                  </p>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label htmlFor="settings-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClass}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="settings-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <span className={labelClass}>Units</span>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="units"
                        checked={units === "metric"}
                        onChange={() => setUnits("metric")}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      Metric
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="units"
                        checked={units === "imperial"}
                        onChange={() => setUnits("imperial")}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      Imperial
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" className={btnSave}>
                Save changes
              </button>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className={cardClass}>
              <h2 className="mb-6 text-lg font-medium text-white">
                Workout settings
              </h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="default-duration" className={labelClass}>
                    Default workout duration
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="default-duration"
                      type="number"
                      min={0}
                      value={defaultDuration}
                      onChange={(e) =>
                        setDefaultDuration(Number(e.target.value) || 0)
                      }
                      className={`${inputClass} max-w-[120px]`}
                    />
                    <span className="text-sm text-[#a0aec0]">min</span>
                  </div>
                </div>
                <div>
                  <span className={labelClass}>Weight increment</span>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="weight-inc"
                        checked={weightIncrement === "2.5"}
                        onChange={() => setWeightIncrement("2.5")}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      2.5 lbs
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="weight-inc"
                        checked={weightIncrement === "5"}
                        onChange={() => setWeightIncrement("5")}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      5 lbs
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="rest-timer" className={labelClass}>
                    Rest timer
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="rest-timer"
                      type="number"
                      min={0}
                      value={restTimer}
                      onChange={(e) =>
                        setRestTimer(Number(e.target.value) || 0)
                      }
                      className={`${inputClass} max-w-[120px]`}
                    />
                    <span className="text-sm text-[#a0aec0]">sec</span>
                  </div>
                </div>
                <div>
                  <span className={labelClass}>Warm-up sets</span>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="warmup"
                        checked={warmUp === "disabled"}
                        onChange={() => setWarmUp("disabled")}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      Disabled
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="warmup"
                        checked={warmUp === "enabled"}
                        onChange={() => setWarmUp("enabled")}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      Enabled
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" className={btnSave}>
                  Save changes
                </button>
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="mb-6 text-lg font-medium text-white">
                Notifications
              </h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-200">
                    Workout reminders
                  </span>
                  <Toggle
                    id="toggle-reminders"
                    enabled={reminders}
                    onChange={setReminders}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-200">Weekly summary</span>
                  <Toggle
                    id="toggle-weekly"
                    enabled={weeklySummary}
                    onChange={setWeeklySummary}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-200">
                    Missed workout alerts
                  </span>
                  <Toggle
                    id="toggle-missed"
                    enabled={missedAlerts}
                    onChange={setMissedAlerts}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" className={btnSave}>
                  Save changes
                </button>
              </div>
            </section>
          </div>

          <section className={cardClass}>
            <h2 className="mb-6 text-lg font-medium text-white">Appearance</h2>
            <div>
              <span className={labelClass}>Theme</span>
              <div className="flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Dark
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Light
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" className={btnSave}>
                Save changes
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
