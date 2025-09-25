export const dynamic = 'force-dynamic';
export const revalidate = 0;         // no static cache
export const runtime = 'nodejs';     // do not run on Edge during build
export const fetchCache = 'force-no-store';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  const session = await getIronSession(req, res, sessionOptions);
  (session as any).user = { id: user.id, username: user.username };
  await session.save();
  return res;
}