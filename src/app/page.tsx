import Link from "next/link";
import Evidence from "@/components/Evidence";
import ProgressStrip from "@/components/ProgressStrip";
import Syllabus from "@/components/Syllabus";
import Receipts from "@/components/Receipts";
import Disclaimer from "@/components/Disclaimer";
import PayoffExplorer from "@/components/charts/PayoffExplorer";
import { modules } from "@/data/modules";

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-14">
          <div>
            <p className="label">Options Lab / an honest options course</p>
            <h1 className="display mt-5 text-[clamp(3.1rem,9.5vw,7.5rem)]">
              Most people lose money <span className="text-accent">trading options.</span>
            </h1>
            <p className="mt-7 max-w-xl text-xl leading-snug sm:text-2xl">
              This free course starts there. Real mechanics, the Greeks with numbers, implied volatility, defined-risk strategies you can drag and break, and the exact checklist I trade by.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/course/the-truth" className="btn">Start with the truth →</Link>
              <Link href="/lab" className="btn btn-ghost">Open the strategy lab</Link>
            </div>
            <dl className="mono mt-10 grid max-w-xl grid-cols-3 gap-px border-2 border-ink bg-ink text-center">
              {[
                [String(modules.length), "modules"],
                ["10", "live payoff models"],
                ["0", "win-rate claims"],
              ].map(([n, l]) => (
                <div key={l} className="bg-paper px-2 py-3">
                  <dt className="label">{l}</dt>
                  <dd className="mt-1 text-2xl font-bold text-ink">{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:mt-8">
            <Evidence />
          </div>
        </div>
      </section>

      <ProgressStrip />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-labelledby="drag-h">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-14">
          <div>
            <p className="label">Don&rsquo;t take my word for it</p>
            <h2 id="drag-h" className="display mt-3 text-4xl sm:text-5xl">Right on direction. Still down.</h2>
            <p className="mt-4 text-lg leading-snug">
              The stock rose 3% after earnings, exactly as hoped, and this call lost money. Drag the IV slider back up to 80% and watch it turn green. Every number here comes from a unit-tested Black-Scholes engine.
            </p>
            <p className="mt-4">
              <Link href="/course/iv-crush" className="link mono text-sm">Read why it happens →</Link>
            </p>
          </div>
          <PayoffExplorer
            preset="earnings-call"
            start={{ S: 103, days: 6, sigma: 0.4 }}
          />
        </div>
      </section>

      <section id="syllabus" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-8 sm:px-6" aria-labelledby="syll-h">
        <p className="label">Syllabus</p>
        <h2 id="syll-h" className="display mb-8 mt-3 text-4xl sm:text-6xl">Sixteen modules, in order.</h2>
        <Syllabus />
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Receipts />
        <section className="mt-16 grid gap-6 border-t-2 border-ink py-10 md:grid-cols-[1fr_2fr]" aria-labelledby="honest-h">
          <h2 id="honest-h" className="display text-3xl">The honesty principle</h2>
          <div className="max-w-2xl text-lg leading-snug">
            <p>
              No win rates, no returns, no screenshots of green accounts, no testimonials. The only statistics on this site are the two in the evidence ledger, with their sources. When I can document real results, they appear in a Receipts section with dates, unedited, losers included.
            </p>
            <Disclaimer className="mt-5 text-muted" />
          </div>
        </section>
      </div>
    </>
  );
}
