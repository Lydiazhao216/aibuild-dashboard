export const dynamic = 'force-dynamic';
export const revalidate = 0;         // no static cache
export const runtime = 'nodejs';     // do not run on Edge during build
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);
  // @ts-ignore
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(products);
}