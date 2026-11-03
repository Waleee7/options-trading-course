import { PREMIUMFLOOR_URL } from "@/data/site";
import Disclaimer from "./Disclaimer";

const LEAD: Record<string, string> = {
  "vertical-spreads": "Drawing a spread is easy. Managing one live is the skill.",
  "income-strategies": "Selling premium looks calm until the day it is not.",
  "iron-condors": "You know how a condor behaves. Execution is a different discipline.",
  "how-i-trade": "You have read the rulebook. Here is where I apply it.",
};

export function PremiumFloorLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <a href={PREMIUMFLOOR_URL} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
}

/** End-of-module card. Quiet by design: one idea, one link, one disclaimer. */
export default function PremiumFloorCard({ moduleId, variant }: { moduleId: string; variant: "compact" | "full" }) {
  const lead = LEAD[moduleId] ?? "Want to see the framework applied live?";
  const full = variant === "full";
  return (
    <aside aria-labelledby={`pf-${moduleId}`} className="panel mt-10 border-l-4 border-l-accent p-5 sm:p-7">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="label">PremiumFloor</p>
          <h2 id={`pf-${moduleId}`} className="display mt-2 text-2xl sm:text-4xl">
            {lead}
          </h2>
          <p className="mt-3 max-w-xl text-lg leading-snug text-fg-2">
            {full
              ? "PremiumFloor is where I share market analysis, options setups written as levels with confirmation and invalidation, education, and coaching built on this same process."
              : "PremiumFloor is where I share market analysis, options setups, education, and coaching built on this same process."}
          </p>
          {full && (
            <ul className="mono mt-4 grid gap-1 text-[13px] text-fg-muted">
              <li>- Watch-lists with levels, not hype</li>
              <li>- Every setup states what proves it wrong</li>
              <li>- Education alongside the analysis</li>
            </ul>
          )}
        </div>
        <PremiumFloorLink className="btn justify-center">
          Trade with Josh <span aria-hidden>→</span> PremiumFloor
          <span className="sr-only"> (opens in a new tab)</span>
        </PremiumFloorLink>
      </div>
      <Disclaimer className="mt-6 border-t border-line pt-4 text-fg-muted" />
    </aside>
  );
}
