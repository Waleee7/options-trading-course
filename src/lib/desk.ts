/**
 * Decorative trading-desk geometry. Deterministic (seeded) so server and client agree,
 * and abstract on purpose: there are no tickers, prices, or P&L figures anywhere in it.
 */

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

/** Small seeded PRNG (mulberry32) returning [0, 1). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A mean-reverting random walk shaped into candles, all values in [0, 1].
 * The last close is pulled back to the first open so the strip tiles seamlessly.
 */
export function generateCandles(n: number, seed: number): Candle[] {
  const r = rng(seed);
  const raw: number[] = [0.5];
  for (let i = 1; i <= n; i++) {
    const prev = raw[i - 1];
    raw.push(prev + (r() - 0.5) * 0.16 + (0.5 - prev) * 0.08);
  }
  // Blend the tail back to the start so the loop has no seam.
  const drift = raw[n] - raw[0];
  const closes = raw.map((v, i) => v - drift * (i / n));
  const lo = Math.min(...closes);
  const hi = Math.max(...closes);
  const norm = (v: number) => 0.08 + ((v - lo) / (hi - lo || 1)) * 0.84;
  const out: Candle[] = [];
  for (let i = 0; i < n; i++) {
    const o = norm(closes[i]);
    const c = norm(closes[i + 1]);
    const wick = 0.012 + r() * 0.035;
    out.push({ o, c, h: Math.min(1, Math.max(o, c) + wick), l: Math.max(0, Math.min(o, c) - wick * (0.6 + r())) });
  }
  return out;
}

/** Simple moving average of closes, same length as input (first points use a shorter window). */
export function movingAverage(candles: Candle[], window: number): number[] {
  return candles.map((_, i) => {
    const from = Math.max(0, i - window + 1);
    const slice = candles.slice(from, i + 1);
    return slice.reduce((s, c) => s + c.c, 0) / slice.length;
  });
}
