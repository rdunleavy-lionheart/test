"use client";

import type { FilterKey } from "@/lib/types";

const FILTERS: { key: FilterKey; label: (n: number) => string }[] = [
  { key: "all", label: (n) => `All academies (${n})` },
  { key: "priority", label: () => "Priority growth only" },
  { key: "inefficient", label: () => "Inefficient ($/lead > $200)" },
  { key: "efficient", label: () => "Efficient ($/lead < $130)" },
  { key: "misaligned", label: () => "Misaligned targeting (> 100)" },
];

export default function FilterBar({
  active,
  total,
  onChange,
}: {
  active: FilterKey;
  total: number;
  onChange: (k: FilterKey) => void;
}) {
  return (
    <div className="controls no-print">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          className={`filter-btn ${active === f.key ? "active" : ""}`}
          onClick={() => onChange(f.key)}
        >
          {f.label(total)}
        </button>
      ))}
    </div>
  );
}
