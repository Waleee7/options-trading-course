import { describe, expect, it } from "vitest";
import {
  bsGreeks,
  bsPrice,
  daysToYears,
  expectedMove,
  impliedVol,
  intrinsic,
  normCdf,
  normPdf,
  probFinishAbove,
  type BSInput,
} from "./blackScholes";

const base: BSInput = { S: 100, K: 100, T: 1, sigma: 0.2, r: 0.05 };

describe("normal distribution", () => {
  it("matches reference CDF values", () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 14);
    expect(normCdf(1)).toBeCloseTo(0.8413447460685429, 12);
    expect(normCdf(-1)).toBeCloseTo(0.15865525393145707, 12);
    expect(normCdf(1.96)).toBeCloseTo(0.9750021048517795, 12);
    expect(normCdf(-3)).toBeCloseTo(0.0013498980316301, 12);
    expect(normCdf(10)).toBe(1);
    expect(normCdf(-40)).toBe(0);
  });
  it("is symmetric and monotone", () => {
    for (const x of [0.1, 0.7, 1.3, 2.9, 5]) {
      expect(normCdf(x) + normCdf(-x)).toBeCloseTo(1, 13);
    }
    expect(normCdf(0.5)).toBeGreaterThan(normCdf(0.4));
  });
  it("pdf peaks at zero at 1/sqrt(2pi)", () => {
    expect(normPdf(0)).toBeCloseTo(0.3989422804014327, 14);
  });
});

describe("bsPrice", () => {
  it("matches the textbook ATM case (S=K=100, T=1, r=5%, vol=20%)", () => {
    expect(bsPrice("call", base)).toBeCloseTo(10.4506, 3);
    expect(bsPrice("put", base)).toBeCloseTo(5.5735, 3);
  });
  it("matches Hull's worked example (S=42, K=40, r=10%, vol=20%, T=0.5)", () => {
    const i: BSInput = { S: 42, K: 40, T: 0.5, sigma: 0.2, r: 0.1 };
    expect(bsPrice("call", i)).toBeCloseTo(4.7594, 3);
    expect(bsPrice("put", i)).toBeCloseTo(0.8086, 3);
  });
  it("satisfies put-call parity across a grid", () => {
    for (const S of [60, 100, 140]) {
      for (const K of [80, 100, 120]) {
        for (const sigma of [0.1, 0.4, 0.9]) {
          for (const T of [0.02, 0.5, 2]) {
            const i: BSInput = { S, K, T, sigma, r: 0.04, q: 0.01 };
            const lhs = bsPrice("call", i) - bsPrice("put", i);
            const rhs = S * Math.exp(-0.01 * T) - K * Math.exp(-0.04 * T);
            expect(lhs).toBeCloseTo(rhs, 9);
          }
        }
      }
    }
  });
  it("never trades below intrinsic for calls with no dividends", () => {
    const i = { ...base, S: 130, K: 100, T: 0.1 };
    expect(bsPrice("call", i)).toBeGreaterThanOrEqual(intrinsic("call", 130, 100));
  });
  it("collapses to intrinsic at expiry", () => {
    expect(bsPrice("call", { ...base, T: 0, S: 107 })).toBe(7);
    expect(bsPrice("put", { ...base, T: 0, S: 107 })).toBe(0);
    expect(bsPrice("put", { ...base, T: 0, S: 93 })).toBe(7);
  });
  it("handles zero volatility without NaN", () => {
    const v = bsPrice("call", { ...base, sigma: 0, S: 100, K: 90, r: 0 });
    expect(v).toBeCloseTo(10, 10);
  });
  it("increases with vol and (for ATM) with time", () => {
    expect(bsPrice("call", { ...base, sigma: 0.4 })).toBeGreaterThan(bsPrice("call", base));
    expect(bsPrice("call", { ...base, T: 2 })).toBeGreaterThan(bsPrice("call", base));
  });
});

