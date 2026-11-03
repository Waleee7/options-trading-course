"use client";

import Link from "next/link";
import { modules } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { BADGES, getNextRank, getRank, nextModule } from "@/lib/gamification";

/** Hero call to action: starts at the truth, then always points at the next unfinished lesson. */
export function StartButton() {
  const p = useProgress();
  const next = nextModule(p);
  const started = p.completedModules.length > 0;
  if (!next) return <Link href="/complete" className="btn">See your results →</Link>;
  return (
    <Link href={`/course/${next.id}`} className="btn">
      {started ? `Continue: ${next.title}` : "Start with the truth"} →
    </Link>
  );
}

/** Where you are, what is next, and how far you have come. */
export default function ProgressStrip() {
  const p = useProgress();
  const rank = getRank(p.totalXp);
  const upcoming = getNextRank(p.totalXp);
  const done = p.completedModules.filter((id) => modules.some((m) => m.id === id)).length;
  const pct = Math.round((done / modules.length) * 100);
  const next = nextModule(p);
  const earned = BADGES.filter((b) => b.check(p));

  return (
    <section aria-label="Your progress" className="border-y border-line-strong bg-deep">
      <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="bg-deep px-4 py-4 sm:px-6">
          <p className="label">Up next</p>
          {next ? (
            <Link href={`/course/${next.id}`} className="t100 group mt-1 block">
              <span className="mono text-xs text-accent">{String(modules.indexOf(next) + 1).padStart(2, "0")} / {modules.length}</span>
              <span className="block text-xl font-bold leading-tight text-fg group-hover:text-accent">{next.title} →</span>
            </Link>
          ) : (
            <Link href="/complete" className="mt-1 block text-xl font-bold text-fg">Course complete. See your results →</Link>
          )}
        </div>
        {[
          ["Rank", rank.title],
          ["XP", `${p.totalXp}${upcoming ? ` / ${upcoming.minXp}` : ""}`],
          ["Streak", `${p.currentStreak} day${p.currentStreak === 1 ? "" : "s"}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-deep px-4 py-4 sm:px-6">
            <p className="label">{k}</p>
            <p className="mono mt-1 text-xl font-bold text-fg">{v}</p>
          </div>
        ))}
      </div>
      <div className="h-1.5 w-full bg-line" role="progressbar" aria-label="Course completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="fill-bar h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="mono text-xs font-semibold text-fg">{done} of {modules.length} modules</span>
        {earned.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Earned marks">
            {earned.map((b) => (
              <li key={b.id} title={b.description} className="mono flex items-center gap-2 border border-line-strong px-2 py-0.5 text-[11px] font-semibold text-fg">
                <span className="bg-accent px-1.5 text-accent-ink">{b.mark}</span>
                {b.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
