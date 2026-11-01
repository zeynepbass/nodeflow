import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getServices } from "@/server/container";
import type { AuthenticatedSession } from "@/server/services/auth-service";

export const SESSION_COOKIE = "nodeflow-oturum";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const getSession = cache(async (): Promise<AuthenticatedSession | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { auth } = await getServices();
  return auth.authenticate(token);
});

export async function writeSessionCookie(token: string, remember: boolean) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? THIRTY_DAYS : undefined,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
