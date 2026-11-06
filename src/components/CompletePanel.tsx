"use client";

import Link from "next/link";
import { modules } from "@/data/modules";
import { scenarios } from "@/data/challenges";
import { resetProgress, useProgress } from "@/lib/progress";
import { BADGES, getNextRank, getRank } from "@/lib/gamification";
import { useState } from "react";

export default function CompletePanel() {
  const p = useProgress();
  const [confirm, setConfirm] = useState(false);
  const done = modules.filter((m) => p.completedModules.includes(m.id)).length;
  const all = done === modules.length;
  const rank = getRank(p.totalXp);
  const next = getNextRank(p.totalXp);
  const right = scenarios.filter((s) => p.challengeResults[s.id]).length;

  return (
    <div>
      <p className="label">{all ? "Course complete" : "Progress report"}</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">{all ? "You finished." : `${done} of ${modules.length} modules.`}</h1>
      <p className="mt-5 max-w-2xl text-xl leading-snug">
        {all
          ? "Finishing is not the same as being ready. The most useful next step is the unglamorous one: paper trade with a written plan, size to a fixed risk, and journal every trade."
          : "Pick up where you left off. The order is deliberate: mechanics before Greeks, Greeks before strategies, risk before everything."}
      </p>

      <div className="mt-10 grid gap-px border-2 border-line-strong bg-deep sm:grid-cols-4">
        {[
          ["Rank", rank.title],
          ["XP", `${p.totalXp}${next ? ` / ${next.minXp}` : ""}`],
          ["Challenge", `${right} / ${scenarios.length}`],
          ["Streak", `${p.currentStreak}d`],
        ].map(([k, v]) => (
          <div key={k} className="bg-canvas p-4">
            <p className="label">{k}</p>
            <p className="mono mt-1 text-2xl font-bold text-fg">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="display mt-14 text-3xl">Quiz scores</h2>
      <div className="ledger-wrap">
        <table className="ledger">
          <thead>
            <tr><th scope="col">Module</th><th scope="col">Score</th><th scope="col">XP</th></tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id}>
                <th scope="row"><Link href={`/course/${m.id}`} className="link">{m.title}</Link></th>
                <td>{p.quizScores[m.id] !== undefined ? `${p.quizScores[m.id]}%` : "-"}</td>
                <td>{p.moduleXp[m.id] ?? 0} / {m.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="display mt-14 text-3xl">Marks</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((b) => {
          const on = b.check(p);
          return (
            <li key={b.id} className="flex items-center gap-4 border-2 p-3" style={{ borderColor: on ? "var(--accent)" : "var(--line)" }}>
              <span className="mono grid h-12 w-12 flex-none place-items-center text-sm font-bold" style={{ background: on ? "var(--accent)" : "var(--raised)", color: on ? "var(--accent-ink)" : "var(--fg-muted)" }}>
                {b.mark}
              </span>
              <span>
                <span className="block text-lg font-bold leading-tight text-fg">{b.title}</span>
                <span className="mono block text-xs text-fg-muted">{on ? b.description : `Locked: ${b.description}`}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-14 flex flex-wrap items-center gap-3 border-t-2 border-line-strong pt-6">
        <Link href="/lab" className="btn">Open the strategy lab →</Link>
        <Link href="/challenge" className="btn btn-ghost">Run the challenge</Link>
        {confirm ? (
          <>
            <button type="button" className="btn" onClick={() => { resetProgress(); setConfirm(false); }}>Yes, erase my progress</button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>
          </>
        ) : (
          <button type="button" className="btn btn-ghost ml-auto" onClick={() => setConfirm(true)}>Reset progress</button>
        )}
      </div>
      <p className="mono mt-4 text-xs text-fg-muted">Progress is stored only in this browser. Nothing is sent anywhere.</p>
    </div>
  );
}
