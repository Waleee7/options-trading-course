/** Small, pure chart helpers. Unit-tested so the SVG code can stay dumb. */

export interface Linear {
  (v: number): number;
  invert: (px: number) => number;
}

export function linear(d0: number, d1: number, r0: number, r1: number): Linear {
  const span = d1 - d0 || 1;
  const f = ((v: number) => r0 + ((v - d0) / span) * (r1 - r0)) as Linear;
  f.invert = (px: number) => d0 + ((px - r0) / (r1 - r0 || 1)) * span;
  return f;
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** "Nice" tick values covering [min, max], roughly `count` of them. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!(max > min)) return [min];
  const raw = (max - min) / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}

const MINUS = "−";

/** $1,234 with a true minus sign. `sign` forces a leading + on positives. */
export function money(v: number, opts: { sign?: boolean; decimals?: number } = {}): string {
  const d = opts.decimals ?? 0;
  const abs = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  if (Math.round(Math.abs(v) * 10 ** d) === 0) return `$${abs}`;
  if (v < 0) return `${MINUS}$${abs}`;
  return `${opts.sign ? "+" : ""}$${abs}`;
}

/** Piecewise-linear path through points in pixel space. */
export function linePath(pts: Array<[number, number]>): string {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

/** Evenly sampled x values, inclusive of both ends. */
export function sample(lo: number, hi: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
}
