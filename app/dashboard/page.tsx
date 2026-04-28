"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import BrandMark from "@/components/BrandMark";
import FilterBar from "@/components/FilterBar";
import StalenessChip, { classifyAge } from "@/components/StalenessChip";
import InsightsPanel from "@/components/InsightsPanel";
import MasterTable from "@/components/MasterTable";
import ReallocationTable from "@/components/ReallocationTable";
import StatsStrip from "@/components/StatsStrip";
import { loadStored } from "@/lib/processor";
import type { FilterKey, Stored } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  ads: "Google Ads — Campaign",
  ages: "Google Ads — Age groups",
  leads: "Lead Source",
  fte: "Classroom Roll",
  conv: "Conversion Rates",
};

function SourcesBlock({ sources }: { sources: NonNullable<Stored["sources"]> }) {
  const [open, setOpen] = useState(false);
  const keys: (keyof NonNullable<Stored["sources"]>)[] = ["ads", "ages", "leads", "fte", "conv"];
  return (
    <div className="no-print" style={{ width: "100%", maxWidth: 360 }}>
      <button
        className="btn-tertiary"
        onClick={() => setOpen((v) => !v)}
        style={{ padding: 0, fontSize: 10, color: "var(--dim)" }}
      >
        {open ? "▾" : "▸"} Source CSV ages
      </button>
      {open && (
        <div className="source-list">
          {keys.map((k) => (
            <Fragment key={k}>
              <span className="src-key">{SOURCE_LABELS[k]}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                <StalenessChip iso={sources[k]} />
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span>
              Period <strong>past 28 days</strong> · Last updated <strong>{compiled}</strong>
            </span>
            <StalenessChip iso={data.uploadedAt} />
          </div>
          <div className="header-actions no-print" style={{ alignItems: "center" }}>
            <Link href="/upload" className="btn-link btn-primary">Re-upload data</Link>
            <span className="action-divider" />
            <Link href="/settings" className="btn-tertiary">Mappings</Link>
            <button className="btn-tertiary" onClick={() => window.print()}>Print / PDF</button>
            <button className="btn-tertiary" onClick={logout}>Sign out</button>
          </div>
          {data.sources && <SourcesBlock sources={data.sources} />}
        </div>
      </div>

      {classifyAge(data.uploadedAt).tier === "old" && (
        <div className="warning-banner" style={{ borderColor: "var(--orange)", borderLeftColor: "var(--orange)", background: "rgba(195,81,49,0.1)" }}>
          <span className="warning-icon" aria-hidden style={{ background: "var(--orange)", color: "var(--paper)" }}>!</span>
          <span>
            <strong>Data is more than 3 weeks old.</strong> The numbers below reflect a stale snapshot. Re-upload
            the latest CSV exports to refresh.
          </span>
        </div>
      )}

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
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--dim)", fontStyle: "italic" }}>
            The reallocation table and insights below are locked to the April 2026 brief. They do not auto-update
            from new CSV data — edit the source files when the period rolls.
          </div>
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
