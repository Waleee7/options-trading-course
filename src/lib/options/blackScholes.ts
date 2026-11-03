/**
 * Black-Scholes-Merton pricing and Greeks for European options on a
 * non-dividend (or continuous-yield) underlying.
 *
 * Conventions (read these before trusting a number):
 *  - T is in YEARS. Use `daysToYears` for calendar days (days / 365).
 *  - sigma is annualised implied vol as a decimal (0.30 = 30%).
 *  - r is the continuously compounded risk-free rate, q the continuous yield.
 *  - theta is dollars per share per CALENDAR day (negative for long options).
 *  - vega is dollars per share per ONE vol point (1% = 0.01 of sigma).
 *  - rho is dollars per share per ONE percentage point of rate.
 *  - All values are per share. Multiply by 100 for one standard US contract.
 *
 * Model limits: flat volatility (no skew or smile), no early exercise (so it
 * is exact for European options and a good approximation for American calls
 * without dividends), no bid/ask, no commissions. It is a teaching model.
 */

export type OptionKind = "call" | "put";

export interface BSInput {
  /** Underlying price. */
  S: number;
  /** Strike. */
  K: number;
  /** Time to expiry in years. */
  T: number;
  /** Annualised implied volatility, decimal. */
  sigma: number;
  /** Risk-free rate, decimal. */
  r: number;
  /** Continuous dividend yield, decimal. Defaults to 0. */
  q?: number;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export const DEFAULT_RATE = 0.04;

export const daysToYears = (days: number): number => days / 365;

/** Standard normal PDF. */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard normal CDF. West (2005), "Better approximations to cumulative
 * normal functions" (Hart's double-precision algorithm, ~1e-15 relative).
 */
export function normCdf(x: number): number {
  const xabs = Math.abs(x);
  let c: number;
  if (xabs > 37) {
    c = 0;
  } else {
    const e = Math.exp(-0.5 * xabs * xabs);
    if (xabs < 7.07106781186547) {
      let b = 3.52624965998911e-2 * xabs + 0.700383064443688;
      b = b * xabs + 6.37396220353165;
      b = b * xabs + 33.912866078383;
      b = b * xabs + 112.079291497871;
      b = b * xabs + 221.213596169931;
      b = b * xabs + 220.206867912376;
      c = e * b;
      b = 8.83883476483184e-2 * xabs + 1.75566716318264;
      b = b * xabs + 16.064177579207;
      b = b * xabs + 86.7807322029461;
      b = b * xabs + 296.564248779674;
      b = b * xabs + 637.333633378831;
      b = b * xabs + 793.826512519948;
      b = b * xabs + 440.413735824752;
      c = c / b;
    } else {
      let b = xabs + 0.65;
      b = xabs + 4 / b;
      b = xabs + 3 / b;
      b = xabs + 2 / b;
      b = xabs + 1 / b;
      c = e / b / 2.506628274631;
    }
  }
  return x > 0 ? 1 - c : c;
}

/** Intrinsic value per share. */
export function intrinsic(kind: OptionKind, S: number, K: number): number {
  return kind === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
}

function d1d2(i: BSInput): { d1: number; d2: number } {
  const q = i.q ?? 0;
  const volT = i.sigma * Math.sqrt(i.T);
  const d1 = (Math.log(i.S / i.K) + (i.r - q + 0.5 * i.sigma * i.sigma) * i.T) / volT;
  return { d1, d2: d1 - volT };
}

const isDegenerate = (i: BSInput): boolean => i.T <= 0 || i.sigma <= 0 || i.S <= 0 || i.K <= 0;

/** Theoretical option value per share. Falls back to intrinsic at/after expiry. */
export function bsPrice(kind: OptionKind, i: BSInput): number {
  if (i.T <= 0) return intrinsic(kind, i.S, i.K);
  const q = i.q ?? 0;
  if (isDegenerate(i)) {
    // Zero vol: the forward is deterministic, so value is discounted forward intrinsic.
    const fwd = i.S * Math.exp((i.r - q) * i.T);
    const disc = Math.exp(-i.r * i.T);
    const payoff = kind === "call" ? Math.max(fwd - i.K, 0) : Math.max(i.K - fwd, 0);
    return payoff * disc;
  }
  const { d1, d2 } = d1d2(i);
  const dfR = Math.exp(-i.r * i.T);
  const dfQ = Math.exp(-q * i.T);
  if (kind === "call") return i.S * dfQ * normCdf(d1) - i.K * dfR * normCdf(d2);
  return i.K * dfR * normCdf(-d2) - i.S * dfQ * normCdf(-d1);
}

/** Greeks per share. At/after expiry delta is the step function and the rest are zero. */
export function bsGreeks(kind: OptionKind, i: BSInput): Greeks {
  if (i.T <= 0 || i.sigma <= 0 || i.S <= 0 || i.K <= 0) {
    const itm = kind === "call" ? i.S > i.K : i.S < i.K;
    return { delta: itm ? (kind === "call" ? 1 : -1) : 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }
  const q = i.q ?? 0;
  const { d1, d2 } = d1d2(i);
  const sqrtT = Math.sqrt(i.T);
  const dfR = Math.exp(-i.r * i.T);
  const dfQ = Math.exp(-q * i.T);
  const pdf = normPdf(d1);

  const gamma = (dfQ * pdf) / (i.S * i.sigma * sqrtT);
  const vegaPerUnit = i.S * dfQ * pdf * sqrtT; // per 1.00 of sigma
  const decay = -(i.S * dfQ * pdf * i.sigma) / (2 * sqrtT);

  if (kind === "call") {
    const thetaYear = decay - i.r * i.K * dfR * normCdf(d2) + q * i.S * dfQ * normCdf(d1);
    return {
      delta: dfQ * normCdf(d1),
      gamma,
      theta: thetaYear / 365,
      vega: vegaPerUnit / 100,
      rho: (i.K * i.T * dfR * normCdf(d2)) / 100,
    };
  }
  const thetaYear = decay + i.r * i.K * dfR * normCdf(-d2) - q * i.S * dfQ * normCdf(-d1);
  return {
    delta: dfQ * (normCdf(d1) - 1),
    gamma,
    theta: thetaYear / 365,
    vega: vegaPerUnit / 100,
    rho: (-i.K * i.T * dfR * normCdf(-d2)) / 100,
  };
}

/**
 * Implied volatility by bisection. Returns null when the price is outside the
 * no-arbitrage bounds (below intrinsic / above the underlying) or T <= 0.
 */
export function impliedVol(
  kind: OptionKind,
  price: number,
  i: Omit<BSInput, "sigma">,
  tol = 1e-8,
): number | null {
  if (i.T <= 0) return null;
  let lo = 1e-4;
  let hi = 5;
  const f = (s: number) => bsPrice(kind, { ...i, sigma: s }) - price;
  if (f(lo) > 0 || f(hi) < 0) return null;
  for (let n = 0; n < 200; n++) {
    const mid = 0.5 * (lo + hi);
    const v = f(mid);
    if (Math.abs(v) < tol) return mid;
    if (v > 0) hi = mid;
    else lo = mid;
  }
  return 0.5 * (lo + hi);
}

/**
 * One-standard-deviation expected move of the underlying implied by IV over
 * `days` calendar days: S * sigma * sqrt(days / 365). A convention, not a forecast.
 */
export function expectedMove(S: number, sigma: number, days: number): number {
  return S * sigma * Math.sqrt(Math.max(days, 0) / 365);
}

/** Probability (under the model's risk-neutral measure) that S_T finishes above K. */
export function probFinishAbove(i: BSInput): number {
  if (i.T <= 0) return i.S > i.K ? 1 : 0;
  const { d2 } = d1d2(i);
  return normCdf(d2);
}
