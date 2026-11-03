import { describe, expect, it } from "vitest";
import { generateCandles, movingAverage, rng } from "./desk";

describe("desk geometry", () => {
  it("is deterministic for a seed and differs across seeds", () => {
    expect(generateCandles(30, 7)).toEqual(generateCandles(30, 7));
    expect(generateCandles(30, 7)).not.toEqual(generateCandles(30, 8));
    const a = rng(1);
    const b = rng(1);
    expect([a(), a()]).toEqual([b(), b()]);
  });
  it("produces valid candles inside [0, 1]", () => {
    for (const c of generateCandles(80, 42)) {
      expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c));
      expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c));
      for (const v of [c.o, c.h, c.l, c.c]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
  it("tiles seamlessly: the last close lands near the first open", () => {
    const c = generateCandles(64, 11);
    expect(Math.abs(c[c.length - 1].c - c[0].o)).toBeLessThan(0.06);
  });
  it("moving average keeps length and stays in range", () => {
    const c = generateCandles(40, 3);
    const ma = movingAverage(c, 8);
    expect(ma).toHaveLength(40);
    for (const v of ma) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

import { TAPE_ITEMS } from "@/components/CourseTape";

describe("course tape", () => {
  it("carries course reminders only, with no prices or percentages", () => {
    expect(TAPE_ITEMS.length).toBeGreaterThanOrEqual(8);
    for (const t of TAPE_ITEMS) expect(/\$\d|\d+%/.test(t), t).toBe(false);
  });
});
