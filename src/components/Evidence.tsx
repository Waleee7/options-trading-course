import { SOURCES } from "@/data/site";

/** The two permitted statistics, verbatim from their sources. Nothing else is cited anywhere on the site. */
export default function Evidence({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-labelledby="evidence-h" className="panel">
      <div className="panel-bar">
        <span className="flex items-center"><span className="dot" style={{ background: "var(--loss)" }} /><span id="evidence-h">Evidence ledger</span></span>
        <span className="hidden sm:inline">Only two statistics cited</span>
      </div>
      <div className="grid gap-6 p-5 sm:p-6">
        <article>
          <p className="mono text-6xl font-bold leading-none sm:text-7xl" style={{ color: "var(--loss)" }}>
            93%
          </p>
          <p className="mt-3 text-lg font-medium leading-snug text-fg">
            of over 1 crore (10M+) individual equity F&amp;O traders in India lost money between FY22 and FY24.
          </p>
          {!compact && (
            <ul className="mono mt-3 space-y-1 text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              <li>Average loss about ₹2 lakh per trader, including transaction costs.</li>
              <li>Aggregate losses exceeded ₹1.8 lakh crore.</li>
              <li>Over 75% of loss-makers kept trading anyway.</li>
              <li>1 crore = 10 million. 1 lakh = 100,000.</li>
            </ul>
          )}
          <p className="mono mt-3 text-xs">
            <a href={SOURCES.sebi.url} target="_blank" rel="noopener noreferrer" className="link">
              Source: SEBI press release, 23 Sep 2024 ↗
            </a>
          </p>
        </article>

        <hr className="border-line" />

        <article>
          <p className="mono text-6xl font-bold leading-none sm:text-7xl" style={{ color: "var(--loss)" }}>
            97%
          </p>
          <p className="mt-3 text-lg font-medium leading-snug text-fg">
            of Brazilian mini-index futures day traders who kept going for more than 300 days lost money.
          </p>
          {!compact && (
            <p className="mono mt-3 text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              Chague, De-Losso &amp; Giovannetti, &ldquo;Day Trading for a Living?&rdquo; FGV EESP working paper, 2019. This study covers futures, not options.
            </p>
          )}
          <p className="mono mt-3 text-xs">
            <a href={SOURCES.brazil.url} target="_blank" rel="noopener noreferrer" className="link">
              Source: SSRN working paper ↗
            </a>
          </p>
        </article>
      </div>
    </section>
  );
}
