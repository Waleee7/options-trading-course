"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { GLOSSARY_CATEGORIES, glossary } from "@/data/glossary";
import type { GlossaryCategory } from "@/data/types";

export default function GlossaryBrowser() {
  const uid = useId();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<GlossaryCategory | "all">("all");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return glossary
      .filter((g) => (cat === "all" || g.category === cat) && (!needle || g.term.toLowerCase().includes(needle) || g.definition.toLowerCase().includes(needle)))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [q, cat]);

  const cats = Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[];
  return (
    <div>
      <div className="grid gap-4 border-y-2 border-ink py-5 md:grid-cols-[20rem_1fr] md:items-end">
        <div>
          <label htmlFor={uid} className="label">Search terms</label>
          <input
            id={uid}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="theta, breakeven, assignment"
            className="mono mt-1 w-full border-2 border-ink bg-paper px-3 py-2.5 text-base text-ink placeholder:text-muted"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(["all", ...cats] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={`t100 mono border-2 border-ink px-3 py-2 text-xs font-semibold ${cat === c ? "bg-ink text-paper" : "text-ink hover:bg-paper-2"}`}
            >
              {c === "all" ? "All" : GLOSSARY_CATEGORIES[c]}
            </button>
          ))}
        </div>
      </div>
      <p className="mono mt-4 text-xs text-muted" role="status">{list.length} of {glossary.length} terms</p>
      <dl className="mt-2">
        {list.map((g) => (
          <div key={g.id} className="grid gap-1 border-b border-rule py-4 md:grid-cols-[16rem_1fr_auto] md:gap-8">
            <dt className="font-serif text-xl font-bold text-ink">
              {g.term}
              <span className="mono ml-2 text-[10px] font-normal uppercase tracking-widest text-muted">{GLOSSARY_CATEGORIES[g.category]}</span>
            </dt>
            <dd className="text-[17px] leading-snug">{g.definition}</dd>
            <dd>
              {g.module && (
                <Link href={`/course/${g.module}`} className="link mono text-xs">Lesson →</Link>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {list.length === 0 && <p className="mt-6 text-lg">No term matches. Try a shorter search.</p>}
    </div>
  );
}
