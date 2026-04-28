import type { Mappings } from "./types";

export const DEFAULT_CAMPAIGN_TO_CODE: Record<string, string> = {
  "Grapevine, TX (121 CC)": "121CC",
  "Grapevine, TX (2)": "SM",
  "Fortville, IN": "MRC",
  "Saginaw, TX": "EVC",
  "Carrollton, TX": "BTB",
  "Arlington, TX": "LABC",
  "Colorado Springs, CO": "ACC",
  "Murfreesboro, TN": "OCMDO",
  "Murfreesboro, TN - PM": "OCTN",
  "Van Alstyne, TX": "FBCVA",
  "Irving, TX": "MBBC",
  "Euless, TX": "CCE",
  "Sylvania, OH": "FLC",
  "Katy, TX": "VCC",
  "Plano, TX: Central Church": "CCH",
  "Arvada, CO": "RCCO",
  "Garland, TX": "SCC",
  "Harrison, OH": "CHH",
  "Plano, TX: FBC": "FBCP",
  "Greenwood, IN": "FBCG",
  "Tomball, TX": "RLT",
};

export const DEFAULT_CENTER_TO_CODE: Record<string, string> = {
  "121CC Grapevine": "121CC",
  "Mercy Road Fortville": "MRC",
  "Academy Christian Colorado Springs": "ACC",
  "Lake Church Arlington": "LABC",
  "First Baptist Van Alstyne": "FBCVA",
  "Central Church Plano": "CCH",
  "First Baptist Plano": "FBCP",
  "Real Life Ministries Tomball": "RLT",
  "Venture Church Katy": "VCC",
  "Eagles View Saginaw": "EVC",
  "MacArthur Blvd Irving": "MBBC",
  "Revive Arvada": "RCCO",
  "One Church Murfreesboro": "OCMDO",
  "Five Lakes Sylvania": "FLC",
  "Bent Tree Carrollton": "BTB",
  "Cross City Euless": "CCE",
  "Springcreek Garland": "SCC",
  "Stone Myers Grapevine": "SM",
  "First Baptist Greenwood": "FBCG",
  "Community Commons Harrison": "CHH",
};

export const DEFAULT_CSV_CODE_TO_CODE: Record<string, string> = {
  LABC: "LABC",
  "121CC": "121CC",
  FBCP: "FBCP",
  CCH: "CCH",
  CCE: "CCE",
  BTB: "BTB",
  SCC: "SCC",
  AC: "ACC",
  MBBC: "MBBC",
  OCTN: "OCTN",
  RCCO: "RCCO",
  FBCG: "FBCG",
  FBCVA: "FBCVA",
  EVC: "EVC",
  OCMDO: "OCMDO",
  SM: "SM",
  FLC: "FLC",
  RLT: "RLT",
  MRC: "MRC",
  VCC: "VCC",
};

export const DEFAULT_MAPPINGS: Mappings = {
  campaignToCode: DEFAULT_CAMPAIGN_TO_CODE,
  centerNameToCode: DEFAULT_CENTER_TO_CODE,
  csvCodeToCode: DEFAULT_CSV_CODE_TO_CODE,
};

const MAPPINGS_KEY = "lionheart.mappings";

export function loadMappings(): Mappings {
  if (typeof window === "undefined") return DEFAULT_MAPPINGS;
  try {
    const raw = window.localStorage.getItem(MAPPINGS_KEY);
    if (!raw) return DEFAULT_MAPPINGS;
    const parsed = JSON.parse(raw) as Partial<Mappings>;
    return {
      campaignToCode: { ...DEFAULT_CAMPAIGN_TO_CODE, ...(parsed.campaignToCode || {}) },
      centerNameToCode: { ...DEFAULT_CENTER_TO_CODE, ...(parsed.centerNameToCode || {}) },
      csvCodeToCode: { ...DEFAULT_CSV_CODE_TO_CODE, ...(parsed.csvCodeToCode || {}) },
    };
  } catch {
    return DEFAULT_MAPPINGS;
  }
}

export function saveMappings(m: Mappings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MAPPINGS_KEY, JSON.stringify(m));
}

export function resetMappings() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MAPPINGS_KEY);
}

// Fuzzy match a campaign name against a mapping. Returns code or null.
export function fuzzyLookup(value: string, table: Record<string, string>): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (!v) return null;
  // Exact match first
  for (const key of Object.keys(table)) {
    if (key.toLowerCase() === v) return table[key];
  }
  // Substring either direction
  for (const key of Object.keys(table)) {
    const k = key.toLowerCase();
    if (v.includes(k) || k.includes(v)) return table[key];
  }
  return null;
}
