"use client";

export default function InsightsPanel() {
  return (
    <div className="insights">
      <div className="insight">
        <div className="insight-num">Insight 01 · Headline</div>
        <div className="insight-title">Spend rank is inversely correlated with efficiency.</div>
        <div className="insight-body">
          Our top three spend lines — <strong>121CC</strong> ($3,582), <strong>MRC</strong> ($3,291),{" "}
          <strong>OCMDO</strong> ($3,189) — are all in the bottom half of cost-per-paid-lead. Meanwhile{" "}
          <strong>RLT Tomball</strong> at <code>$64/lead</code> gets the third-smallest budget.
        </div>
      </div>

      <div className="insight yellow">
        <div className="insight-num">Insight 02 · Targeting</div>
        <div className="insight-title">Every academy has misaligned ad targeting.</div>
        <div className="insight-body">
          Average misalignment score: <strong>97 out of a possible 200</strong>. Worst offenders:{" "}
          <strong>FLC</strong> (157), <strong>121CC</strong> (141), <strong>CCE</strong> (138),{" "}
          <strong>MBBC</strong> (134). At MBBC, <code>39%</code> of clicks went to Trailblazers — a program the
          academy doesn't even offer.{" "}
          <strong>Realigning ad groups to actual classroom gaps is the highest-leverage zero-cost move on this brief.</strong>{" "}
          Click any academy row to see the mismatch.
        </div>
      </div>

      <div className="insight">
        <div className="insight-num">Insight 03 · Capacity</div>
        <div className="insight-title">Open capacity isn't where you'd guess.</div>
        <div className="insight-body">
          <strong>FBCG Greenwood (25.2)</strong> and <strong>VCC (25.2)</strong> have the most open seats in the
          portfolio. Both are underfunded. <strong>SM (2)</strong> and <strong>MBBC (5)</strong> have almost no
          room — adding spend there is wasted capacity.
        </div>
      </div>

      <div className="insight">
        <div className="insight-num">Insight 04 · Hands off</div>
        <div className="insight-title">VCC isn't a marketing problem.</div>
        <div className="insight-body">
          "Tours slowing" is downstream of marketing. VCC has the <strong>lowest CPC ($2.01)</strong> and{" "}
          <strong>highest CTR (5.04%)</strong> in the portfolio at 71% paid dependency. The funnel is filling — the
          issue is what happens after the tour. (Side note: 25.2 FTE of open capacity, mostly Pre-K. Targeting
          score is 108 — fixable.)
        </div>
      </div>

      <div className="insight orange">
        <div className="insight-num">Insight 05 · Watch</div>
        <div className="insight-title">RCCO Arvada needs the growth team's attention, not ours.</div>
        <div className="insight-body">
          $144/lead is fine. Tour-to-registered collapsed from <code>93.5% → 35.7%</code> March YoY. With 15.4 FTE
          open and 6 incoming, they have the room — they're losing tours. Flag it across the table; it's not a
          budget question.
        </div>
      </div>
    </div>
  );
}
