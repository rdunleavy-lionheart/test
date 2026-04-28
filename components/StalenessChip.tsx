"use client";

type Tier = "fresh" | "ok" | "stale" | "old";

function classifyAge(iso: string | undefined): { tier: Tier; days: number; label: string } {
  if (!iso) return { tier: "old", days: Infinity, label: "no data" };
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor(ms / (1000 * 60 * 60));
  let label: string;
  if (days >= 1) label = `${days} day${days === 1 ? "" : "s"} ago`;
  else if (hours >= 1) label = `${hours} hour${hours === 1 ? "" : "s"} ago`;
  else label = "just now";
  let tier: Tier;
  if (days < 3) tier = "fresh";
  else if (days < 7) tier = "ok";
  else if (days < 21) tier = "stale";
  else tier = "old";
  return { tier, days, label };
}

const TIER_CLASS: Record<Tier, string> = {
  fresh: "chip-fresh",
  ok: "chip-ok",
  stale: "chip-stale",
  old: "chip-old",
};

export default function StalenessChip({ iso }: { iso: string | undefined }) {
  const { tier, label } = classifyAge(iso);
  return <span className={`age-chip ${TIER_CLASS[tier]}`}>{label}</span>;
}

export { classifyAge };
