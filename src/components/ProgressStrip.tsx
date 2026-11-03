"use client";

import { modules } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { BADGES, getNextRank, getRank } from "@/lib/gamification";

export default function ProgressStrip() {
  const p = useProgress();
  const rank = getRank(p.totalXp);
  const next = getNextRank(p.totalXp);
  const done = p.completedModules.filter((id) => modules.some((m) => m.id === id)).length;
  const pct = Math.round((done / modules.length) * 100);
  const earned = BADGES.filter((b) => b.check(p));

  return (
    <section aria-label="Your progress" className="border-y-2 border-ink">
      <div className="grid gap-px bg-rule sm:grid-cols-4">
        {[
          ["Rank", rank.title],
          ["XP", `${p.totalXp}${next ? ` / ${next.minXp}` : ""}`],
          ["Modules", `${done} / ${modules.length}`],
          ["Streak", `${p.currentStreak} day${p.currentStreak === 1 ? "" : "s"}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-paper px-4 py-3">
            <p className="label">{k}</p>
            <p className="mono mt-1 text-lg font-bold text-ink">{v}</p>
          </div>
        ))}
      </div>
      <div className="h-1.5 w-full bg-paper-3" role="progressbar" aria-label="Course completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="h-full bg-ink" style={{ width: `${pct}%`, transition: "width 100ms ease-out" }} />
      </div>
      {earned.length > 0 && (
        <ul className="flex flex-wrap gap-2 px-4 py-3" aria-label="Earned marks">
          {earned.map((b) => (
            <li key={b.id} title={b.description} className="mono flex items-center gap-2 border-2 border-ink px-2 py-1 text-xs font-semibold text-ink">
              <span className="bg-ink px-1.5 text-paper">{b.mark}</span>
              {b.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
