"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { parseCsv } from "@/lib/processor";
import type { CsvRow } from "@/lib/processor";

type Props = {
  label: string;
  description: string;
  onParsed: (rows: CsvRow[], file: File) => void;
  loadedFile?: { name: string; rowCount: number } | null;
  diagnostic?: { matched: number; total: number; unmatched: string[] } | null;
};

export default function CsvUploader({ label, description, onParsed, loadedFile, diagnostic }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const rows = await parseCsv(file);
      onParsed(rows, file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV");
    } finally {
      setBusy(false);
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const cls = ["upload-zone", drag ? "drag" : "", loadedFile ? "loaded" : "", error ? "error" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
    >
      <h3>{label}</h3>
      <p>{description}</p>
      <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onChange} style={{ display: "none" }} />
      {busy && <div className="row-count">Parsing…</div>}
      {loadedFile && !busy && (
        <>
          <div className="filename">{loadedFile.name}</div>
          <div className="row-count">{loadedFile.rowCount.toLocaleString()} rows</div>
          {diagnostic && <DiagnosticLine d={diagnostic} />}
        </>
      )}
      {!loadedFile && !busy && <div className="row-count">Drag CSV here, or click to browse</div>}
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

function DiagnosticLine({ d }: { d: { matched: number; total: number; unmatched: string[] } }) {
  if (d.total === 0) {
    return <div className="diag diag-bad">No usable rows — header column not found</div>;
  }
  if (d.matched === 0) {
    return (
      <div className="diag diag-bad">
        0 of {d.total} mapped — check headers or update mappings in /settings
        {d.unmatched.length > 0 && <div className="diag-list">e.g. {d.unmatched.slice(0, 3).join(" · ")}</div>}
      </div>
    );
  }
  if (d.matched < d.total) {
    return (
      <div className="diag diag-warn">
        {d.matched} of {d.total} mapped · {d.unmatched.length} unmatched
        {d.unmatched.length > 0 && (
          <div className="diag-list">unmatched: {d.unmatched.slice(0, 3).join(" · ")}{d.unmatched.length > 3 ? ` (+${d.unmatched.length - 3})` : ""}</div>
        )}
      </div>
    );
  }
  return <div className="diag diag-good">{d.matched} of {d.total} mapped</div>;
}
