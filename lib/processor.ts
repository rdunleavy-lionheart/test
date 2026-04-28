import Papa from "papaparse";
import type { Academy, AgeBands, Mappings, Room, Stored } from "./types";
import { fuzzyLookup } from "./mappings";

const STORAGE_KEY = "lionheart.dashboard";

export type CsvRow = Record<string, string>;

export type AdsRow = {
  code: string;
  spend: number;
  clicks: number;
  cpc: number;
  ctr: number;
  impressions: number;
  campaign: string;
};

export type LeadsRow = {
  code: string;
  total_leads: number;
  paid_leads: number;
  centerName: string;
};

export type FteRow = {
  code: string;
  enrollments: number;
  total_ftes: number;
  incoming_enr: number;
  incoming_fte: number;
  total_inf_prek_ftes: number;
  rooms: Room[];
  upcoming_withdrawals: number;
  withdraw_fte: number;
};

export type ConvRow = {
  code: string;
  lead_to_tour: number;
  tour_to_reg: number;
};

export type AgesRow = {
  code: string;
  campaign: string;
  ages: AgeBands;
};

// ---------------- column matching ----------------
function findHeader(headers: string[], candidates: string[]): string | undefined {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const c of candidates) {
    const cl = c.toLowerCase();
    const idx = lower.findIndex((h) => h === cl);
    if (idx >= 0) return headers[idx];
  }
  for (const c of candidates) {
    const cl = c.toLowerCase();
    const idx = lower.findIndex((h) => h.includes(cl));
    if (idx >= 0) return headers[idx];
  }
  return undefined;
}

function num(v: unknown): number {
  if (v === undefined || v === null || v === "") return 0;
  const s = String(v).replace(/[$,%\s]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function pct(v: unknown): number {
  // Accept both 3.77 and 0.0377; normalize to %.
  if (v === undefined || v === null || v === "") return 0;
  const s = String(v).trim();
  const hasPct = s.includes("%");
  const n = num(s);
  if (hasPct) return n;
  return n <= 1 ? n * 100 : n;
}

// ---------------- parsers ----------------
export function parseCsv(file: File): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: reject,
    });
  });
}

export function parseAdsRows(rows: CsvRow[], mappings: Mappings): AdsRow[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const hCampaign = findHeader(headers, ["Campaign"]);
  const hCost = findHeader(headers, ["Cost", "Spend"]);
  const hClicks = findHeader(headers, ["Clicks"]);
  const hCpc = findHeader(headers, ["Avg. CPC", "Avg CPC", "CPC"]);
  const hCtr = findHeader(headers, ["CTR"]);
  const hImpr = findHeader(headers, ["Impressions", "Impr."]);
  const out: AdsRow[] = [];
  for (const r of rows) {
    const campaign = hCampaign ? String(r[hCampaign] ?? "") : "";
    if (!campaign) continue;
    const code = fuzzyLookup(campaign, mappings.campaignToCode);
    if (!code) continue;
    out.push({
      code,
      campaign,
      spend: hCost ? num(r[hCost]) : 0,
      clicks: hClicks ? Math.round(num(r[hClicks])) : 0,
      cpc: hCpc ? num(r[hCpc]) : 0,
      ctr: hCtr ? pct(r[hCtr]) : 0,
      impressions: hImpr ? Math.round(num(r[hImpr])) : 0,
    });
  }
  return out;
}

export function parseAgesRows(rows: CsvRow[], mappings: Mappings): AgesRow[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const hCampaign = findHeader(headers, ["Campaign"]);
  const hPS = findHeader(headers, ["Preschool"]);
  const hSA = findHeader(headers, ["School Age: Trailblazers", "School Age", "Trailblazers"]);
  const hInf = findHeader(headers, ["Infants", "Infant"]);
  const hTT = findHeader(headers, ["Toddlers & Twos", "Toddlers and Twos", "Toddlers"]);
  const out: AgesRow[] = [];
  for (const r of rows) {
    const campaign = hCampaign ? String(r[hCampaign] ?? "") : "";
    if (!campaign) continue;
    const code = fuzzyLookup(campaign, mappings.campaignToCode);
    if (!code) continue;
    out.push({
      code,
      campaign,
      ages: {
        PS: hPS ? Math.round(num(r[hPS])) : 0,
        SA: hSA ? Math.round(num(r[hSA])) : 0,
        Inf: hInf ? Math.round(num(r[hInf])) : 0,
        TT: hTT ? Math.round(num(r[hTT])) : 0,
      },
    });
  }
  return out;
}

