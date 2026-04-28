"use client";

import { useMemo, useState } from "react";
import type { Academy, FilterKey } from "@/lib/types";
import { alignClass, cplClass, fmtNum, fteClass } from "@/lib/format";
import RoomDetail from "./RoomDetail";

type SortKey =
  | "code"
  | "name"
  | "region"
  | "budget"
  | "current"
  | "fte_vs_budget"
  | "open_capacity"
  | "incoming_enr"
  | "spend"
  | "cpc"
  | "ctr"
  | "paid_leads"
  | "cost_per_paid"
  | "lead_to_tour"
  | "tour_to_reg"
  | "misalign";

const TOTAL_COLS = 17;

export default function MasterTable({ academies, filter }: { academies: Academy[]; filter: FilterKey }) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  function applySort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    let rows = academies.slice();
    if (filter === "priority") rows = rows.filter((r) => r.priority);
    else if (filter === "inefficient") rows = rows.filter((r) => r.cost_per_paid > 200);
    else if (filter === "efficient") rows = rows.filter((r) => r.cost_per_paid > 0 && r.cost_per_paid < 130);
    else if (filter === "misaligned") rows = rows.filter((r) => r.misalign > 100);
    return rows.sort((a, b) => {
      const av = (a[sortKey] ?? -Infinity) as number | string;
      const bv = (b[sortKey] ?? -Infinity) as number | string;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [academies, filter, sortKey, sortDir]);

  const sortClass = (k: SortKey) => (sortKey === k ? "sort-active" : "");

  return (
    <div className="table-wrap">
      <table className="master">
        <thead>
          <tr>
            <th rowSpan={2} onClick={() => applySort("code")} className={sortClass("code")}>
              Code <span className="arrow">▾</span>
            </th>
            <th rowSpan={2} onClick={() => applySort("name")} className={sortClass("name")}>
              Academy <span className="arrow">▾</span>
            </th>
            <th rowSpan={2} onClick={() => applySort("region")} className={sortClass("region")}>
              Reg <span className="arrow">▾</span>
            </th>
            <th colSpan={3} className="group-fte">
              FTE / Enrollment
            </th>
            <th colSpan={2} className="group-cap">
              Capacity
            </th>
            <th colSpan={3} className="group-ads">
              Google Ads (28d)
            </th>
            <th colSpan={2} className="group-leads">
              Leads
            </th>
            <th colSpan={2} className="group-conv">
              Latest Conversion
            </th>
            <th rowSpan={2} className={`group-align ${sortClass("misalign")}`} onClick={() => applySort("misalign")}>
              Targeting
              <br />
              Misalign <span className="arrow">▾</span>
            </th>
            <th rowSpan={2}>Click Mix</th>
          </tr>
          <tr>
            <th className={`numeric ${sortClass("budget")}`} onClick={() => applySort("budget")}>
              Budget <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("current")}`} onClick={() => applySort("current")}>
              Current <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("fte_vs_budget")}`} onClick={() => applySort("fte_vs_budget")}>
              vs Bud <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("open_capacity")}`} onClick={() => applySort("open_capacity")}>
              Open <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("incoming_enr")}`} onClick={() => applySort("incoming_enr")}>
              Pipe <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("spend")}`} onClick={() => applySort("spend")}>
              Spend <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("cpc")}`} onClick={() => applySort("cpc")}>
              CPC <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("ctr")}`} onClick={() => applySort("ctr")}>
              CTR <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("paid_leads")}`} onClick={() => applySort("paid_leads")}>
              Paid <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("cost_per_paid")}`} onClick={() => applySort("cost_per_paid")}>
              $/Paid Lead <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("lead_to_tour")}`} onClick={() => applySort("lead_to_tour")}>
              L→T <span className="arrow">▾</span>
            </th>
            <th className={`numeric ${sortClass("tour_to_reg")}`} onClick={() => applySort("tour_to_reg")}>
              T→R <span className="arrow">▾</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => {
            const isExpanded = expanded === s.code;
            const trClass = `${s.priority ? "priority" : ""} ${isExpanded ? "expanded" : ""}`.trim();
            return (
              <RowAndDetail
                key={s.code}
                s={s}
                isExpanded={isExpanded}
                onToggle={() => setExpanded(isExpanded ? null : s.code)}
                trClass={trClass}
              />
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={TOTAL_COLS} style={{ textAlign: "center", padding: 28, color: "var(--dim)" }}>
                No academies match the current filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RowAndDetail({
  s,
  isExpanded,
  onToggle,
  trClass,
}: {
  s: Academy;
  isExpanded: boolean;
  onToggle: () => void;
  trClass: string;
}) {
  return (
    <>
      <tr className={trClass} onClick={onToggle}>
        <td className="code">
          {s.priority && <span className="pri-dot" />}
          {s.code}
          <span className="expand-icon">▶</span>
        </td>
        <td className="name">
          {s.name}
          <span className="city">{s.city}</span>
        </td>
        <td className="region">{s.region}</td>
        <td className="numeric">{s.budget ? s.budget.toFixed(1) : "—"}</td>
        <td className="numeric">{s.current ? s.current.toFixed(1) : "—"}</td>
        <td className="numeric">
          {s.budget ? (
            <TrendPill diff={s.current - s.budget} />
          ) : (
            <span className="pill pill-flat">new</span>
          )}
        </td>
        <td className="numeric">
          {s.open_capacity > 0 ? (
            <strong>{s.open_capacity.toFixed(1)}</strong>
          ) : (
            <span style={{ color: "var(--dim)" }}>—</span>
          )}
        </td>
        <td className="numeric">
          {s.incoming_enr ? `+${s.incoming_enr}` : <span style={{ color: "var(--dim)" }}>—</span>}
        </td>
        <td className="numeric">${fmtNum(s.spend)}</td>
        <td className="numeric">${s.cpc.toFixed(2)}</td>
        <td className="numeric">
          <span className={s.ctr < 1.5 ? "pill pill-bad" : s.ctr > 4 ? "pill pill-good" : ""}>
            {s.ctr.toFixed(2)}%
          </span>
        </td>
        <td className="numeric">{s.paid_leads || "—"}</td>
        <td className="numeric cpl-cell">
          {s.cost_per_paid ? (
            <span className={`cpl-bg ${cplClass(s.cost_per_paid)}`}>${s.cost_per_paid}</span>
          ) : (
            "—"
          )}
        </td>
        <td className="numeric">{s.lead_to_tour ? `${s.lead_to_tour.toFixed(1)}%` : "—"}</td>
        <td className="numeric">
          {s.tour_to_reg === 0 ? (
            <span style={{ color: "var(--orange)" }}>0%</span>
          ) : (
            `${s.tour_to_reg.toFixed(1)}%`
          )}
        </td>
        <td className="numeric">
          {s.misalign ? (
            <span className={`align-bg ${alignClass(s.misalign)}`}>{s.misalign}</span>
          ) : (
            <span style={{ color: "var(--dim)" }}>—</span>
          )}
        </td>
        <td>
          <AgeBars ages={s.ages} />
        </td>
      </tr>
      {isExpanded && (
        <tr className="detail-row">
          <td colSpan={TOTAL_COLS}>
            <RoomDetail academy={s} />
          </td>
        </tr>
      )}
    </>
  );
}

function TrendPill({ diff }: { diff: number }) {
  const sign = diff > 0 ? "+" : "";
  return <span className={`pill ${fteClass(diff)}`}>{sign}{diff.toFixed(1)}</span>;
}

function AgeBars({ ages }: { ages: { PS: number; SA: number; Inf: number; TT: number } }) {
  const total = ages.PS + ages.SA + ages.Inf + ages.TT;
  if (total === 0) return <span style={{ color: "var(--dim)", fontSize: 11 }}>—</span>;
  const pct = (k: keyof typeof ages) => ((ages[k] / total) * 100).toFixed(1);
  return (
    <div className="age-bars" title={`PS ${ages.PS} · Trailblazers ${ages.SA} · Inf ${ages.Inf} · T&T ${ages.TT}`}>
      <div className="age-seg age-PS" style={{ width: `${pct("PS")}%` }} />
      <div className="age-seg age-SA" style={{ width: `${pct("SA")}%` }} />
      <div className="age-seg age-Inf" style={{ width: `${pct("Inf")}%` }} />
      <div className="age-seg age-TT" style={{ width: `${pct("TT")}%` }} />
    </div>
  );
}
