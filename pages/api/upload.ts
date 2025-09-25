import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

export const config = { api: { bodyParser: false } }; // 接收 form-data

function deriveDays(headers: string[]) {
  const re = /(\(Day\s*(\d+)\))/i;
  let max = 0;
  for (const h of headers) {
    const m = h.match(re);
    if (m) max = Math.max(max, parseInt(m[2], 10));
  }
  return Array.from({ length: max }, (_, i) => i + 1);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getIronSession(req, res, sessionOptions);
  // @ts-ignore
  if (!session.user) return res.status(401).json({ error: 'Unauthorized' });

  // 读取 form-data 文件
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve());
    req.on('error', reject);
  });
  const buf = Buffer.concat(chunks);

  // 从 multipart 中粗提取文件内容（简单版：直接整个 buffer 交给 xlsx 也常能解析）
  const wb = XLSX.read(buf, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: 0 });
  if (!json.length) return res.status(400).json({ error: 'Empty sheet' });

  const headers = Object.keys(json[0]);
  const days = deriveDays(headers);
  const idKey = headers.find(h => /^(id)$/i.test(h)) || 'ID';
  const nameKey = headers.find(h => /name/i.test(h)) || 'Product Name';
  const openingKey = headers.find(h => /opening\s*inventory/i.test(h)) || 'Opening Inventory';

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

  res.status(200).json({ ok: true, daysCount: days.length, rows: json.length });
}
