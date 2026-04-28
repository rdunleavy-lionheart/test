"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_MAPPINGS, loadMappings, resetMappings, saveMappings } from "@/lib/mappings";
import type { Mappings } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const m = loadMappings();
    setText(JSON.stringify(m, null, 2));
  }, []);

  function onSave() {
    setError(null);
    try {
      const parsed = JSON.parse(text) as Mappings;
      if (
        typeof parsed !== "object" ||
        !parsed.campaignToCode ||
        !parsed.centerNameToCode ||
        !parsed.csvCodeToCode
      ) {
        setError(
          "Expected three top-level objects: campaignToCode, centerNameToCode, csvCodeToCode."
        );
        return;
      }
      saveMappings(parsed);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  function onReset() {
    resetMappings();
    setText(JSON.stringify(DEFAULT_MAPPINGS, null, 2));
    setSavedAt(null);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <div className="container-page">
      <div className="masthead">
        <div className="brand-lockup">
          <div className="brand-mark">
            li<span className="leaf">o</span>nheart
          </div>
          <div className="brand-tag">Settings · Column Mappings</div>
        </div>
        <div className="header-actions">
          <Link href="/dashboard" className="btn-link">Dashboard</Link>
          <Link href="/upload" className="btn-link">Upload</Link>
          <button className="btn-link" onClick={logout}>Sign out</button>
        </div>
      </div>

      <h1 className="headline">Edit campaign + center mappings</h1>
      <div className="deck">
        These maps translate the names in each CSV (Google Ads campaign, lead-source center name, FTE academy
        code) into the canonical Lionheart academy code used everywhere in the dashboard. Update this when a new
        academy is added or a campaign is renamed.
      </div>

      <div className="field">
        <label>mappings.json</label>
        <textarea className="json-editor" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn-submit" style={{ width: "auto", padding: "11px 22px" }} onClick={onSave}>
          Save mappings
        </button>
        <button className="btn-link" onClick={onReset}>
          Reset to defaults
        </button>
        {savedAt && <span style={{ color: "var(--green-d)", fontSize: 12 }}>Saved at {savedAt}</span>}
        {error && <span className="error-msg">{error}</span>}
      </div>
    </div>
  );
}
