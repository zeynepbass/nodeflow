import { create } from "zustand";
import { useWorkspace } from "@/lib/stores/workspace";
import type { UserProfile } from "@/lib/types";

export const DEMO_EMAIL = "demo@nodeflow.dev";
export const DEMO_PASSWORD = "NodeFlow123";

const USERS_KEY = "nodeflow-kullanicilar";
const SESSION_KEY = "nodeflow-oturum";

interface StoredUser extends UserProfile {
  passwordHash: string;
}

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

async function readUsers(): Promise<StoredUser[]> {
  let users: StoredUser[] = [];
  try {
    users = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {}
  if (users.some((user) => user.email === DEMO_EMAIL)) return users;
  return [
    {
      name: "Deniz Kaya",
      username: "denizkaya",
      email: DEMO_EMAIL,
      timezone: "Europe/Istanbul",
      passwordHash: await hash(DEMO_PASSWORD),
    },
    ...users,
  ];
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function persistSession(profile: UserProfile | null, remember: boolean) {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (profile) {
      (remember ? localStorage : sessionStorage).setItem(
        SESSION_KEY,
        JSON.stringify(profile),
      );
    }
  } catch {}
}

function readSession(): UserProfile | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const profileOf = (user: StoredUser): UserProfile => ({
  name: user.name,
  username: user.username,
  email: user.email,
  timezone: user.timezone,
});

interface AuthState {
  ready: boolean;
  user: UserProfile | null;
  hydrate: () => void;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<"ok" | "exists">;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  ready: false,
  user: null,
  hydrate: () => set({ ready: true, user: readSession() }),
  login: async (email, password, remember) => {
    await wait(700);
    const normalized = email.trim().toLowerCase();
    const users = await readUsers();
    const user = users.find((item) => item.email === normalized);
    if (!user || user.passwordHash !== (await hash(password))) return false;
    const profile = profileOf(user);
    useWorkspace.getState().openWorkspace(normalized, normalized === DEMO_EMAIL);
    persistSession(profile, remember);
    set({ user: profile });
    return true;
  },
  register: async ({ name, email, password }) => {
    await wait(700);
    const normalized = email.trim().toLowerCase();
    const users = await readUsers();
    if (users.some((item) => item.email === normalized)) return "exists";
    const user: StoredUser = {
      name: name.trim(),
      username: normalized.split("@")[0],
      email: normalized,
      timezone: "Europe/Istanbul",
      passwordHash: await hash(password),
    };
    writeUsers([...users, user]);
    const profile = profileOf(user);
    useWorkspace.getState().openWorkspace(normalized, false);
    persistSession(profile, true);
    set({ user: profile });
    return "ok";
  },
  logout: () => {
    persistSession(null, false);
    set({ user: null });
  },
  updateProfile: async (patch) => {
    const current = get().user;
    if (!current) return;
    const next = { ...current, ...patch };
    const users = await readUsers();
    writeUsers(
      users.map((item) =>
        item.email === current.email ? { ...item, ...patch } : item,
      ),
    );
    persistSession(next, true);
    set({ user: next });
  },
  changePassword: async (currentPassword, nextPassword) => {
    const current = get().user;
    if (!current) return false;
    const users = await readUsers();
    const user = users.find((item) => item.email === current.email);
    if (!user || user.passwordHash !== (await hash(currentPassword))) {
      return false;
    }
    const passwordHash = await hash(nextPassword);
    writeUsers(
      users.map((item) =>
        item.email === current.email ? { ...item, passwordHash } : item,
      ),
    );
    return true;
  },
  deleteAccount: async () => {
    const current = get().user;
    if (!current) return;
    const users = await readUsers();
    writeUsers(users.filter((item) => item.email !== current.email));
    useWorkspace.getState().dropWorkspace(current.email);
    get().logout();
  },
}));
