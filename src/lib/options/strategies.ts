/**
 * Multi-leg position maths built on Black-Scholes.
 *
 * A position is a list of legs. `qty` is signed: +1 long, -1 short.
 * Option legs are in contracts (x100 shares). Stock legs are in lots of
 * 100 shares so a covered call is `stock +1` and `call -1`.
 *
 * P&L is always measured against the theoretical entry price (mid, no
 * commissions, no slippage). Real fills are worse; see the liquidity module.
 */
import { DEFAULT_RATE, bsGreeks, bsPrice, daysToYears, intrinsic, type Greeks } from "./blackScholes";

export type LegKind = "call" | "put" | "stock";

export interface Leg {
  kind: LegKind;
  /** Signed quantity: +long, -short. Contracts for options, 100-share lots for stock. */
  qty: number;
  /** Strike (ignored for stock). */
  strike?: number;
}

export interface Market {
  S: number;
  /** Calendar days to expiry. */
  days: number;
  /** Annualised implied vol, decimal. */
  sigma: number;
  r?: number;
}

const MULT = 100;

/** Value of ONE leg per share (stock = spot). */
export function legValuePerShare(leg: Leg, m: Market): number {
  if (leg.kind === "stock") return m.S;
  return bsPrice(leg.kind, {
    S: m.S,
    K: leg.strike ?? 0,
    T: daysToYears(m.days),
    sigma: m.sigma,
    r: m.r ?? DEFAULT_RATE,
  });
}

/** Total dollar value of the position under the model. */
export function positionValue(legs: Leg[], m: Market): number {
  return legs.reduce((sum, leg) => sum + leg.qty * MULT * legValuePerShare(leg, m), 0);
}

/**
 * Net cost to open, in dollars. Positive = net debit paid, negative = net credit
 * received. For stock legs this is the cash paid for the shares.
 */
export function entryCost(legs: Leg[], entry: Market): number {
  return positionValue(legs, entry);
}

/** Dollar P&L if you marked the position to `now` under the model. */
export function positionPnL(legs: Leg[], entry: Market, now: Market): number {
  return positionValue(legs, now) - entryCost(legs, entry);
}

/** Dollar P&L at expiry for underlying price S (pure intrinsic, no model). */
export function expiryPnL(legs: Leg[], cost: number, S: number): number {
  const value = legs.reduce((sum, leg) => {
    if (leg.kind === "stock") return sum + leg.qty * MULT * S;
    return sum + leg.qty * MULT * intrinsic(leg.kind, S, leg.strike ?? 0);
  }, 0);
  return value - cost;
}

/** Position-level Greeks in dollars: per $1 move, per $1 move per $1, per day, per vol point. */
export function positionGreeks(legs: Leg[], m: Market): Greeks {
  const total: Greeks = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  for (const leg of legs) {
    if (leg.kind === "stock") {
      total.delta += leg.qty * MULT;
      continue;
    }
    const g = bsGreeks(leg.kind, {
      S: m.S,
      K: leg.strike ?? 0,
      T: daysToYears(m.days),
      sigma: m.sigma,
      r: m.r ?? DEFAULT_RATE,
    });
    const k = leg.qty * MULT;
    total.delta += g.delta * k;
    total.gamma += g.gamma * k;
    total.theta += g.theta * k;
    total.vega += g.vega * k;
    total.rho += g.rho * k;
  }
  return total;
}

export interface ExpirySummary {
  /** Largest possible gain at expiry; Infinity if uncapped. */
  maxProfit: number;
  /** Largest possible loss as a POSITIVE number; Infinity if uncapped. */
  maxLoss: number;
  /** Underlying prices where expiry P&L crosses zero, ascending. */
  breakevens: number[];
}

/**
 * Exact expiry summary. Expiry P&L is piecewise linear in S with kinks only at
 * strikes, so evaluating at 0 and each strike and extending the final slope is
 * exact, not a sampled estimate.
 */
export function expirySummary(legs: Leg[], cost: number): ExpirySummary {
  const strikes = legs.filter((l) => l.kind !== "stock").map((l) => l.strike ?? 0);
  const pts = Array.from(new Set([0, ...strikes])).sort((a, b) => a - b);
  const vals = pts.map((s) => expiryPnL(legs, cost, s));

  // Slope above the highest strike: each long call / share adds, each short call subtracts.
  const tailSlope = legs.reduce((sum, l) => {
    if (l.kind === "call") return sum + l.qty * MULT;
    if (l.kind === "stock") return sum + l.qty * MULT;
    return sum;
  }, 0);

  let maxProfit = Math.max(...vals);
  let maxLoss = -Math.min(...vals);
  if (tailSlope > 1e-9) maxProfit = Infinity;
  if (tailSlope < -1e-9) maxLoss = Infinity;

  const breakevens: number[] = [];
  const push = (x: number) => {
    if (!breakevens.some((b) => Math.abs(b - x) < 1e-6)) breakevens.push(x);
  };
  for (let n = 0; n < pts.length - 1; n++) {
    const a = vals[n];
    const b = vals[n + 1];
    if (Math.abs(a) < 1e-9) push(pts[n]);
    else if (a * b < 0) push(pts[n] + (-a * (pts[n + 1] - pts[n])) / (b - a));
  }
  const lastV = vals[vals.length - 1];
  const lastS = pts[pts.length - 1];
  if (Math.abs(lastV) < 1e-9) push(lastS);
  else if (Math.abs(tailSlope) > 1e-9 && lastV * tailSlope < 0) push(lastS - lastV / tailSlope);

  breakevens.sort((x, y) => x - y);
  return { maxProfit, maxLoss, breakevens };
}

