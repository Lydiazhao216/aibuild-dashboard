export const dynamic = 'force-dynamic';
export const revalidate = 0;         // no static cache
export const runtime = 'nodejs';     // do not run on Edge during build
export const fetchCache = 'force-no-store';
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const session = await getIronSession(req, res, sessionOptions);
  // @ts-ignore
  session.destroy();
  return res;
}