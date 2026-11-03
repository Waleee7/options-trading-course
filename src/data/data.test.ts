import { describe, expect, it } from "vitest";
import { modules, totalXp } from "./modules";
import { glossary } from "./glossary";
import { PARTS } from "./parts";
import { receipts, sortReceipts } from "./receipts";
import { FLAT_BAND, classify, scenarioPnL, scenarios } from "./challenges";
import { PREMIUMFLOOR_URL, SOURCES } from "./site";
import { PRESETS } from "@/lib/options/strategies";

describe("course content integrity", () => {
  it("has unique module ids and valid parts", () => {
    const ids = modules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    const partIds = new Set(PARTS.map((p) => p.id));
    for (const m of modules) expect(partIds.has(m.part)).toBe(true);
  });
  it("orders modules by part", () => {
    const order = PARTS.map((p) => p.id);
    let last = -1;
    for (const m of modules) {
      const i = order.indexOf(m.part);
      expect(i).toBeGreaterThanOrEqual(last);
      last = i;
    }
  });
  it("every quiz is well-formed with unique ids", () => {
    const seen = new Set<string>();
    for (const m of modules) {
      expect(m.quiz.length).toBeGreaterThanOrEqual(4);
      for (const q of m.quiz) {
        expect(seen.has(q.id)).toBe(false);
        seen.add(q.id);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.correct).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, q.id).toBe(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(20);
      }
    }
  });
  it("correct answers are not always in the same slot", () => {
    const slots = new Set(modules.flatMap((m) => m.quiz.map((q) => q.correct)));
    expect(slots.size).toBeGreaterThanOrEqual(3);
  });
  it("glossary ids are unique and point at real modules", () => {
    const ids = glossary.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of glossary) {
      if (g.module) expect(modules.some((m) => m.id === g.module)).toBe(true);
    }
  });
  it("every term a lesson references exists in the glossary", () => {
    const ids = new Set(glossary.map((g) => g.id));
    for (const m of modules) for (const t of m.terms) expect(ids.has(t), `${m.id} -> ${t}`).toBe(true);
  });
  it("every payoff block names a real preset", () => {
    for (const m of modules) {
      for (const b of m.blocks) if (b.t === "payoff") expect(PRESETS[b.preset]).toBeDefined();
    }
  });
  it("PremiumFloor end-of-module cards sit on strategy modules and How I trade only", () => {
    const withCard = modules.filter((m) => m.pf).map((m) => m.id);
    expect(withCard).toEqual(["vertical-spreads", "income-strategies", "iron-condors", "how-i-trade"]);
  });
  it("has a non-trivial but bounded XP economy", () => {
    expect(totalXp()).toBeGreaterThan(1500);
    expect(totalXp()).toBeLessThan(3000);
  });
});

describe("honesty guardrails", () => {
  const corpus = JSON.stringify([modules, glossary, scenarios]).toLowerCase();
  it("contains no guaranteed-profit or hype language outside of negations", () => {
    // Negations ("not free money") and the author's list of words to avoid are fine.
    const cleaned = corpus
      .replaceAll("not free money", "")
      .replaceAll("no free money", "")
      .replaceAll("lock, free money", "");
    for (const bad of ["guaranteed profit", "risk-free", "can't lose", "cannot lose", "free money", "get rich", "100% win"]) {
      expect(cleaned.includes(bad), bad).toBe(false);
    }
  });
  it("contains no testimonial or follower-count claims", () => {
    for (const bad of ["testimonial", "followers", "members earn", "my win rate is", "my returns"]) {
      expect(corpus.includes(bad), bad).toBe(false);
    }
  });
  it("cites the two permitted sources with exact URLs", () => {
    expect(SOURCES.sebi.url).toBe(
      "https://www.sebi.gov.in/media-and-notifications/press-releases/sep-2024/updated-sebi-study-reveals-93-of-individual-traders-incurred-losses-in-equity-fando-between-fy22-and-fy24-aggregate-losses-exceed-1-8-lakh-crores-over-three-years_86906.html",
    );
    expect(SOURCES.brazil.url).toBe("https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101");
  });
  it("links PremiumFloor exactly", () => {
    expect(PREMIUMFLOOR_URL).toBe("https://whop.com/premiumfloor");
  });
  it("ships the receipts array empty until real evidence is added", () => {
    expect(receipts).toEqual([]);
  });
  it("sorts receipts newest first", () => {
    const list = [
      { image: "/receipts/a.png", date: "2026-01-02", caption: "a" },
      { image: "/receipts/b.png", date: "2026-03-01", caption: "b" },
    ];
    expect(sortReceipts(list).map((r) => r.caption)).toEqual(["b", "a"]);
  });
});

describe("challenge scenarios agree with the pricing engine", () => {
  for (const s of scenarios) {
    it(`${s.id}: declared outcome matches the model`, () => {
      expect(classify(scenarioPnL(s))).toBe(s.outcome);
    });
  }
  it("is not trivially one-sided", () => {
    const kinds = new Set(scenarios.map((s) => s.outcome));
    expect(kinds.size).toBe(3);
  });
  it("classification band is symmetric", () => {
    expect(classify(FLAT_BAND)).toBe("flat");
    expect(classify(-FLAT_BAND)).toBe("flat");
    expect(classify(FLAT_BAND + 0.01)).toBe("gain");
  });
});
