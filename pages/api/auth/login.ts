import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { username, password } =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const session = await getIronSession(req, res, sessionOptions);
    (session as any).user = { id: user.id, username: user.username };
    await session.save();

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[/api/auth/login] error:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
}