export function agesByCodeFromRows(rows: AgesRow[]): Record<string, AgeBands> {
  const out: Record<string, AgeBands> = {};
  for (const r of rows) {
    const cur = out[r.code] ?? { PS: 0, SA: 0, Inf: 0, TT: 0 };
    cur.PS += r.ages.PS;
    cur.SA += r.ages.SA;
    cur.Inf += r.ages.Inf;
    cur.TT += r.ages.TT;
    out[r.code] = cur;
  }
  return out;
}

export function parseLeadsRows(rows: CsvRow[], mappings: Mappings): LeadsRow[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const hName = findHeader(headers, ["Center Name", "Center", "Location"]);
  const hTotal = findHeader(headers, ["Total Leads", "Total"]);
  const hPaid = findHeader(headers, ["Paid Lead", "Paid Leads", "Paid"]);
  const out: LeadsRow[] = [];
  for (const r of rows) {
    const center = hName ? String(r[hName] ?? "") : "";
    if (!center) continue;
    const code = fuzzyLookup(center, mappings.centerNameToCode);
    if (!code) continue;
    out.push({
      code,
      centerName: center,
      total_leads: hTotal ? Math.round(num(r[hTotal])) : 0,
      paid_leads: hPaid ? Math.round(num(r[hPaid])) : 0,
    });
  }
  return out;
}

const ROOM_DEFS: Array<{ short: string; name: string; fteCols: string[]; budgetCols: string[] }> = [
  { short: "Inf", name: "Infant", fteCols: ["Infant FTEs", "Infant FTE"], budgetCols: ["Infant Budget"] },
  {
    short: "YT",
    name: "Younger Toddler",
    fteCols: ["Younger Todd FTEs", "Young Todd FTEs", "Younger Toddler FTEs"],
    budgetCols: ["Young Todd Budget", "Younger Todd Budget", "Younger Toddler Budget"],
  },
  {
    short: "OT",
    name: "Older Toddler",
    fteCols: ["Older Todd FTEs", "Older Toddler FTEs"],
    budgetCols: ["Older Todd Budget", "Older Toddler Budget"],
  },
  { short: "EPS", name: "Early Preschool", fteCols: ["Early PS FTEs"], budgetCols: ["Early PS Budget"] },
  { short: "PS", name: "Preschool", fteCols: ["PS FTEs"], budgetCols: ["PS Budget"] },
  { short: "PK", name: "Pre-K", fteCols: ["Pre K FTEs", "Pre-K FTEs", "PreK FTEs"], budgetCols: ["Pre K Budget", "Pre-K Budget", "PreK Budget"] },
  { short: "TB", name: "Trailblazers", fteCols: ["TB FTEs", "Trailblazers FTEs"], budgetCols: ["TB Budget", "Trailblazers Budget"] },
];

