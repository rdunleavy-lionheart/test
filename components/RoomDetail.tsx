"use client";

import type { Academy } from "@/lib/types";
import TargetingChart from "./TargetingChart";

export default function RoomDetail({ academy }: { academy: Academy }) {
  if (!academy.rooms) {
    return (
      <div className="detail-content">
        <em style={{ color: "var(--dim)" }}>No classroom-level data available for this academy.</em>
      </div>
    );
  }
  const netDelta = academy.incoming_fte - academy.withdraw_fte;

  return (
    <div className="detail-content">
      <div className="detail-grid">
        <div className="detail-section">
          <h4>Classroom-Level Capacity</h4>
          <table className="room-table">
            <thead>
              <tr>
                <th>Room</th>
                <th className="numeric">FTE</th>
                <th className="numeric">Budget</th>
                <th>Fill</th>
                <th className="numeric">Gap</th>
              </tr>
            </thead>
            <tbody>
              {academy.rooms.map((r) => {
                const pct = r.budget > 0 ? Math.min(100, (r.fte / r.budget) * 100) : 0;
                const over = r.gap < 0;
                return (
                  <tr key={r.short}>
                    <td className="room-name">{r.name}</td>
                    <td className="numeric">{r.fte.toFixed(1)}</td>
                    <td className="numeric">{r.budget.toFixed(1)}</td>
                    <td>
                      <div className="gap-bar-wrap">
                        <div className={`gap-bar ${over ? "over" : ""}`} style={{ width: `${over ? 100 : pct}%` }} />
                      </div>
                    </td>
                    <td className="numeric">
                      {r.gap === 0 ? (
                        <span className="gap-zero">FULL</span>
                      ) : r.gap > 0 ? (
                        <span className="gap-positive">+{r.gap.toFixed(1)} open</span>
                      ) : (
                        <span className="gap-over">{r.gap.toFixed(1)} over</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pipeline-strip">
            <div className="pipe-item">
              <div className="pipe-label">Open Capacity</div>
              <div className="pipe-value">{academy.open_capacity.toFixed(1)}</div>
              <div className="pipe-sub">FTE seats available</div>
            </div>
            <div className="pipe-item">
              <div className="pipe-label">Incoming</div>
              <div className="pipe-value">+{academy.incoming_enr}</div>
              <div className="pipe-sub">{academy.incoming_fte} FTE confirmed</div>
            </div>
            <div className="pipe-item">
              <div className="pipe-label">Withdrawals</div>
              <div className="pipe-value">−{academy.withdrawals}</div>
              <div className="pipe-sub">{academy.withdraw_fte} FTE leaving</div>
            </div>
            <div className="pipe-item">
              <div className="pipe-label">Net Δ</div>
              <div className="pipe-value">
                {netDelta >= 0 ? "+" : ""}
                {netDelta.toFixed(1)}
              </div>
              <div className="pipe-sub">FTE pipeline</div>
            </div>
          </div>
        </div>

        <TargetingChart academy={academy} />
      </div>
    </div>
  );
}
