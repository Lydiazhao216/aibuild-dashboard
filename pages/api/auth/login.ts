import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Bad request' });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const session = await getIronSession(req, res, sessionOptions);
  (session as any).user = { id: user.id, username: user.username };
  await session.save();

  res.status(200).json({ ok: true });
}
