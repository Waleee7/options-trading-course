"use client";

import { useId, useState } from "react";
import { money } from "./charts/scale";

export function sizeTrade(account: number, riskPct: number, maxLossPerContract: number) {
  const budget = (account * riskPct) / 100;
  const contracts = maxLossPerContract > 0 ? Math.floor(budget / maxLossPerContract) : 0;
  const atRisk = contracts * maxLossPerContract;
  return { budget, contracts, atRisk, pctOfAccount: account > 0 ? (atRisk / account) * 100 : 0 };
}

export default function SizingCalculator() {
  const uid = useId();
  const [account, setAccount] = useState(50000);
  const [riskPct, setRiskPct] = useState(1);
  const [loss, setLoss] = useState(306);

  const r = sizeTrade(account, riskPct, loss);
  const streak = Math.pow(1 - riskPct / 100, 10) * 100;

  const field = "mono w-full border-2 border-paper bg-transparent px-3 py-2 text-base text-paper";
  return (
    <section className="panel on-ink my-10 p-4 sm:p-6" aria-labelledby={`${uid}-t`}>
      <p className="label">Calculator</p>
      <h4 id={`${uid}-t`} className="mt-1 font-mono text-base font-semibold text-paper">
        How many contracts fit your plan?
      </h4>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="label">Account ($)</span>
          <input className={field} type="number" inputMode="decimal" min={0} step={1000} value={account} onChange={(e) => setAccount(Math.max(0, Number(e.target.value)))} />
        </label>
        <label className="block">
          <span className="label">Risk per trade (%)</span>
          <input className={field} type="number" inputMode="decimal" min={0.1} max={100} step={0.25} value={riskPct} onChange={(e) => setRiskPct(Math.min(100, Math.max(0, Number(e.target.value))))} />
        </label>
        <label className="block">
          <span className="label">Max loss per contract ($)</span>
          <input className={field} type="number" inputMode="decimal" min={1} step={10} value={loss} onChange={(e) => setLoss(Math.max(0, Number(e.target.value)))} />
        </label>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: "var(--ink-3)" }} aria-live="polite">
        {[
          ["Risk budget", money(r.budget)],
          ["Contracts", String(r.contracts)],
          ["Dollars at risk", money(r.atRisk)],
          ["10 straight losses leave", `${streak.toFixed(1)}%`],
        ].map(([k, v]) => (
          <div key={k} className="p-3" style={{ background: "var(--ink)" }}>
            <dt className="label">{k}</dt>
            <dd className="mono mt-1 text-lg font-bold" style={{ color: k === "Contracts" && r.contracts === 0 ? "var(--accent-bright)" : "var(--on-ink)" }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      {r.contracts === 0 && loss > 0 && (
        <p className="mono mt-4 text-sm" style={{ color: "var(--accent-bright)" }}>
          Zero contracts fit. The trade is too large for this plan. Narrow it, or skip it. Do not round up.
        </p>
      )}
    </section>
  );
}
