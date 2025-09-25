import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export const sessionOptions = {
  cookieName: "aibuild_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
} as const;

export async function getSession() {
  return getIronSession<{ user?: { id: number; username: string } }>(
    cookies(),
    sessionOptions
  );
}

export type SessionUser = { id: number; username: string };
