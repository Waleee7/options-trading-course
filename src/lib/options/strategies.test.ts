import { describe, expect, it } from "vitest";
import {
  PRESETS,
  chartRange,
  entryCost,
  expiryPnL,
  expirySummary,
  positionGreeks,
  positionPnL,
  positionValue,
  presetEntry,
  type PresetId,
} from "./strategies";

const ids = Object.keys(PRESETS) as PresetId[];

describe("presets", () => {
  it("every preset ids matches its key and has legs", () => {
    for (const id of ids) {
      expect(PRESETS[id].id).toBe(id);
      expect(PRESETS[id].legs.length).toBeGreaterThan(0);
      expect(PRESETS[id].legsText.length).toBe(PRESETS[id].legs.length);
    }
  });
  it("P&L at entry is exactly zero for every preset", () => {
    for (const id of ids) {
      const p = PRESETS[id];
      expect(positionPnL(p.legs, presetEntry(p), presetEntry(p))).toBeCloseTo(0, 10);
    }
  });
  it("model P&L converges to expiry P&L as days -> 0", () => {
    for (const id of ids) {
      const p = PRESETS[id];
      const cost = entryCost(p.legs, presetEntry(p));
      for (const S of [70, 90, 100, 104, 120]) {
        const model = positionPnL(p.legs, presetEntry(p), { S, days: 0, sigma: p.sigma });
        expect(model).toBeCloseTo(expiryPnL(p.legs, cost, S), 8);
      }
    }
  });
});

describe("long call", () => {
  const p = PRESETS["long-call"];
  const cost = entryCost(p.legs, presetEntry(p));
  const sum = expirySummary(p.legs, cost);
  it("risks exactly the premium and has uncapped upside", () => {
    expect(cost).toBeGreaterThan(0);
    expect(sum.maxLoss).toBeCloseTo(cost, 8);
    expect(sum.maxProfit).toBe(Infinity);
  });
  it("breaks even at strike + premium per share", () => {
    expect(sum.breakevens).toHaveLength(1);
    expect(sum.breakevens[0]).toBeCloseTo(100 + cost / 100, 8);
  });
  it("expiry P&L is -premium below the strike", () => {
    expect(expiryPnL(p.legs, cost, 80)).toBeCloseTo(-cost, 10);
    expect(expiryPnL(p.legs, cost, 120)).toBeCloseTo(2000 - cost, 10);
  });
});

describe("verticals", () => {
  it("bull call spread: max loss = debit, max profit = width*100 - debit", () => {
    const p = PRESETS["bull-call-spread"];
    const cost = entryCost(p.legs, presetEntry(p));
    const s = expirySummary(p.legs, cost);
    expect(cost).toBeGreaterThan(0);
    expect(s.maxLoss).toBeCloseTo(cost, 8);
    expect(s.maxProfit).toBeCloseTo(1000 - cost, 8);
    expect(s.breakevens[0]).toBeCloseTo(100 + cost / 100, 8);
  });
  it("bull put spread: credit received, max loss = width*100 - credit", () => {
    const p = PRESETS["bull-put-spread"];
    const cost = entryCost(p.legs, presetEntry(p));
    const s = expirySummary(p.legs, cost);
    expect(cost).toBeLessThan(0);
    const credit = -cost;
    expect(s.maxProfit).toBeCloseTo(credit, 8);
    expect(s.maxLoss).toBeCloseTo(500 - credit, 8);
    expect(s.breakevens[0]).toBeCloseTo(95 - credit / 100, 8);
  });
  it("bear call spread mirrors the same maths", () => {
    const p = PRESETS["bear-call-spread"];
    const cost = entryCost(p.legs, presetEntry(p));
    const s = expirySummary(p.legs, cost);
    const credit = -cost;
    expect(credit).toBeGreaterThan(0);
    expect(s.maxProfit).toBeCloseTo(credit, 8);
    expect(s.maxLoss).toBeCloseTo(500 - credit, 8);
    expect(s.breakevens[0]).toBeCloseTo(105 + credit / 100, 8);
  });
  it("bear put spread: debit, capped both ways", () => {
    const p = PRESETS["bear-put-spread"];
    const cost = entryCost(p.legs, presetEntry(p));
    const s = expirySummary(p.legs, cost);
    expect(s.maxLoss).toBeCloseTo(cost, 8);
    expect(s.maxProfit).toBeCloseTo(1000 - cost, 8);
    expect(s.breakevens[0]).toBeCloseTo(100 - cost / 100, 8);
  });
});

