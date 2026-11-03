"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PREMIUMFLOOR_URL } from "@/data/site";

const NAV = [
  { href: "/", label: "Course" },
  { href: "/lab", label: "Strategy lab" },
  { href: "/challenge", label: "Challenge" },
  { href: "/glossary", label: "Glossary" },
];

function isActive(path: string, href: string) {
  if (href === "/") return path === "/" || path.startsWith("/course") || path.startsWith("/quiz") || path.startsWith("/complete");
  return path.startsWith(href);
}

export default function SiteHeader() {
  const path = usePathname();
  const links = NAV.map((n) => {
    const active = isActive(path, n.href);
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={active ? "page" : undefined}
        className={`t100 mono whitespace-nowrap px-3 py-2 text-xs font-semibold ${active ? "bg-paper text-ink" : "hover:bg-ink-3"}`}
        style={active ? undefined : { color: "var(--on-ink)" }}
      >
        {n.label}
      </Link>
    );
  });

  return (
    <>
      <header className="on-ink sticky top-0 z-40 border-b-2" style={{ background: "var(--ink)", borderColor: "var(--ink)" }}>
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="mono text-sm font-bold tracking-tight text-paper">
              OPTIONS<span style={{ color: "var(--accent-bright)" }}>/</span>LAB
            </Link>
            <nav aria-label="Primary" className="hidden items-center md:flex">
              {links}
            </nav>
          </div>
          <a
            href={PREMIUMFLOOR_URL}
            target="_blank"
            rel="noopener"
            aria-label="Trade with Josh on PremiumFloor (opens in a new tab)"
            className="t100 mono flex min-h-9 items-center gap-2 border-2 px-3 text-xs font-semibold text-paper hover:bg-paper hover:text-ink"
            style={{ borderColor: "var(--accent-bright)" }}
          >
            <span className="hidden sm:inline">Trade with Josh</span>
            <span aria-hidden className="hidden sm:inline" style={{ color: "var(--accent-bright)" }}>→</span>
            <span>PremiumFloor</span>
            <span aria-hidden className="sm:hidden" style={{ color: "var(--accent-bright)" }}>→</span>
          </a>
        </div>
      </header>
      <nav aria-label="Primary mobile" className="on-ink flex overflow-x-auto border-b-2 md:hidden" style={{ background: "var(--ink)", borderColor: "var(--ink)" }}>
        <div className="flex px-2">{links}</div>
      </nav>
    </>
  );
}
