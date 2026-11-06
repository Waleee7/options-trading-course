import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("design tokens", () => {
  it("never name a color after a Tailwind font size", () => {
    // `--color-base` made every `text-base` paint its text the page background, hiding it.
    const css = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8");
    const names = [...css.matchAll(/--color-([\w-]+):/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(0);
    for (const n of names) expect(n).not.toMatch(/^(xs|sm|base|lg|\d*xl)$/);
  });
});
