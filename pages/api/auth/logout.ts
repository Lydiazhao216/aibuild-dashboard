import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "HEAD")    return res.status(200).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS, HEAD");
    return res.status(405).json({ error: "Method Not Allowed", method: req.method });
  }

  const session = await getIronSession(req, res, sessionOptions);
  await session.destroy();
  return res.status(200).json({ ok: true });
}
