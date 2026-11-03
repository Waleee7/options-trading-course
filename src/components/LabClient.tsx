"use client";

import { useState } from "react";
import { PRESETS, type PresetId } from "@/lib/options/strategies";
import PayoffExplorer from "./charts/PayoffExplorer";

const GROUPS: Array<{ title: string; ids: PresetId[] }> = [
  { title: "Single options", ids: ["long-call", "long-put", "earnings-call"] },
  { title: "Verticals", ids: ["bull-call-spread", "bear-put-spread", "bull-put-spread", "bear-call-spread"] },
  { title: "Income and range", ids: ["covered-call", "cash-secured-put", "iron-condor"] },
];

export default function LabClient() {
  const [id, setId] = useState<PresetId>("iron-condor");
  const p = PRESETS[id];
  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
      <nav aria-label="Strategies" className="grid content-start gap-5">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="label">{g.title}</p>
            <ul className="mt-2 grid grid-cols-2 gap-1 lg:grid-cols-1">
              {g.ids.map((x) => (
                <li key={x}>
                  <button
                    type="button"
                    aria-pressed={id === x}
                    onClick={() => setId(x)}
                    className={`t100 mono w-full border-2 border-line-strong px-2 py-2 text-left text-[11px] font-semibold sm:px-3 sm:text-xs ${id === x ? "bg-accent text-accent-ink !border-accent" : "text-fg hover:bg-surface"}`}
                  >
                    {PRESETS[x].name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div>
        <p className="max-w-2xl text-lg leading-snug">{p.blurb}</p>
        <PayoffExplorer key={id} preset={id} />
      </div>
    </div>
  );
}
