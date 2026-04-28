"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandMark from "@/components/BrandMark";
import CsvUploader from "@/components/CsvUploader";
import { loadMappings } from "@/lib/mappings";
import { mergeAcademies, saveStored } from "@/lib/processor";
import type { CsvRow } from "@/lib/processor";
import { buildSampleStored } from "@/lib/sample";

type Loaded = { name: string; rowCount: number; rows: CsvRow[] } | null;

export default function UploadPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Loaded>(null);
  const [leads, setLeads] = useState<Loaded>(null);
  const [fte, setFte] = useState<Loaded>(null);
  const [conv, setConv] = useState<Loaded>(null);
  const [error, setError] = useState<string | null>(null);

  const allReady = ads && leads && fte && conv;

  function build() {
    if (!allReady) return;
    setError(null);
    try {
      const mappings = loadMappings();
      const academies = mergeAcademies({
        ads: ads.rows,
        leads: leads.rows,
        fte: fte.rows,
        conv: conv.rows,
        mappings,
      });
      if (academies.length === 0) {
        setError("No academies could be matched. Check your column headers and the campaign/center mapping in /settings.");
        return;
      }
      saveStored({ academies, uploadedAt: new Date().toISOString() });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build dashboard data");
    }
  }

  function loadDemo() {
    saveStored(buildSampleStored());
    router.push("/dashboard");
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <div className="container-page">
      <div className="masthead">
        <BrandMark tag="Marketing Allocation Brief" />
        <div className="header-actions">
          <Link href="/settings" className="btn-link">Mappings</Link>
          <button className="btn-link" onClick={logout}>Sign out</button>
        </div>
      </div>

      <h1 className="headline">Upload the four exports.</h1>
      <div className="deck">
        Drop each CSV into the matching slot. Column headers are matched flexibly — partial
        names work. Mapping for campaign-to-academy and center-to-academy is editable in{" "}
        <Link href="/settings" style={{ color: "var(--green-d)", textDecoration: "underline" }}>Settings</Link>.
      </div>

      <div className="upload-grid">
        <CsvUploader
          label="A · Google Ads Export"
          description="Campaign, Cost, Clicks, Avg. CPC, CTR, Impressions"
          loadedFile={ads ? { name: ads.name, rowCount: ads.rowCount } : null}
          onParsed={(rows, file) => setAds({ name: file.name, rowCount: rows.length, rows })}
        />
        <CsvUploader
          label="B · Lead Source Export"
          description="Center Name, Total Leads, Paid Lead"
          loadedFile={leads ? { name: leads.name, rowCount: leads.rowCount } : null}
          onParsed={(rows, file) => setLeads({ name: file.name, rowCount: rows.length, rows })}
        />
        <CsvUploader
          label="C · FTE / Classroom Roll"
          description="Academy, Enrollments, FTEs by classroom + budget"
          loadedFile={fte ? { name: fte.name, rowCount: fte.rowCount } : null}
          onParsed={(rows, file) => setFte({ name: file.name, rowCount: rows.length, rows })}
        />
        <CsvUploader
          label="D · Conversion Rates"
          description="Location Name, Lead→Tour & Tour→Registered (most recent month)"
          loadedFile={conv ? { name: conv.name, rowCount: conv.rowCount } : null}
          onParsed={(rows, file) => setConv({ name: file.name, rowCount: rows.length, rows })}
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn-submit" style={{ width: "auto", padding: "11px 22px" }} disabled={!allReady} onClick={build}>
          {allReady ? "Build dashboard" : "All four CSVs required"}
        </button>
        <button className="btn-link" onClick={loadDemo}>
          Load demo data
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
