import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== 'GET' || typeof id !== 'string') return res.status(405).end();

  const pid = Number(id);
  if (Number.isNaN(pid)) return res.status(400).json({ error: 'bad id' });

  const rows = await prisma.dailySnapshot.findMany({
    where: { productId: pid },
    orderBy: { day: 'asc' },
    select: {
      day: true,
      inventory: true,
      procurementQty: true,
      procurementPrice: true,
      salesQty: true,
      salesPrice: true
    }
  });

  const series = rows.map(r => ({
    day: r.day,
    inventory: r.inventory,
    procurementAmount: Number((r.procurementQty * r.procurementPrice).toFixed(2)),
    salesAmount: Number((r.salesQty * r.salesPrice).toFixed(2)),
  }));

  res.status(200).json(series);
}
