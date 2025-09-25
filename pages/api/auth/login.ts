import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Vercel 下 req.body 可能已是对象，也可能是字符串，兜底处理一下
  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch {}
  }

  const { username, password } = body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // 用核心 API 设置 session（不依赖 iron-session/next）
  const session = await getIronSession(req, res, sessionOptions);
  (session as any).user = { id: user.id, username: user.username };
  await session.save();

  return res.status(200).json({ ok: true });
}
