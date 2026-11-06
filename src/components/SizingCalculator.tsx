"use client";

import { useId, useState } from "react";
import { parseAmount, sizeTrade } from "@/lib/sizing";
import { money } from "./charts/scale";

export default function SizingCalculator() {
  const uid = useId();
  const [accountText, setAccount] = useState("50000");
  const [riskText, setRisk] = useState("1");
  const [lossText, setLoss] = useState("306");

  // the fields keep what was typed, so clearing one leaves it empty instead of a stuck 0
  const account = parseAmount(accountText);
  const riskPct = parseAmount(riskText, 100);
  const loss = parseAmount(lossText);
  const incomplete = account === 0 || riskPct === 0 || loss === 0;

  const r = sizeTrade(account, riskPct, loss);
  const streak = Math.pow(1 - riskPct / 100, 10) * 100;

  const field = "mono w-full border-2 border-fg bg-transparent px-3 py-2 text-base text-fg";
  return (
    <section className="panel my-10 p-4 sm:p-6" aria-labelledby={`${uid}-t`}>
      <p className="label">Calculator</p>
      <h4 id={`${uid}-t`} className="mt-1 font-mono text-base font-semibold text-fg">
        How many contracts fit your plan?
      </h4>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="label">Account ($)</span>
          <input className={field} type="number" inputMode="decimal" min={0} step={1000} value={accountText} onChange={(e) => setAccount(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Risk per trade (%)</span>
          <input className={field} type="number" inputMode="decimal" min={0.1} max={100} step={0.25} value={riskText} onChange={(e) => setRisk(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Max loss per contract ($)</span>
          <input className={field} type="number" inputMode="decimal" min={1} step={10} value={lossText} onChange={(e) => setLoss(e.target.value)} />
        </label>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: "var(--line)" }} aria-live="polite">
        {[
          ["Risk budget", money(r.budget)],
          ["Contracts", String(r.contracts)],
          ["Dollars at risk", money(r.atRisk)],
          ["10 straight losses leave", `${streak.toFixed(1)}%`],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0 p-3" style={{ background: "var(--deep)" }}>
            <dt className="label">{k}</dt>
            <dd className="mono mt-1 break-words text-lg font-bold" style={{ color: k === "Contracts" && r.contracts === 0 ? "var(--accent)" : "var(--fg)" }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      {incomplete && (
        <p className="mono mt-4 text-sm text-fg-muted">Enter your account size, risk and max loss above to see how many contracts fit.</p>
      )}
      {!incomplete && r.contracts === 0 && (
        <p className="mono mt-4 text-sm" style={{ color: "var(--accent)" }}>
          Zero contracts fit. The trade is too large for this plan. Narrow it, or skip it. Do not round up.
        </p>
      )}
    </section>
  );
}