export function parseFteRows(rows: CsvRow[], mappings: Mappings): FteRow[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const hAcademy = findHeader(headers, ["Academy"]);
  const hEnroll = findHeader(headers, ["Enrollments"]);
  const hTotalFte = findHeader(headers, ["Total FTEs", "Total FTE"]);
  const hIncEnr = findHeader(headers, ["Incoming Enrollments"]);
  const hIncFte = findHeader(headers, ["Incoming FTEs"]);
  const hTotalIPK = findHeader(headers, ["Total Infant-PreK FTEs", "Total Infant PreK FTEs"]);
  const hWith = findHeader(headers, ["Upcoming Withdrawals"]);
  const hWithFte = findHeader(headers, ["Total Withdrawing FTEs"]);
  const out: FteRow[] = [];
  for (const r of rows) {
    const academy = hAcademy ? String(r[hAcademy] ?? "").trim() : "";
    if (!academy) continue;
    const code = mappings.csvCodeToCode[academy] ?? fuzzyLookup(academy, mappings.csvCodeToCode);
    if (!code) continue;
    const rooms: Room[] = [];
    for (const def of ROOM_DEFS) {
      const fteCol = findHeader(headers, def.fteCols);
      const budCol = findHeader(headers, def.budgetCols);
      if (!fteCol && !budCol) continue;
      const fte = fteCol ? num(r[fteCol]) : 0;
      const budget = budCol ? num(r[budCol]) : 0;
      if (fte === 0 && budget === 0) continue;
      rooms.push({ name: def.name, short: def.short, fte, budget, gap: budget - fte });
    }
    out.push({
      code,
      enrollments: hEnroll ? Math.round(num(r[hEnroll])) : 0,
      total_ftes: hTotalFte ? num(r[hTotalFte]) : 0,
      incoming_enr: hIncEnr ? Math.round(num(r[hIncEnr])) : 0,
      incoming_fte: hIncFte ? num(r[hIncFte]) : 0,
      total_inf_prek_ftes: hTotalIPK ? num(r[hTotalIPK]) : 0,
      rooms,
      upcoming_withdrawals: hWith ? Math.round(num(r[hWith])) : 0,
      withdraw_fte: hWithFte ? num(r[hWithFte]) : 0,
    });
  }
  return out;
}

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function parseMonthYear(label: string): number | null {
  // Try formats like "April 2026", "2026-04", "Apr 2026", "04/2026", "Apr-26"
  const s = label.toLowerCase().trim();
  let year = 0;
  let month = 0;
  const ymMatch = s.match(/(20\d{2})[\s\-/]?(\d{1,2})/);
  if (ymMatch) {
    year = parseInt(ymMatch[1], 10);
    month = parseInt(ymMatch[2], 10);
  } else {
    const myMatch = s.match(/(\d{1,2})[\s\-/](\d{2,4})/);
    if (myMatch) {
      month = parseInt(myMatch[1], 10);
      const y = parseInt(myMatch[2], 10);
      year = y < 100 ? 2000 + y : y;
    } else {
      for (let i = 0; i < MONTH_NAMES.length; i++) {
        if (s.includes(MONTH_NAMES[i].slice(0, 3))) {
          month = i + 1;
          break;
        }
      }
      const yMatch = s.match(/(20\d{2}|\d{2})/);
      if (yMatch) {
        const y = parseInt(yMatch[1], 10);
        year = y < 100 ? 2000 + y : y;
      }
    }
  }
  if (!year || !month) return null;
  return year * 100 + month;
}

export function parseConversionRows(rows: CsvRow[], mappings: Mappings): ConvRow[] {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const hName = findHeader(headers, ["Location Name", "Center Name", "Location"]);
  // Find the most recent month columns for each conversion type
  type Col = { header: string; ym: number };
  const tourCols: Col[] = [];
  const regCols: Col[] = [];
  for (const h of headers) {
    const hl = h.toLowerCase();
    const ym = parseMonthYear(h);
    if (ym === null) continue;
    if (hl.includes("lead to tour") || hl.includes("tour scheduled")) tourCols.push({ header: h, ym });
    else if (hl.includes("tour completed") || hl.includes("waitlist") || hl.includes("registered")) regCols.push({ header: h, ym });
  }
  tourCols.sort((a, b) => b.ym - a.ym);
  regCols.sort((a, b) => b.ym - a.ym);
  const tourCol = tourCols[0]?.header;
  const regCol = regCols[0]?.header;
  const out: ConvRow[] = [];
  for (const r of rows) {
    const center = hName ? String(r[hName] ?? "") : "";
    if (!center) continue;
    const code = fuzzyLookup(center, mappings.centerNameToCode);
    if (!code) continue;
    out.push({
      code,
      lead_to_tour: tourCol ? pct(r[tourCol]) : 0,
      tour_to_reg: regCol ? pct(r[regCol]) : 0,
    });
  }
  return out;
}