describe("income structures", () => {
  it("covered call: capped profit, loss falls to zero-price, one breakeven below entry", () => {
    const p = PRESETS["covered-call"];
    const cost = entryCost(p.legs, presetEntry(p));
    const s = expirySummary(p.legs, cost);
    const premium = positionValue([p.legs[1]], presetEntry(p)); // negative: credit
    expect(s.maxProfit).toBeCloseTo(500 - premium, 6); // 500 + credit (premium is negative)
    expect(s.maxLoss).toBeCloseTo(10000 + premium, 6); // stock to zero offset by credit
    expect(s.breakevens[0]).toBeCloseTo(100 + premium / 100, 6);
    expect(s.breakevens[0]).toBeLessThan(100);
  });
  it("cash-secured put: profit capped at credit, loss at strike*100 - credit", () => {
    const p = PRESETS["cash-secured-put"];
    const cost = entryCost(p.legs, presetEntry(p));
    const s = expirySummary(p.legs, cost);
    const credit = -cost;
    expect(s.maxProfit).toBeCloseTo(credit, 8);
    expect(s.maxLoss).toBeCloseTo(9500 - credit, 8);
    expect(s.breakevens[0]).toBeCloseTo(95 - credit / 100, 8);
  });
  it("naked short call has unlimited loss", () => {
    const legs = [{ kind: "call" as const, qty: -1, strike: 100 }];
    const cost = -300;
    expect(expirySummary(legs, cost).maxLoss).toBe(Infinity);
  });
});

describe("iron condor", () => {
  const p = PRESETS["iron-condor"];
  const cost = entryCost(p.legs, presetEntry(p));
  const s = expirySummary(p.legs, cost);
  const credit = -cost;
  it("is a net credit with two breakevens around price", () => {
    expect(credit).toBeGreaterThan(0);
    expect(s.breakevens).toHaveLength(2);
    expect(s.breakevens[0]).toBeCloseTo(95 - credit / 100, 8);
    expect(s.breakevens[1]).toBeCloseTo(105 + credit / 100, 8);
  });
  it("max profit = credit, max loss = wing width*100 - credit", () => {
    expect(s.maxProfit).toBeCloseTo(credit, 8);
    expect(s.maxLoss).toBeCloseTo(500 - credit, 8);
  });
  it("positionValue is monotone in sign: closing a flat position returns the credit", () => {
    expect(positionValue(p.legs, presetEntry(p))).toBeCloseTo(cost, 10);
  });
});

describe("Greeks and sensitivities of positions", () => {
  it("long call is long delta/gamma/vega, short theta", () => {
    const p = PRESETS["long-call"];
    const g = positionGreeks(p.legs, presetEntry(p));
    expect(g.delta).toBeGreaterThan(0);
    expect(g.gamma).toBeGreaterThan(0);
    expect(g.vega).toBeGreaterThan(0);
    expect(g.theta).toBeLessThan(0);
  });
  it("iron condor is short vega and long theta near the middle", () => {
    const p = PRESETS["iron-condor"];
    const g = positionGreeks(p.legs, presetEntry(p));
    expect(g.vega).toBeLessThan(0);
    expect(g.theta).toBeGreaterThan(0);
    expect(Math.abs(g.delta)).toBeLessThan(5);
  });
  it("covered call delta = 100 shares minus the short call delta", () => {
    const p = PRESETS["covered-call"];
    const g = positionGreeks(p.legs, presetEntry(p));
    expect(g.delta).toBeGreaterThan(40);
    expect(g.delta).toBeLessThan(100);
  });
});

describe("the earnings (IV crush) preset", () => {
  const p = PRESETS["earnings-call"];
  const entry = presetEntry(p);
  it("loses money on a correct 3% rise when IV collapses from 80% to 40% the next day", () => {
    const next = { S: 103, days: 6, sigma: 0.4 };
    expect(positionPnL(p.legs, entry, next)).toBeLessThan(0);
  });
  it("makes money on the same move if IV had not moved", () => {
    const next = { S: 103, days: 6, sigma: 0.8 };
    expect(positionPnL(p.legs, entry, next)).toBeGreaterThan(0);
  });
});

describe("chartRange", () => {
  it("brackets spot and every strike", () => {
    for (const id of ids) {
      const p = PRESETS[id];
      const [lo, hi] = chartRange(p.S0, p.legs, p.sigma, p.days);
      expect(lo).toBeLessThan(Math.min(p.S0, ...p.legs.filter((l) => l.strike).map((l) => l.strike!)));
      expect(hi).toBeGreaterThan(Math.max(p.S0, ...p.legs.filter((l) => l.strike).map((l) => l.strike!)));
      expect(lo).toBeGreaterThan(0);
    }
  });
});
