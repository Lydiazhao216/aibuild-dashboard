import { IronSessionOptions } from "iron-session";

export const sessionOptions: IronSessionOptions = {
  cookieName: "aibuild_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: { secure: process.env.NODE_ENV === "production" }
};

export type SessionUser = { id: number; username: string };