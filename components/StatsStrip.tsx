"use client";

import type { Academy } from "@/lib/types";
import { fmtCurrencyShort, fmtNum } from "@/lib/format";

export default function StatsStrip({ academies }: { academies: Academy[] }) {
  const totalSpend = academies.reduce((s, a) => s + a.spend, 0);
  const totalPaid = academies.reduce((s, a) => s + a.paid_leads, 0);
  const avgCpl = totalPaid > 0 ? totalSpend / totalPaid : 0;
  const openCap = academies.reduce((s, a) => s + a.open_capacity, 0);
  const incoming = academies.reduce((s, a) => s + a.incoming_enr, 0);
  const withdrawals = academies.reduce((s, a) => s + a.withdrawals, 0);
  const withdrawFte = academies.reduce((s, a) => s + a.withdraw_fte, 0);
  const campaignCount = academies.filter((a) => a.spend > 0).length;
  const avgPerAcademy = academies.length ? totalPaid / academies.length : 0;

  return (
    <div className="stats-strip">
      <Stat label="Total Spend / 28d" value={fmtCurrencyShort(totalSpend)} sub={`${campaignCount} campaigns`} />
      <Stat label="Total Paid Leads" value={fmtNum(totalPaid)} sub={`avg ${avgPerAcademy.toFixed(1)} / academy`} />
      <Stat label="Avg $/Paid Lead" value={`$${fmtNum(Math.round(avgCpl))}`} sub="portfolio mean" />
      <Stat label="Open Capacity" value={fmtNum(Math.round(openCap))} sub="FTE seats portfolio-wide" />
      <Stat label="Incoming Pipeline" value={fmtNum(incoming)} sub="enrollments confirmed" />
      <Stat label="Upcoming Withdrawals" value={fmtNum(withdrawals)} sub={`${withdrawFte.toFixed(1)} FTE leaving`} />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