// ---------------- diagnostics ----------------
export type Diagnostic = {
  matched: number;
  total: number;
  unmatched: string[];
};

function diagnoseGeneric<T extends { code: string }>(
  rows: CsvRow[],
  parsed: T[],
  keyHeaderCandidates: string[]
): Diagnostic {
  if (!rows.length) return { matched: 0, total: 0, unmatched: [] };
  const headers = Object.keys(rows[0]);
  const keyHeader = findHeader(headers, keyHeaderCandidates);
  if (!keyHeader) {
    return { matched: 0, total: rows.length, unmatched: [] };
  }
  const total = rows.filter((r) => String(r[keyHeader] ?? "").trim() !== "").length;
  const matched = parsed.length;
  const matchedKeys = new Set<string>();
  // Best-effort: collect identifiers we couldn't map by reverse-checking.
  // Re-run the lookup logic here without storing the full parsed→raw link.
  const allKeys = rows
    .map((r) => String(r[keyHeader] ?? "").trim())
    .filter(Boolean);
  // Walk parsed and remove matched keys from allKeys uniqueness.
  for (const p of parsed) matchedKeys.add(p.code);
  // Unmatched: names that didn't produce any parsed row.
  // We approximate by deduping raw keys and filtering those that yield no fuzzy hit.
  const seen = new Set<string>();
  const unmatched: string[] = [];
  for (const k of allKeys) {
    if (seen.has(k)) continue;
    seen.add(k);
  }
  return { matched, total, unmatched };
}

export function diagnoseAds(rows: CsvRow[], mappings: Mappings): Diagnostic {
  if (!rows.length) return { matched: 0, total: 0, unmatched: [] };
  const headers = Object.keys(rows[0]);
  const hCampaign = findHeader(headers, ["Campaign"]);
  if (!hCampaign) return { matched: 0, total: rows.length, unmatched: ["(no Campaign column found)"] };
  const all = rows
    .map((r) => String(r[hCampaign] ?? "").trim())
    .filter(Boolean);
  const total = all.length;
  let matched = 0;
  const unmatched: string[] = [];
  const seen = new Set<string>();
  for (const c of all) {
    if (fuzzyLookup(c, mappings.campaignToCode)) matched++;
    else if (!seen.has(c)) {
      unmatched.push(c);
      seen.add(c);
    }
  }
  return { matched, total, unmatched };
}

export function diagnoseAges(rows: CsvRow[], mappings: Mappings): Diagnostic {
  return diagnoseAds(rows, mappings);
}

export function diagnoseLeads(rows: CsvRow[], mappings: Mappings): Diagnostic {
  if (!rows.length) return { matched: 0, total: 0, unmatched: [] };
  const headers = Object.keys(rows[0]);
  const hName = findHeader(headers, ["Center Name", "Center", "Location"]);
  if (!hName) return { matched: 0, total: rows.length, unmatched: ["(no Center/Location column found)"] };
  const all = rows.map((r) => String(r[hName] ?? "").trim()).filter(Boolean);
  let matched = 0;
  const unmatched: string[] = [];
  const seen = new Set<string>();
  for (const c of all) {
    if (fuzzyLookup(c, mappings.centerNameToCode)) matched++;
    else if (!seen.has(c)) {
      unmatched.push(c);
      seen.add(c);
    }
  }
  return { matched, total: all.length, unmatched };
}

export function diagnoseFte(rows: CsvRow[], mappings: Mappings): Diagnostic {
  if (!rows.length) return { matched: 0, total: 0, unmatched: [] };
  const headers = Object.keys(rows[0]);
  const hAcademy = findHeader(headers, ["Academy"]);
  if (!hAcademy) return { matched: 0, total: rows.length, unmatched: ["(no Academy column found)"] };
  const all = rows.map((r) => String(r[hAcademy] ?? "").trim()).filter(Boolean);
  let matched = 0;
  const unmatched: string[] = [];
  const seen = new Set<string>();
  for (const c of all) {
    const direct = mappings.csvCodeToCode[c];
    const code = direct ?? fuzzyLookup(c, mappings.csvCodeToCode);
    if (code) matched++;
    else if (!seen.has(c)) {
      unmatched.push(c);
      seen.add(c);
    }
  }
  return { matched, total: all.length, unmatched };
}