describe("bsGreeks", () => {
  const bump = (i: BSInput, patch: Partial<BSInput>): BSInput => ({ ...i, ...patch });
  const cases: BSInput[] = [
    base,
    { S: 100, K: 105, T: 30 / 365, sigma: 0.3, r: 0.04 },
    { S: 100, K: 95, T: 7 / 365, sigma: 0.8, r: 0.04 },
    { S: 250, K: 240, T: 3 / 365, sigma: 0.25, r: 0.04 },
  ];
  for (const kind of ["call", "put"] as const) {
    it(`${kind}: analytic Greeks agree with finite differences`, () => {
      for (const i of cases) {
        const g = bsGreeks(kind, i);
        const h = 0.01;
        const dUp = bsPrice(kind, bump(i, { S: i.S + h }));
        const dDn = bsPrice(kind, bump(i, { S: i.S - h }));
        expect(g.delta).toBeCloseTo((dUp - dDn) / (2 * h), 5);
        expect(g.gamma).toBeCloseTo((dUp - 2 * bsPrice(kind, i) + dDn) / (h * h), 3);

        const v = 0.0001;
        const vegaFd =
          (bsPrice(kind, bump(i, { sigma: i.sigma + v })) - bsPrice(kind, bump(i, { sigma: i.sigma - v }))) /
          (2 * v) /
          100;
        expect(g.vega).toBeCloseTo(vegaFd, 5);

        const dt = 1e-6;
        const thetaFd =
          (bsPrice(kind, bump(i, { T: i.T - dt })) - bsPrice(kind, bump(i, { T: i.T + dt }))) / (2 * dt) / 365;
        expect(g.theta).toBeCloseTo(thetaFd, 4);

        const dr = 1e-5;
        const rhoFd =
          (bsPrice(kind, bump(i, { r: i.r + dr })) - bsPrice(kind, bump(i, { r: i.r - dr }))) / (2 * dr) / 100;
        expect(g.rho).toBeCloseTo(rhoFd, 5);
      }
    });
  }
  it("call delta minus put delta is 1 (no dividends)", () => {
    const c = bsGreeks("call", base).delta;
    const p = bsGreeks("put", base).delta;
    expect(c - p).toBeCloseTo(1, 12);
  });
  it("long options have negative theta and positive vega/gamma", () => {
    const g = bsGreeks("call", base);
    expect(g.theta).toBeLessThan(0);
    expect(g.vega).toBeGreaterThan(0);
    expect(g.gamma).toBeGreaterThan(0);
  });
  it("ATM gamma rises sharply as expiry approaches", () => {
    const atm = (days: number) => bsGreeks("call", { S: 100, K: 100, T: daysToYears(days), sigma: 0.3, r: 0.04 }).gamma;
    expect(atm(1)).toBeGreaterThan(atm(7));
    expect(atm(7)).toBeGreaterThan(atm(30));
    expect(atm(1) / atm(30)).toBeGreaterThan(4);
  });
  it("returns step-function delta and zero others at expiry", () => {
    const g = bsGreeks("call", { ...base, T: 0, S: 110 });
    expect(g).toEqual({ delta: 1, gamma: 0, theta: 0, vega: 0, rho: 0 });
    expect(bsGreeks("put", { ...base, T: 0, S: 110 }).delta).toBe(0);
  });
});

describe("impliedVol and helpers", () => {
  it("round-trips a price to its volatility", () => {
    for (const sigma of [0.12, 0.3, 0.8, 1.4]) {
      for (const kind of ["call", "put"] as const) {
        const i = { S: 100, K: 102, T: 20 / 365, r: 0.04 };
        const px = bsPrice(kind, { ...i, sigma });
        expect(impliedVol(kind, px, i)).toBeCloseTo(sigma, 5);
      }
    }
  });
  it("returns null when the price is impossible", () => {
    expect(impliedVol("call", 0.0001, { S: 150, K: 100, T: 0.1, r: 0.04 })).toBeNull();
    expect(impliedVol("call", 5, { S: 100, K: 100, T: 0, r: 0.04 })).toBeNull();
  });
  it("expected move is S * sigma * sqrt(days/365)", () => {
    expect(expectedMove(100, 0.365, 365)).toBeCloseTo(36.5, 10);
    expect(expectedMove(100, 0.2, 0)).toBe(0);
    expect(expectedMove(200, 0.3, 30)).toBeCloseTo(200 * 0.3 * Math.sqrt(30 / 365), 12);
  });
  it("finish-above probability is a probability and ~50% ATM", () => {
    const p = probFinishAbove({ S: 100, K: 100, T: 30 / 365, sigma: 0.3, r: 0.0 });
    expect(p).toBeGreaterThan(0.4);
    expect(p).toBeLessThan(0.6);
    expect(probFinishAbove({ S: 120, K: 100, T: 0, sigma: 0.3, r: 0 })).toBe(1);
  });
});
