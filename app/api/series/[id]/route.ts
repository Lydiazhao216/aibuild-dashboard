export const dynamic = 'force-dynamic';
export const revalidate = 0;         // no static cache
export const runtime = 'nodejs';     // do not run on Edge during build
export const fetchCache = 'force-no-store';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: { id: string }}) {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);
  // @ts-ignore
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productId = Number(params.id);
  const snapshots = await prisma.dailySnapshot.findMany({ where: { productId }, orderBy: { day: "asc" }});
  const data = snapshots.map(s => ({
    day: s.day,
    inventory: s.inventory,
    procurementAmount: s.procurementQty * s.procurementPrice,
    salesAmount: s.salesQty * s.salesPrice
  }));
  return NextResponse.json(data);
}