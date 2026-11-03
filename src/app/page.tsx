import Link from "next/link";
import Evidence from "@/components/Evidence";
import ProgressStrip, { StartButton } from "@/components/ProgressStrip";
import Syllabus from "@/components/Syllabus";
import Receipts from "@/components/Receipts";
import Disclaimer from "@/components/Disclaimer";
import PayoffExplorer from "@/components/charts/PayoffExplorer";
import DeskWall from "@/components/desk/DeskPanels";
import { modules } from "@/data/modules";

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-12">
          <div className="lg:pt-4">
            <p className="label">Options Lab / an honest options course</p>
            <h1 className="display mt-5 text-[clamp(2.7rem,6.1vw,4.5rem)]">
              Most people lose money <span className="text-accent">trading options.</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-snug text-fg-2">
              This free course starts there. Real mechanics, the Greeks with numbers, implied volatility, defined-risk strategies you can drag and break, and the exact checklist I trade by.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StartButton />
              <Link href="/lab" className="btn btn-ghost">Open the strategy lab</Link>
            </div>
            <dl className="mono mt-9 grid max-w-md grid-cols-3 border border-line-strong bg-deep text-center">
              {[
                [String(modules.length), "modules"],
                ["10", "live payoff models"],
                ["0", "win-rate claims"],
              ].map(([n, l], i) => (
                <div key={l} className={`px-2 py-3 ${i ? "border-l border-line-strong" : ""}`}>
                  <dt className="label">{l}</dt>
                  <dd className="mt-1 text-2xl font-bold text-fg">{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <DeskWall />
        </div>
      </section>

      <ProgressStrip />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="evidence-section">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <div className="lg:pt-6">
            <p className="label">Before anything else</p>
            <h2 id="evidence-section" className="display mt-3 text-4xl sm:text-5xl">The evidence, in two numbers.</h2>
            <p className="mt-4 max-w-md text-lg leading-snug text-fg-2">
              These are the only two statistics on this site. Both describe specific groups, and neither is a forecast for you. They are here because they are the honest starting point.
            </p>
            <p className="mt-4">
              <Link href="/course/the-truth" className="link mono text-sm">Read what they do and do not say →</Link>
            </p>
          </div>
          <Evidence />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="drag-h">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-12">
          <div>
            <p className="label">Don&rsquo;t take my word for it</p>
            <h2 id="drag-h" className="display mt-3 text-4xl sm:text-5xl">Right on direction. Still down.</h2>
            <p className="mt-4 text-lg leading-snug text-fg-2">
              The stock rose 3% after earnings, exactly as hoped, and this call lost money. Drag the IV slider back up to 80% and watch it turn green. Every number comes from a unit-tested Black-Scholes engine.
            </p>
            <p className="mt-4">
              <Link href="/course/iv-crush" className="link mono text-sm">Read why it happens →</Link>
            </p>
          </div>
          <PayoffExplorer preset="earnings-call" start={{ S: 103, days: 6, sigma: 0.4 }} />
        </div>
      </section>

      <section id="syllabus" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-8 sm:px-6" aria-labelledby="syll-h">
        <p className="label">Syllabus</p>
        <h2 id="syll-h" className="display mb-8 mt-3 text-4xl sm:text-6xl">Sixteen modules, in order.</h2>
        <Syllabus />
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Receipts />
        <section className="reading mt-14 grid gap-6 p-6 md:grid-cols-[1fr_2fr] md:p-8" aria-labelledby="honest-h">
          <h2 id="honest-h" className="display text-3xl">The honesty principle</h2>
          <div className="max-w-2xl text-lg leading-snug text-fg-2">
            <p>
              No win rates, no returns, no screenshots of green accounts, no testimonials. The only statistics on this site are the two in the evidence ledger, with their sources. When I can document real results, they appear in a Receipts section with dates, unedited, losers included.
            </p>
            <Disclaimer className="mt-5 text-fg-muted" />
          </div>
        </section>
      </div>
    </>
  );
}
