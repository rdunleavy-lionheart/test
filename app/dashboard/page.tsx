"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BrandMark from "@/components/BrandMark";
import FilterBar from "@/components/FilterBar";
import InsightsPanel from "@/components/InsightsPanel";
import MasterTable from "@/components/MasterTable";
import ReallocationTable from "@/components/ReallocationTable";
import StatsStrip from "@/components/StatsStrip";
import { loadStored } from "@/lib/processor";
import type { FilterKey, Stored } from "@/lib/types";

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Stored | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    const stored = loadStored();
    if (!stored || !stored.academies?.length) {
      router.replace("/upload");
      return;
    }
    setData(stored);
    setLoaded(true);
  }, [router]);

  const compiled = useMemo(() => {
    if (!data) return "";
    return formatTimestamp(data.uploadedAt);
  }, [data]);

  if (!loaded || !data) {
    return (
      <div className="container-page">
        <div style={{ color: "var(--dim)" }}>Loading dashboard…</div>
      </div>
    );
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
  }

  const total = data.academies.length;

  return (
    <div className="container-page">
      <div className="masthead">
        <BrandMark tag="Marketing Allocation Brief" />
        <div className="meta" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div>
            Period <strong>past 28 days</strong>
            <br />
            Last updated <strong>{compiled}</strong>
          </div>
          <div className="header-actions no-print">
            <Link href="/upload" className="btn-link">Re-upload data</Link>
            <Link href="/settings" className="btn-link">Mappings</Link>
            <button className="btn-link" onClick={() => window.print()}>Print / PDF</button>
            <button className="btn-link" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>

      <h1 className="headline">
        The portfolio is spending most on the
        <br />
        academies that <span className="accent">convert least efficiently</span>.
      </h1>
      <div className="deck">
        Cost per paid lead ranges from <strong>$64</strong> at the top performer to <strong>$299</strong> at the
        bottom — a 4.7× spread. The three largest line items are all in the bottom half of the efficiency table.
        Layered against classroom-level capacity, every academy shows targeting misalignment — the highest-leverage
        moves are zero-cost ad-group reallocations.
      </div>

      <StatsStrip academies={data.academies} />

      {data.hasAges === false && (
        <div className="warning-banner">
          <span className="warning-icon" aria-hidden>!</span>
          <span>
            <strong>Age-group data not uploaded</strong> — targeting alignment scores unavailable. Upload the
            "Google Ads — Clicks by Age Group" CSV (slot B) on the{" "}
            <Link href="/upload" style={{ color: "var(--green-d)", textDecoration: "underline" }}>upload page</Link>{" "}
            to enable the alignment column and the per-academy targeting comparison chart.
          </span>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <div className="subhead">
            Section 01 · {total} Academies · Click any row for room-level detail
          </div>
          <h2 className="section-title">Master Academy Table</h2>
        </div>

        <FilterBar active={filter} total={total} onChange={setFilter} />

        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot priority" /> Priority growth academy
          </span>
          <span className="legend-item">
            <span className="legend-dot age-PS" /> Preschool
          </span>
          <span className="legend-item">
            <span className="legend-dot age-SA" /> Trailblazers
          </span>
          <span className="legend-item">
            <span className="legend-dot age-Inf" /> Infants
          </span>
          <span className="legend-item">
            <span className="legend-dot age-TT" /> Toddlers &amp; Twos
          </span>
        </div>

        <div className="helper-text">
          Sort any column by clicking. Click any academy row to expand classroom-level capacity and ad-targeting
          alignment.
        </div>

        <MasterTable academies={data.academies} filter={filter} />
      </div>

      <div className="section">
        <div className="section-header">
          <div className="subhead">Section 02 · Net-Neutral · ~$6.5K Shifted</div>
          <h2 className="section-title">Recommended Reallocation</h2>
        </div>

        <div className="two-col">
          <ReallocationTable />
          <InsightsPanel />
        </div>
      </div>

      <div className="footer">
        <span>
          <span className="leaf-icon">●</span> Lionheart Children's Academy · Marketing Allocation Brief
        </span>
        <span>Sources: Google Ads (28d) · Lead-source export · Classroom roll · Conversion CSV</span>
        <span>Next review: 30 days post-implementation</span>
      </div>
    </div>
  );
}
