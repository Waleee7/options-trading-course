"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PREMIUMFLOOR_URL } from "@/data/site";
import SoundToggle from "./SoundToggle";

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
        className={`t100 mono whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold ${active ? "border-accent bg-raised text-fg" : "border-transparent text-fg-2 hover:bg-raised hover:text-fg"}`}
      >
        {n.label}
      </Link>
    );
  });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line-strong bg-deep">
        <div className="mx-auto flex min-h-12 max-w-6xl flex-wrap items-center justify-between gap-x-3 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="mono flex min-h-9 items-center text-sm font-bold tracking-tight text-fg">
              OPTIONS<span className="text-accent">/</span>LAB
            </Link>
            <nav aria-label="Primary" className="hidden items-center md:flex">
              {links}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <SoundToggle />
            <a
              href={PREMIUMFLOOR_URL}
              target="_blank"
              rel="noopener"
              className="t100 mono flex min-h-9 items-center gap-2 border-2 border-accent px-3 text-xs font-bold text-accent hover:bg-accent hover:text-accent-ink"
            >
              <span className="hidden sm:inline">Trade with Josh</span>
              <span aria-hidden className="hidden sm:inline">→</span>
              <span>PremiumFloor</span>
              <span aria-hidden className="sm:hidden">→</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </header>
      <nav aria-label="Primary mobile" className="flex overflow-x-auto border-b border-line-strong bg-deep md:hidden">
        <div className="flex px-2">{links}</div>
      </nav>
    </>
  );
}
