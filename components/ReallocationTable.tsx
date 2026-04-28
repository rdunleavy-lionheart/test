"use client";

type Row = {
  action: "Cut" | "Add" | "Reserve";
  code: string;
  academy: string;
  delta: string;
  why: string;
};

const ROWS: Row[] = [
  { action: "Cut", code: "121CC", academy: "121 Community Church", delta: "−$1,500", why: "$299/lead. Highest misalignment (141): infants saturated, capacity in PS/PreK." },
  { action: "Cut", code: "OCMDO+OCTN", academy: "One Church Murfreesboro", delta: "−$1,500", why: "$290/lead, 1.3% CTR. Pause weaker, rebuild." },
  { action: "Cut", code: "MRC", academy: "Mercy Road Fortville", delta: "−$1,500", why: "23% over FTE budget. Staff turnover. No room." },
  { action: "Cut", code: "SM", academy: "Stone Myers Grapevine", delta: "−$500", why: "$256/lead, 1.25% CTR (worst). Only 2 FTE open." },
  { action: "Cut", code: "FLC", academy: "Five Lakes Sylvania", delta: "−$500", why: "$273/lead. Worst misalignment (157): 91% capacity in toddlers, 12% clicks." },
  { action: "Cut", code: "CHH", academy: "Community Commons Harrison", delta: "−$500", why: "$261/lead, only 4 paid leads." },
  { action: "Cut", code: "MBBC", academy: "MacArthur Blvd Irving", delta: "−$500", why: "Hold pending waitlist SOP fix. Only 5 FTE open." },
  { action: "Add", code: "RLT", academy: "Real Life Ministries Tomball", delta: "+$1,500", why: "$64/lead — best in portfolio." },
  { action: "Add", code: "FBCP", academy: "First Baptist Plano", delta: "+$1,500", why: "$102/lead, 13.4 open FTE, priority growth." },
  { action: "Add", code: "ACC", academy: "Academy Christian Colorado Springs", delta: "+$1,000", why: "$81/lead, 21.4 open FTE, top volume engine." },
  { action: "Add", code: "CCE", academy: "Cross City Euless", delta: "+$1,000", why: "April 20 I/T room (8 toddler seats). Time-boxed." },
  { action: "Add", code: "FBCG", academy: "First Baptist Greenwood", delta: "+$500", why: "$101/lead, 25.2 open FTE — most open capacity in portfolio." },
  { action: "Reserve", code: "—", academy: "Creative-rebuild fund", delta: "+$1,000", why: "For 121CC keyword shift & Murfreesboro rebuild." },
];

export default function ReallocationTable() {
  return (
    <div className="realloc">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Code</th>
            <th>Academy</th>
            <th className="numeric">Δ Spend</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => {
            const cls = r.action === "Cut" ? "cut" : r.action === "Add" ? "add" : "hold";
            return (
              <tr key={i} className={cls}>
                <td className="action">{r.action}</td>
                <td className="code">{r.code}</td>
                <td>{r.academy}</td>
                <td className="amount numeric">{r.delta}</td>
                <td>{r.why}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Net Change</td>
            <td className="numeric">$0</td>
            <td>~16% of budget repositioned</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
