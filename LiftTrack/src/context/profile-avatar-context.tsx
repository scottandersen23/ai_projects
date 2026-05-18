"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "lifttrack-profile-v1";
const LEGACY_AVATAR_KEY = "lifttrack-profile-avatar-v1";

const DEFAULT_DISPLAY_NAME = "John Doe";
const DEFAULT_EMAIL = "johndoe@example.com";

export type PersistedProfileV1 = {
  v: 1;
  avatarDataUrl: string | null;
  displayName: string;
  email: string;
};

/** Two letters for avatar fallback (e.g. "John Doe" → "JD", "Ada" → "AD"). */
export function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const w = parts[0];
    return w.slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function loadProfile(): PersistedProfileV1 {
  if (typeof window === "undefined") {
    return {
      v: 1,
      avatarDataUrl: null,
      displayName: DEFAULT_DISPLAY_NAME,
      email: DEFAULT_EMAIL,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PersistedProfileV1>;
      if (p && typeof p === "object") {
        return {
          v: 1,
          avatarDataUrl:
            typeof p.avatarDataUrl === "string" ? p.avatarDataUrl : null,
          displayName:
            typeof p.displayName === "string" && p.displayName.trim()
              ? p.displayName.trim()
              : DEFAULT_DISPLAY_NAME,
          email:
            typeof p.email === "string" && p.email.trim()
              ? p.email.trim()
              : DEFAULT_EMAIL,
        };
      }
    }
    const legacy = localStorage.getItem(LEGACY_AVATAR_KEY);
    return {
      v: 1,
      avatarDataUrl: legacy || null,
      displayName: DEFAULT_DISPLAY_NAME,
      email: DEFAULT_EMAIL,
    };
  } catch {
    return {
      v: 1,
      avatarDataUrl: null,
      displayName: DEFAULT_DISPLAY_NAME,
      email: DEFAULT_EMAIL,
    };
  }
}

function saveProfile(profile: PersistedProfileV1) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    localStorage.removeItem(LEGACY_AVATAR_KEY);
  } catch {
    /* ignore */
  }
}

type ProfileAvatarContextValue = {
  avatarDataUrl: string | null;
  setAvatarDataUrl: (url: string | null) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
};

const ProfileAvatarContext = createContext<ProfileAvatarContextValue | null>(
  null,
);

export function ProfileAvatarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [avatarDataUrl, setAvatarDataUrlState] = useState<string | null>(null);
  const [displayName, setDisplayNameState] = useState(DEFAULT_DISPLAY_NAME);
  const [email, setEmailState] = useState(DEFAULT_EMAIL);

  useEffect(() => {
    const p = loadProfile();
    setAvatarDataUrlState(p.avatarDataUrl);
    setDisplayNameState(p.displayName);
    setEmailState(p.email);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProfile({
      v: 1,
      avatarDataUrl,
      displayName,
      email,
    });
  }, [hydrated, avatarDataUrl, displayName, email]);

  const setAvatarDataUrl = useCallback((url: string | null) => {
    setAvatarDataUrlState(url);
  }, []);

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
  }, []);

  const setEmail = useCallback((next: string) => {
    setEmailState(next);
  }, []);

  const value = useMemo(
    () => ({
      avatarDataUrl,
      setAvatarDataUrl,
      displayName,
      setDisplayName,
      email,
      setEmail,
    }),
    [
      avatarDataUrl,
      setAvatarDataUrl,
      displayName,
      setDisplayName,
      email,
      setEmail,
    ],
  );

  return (
    <ProfileAvatarContext.Provider value={value}>
      {children}
    </ProfileAvatarContext.Provider>
  );
}

export function useProfileAvatar() {
  const ctx = useContext(ProfileAvatarContext);
  if (!ctx) {
    throw new Error(
      "useProfileAvatar must be used within ProfileAvatarProvider",
    );
  }
  return ctx;
}
