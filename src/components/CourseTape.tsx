"use client";

import { useSyncExternalStore } from "react";

/** Course reminders only: no prices, no headlines, no fabricated market data. */
export const TAPE_ITEMS = [
  "1 contract = 100 shares",
  "Know your max loss in dollars before you enter",
  "Call breakeven = strike + premium",
  "Right on direction can still lose to IV crush",
  "The bid-ask spread is a cost on every round trip",
  "Theta accelerates into expiry",
  "High IV is not a sell signal",
  "Size by max loss, not by credit",
  "Write the exit before the entry",
  "Most traders lose money",
  "Educational only, not financial advice",
];

const KEY = "options-lab:v2:tape";
const listeners = new Set<() => void>();
const read = () => {
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const set = (on: boolean) => {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};

export default function CourseTape() {
  const on = useSyncExternalStore(subscribe, read, () => true);
  const doubled = [...TAPE_ITEMS, ...TAPE_ITEMS];
  return (
    <div className="tape border-b" style={{ borderColor: "var(--rule)", background: "rgba(233,229,216,0.7)" }} role="region" aria-label="Course tape">
      <div className="mx-auto flex h-8 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <span className="mono flex-none bg-ink px-2 py-0.5 text-[10px] font-bold tracking-widest text-paper">TAPE</span>
        {on ? (
          <div className="min-w-0 flex-1 overflow-hidden" aria-hidden>
            <div className="tape-run mono text-[11px] text-muted">
              {doubled.map((t, i) => (
                <span key={i} className="whitespace-nowrap pr-8">
                  <span style={{ color: "var(--accent)" }}>/</span> {t}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="mono min-w-0 flex-1 truncate text-[11px] text-muted">Tape hidden</span>
        )}
        <button
          type="button"
          aria-pressed={on}
          onClick={() => set(!on)}
          className="t100 mono flex-none border border-ink px-2 py-0.5 text-[10px] font-semibold text-ink hover:bg-ink hover:text-paper"
        >
          {on ? "Hide tape" : "Show tape"}
        </button>
      </div>
    </div>
  );
}
