import { describe, expect, it } from "vitest";
import { clamp, linePath, linear, money, niceTicks, sample } from "./scale";

describe("linear", () => {
  it("maps and inverts", () => {
    const f = linear(0, 10, 100, 200);
    expect(f(0)).toBe(100);
    expect(f(10)).toBe(200);
    expect(f(5)).toBe(150);
    expect(f.invert(150)).toBe(5);
  });
  it("supports inverted ranges (svg y axis)", () => {
    const y = linear(-100, 100, 300, 0);
    expect(y(100)).toBe(0);
    expect(y(-100)).toBe(300);
    expect(y.invert(150)).toBe(0);
  });
  it("does not divide by zero on a degenerate domain", () => {
    expect(Number.isFinite(linear(5, 5, 0, 10)(5))).toBe(true);
  });
});

describe("niceTicks", () => {
  it("returns round steps inside the range", () => {
    expect(niceTicks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    const t = niceTicks(-347, 912, 5);
    for (const v of t) {
      expect(v).toBeGreaterThanOrEqual(-347);
      expect(v).toBeLessThanOrEqual(912);
    }
    expect(t.length).toBeGreaterThanOrEqual(3);
    expect(t.includes(0)).toBe(true);
  });
  it("handles a collapsed range", () => {
    expect(niceTicks(3, 3)).toEqual([3]);
  });
});

describe("formatting and helpers", () => {
  it("formats money with a true minus and optional plus", () => {
    expect(money(1234.4)).toBe("$1,234");
    expect(money(-49.56)).toBe("−$50");
    expect(money(114.36, { sign: true })).toBe("+$114");
    expect(money(-0.2)).toBe("$0");
    expect(money(3.585, { decimals: 2 })).toBe("$3.59");
  });
  it("clamps", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
  it("builds paths and samples inclusively", () => {
    expect(linePath([[0, 0], [1, 2]])).toBe("M0.0,0.0 L1.0,2.0");
    expect(sample(0, 1, 3)).toEqual([0, 0.5, 1]);
  });
});
