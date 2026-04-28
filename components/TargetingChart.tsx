"use client";

import type { Academy } from "@/lib/types";
import { capacityByBand } from "@/lib/format";

const BAND_LABELS: Record<string, string> = {
  Inf: "Infants",
  TT: "Toddlers/Twos",
  PS: "Preschool",
  SA: "Trailblazers",
};
const BAND_COLORS: Record<string, string> = {
  Inf: "var(--blue)",
  TT: "var(--yellow)",
  PS: "var(--green)",
  SA: "var(--orange)",
};

export default function TargetingChart({ academy }: { academy: Academy }) {
  const cap = capacityByBand(academy.rooms);
  const totalCap = cap.Inf + cap.TT + cap.PS + cap.SA;
  const totalClicks = academy.ages.Inf + academy.ages.TT + academy.ages.PS + academy.ages.SA;
  const bands: ("Inf" | "TT" | "PS" | "SA")[] = ["Inf", "TT", "PS", "SA"];

  const m = academy.misalign;
  const note = m > 100 ? (
    <span style={{ color: "var(--orange)" }}>— significant gap</span>
  ) : m > 60 ? (
    <span style={{ color: "#b88800" }}>— moderate</span>
  ) : (
    <span style={{ color: "var(--green-d)" }}>— good alignment</span>
  );

  return (
    <div className="detail-section">
      <h4>Ad Targeting vs. Actual Capacity</h4>
      <div className="targeting-comparison">
        {bands.map((b) => {
          const capPct = totalCap > 0 ? (cap[b] / totalCap) * 100 : 0;
          const clkPct = totalClicks > 0 ? (academy.ages[b] / totalClicks) * 100 : 0;
          const diff = clkPct - capPct;
          const showNote = Math.abs(diff) > 20;
          return (
            <div className="target-row" key={b}>
              <div className="target-label">
                <strong>{BAND_LABELS[b]}</strong>
                <span>
                  {showNote && (
                    <span style={{ color: "var(--orange)", fontWeight: 600 }}>
                      {diff > 0 ? `+${diff.toFixed(0)} over-targeted` : `${diff.toFixed(0)} under-targeted`}
                    </span>
                  )}
                </span>
              </div>
              <div className="target-bars">
                <div className="target-bar-row">
                  <span className="bar-label">Capacity</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${capPct}%`, background: BAND_COLORS[b] }} />
                  </div>
                  <span className="bar-pct">{capPct.toFixed(0)}%</span>
                </div>
                <div className="target-bar-row">
                  <span className="bar-label">Clicks</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${clkPct}%`, background: BAND_COLORS[b], opacity: 0.5 }}
                    />
                  </div>
                  <span className="bar-pct">{clkPct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid var(--rule)",
            fontSize: 12,
            color: "var(--brown)",
          }}
        >
          Misalignment score: <strong>{m}</strong> {note}
        </div>
      </div>
    </div>
  );
}
