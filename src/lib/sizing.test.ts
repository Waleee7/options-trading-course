import { describe, expect, it } from "vitest";
import { MAX_AMOUNT, parseAmount, sizeTrade } from "./sizing";

describe("parseAmount", () => {
  it("reads normal numbers", () => {
    expect(parseAmount("25000")).toBe(25000);
    expect(parseAmount("0.5")).toBe(0.5);
  });
  it("treats blank, negative and non-numeric input as 0", () => {
    for (const bad of ["", "   ", "-5", "abc", "NaN", "Infinity", "-Infinity"]) expect(parseAmount(bad)).toBe(0);
  });
  it("caps absurd numbers", () => {
    expect(parseAmount("1e308")).toBe(MAX_AMOUNT);
    expect(parseAmount("500", 100)).toBe(100);
  });
});

describe("sizeTrade", () => {
  it("rounds contracts down, never up", () => {
    expect(sizeTrade(50000, 1, 306)).toMatchObject({ budget: 500, contracts: 1, atRisk: 306 });
  });
  it("stays finite at the largest inputs", () => {
    const r = sizeTrade(MAX_AMOUNT, 100, 0.0001);
    for (const v of Object.values(r)) expect(Number.isFinite(v)).toBe(true);
  });
  it("returns zero contracts when there is no max loss", () => {
    expect(sizeTrade(50000, 1, 0).contracts).toBe(0);
  });
});
