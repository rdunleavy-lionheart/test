import type { AgeBands } from "./types";

export function fmtNum(n: number, dec = 0): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function fmtCurrencyShort(n: number): string {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return "$" + n.toLocaleString();
}

export function cplClass(cpl: number): string {
  if (!cpl) return "";
  if (cpl < 100) return "cpl-elite";
  if (cpl < 150) return "cpl-good";
  if (cpl < 200) return "cpl-mid";
  if (cpl < 260) return "cpl-bad";
  return "cpl-awful";
}

export function alignClass(m: number): string {
  if (!m) return "";
  if (m < 50) return "align-elite";
  if (m < 80) return "align-good";
  if (m < 110) return "align-mid";
  if (m < 140) return "align-bad";
  return "align-awful";
}

export function fteClass(diff: number): string {
  if (Math.abs(diff) < 0.5) return "pill-flat";
  if (diff > 0) return "pill-good";
  return "pill-bad";
}

export function capacityByBand(rooms: { short: string; gap: number }[] | null): AgeBands {
  const bands: AgeBands = { Inf: 0, TT: 0, PS: 0, SA: 0 };
  if (!rooms) return bands;
  for (const r of rooms) {
    const gap = Math.max(0, r.gap);
    if (r.short === "Inf") bands.Inf += gap;
    else if (r.short === "YT" || r.short === "OT") bands.TT += gap;
    else if (r.short === "EPS" || r.short === "PS" || r.short === "PK") bands.PS += gap;
    else if (r.short === "TB") bands.SA += gap;
  }
  return bands;
}
