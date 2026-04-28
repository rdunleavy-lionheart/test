# Lionheart — Marketing Allocation Dashboard

A Next.js 14 dashboard that converts the static Marketing Allocation Brief into
an interactive, CSV-driven tool for Lionheart Children's Academy.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS + custom Lionheart brand stylesheet (`app/globals.css`)
- PapaParse for CSV parsing
- `localStorage` for data persistence (no database)
- Cookie-based password gate (HMAC-signed, 7-day session)

## Setup

```bash
npm install
cp .env.example .env.local        # set DASHBOARD_PASSWORD
npm run dev                       # http://localhost:3000
```

## Deploying to Vercel

1. Import the repo into Vercel.
2. Set `DASHBOARD_PASSWORD` in **Settings → Environment Variables** for all
   environments (Production, Preview, Development).
3. Deploy.

The middleware uses Web Crypto, so it runs on the Edge runtime with no Node.js
shims required.

## App structure

```
/app
  /page.tsx                login (password gate)
  /upload/page.tsx         four CSV uploaders → builds dashboard
  /dashboard/page.tsx      main dashboard
  /settings/page.tsx       JSON editor for column-name → academy-code maps
  /api/login, /api/logout  cookie session
/components
  StatsStrip, MasterTable, RoomDetail, TargetingChart,
  ReallocationTable, InsightsPanel, CsvUploader, FilterBar
/lib
  types.ts        TypeScript interfaces
  mappings.ts     default + user-overridable mappings (localStorage)
  processor.ts    CSV parsing, column-fuzzy-match, join, metric computation
  format.ts       formatting + color-class helpers
  sample.ts       demo dataset (matches the original static HTML)
  auth.ts         Web-Crypto HMAC for cookie session
middleware.ts     redirects unauthenticated requests to /
```

## CSV expectations

Header matching is fuzzy (case-insensitive, partial substring), so minor renames
won't break things. The four expected exports:

| Slot | File | Required columns |
|---|---|---|
| A | Google Ads | Campaign, Cost, Clicks, Avg. CPC, CTR, Impressions |
| B | Lead Source | Center Name, Total Leads, Paid Lead |
| C | FTE / Classroom Roll | Academy, Enrollments, Total FTEs, Incoming Enrollments / FTEs, per-classroom FTEs and Budgets, Upcoming Withdrawals, Total Withdrawing FTEs |
| D | Conversion Rates | Location Name + per-month "New Lead to Tour Scheduled %" / "Tour Completed to Waitlist or Registered %" columns. The most recent month is used. |

## Mappings

All three mappings live in `lib/mappings.ts` as defaults and can be overridden
via the in-app `/settings` page (stored in `localStorage`):

- `campaignToCode`     — Google Ads campaign name → academy code
- `centerNameToCode`   — lead-source / conversion CSV center name → academy code
- `csvCodeToCode`      — FTE CSV academy code → canonical dashboard code

## Misalignment score

`misalign = Σ |capacity%_band − click%_band|` across four bands:

- Infants ← Infant rooms
- Toddlers/Twos ← Younger Toddler + Older Toddler
- Preschool ← Early PS + PS + Pre-K
- Trailblazers ← TB

Both shares are computed against open-capacity totals and click totals
respectively. Score is `0..200`. With the default Google Ads export schema,
ad-group-level click-by-age data is not present; the dashboard exposes a hook
(`agesByCode`) for layering it in once a per-ad-group export is available.

## Notes / known gaps

- Tour-to-Registered "0%" is rendered in Lionheart orange (matches the static
  HTML's signal that the data is missing rather than literally zero).
- The Reallocation table and Insights panel are static text from the brief.
  When the CSV-derived metrics shift week-over-week, those copy blocks should
  be edited (`components/ReallocationTable.tsx`, `components/InsightsPanel.tsx`)
  or replaced with auto-generated logic.
- For the demo flow without uploading CSVs, click "Load demo data" on the
  upload page — it seeds the exact dataset from the original HTML.