export function diagnoseConv(rows: CsvRow[], mappings: Mappings): Diagnostic {
  return diagnoseLeads(rows, mappings);
}

void diagnoseGeneric; // silence unused

// ---------------- merge / compute ----------------
function bandFromShort(short: string): keyof AgeBands | null {
  if (short === "Inf") return "Inf";
  if (short === "YT" || short === "OT") return "TT";
  if (short === "EPS" || short === "PS" || short === "PK") return "PS";
  if (short === "TB") return "SA";
  return null;
}

function computeMisalignment(rooms: Room[] | null, ages: AgeBands): number {
  if (!rooms || rooms.length === 0) return 0;
  const cap: AgeBands = { Inf: 0, TT: 0, PS: 0, SA: 0 };
  for (const r of rooms) {
    const b = bandFromShort(r.short);
    if (!b) continue;
    cap[b] += Math.max(0, r.gap);
  }
  const totalCap = cap.Inf + cap.TT + cap.PS + cap.SA;
  const totalClicks = ages.Inf + ages.TT + ages.PS + ages.SA;
  if (totalCap === 0 || totalClicks === 0) return 0;
  let score = 0;
  (Object.keys(cap) as Array<keyof AgeBands>).forEach((k) => {
    const capPct = (cap[k] / totalCap) * 100;
    const clkPct = (ages[k] / totalClicks) * 100;
    score += Math.abs(capPct - clkPct);
  });
  return Math.round(score);
}

function clicksToAgeBands(_ads: AdsRow[]): AgeBands {
  // Click-by-age data isn't in the raw Google Ads export schema; ad-group level
  // breakdowns require a separate export. Default to zero — mismatch becomes 0.
  return { Inf: 0, TT: 0, PS: 0, SA: 0 };
}

export type ProcessInput = {
  ads: CsvRow[];
  leads: CsvRow[];
  fte: CsvRow[];
  conv: CsvRow[];
  mappings: Mappings;
  priorityCodes?: string[];
  // Optional: pre-existing ages-by-band per code (from a future ad-group export)
  agesByCode?: Record<string, AgeBands>;
};

const DEFAULT_PRIORITY = ["121CC", "MBBC", "CCH", "RCCO", "SCC", "FBCP"];

const REGION_BY_CODE: Record<string, string> = {
  "121CC": "NC",
  MRC: "PKS",
  EVC: "NC",
  BTB: "BF",
  LABC: "NC",
  ACC: "BF",
  OCMDO: "PKS",
  FBCVA: "BF",
  MBBC: "NC",
  CCE: "NC",
  FLC: "PKS",
  VCC: "PN",
  CCH: "PKS",
  RCCO: "BF",
  SM: "PN",
  SCC: "PN",
  CHH: "PKS",
  FBCP: "PN",
  FBCG: "PKS",
  RLT: "PN",
  OCTN: "PKS",
};

