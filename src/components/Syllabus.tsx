"use client";

import Link from "next/link";
import { modules } from "@/data/modules";
import { PARTS } from "@/data/parts";
import { readMinutes } from "@/lib/content";
import { nextModule } from "@/lib/gamification";
import { useProgress } from "@/lib/progress";

export default function Syllabus() {
  const p = useProgress();
  const next = nextModule(p);
  return (
    <div className="grid gap-5">
      {PARTS.map((part) => {
        const items = modules.filter((m) => m.part === part.id);
        const doneCount = items.filter((m) => p.completedModules.includes(m.id)).length;
        return (
          <section key={part.id} aria-labelledby={`part-${part.id}`} className="reading grid md:grid-cols-[15rem_1fr]">
            <div className="border-b border-line p-5 md:border-b-0 md:border-r">
              <p className="mono text-3xl font-bold text-accent">{part.numeral}</p>
              <h3 id={`part-${part.id}`} className="display mt-1 text-2xl">{part.title}</h3>
              <p className="mt-2 text-[15px] leading-snug text-fg-muted">{part.blurb}</p>
              <p className="mono mt-3 text-[11px] text-fg-muted">{doneCount} / {items.length} done</p>
            </div>
            <ol className="divide-y divide-line">
              {items.map((m) => {
                const idx = modules.indexOf(m) + 1;
                const done = p.completedModules.includes(m.id);
                const score = p.quizScores[m.id];
                const isNext = next?.id === m.id;
                return (
                  <li key={m.id}>
                    <Link
                      href={`/course/${m.id}`}
                      className={`t100 group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 border-l-4 px-4 py-4 hover:bg-raised ${isNext ? "border-accent bg-raised" : "border-transparent"}`}
                    >
                      <span className={`mono text-sm font-bold ${done ? "text-gain" : "text-accent"}`}>{done ? "✓" : String(idx).padStart(2, "0")}</span>
                      <span>
                        <span className="block text-xl font-bold leading-tight text-fg">{m.title}</span>
                        <span className="mt-1 block max-w-xl text-[15px] leading-snug text-fg-muted">{m.lede}</span>
                      </span>
                      <span className="mono text-right text-xs">
                        {isNext && <span className="mb-1 block bg-accent px-1.5 py-0.5 text-center font-bold text-accent-ink">NEXT</span>}
                        {done ? (
                          <span className="font-semibold text-gain" aria-label={`Completed, quiz score ${score}%`}>{score}%</span>
                        ) : (
                          <span className="text-fg-muted">{readMinutes(m)} min</span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
