import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore
    session.destroy();
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[/api/auth/logout] error:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
}
