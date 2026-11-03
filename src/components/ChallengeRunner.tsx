"use client";

import { useState } from "react";
import { OUTCOME_LABEL, classify, scenarioPnL, scenarios, type Outcome } from "@/data/challenges";
import { recordChallenge, useProgress } from "@/lib/progress";
import PayoffExplorer from "./charts/PayoffExplorer";
import { money } from "./charts/scale";

const ORDER: Outcome[] = ["gain", "loss", "flat"];

export default function ChallengeRunner() {
  const progress = useProgress();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Outcome | null>(null);
  const [gained, setGained] = useState(0);
  const [score, setScore] = useState(0);

  const s = scenarios[i];
  const done = i >= scenarios.length;

  if (done) {
    return (
      <div className="reveal">
        <p className="label">Challenge complete</p>
        <p className="display mt-2 text-6xl">{score}/{scenarios.length}</p>
        <p className="mono mt-3 text-sm text-muted">
          Total XP so far: {progress.totalXp}. Scenarios are scored by the same pricing engine as the charts, not by opinion.
        </p>
        <button type="button" className="btn mt-6" onClick={() => { setI(0); setPicked(null); setScore(0); setGained(0); }}>
          Run it again
        </button>
      </div>
    );
  }

  const pnl = scenarioPnL(s);
  const actual = classify(pnl);
  const right = picked === actual;

  const choose = (o: Outcome) => {
    if (picked) return;
    setPicked(o);
    const g = recordChallenge(s.id, o === actual, s.xp);
    setGained(g);
    if (o === actual) setScore((x) => x + 1);
  };

  return (
    <article key={s.id}>
      <div className="flex items-center justify-between">
        <p className="label">Scenario {i + 1} of {scenarios.length}</p>
        <p className="mono text-xs text-muted">{s.xp} XP</p>
      </div>
      <h2 className="display mt-3 text-4xl sm:text-5xl">{s.title}</h2>
      <dl className="mt-6 grid gap-px border-2 border-ink bg-ink sm:grid-cols-2">
        <div className="bg-paper p-4">
          <dt className="label">What you did</dt>
          <dd className="mt-1 text-[17px] leading-snug">{s.setup}</dd>
        </div>
        <div className="bg-paper p-4">
          <dt className="label">What happened</dt>
          <dd className="mt-1 text-[17px] leading-snug">{s.event}</dd>
        </div>
      </dl>
      <h3 className="mt-8 font-serif text-2xl font-bold text-ink">{s.question}</h3>
      <div role="radiogroup" aria-label="Your prediction" className="mt-4 grid gap-3 sm:grid-cols-3">
        {ORDER.map((o) => {
          const state = !picked ? "idle" : o === actual ? "right" : o === picked ? "wrong" : "dim";
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={picked === o}
              disabled={!!picked}
              onClick={() => choose(o)}
              className="t100 border-2 px-4 py-4 text-left font-mono text-sm font-semibold disabled:cursor-default"
              style={{
                borderColor: state === "right" ? "var(--gain)" : state === "wrong" ? "var(--accent)" : "var(--ink)",
                background: state === "right" ? "var(--gain)" : state === "wrong" ? "var(--accent)" : "transparent",
                color: state === "right" || state === "wrong" ? "var(--paper)" : state === "dim" ? "var(--muted)" : "var(--ink)",
              }}
            >
              {OUTCOME_LABEL[o]}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="reveal mt-8" role="status">
          <p className="mono text-sm font-bold" style={{ color: right ? "var(--gain)" : "var(--accent)" }}>
            {right ? `CORRECT${gained ? ` +${gained} XP` : ""}` : "NOT QUITE"} - model P&amp;L per contract: {money(pnl, { sign: true })}
          </p>
          <p className="mt-2 max-w-2xl text-lg leading-snug">{s.explanation}</p>
          <PayoffExplorer preset={s.preset} start={s.now} caption="The chart is open at this exact scenario. Drag, scrub, and change IV to see what else could have happened." />
          <button
            type="button"
            className="btn"
            onClick={() => {
              setI(i + 1);
              setPicked(null);
              setGained(0);
            }}
            autoFocus
          >
            {i < scenarios.length - 1 ? "Next scenario →" : "Finish →"}
          </button>
        </div>
      )}
    </article>
  );
}
