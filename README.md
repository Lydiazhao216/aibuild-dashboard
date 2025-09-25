# AIBUILD – Data Visualisation Dashboard

## Understanding of Requirements
- Import Excel containing product opening inventory and day‑wise procurement & sales (qty & price).
- Persist to own DB using an ORM.
- Visualise per product in one line chart with 3 curves: Inventory, Procurement Amount (qty×price), Sales Amount (qty×price).
- Provide basic username/password login using our own database; no commercial auth service.

## Architecture & Data Flow
Next.js (App Router) + API routes → Prisma ORM → SQLite DB.
- Upload: user uploads `.xlsx` → API parses with `xlsx` → upsert Product and DailySnapshot rows, computing closing inventory as prev + procurement - sales.
- Visualisation: client fetches `/api/series/:id` → renders 3 Recharts lines.
- Auth: `/api/auth/login` verifies bcrypt hash in DB and issues a signed cookie via iron-session.

## DB Schema
- User(id, username, passwordHash)
- Product(id, name, openingInventory)
- DailySnapshot(id, productId, day, procurementQty, procurementPrice, salesQty, salesPrice, inventory)

## Assumptions / Notes
- Excel headers like `Procurement Qty (Day X)`, `Procurement Price (Day X)`, etc. Max day auto-detected.
- Inventory is integer; qty/price numeric. Day is an index (1..N).

## Local Run
1) `pnpm install`
2) `cp .env.example .env` and set `SESSION_SECRET` (>=32 chars)
3) `pnpm prisma migrate dev --name init`
4) `pnpm ts-node scripts/seed.ts` (creates admin/admin123)
5) `pnpm dev` → http://localhost:3000 → login → upload Excel → select products → view charts

## Deploy
- Works on Vercel/Render/Fly; if using Vercel, consider hosted DB (Turso/Neon). Set env vars accordingly.