/** Pick a chart x-range wide enough to show strikes and a few expected moves. */
export function chartRange(S0: number, legs: Leg[], sigma: number, days: number): [number, number] {
  const strikes = legs.filter((l) => l.kind !== "stock").map((l) => l.strike ?? S0);
  const em = S0 * sigma * Math.sqrt(Math.max(days, 1) / 365);
  const lo = Math.min(S0, ...strikes) - Math.max(em * 1.5, S0 * 0.08);
  const hi = Math.max(S0, ...strikes) + Math.max(em * 1.5, S0 * 0.08);
  return [Math.max(0.01, lo), hi];
}

// ---------------------------------------------------------------------------
// Presets. Every worked example in the course is built from these, so the
// numbers in the prose and the numbers in the explorer cannot drift apart.
// ---------------------------------------------------------------------------

export type PresetId =
  | "long-call"
  | "long-put"
  | "earnings-call"
  | "bull-call-spread"
  | "bear-put-spread"
  | "bull-put-spread"
  | "bear-call-spread"
  | "covered-call"
  | "cash-secured-put"
  | "iron-condor";

export interface Preset {
  id: PresetId;
  name: string;
  /** One-line description of the view and the structure. */
  blurb: string;
  S0: number;
  days: number;
  sigma: number;
  legs: Leg[];
  /** Plain-English legs for display. */
  legsText: string[];
}

export const PRESETS: Record<PresetId, Preset> = {
  "long-call": {
    id: "long-call",
    name: "Long call",
    blurb: "Buy one 100-strike call. Bullish; risk limited to the premium.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [{ kind: "call", qty: 1, strike: 100 }],
    legsText: ["Buy 1 x 100 call"],
  },
  "long-put": {
    id: "long-put",
    name: "Long put",
    blurb: "Buy one 100-strike put. Bearish or protective; risk limited to the premium.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [{ kind: "put", qty: 1, strike: 100 }],
    legsText: ["Buy 1 x 100 put"],
  },
  "earnings-call": {
    id: "earnings-call",
    name: "Call bought before earnings",
    blurb: "Buy one 100-strike call a week before earnings, with IV inflated by the event.",
    S0: 100,
    days: 7,
    sigma: 0.8,
    legs: [{ kind: "call", qty: 1, strike: 100 }],
    legsText: ["Buy 1 x 100 call (7 days, event IV)"],
  },
  "bull-call-spread": {
    id: "bull-call-spread",
    name: "Bull call spread (debit)",
    blurb: "Buy the 100 call, sell the 110 call. Bullish with capped profit and cheaper entry.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [
      { kind: "call", qty: 1, strike: 100 },
      { kind: "call", qty: -1, strike: 110 },
    ],
    legsText: ["Buy 1 x 100 call", "Sell 1 x 110 call"],
  },
  "bear-put-spread": {
    id: "bear-put-spread",
    name: "Bear put spread (debit)",
    blurb: "Buy the 100 put, sell the 90 put. Bearish with capped profit and cheaper entry.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [
      { kind: "put", qty: 1, strike: 100 },
      { kind: "put", qty: -1, strike: 90 },
    ],
    legsText: ["Buy 1 x 100 put", "Sell 1 x 90 put"],
  },
  "bull-put-spread": {
    id: "bull-put-spread",
    name: "Bull put spread (credit)",
    blurb: "Sell the 95 put, buy the 90 put. Collect a credit; wins if price stays above 95.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [
      { kind: "put", qty: -1, strike: 95 },
      { kind: "put", qty: 1, strike: 90 },
    ],
    legsText: ["Sell 1 x 95 put", "Buy 1 x 90 put"],
  },
  "bear-call-spread": {
    id: "bear-call-spread",
    name: "Bear call spread (credit)",
    blurb: "Sell the 105 call, buy the 110 call. Collect a credit; wins if price stays below 105.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [
      { kind: "call", qty: -1, strike: 105 },
      { kind: "call", qty: 1, strike: 110 },
    ],
    legsText: ["Sell 1 x 105 call", "Buy 1 x 110 call"],
  },
  "covered-call": {
    id: "covered-call",
    name: "Covered call",
    blurb: "Own 100 shares, sell the 105 call. Income now; upside capped; downside still yours.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [
      { kind: "stock", qty: 1 },
      { kind: "call", qty: -1, strike: 105 },
    ],
    legsText: ["Own 100 shares", "Sell 1 x 105 call"],
  },
  "cash-secured-put": {
    id: "cash-secured-put",
    name: "Cash-secured put",
    blurb: "Sell the 95 put with cash set aside to buy 100 shares. Paid to wait for a lower entry.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [{ kind: "put", qty: -1, strike: 95 }],
    legsText: ["Sell 1 x 95 put (cash held for 9,500)"],
  },
  "iron-condor": {
    id: "iron-condor",
    name: "Iron condor",
    blurb: "Sell a put spread and a call spread around price. A bet on staying inside a range.",
    S0: 100,
    days: 30,
    sigma: 0.3,
    legs: [
      { kind: "put", qty: 1, strike: 90 },
      { kind: "put", qty: -1, strike: 95 },
      { kind: "call", qty: -1, strike: 105 },
      { kind: "call", qty: 1, strike: 110 },
    ],
    legsText: ["Buy 1 x 90 put", "Sell 1 x 95 put", "Sell 1 x 105 call", "Buy 1 x 110 call"],
  },
};

export const presetEntry = (p: Preset): Market => ({ S: p.S0, days: p.days, sigma: p.sigma });
