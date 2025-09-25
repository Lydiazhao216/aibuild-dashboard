import { prisma } from "../lib/db";
import bcrypt from "bcrypt";

async function main(){
  const username = process.env.DEMO_USER ?? "admin";
  const password = process.env.DEMO_PASS ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({ where: { username }, update: {}, create: { username, passwordHash }});
  console.log(`Seeded user → ${username} / ${password}`);
}
main().then(()=>process.exit(0));