const NAME_BY_CODE: Record<string, { name: string; city: string }> = {
  "121CC": { name: "121 Community Church", city: "Grapevine, TX" },
  MRC: { name: "Mercy Road", city: "Fortville, IN" },
  EVC: { name: "Eagles View", city: "Saginaw, TX" },
  BTB: { name: "Bent Tree Bible", city: "Carrollton, TX" },
  LABC: { name: "Lake Church", city: "Arlington, TX" },
  ACC: { name: "Academy Christian", city: "Colorado Springs, CO" },
  OCMDO: { name: "One Church Murfreesboro", city: "Murfreesboro, TN" },
  FBCVA: { name: "First Baptist Van Alstyne", city: "Van Alstyne, TX" },
  MBBC: { name: "MacArthur Blvd", city: "Irving, TX" },
  CCE: { name: "Cross City", city: "Euless, TX" },
  FLC: { name: "Five Lakes", city: "Sylvania, OH" },
  VCC: { name: "Venture Church", city: "Katy, TX" },
  CCH: { name: "Central Church", city: "Plano, TX" },
  RCCO: { name: "Revive Church", city: "Arvada, CO" },
  SM: { name: "Stone Myers", city: "Grapevine, TX" },
  SCC: { name: "Springcreek Church", city: "Garland, TX" },
  CHH: { name: "Community Commons", city: "Harrison, OH" },
  FBCP: { name: "First Baptist Plano", city: "Plano, TX" },
  FBCG: { name: "First Baptist Greenwood", city: "Greenwood, IN" },
  RLT: { name: "Real Life Ministries", city: "Tomball, TX" },
  OCTN: { name: "One Church Murfreesboro (PM)", city: "Murfreesboro, TN" },
};

export function mergeAcademies(input: ProcessInput): Academy[] {
  const ads = parseAdsRows(input.ads, input.mappings);
  const leads = parseLeadsRows(input.leads, input.mappings);
  const fte = parseFteRows(input.fte, input.mappings);
  const conv = parseConversionRows(input.conv, input.mappings);
  const priority = new Set(input.priorityCodes ?? DEFAULT_PRIORITY);

  const codes = new Set<string>([
    ...ads.map((a) => a.code),
    ...leads.map((l) => l.code),
    ...fte.map((f) => f.code),
    ...conv.map((c) => c.code),
  ]);

  const out: Academy[] = [];
  for (const code of codes) {
    const a = ads.find((x) => x.code === code);
    const l = leads.find((x) => x.code === code);
    const f = fte.find((x) => x.code === code);
    const c = conv.find((x) => x.code === code);
    const meta = NAME_BY_CODE[code] ?? { name: code, city: "" };
    const rooms = f?.rooms ?? null;
    const open_capacity = rooms ? rooms.reduce((s, r) => s + Math.max(0, r.gap), 0) : 0;
    const totalBudget = rooms ? rooms.reduce((s, r) => s + r.budget, 0) : 0;
    const totalCurrent = f?.total_ftes ?? (rooms ? rooms.reduce((s, r) => s + r.fte, 0) : 0);
    const ages = input.agesByCode?.[code] ?? clicksToAgeBands(ads.filter((x) => x.code === code));
    const misalign = computeMisalignment(rooms, ages);
    const cost_per_paid = a && l && l.paid_leads > 0 ? Math.round(a.spend / l.paid_leads) : 0;
    const pct_paid = l && l.total_leads > 0 ? Math.round((l.paid_leads / l.total_leads) * 100) : 0;

    out.push({
      code,
      name: meta.name,
      city: meta.city,
      region: REGION_BY_CODE[code] ?? "—",
      budget: totalBudget,
      current: totalCurrent,
      fte_vs_budget: totalCurrent - totalBudget,
      spend: a?.spend ?? 0,
      cpc: a?.cpc ?? 0,
      ctr: a?.ctr ?? 0,
      clicks: a?.clicks ?? 0,
      total_leads: l?.total_leads ?? 0,
      paid_leads: l?.paid_leads ?? 0,
      pct_paid,
      cost_per_paid,
      lead_to_tour: c?.lead_to_tour ?? 0,
      tour_to_reg: c?.tour_to_reg ?? 0,
      ages,
      misalign,
      priority: priority.has(code),
      open_capacity,
      incoming_enr: f?.incoming_enr ?? 0,
      incoming_fte: f?.incoming_fte ?? 0,
      withdrawals: f?.upcoming_withdrawals ?? 0,
      withdraw_fte: f?.withdraw_fte ?? 0,
      enrollments: f?.enrollments ?? 0,
      rooms,
    });
  }

  return out.sort((a, b) => b.spend - a.spend);
}

export function loadStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

export function saveStored(s: Stored) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function clearStored() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
