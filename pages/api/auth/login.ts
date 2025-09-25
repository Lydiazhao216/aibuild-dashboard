import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "HEAD")    return res.status(200).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS, HEAD");
    return res.status(405).json({ error: "Method Not Allowed", method: req.method });
  }

  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { /* ignore */ }
  }

  const { username, password } = body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const session = await getIronSession(req, res, sessionOptions);
  (session as any).user = { id: user.id, username: user.username };
  await session.save();

  return res.status(200).json({ ok: true });
}
