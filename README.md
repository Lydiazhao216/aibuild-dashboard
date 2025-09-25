# AIBUILD Data Visualisation Dashboard

## Understanding of the requirements
The client keeps procurement, sales and inventory data in Excel. The system needs to let users upload these Excel files, store the data, and show clear visualisations.  

For each product, one chart should display three lines:
- Daily inventory  
- Procurement amount (qty × price)  
- Sales amount (qty × price)  

Users should be able to compare multiple products.  
A basic login with username and password is also required.

## System structure
- **Framework:** Next.js for both frontend UI and backend API routes  
- **Frontend:** React pages and components for login, dashboard, file upload and charts  
- **Charts:** Recharts to plot three series (inventory, procurement amount, sales amount)  
- **APIs:**  
  - `/api/auth/login` and `/api/auth/logout` handle session login/logout  
  - `/api/upload` parses Excel and inserts rows into the database  
  - `/api/products` returns product list  
  - `/api/series/[id]` returns time-series data for one product  
- **Database & ORM:** Prisma used for schema and queries; SQLite in local dev; Postgres connection string prepared for deployment  
- **Auth & Session:** iron-session creates secure HTTP-only cookies after login  
- **Excel processing:** xlsx library reads uploaded Excel file, converts into Product and DailySnapshot tables  

**Data flow:**
1. User logs in with username and password  
2. Upload Excel → backend parses and saves data into `Product` and `DailySnapshot` tables  
3. Dashboard fetches product list and data series from APIs  
4. Charts display inventory, procurement and sales trends, with option to overlay products  

## Assumptions and limitations
- Authentication is basic (`admin` / `admin123`), enough for prototype  
- Excel format must roughly follow expected columns (inventory, procurement, sales)  
- Local version works fully; deployed version on Vercel has an API issue (login route returns 405).  
  This is likely a build/output setting and can be fixed with more time.

## Deployment Troubleshooting

If the system runs locally but fails after deployment (e.g. login API returns 405), check the following:

1. **Vercel settings**  
   - Framework Preset = **Next.js**  
   - Build Command = `next build` (not `next export`)  

2. **Environment variables**  
   - Ensure `DATABASE_URL` and `SESSION_SECRET` (at least 32 characters) are set in Vercel Project Settings → Environment Variables.  

3. **API routes**  
   - All backend endpoints must be under `pages/api/**`.  
   - Remove any old `app/api/**` directories to avoid conflicts.  

4. **Probe endpoint**  
   Add a simple endpoint to confirm API routes are included in the deployment:  

   `pages/api/ping.ts`  
   ```ts
   import type { NextApiRequest, NextApiResponse } from "next";

   export default function handler(req: NextApiRequest, res: NextApiResponse) {
     res.status(200).json({ ok: true, method: req.method, route: "pages/api/ping" });
   }
