import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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

  // @ts-ignore
  req.session.user = { id: user.id, username: user.username };
  // @ts-ignore
  await req.session.save();

  return res.status(200).json({ ok: true });
}

export default withIronSessionApiRoute(handler, sessionOptions);
