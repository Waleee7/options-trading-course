import { describe, expect, it } from "vitest";
import { parseInline, readMinutes } from "./content";
import { modules } from "@/data/modules";

describe("parseInline", () => {
  it("parses bold, code and links in order", () => {
    expect(parseInline("a **b** `c` [d](/e) f")).toEqual([
      { k: "text", v: "a " },
      { k: "strong", v: "b" },
      { k: "text", v: " " },
      { k: "code", v: "c" },
      { k: "text", v: " " },
      { k: "link", v: "d", href: "/e" },
      { k: "text", v: " f" },
    ]);
  });
  it("leaves plain text and stray asterisks alone", () => {
    expect(parseInline("5 * 3 = 15")).toEqual([{ k: "text", v: "5 * 3 = 15" }]);
  });
});

describe("readMinutes", () => {
  it("is a sane positive number for every module", () => {
    for (const m of modules) {
      const t = readMinutes(m);
      expect(t, m.id).toBeGreaterThanOrEqual(2);
      expect(t, m.id).toBeLessThan(30);
    }
  });
});
