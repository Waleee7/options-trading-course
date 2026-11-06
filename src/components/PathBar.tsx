"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { modules } from "@/data/modules";
import { useProgress } from "@/lib/progress";

/** Sixteen steps. Finished ones are filled, the current one is outlined, the rest are quiet. */
export default function PathBar({ current }: { current: number }) {
  const p = useProgress();
  const done = p.completedModules.filter((id) => modules.some((m) => m.id === id)).length;
  return (
    <nav aria-label="Course path" className="mb-3">
      <p className="mono mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs text-fg-muted">
        <span>
          <span className="font-bold text-fg">Step {current + 1} of {modules.length}</span> - {done} finished
        </span>
        <span>{Math.round((done / modules.length) * 100)}% of the course</span>
      </p>
      {/* two rows on a phone, so each step stays big enough to tap */}
      <ol className="grid grid-cols-8 gap-x-[3px] sm:grid-cols-[repeat(var(--steps),minmax(0,1fr))]" style={{ "--steps": modules.length } as CSSProperties}>
        {modules.map((m, i) => {
          const isDone = p.completedModules.includes(m.id);
          const isCur = i === current;
          return (
            <li key={m.id}>
              <Link
                href={`/course/${m.id}`}
                title={`${i + 1}. ${m.title}`}
                aria-label={`${i + 1}. ${m.title}${isDone ? ", finished" : ""}${isCur ? ", you are here" : ""}`}
                aria-current={isCur ? "step" : undefined}
                className="t100 block py-1.5"
              >
                <span
                  className="block h-3"
                  style={{
                    background: isDone ? "var(--accent)" : isCur ? "var(--bg)" : "var(--line)",
                    border: isCur ? "2px solid var(--accent)" : "none",
                  }}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
