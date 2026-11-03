import Link from "next/link";
import { AUTHOR, PREMIUMFLOOR_URL, REPO_URL, SOURCES } from "@/data/site";
import Disclaimer from "./Disclaimer";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-accent bg-deep text-fg">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="mono text-sm font-bold">
            OPTIONS<span className="text-accent">/</span>LAB
          </p>
          <p className="mt-3 max-w-md text-lg leading-snug text-fg-2">
            A free, honest options course. It starts with the fact that most people lose money, and teaches you to price, size, and survive.
          </p>
          <p className="mono mt-5 text-xs text-fg-muted">
            Built by{" "}
            <a href={AUTHOR.url} target="_blank" rel="noopener noreferrer" className="link">
              {AUTHOR.name}
            </a>
          </p>
        </div>
        <div>
          <p className="label">Course</p>
          <ul className="mono mt-3 grid gap-2 text-sm">
            <li><Link href="/" className="link">All modules</Link></li>
            <li><Link href="/lab" className="link">Strategy lab</Link></li>
            <li><Link href="/challenge" className="link">Challenge</Link></li>
            <li><Link href="/glossary" className="link">Glossary</Link></li>
            <li><a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="link">Source on GitHub ↗</a></li>
          </ul>
        </div>
        <div>
          <p className="label">Elsewhere</p>
          <ul className="mono mt-3 grid gap-2 text-sm">
            <li>
              <a href={PREMIUMFLOOR_URL} target="_blank" rel="noopener" className="link">
                Trade with Josh → PremiumFloor<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li><a href={SOURCES.sebi.url} target="_blank" rel="noopener noreferrer" className="link">SEBI study ↗</a></li>
            <li><a href={SOURCES.brazil.url} target="_blank" rel="noopener noreferrer" className="link">Day-trading paper ↗</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Disclaimer long className="max-w-4xl text-fg-muted" />
        </div>
      </div>
    </footer>
  );
}
