import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true }
  });

  res.status(200).json(products);
}
