"use client";

import Link from "next/link";
import { modules } from "@/data/modules";
import { PARTS } from "@/data/parts";
import { readMinutes } from "@/lib/content";
import { useProgress } from "@/lib/progress";

export default function Syllabus() {
  const p = useProgress();
  return (
    <div>
      {PARTS.map((part) => {
        const items = modules.filter((m) => m.part === part.id);
        return (
          <section key={part.id} aria-labelledby={`part-${part.id}`} className="grid gap-4 border-t-2 border-ink py-8 md:grid-cols-[15rem_1fr] md:gap-10">
            <div>
              <p className="mono text-4xl font-bold text-accent">{part.numeral}</p>
              <h3 id={`part-${part.id}`} className="display mt-1 text-2xl">{part.title}</h3>
              <p className="mt-2 max-w-xs text-[15px] leading-snug text-muted">{part.blurb}</p>
            </div>
            <ol className="divide-y divide-rule border-y border-rule">
              {items.map((m) => {
                const idx = modules.indexOf(m) + 1;
                const done = p.completedModules.includes(m.id);
                const score = p.quizScores[m.id];
                return (
                  <li key={m.id}>
                    <Link href={`/course/${m.id}`} className="t100 group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 px-1 py-3.5 hover:bg-ink hover:text-paper sm:grid-cols-[2.5rem_1fr_auto_auto] sm:px-3">
                      <span className="mono text-sm text-accent group-hover:text-accent-bright">{String(idx).padStart(2, "0")}</span>
                      <span>
                        <span className="block font-serif text-xl font-bold leading-tight text-ink group-hover:text-paper">{m.title}</span>
                        <span className="mt-0.5 block max-w-xl text-[15px] leading-snug text-muted group-hover:text-on-ink-muted">{m.lede}</span>
                      </span>
                      <span className="mono hidden text-xs text-muted group-hover:text-on-ink-muted sm:block">{readMinutes(m)} min</span>
                      <span className="mono text-right text-xs font-semibold text-ink group-hover:text-paper">
                        {done ? <span aria-label={`Completed, quiz score ${score}%`}>✓ {score}%</span> : <span className="text-muted group-hover:text-on-ink-muted">{m.xp} XP</span>}
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
