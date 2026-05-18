"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialsFromDisplayName,
  useProfileAvatar,
} from "@/context/profile-avatar-context";

function LogoIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-white"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M5 18 8.5 6l2.2 8.5L14 4l2.5 14h-11Z"
        opacity="0.95"
      />
      <path
        fill="currentColor"
        d="M11 18 14.5 6l2.2 8.5L20 4l2.5 14h-11.5Z"
        opacity="0.65"
      />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 text-slate-300 transition ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppHeader() {
  const { avatarDataUrl, displayName } = useProfileAvatar();
  const avatarInitials = initialsFromDisplayName(displayName);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgBroken(false);
  }, [avatarDataUrl]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <header
      className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-slate-700/80 bg-[#1e293b] px-4 lg:px-8"
      role="banner"
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 text-white transition hover:text-emerald-200/90"
      >
        <LogoIcon />
        <span className="text-lg font-semibold tracking-tight">LiftTrack</span>
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:gap-5">
        <div className="relative mx-2 min-w-0 max-w-md flex-1 sm:mx-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search workouts..."
            className="h-10 w-full min-w-[200px] rounded-lg border border-slate-600/80 bg-[#0f172a] py-2 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-0 transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            aria-label="Search workouts"
          />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-white/5"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            {avatarDataUrl && !imgBroken ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL from user upload
              <img
                src={avatarDataUrl}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-500/50"
                onError={() => setImgBroken(true)}
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-600 text-sm font-medium text-white ring-2 ring-slate-500/50">
                {avatarInitials}
              </span>
            )}
            <ChevronDown open={menuOpen} />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-lg border border-slate-600/80 bg-[#0f172a] py-1 shadow-xl shadow-black/40"
            >
              <button
                type="button"
                role="menuitem"
                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={loggedIn}
                onClick={() => {
                  setLoggedIn(true);
                  closeMenu();
                }}
              >
                Login
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!loggedIn}
                onClick={() => {
                  setLoggedIn(false);
                  closeMenu();
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
