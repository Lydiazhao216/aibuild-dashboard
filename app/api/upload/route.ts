import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

function deriveDays(headers: string[]) {
  const re = /(\(Day\s*(\d+)\))/i;
  let max = 0;
  for (const h of headers) {
    const m = h.match(re);
    if (m) max = Math.max(max, parseInt(m[2], 10));
  }
  return Array.from({ length: max }, (_, i) => i + 1);
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const session = await getIronSession(req, res, sessionOptions);
  // @ts-ignore
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: 0 });

  if (!json.length) return NextResponse.json({ error: "Empty sheet" }, { status: 400 });

  const headers = Object.keys(json[0]);
  const days = deriveDays(headers);

  const idKey = headers.find(h => /^(id)$/i.test(h)) || "ID";
  const nameKey = headers.find(h => /name/i.test(h)) || "Product Name";
  const openingKey = headers.find(h => /opening\s*inventory/i.test(h)) || "Opening Inventory";

  await prisma.$transaction(async (tx) => {
    for (const row of json) {
      const productId = Number(row[idKey]);
      const name = String(row[nameKey]);
      const opening = Number(row[openingKey] || 0);

      await tx.product.upsert({
        where: { id: productId },
        update: { name, openingInventory: opening },
        create: { id: productId, name, openingInventory: opening }
      });

      let inv = opening;
      for (const d of days) {
        const pq = Number(row[`Procurement Qty (Day ${d})`] || 0);
        const pp = Number(row[`Procurement Price (Day ${d})`] || 0);
        const sq = Number(row[`Sales Qty (Day ${d})`] || 0);
        const sp = Number(row[`Sales Price (Day ${d})`] || 0);
        inv = Math.round(inv + pq - sq);

        await tx.dailySnapshot.upsert({
          where: { productId_day: { productId, day: d } },
          update: { procurementQty: pq, procurementPrice: pp, salesQty: sq, salesPrice: sp, inventory: inv },
          create: { productId, day: d, procurementQty: pq, procurementPrice: pp, salesQty: sq, salesPrice: sp, inventory: inv }
        });
      }
    }
  });

  return NextResponse.json({ ok: true, daysCount: days.length, rows: json.length });
}