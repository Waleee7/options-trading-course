import { generateCandles, movingAverage, rng, type Candle } from "@/lib/desk";

export const GAIN = "var(--gain)";
export const LOSS = "var(--loss)";

export const yAt = (H: number) => (v: number) => +(H * (1 - v)).toFixed(1);

/** Candlesticks in a W x H box. Pure SVG; each candle carries --i for staggered CSS entrance. */
export function Candles({ data, W, H, animate = true, tickLast = false }: { data: Candle[]; W: number; H: number; animate?: boolean; tickLast?: boolean }) {
  const y = yAt(H);
  const step = W / data.length;
  const bw = step * 0.58;
  return (
    <>
      {data.map((c, i) => {
        const x = i * step + step / 2;
        const up = c.c >= c.o;
        const col = up ? GAIN : LOSS;
        const top = Math.min(y(c.o), y(c.c));
        const h = Math.max(2, Math.abs(y(c.o) - y(c.c)));
        const last = tickLast && i === data.length - 1;
        return (
          <g key={i} className={animate ? "candle" : undefined} style={{ ["--i" as string]: i }}>
            <g className={last ? "candle-tick" : undefined}>
              <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.4} />
              <rect x={x - bw / 2} y={top} width={bw} height={h} fill={col} />
            </g>
          </g>
        );
      })}
    </>
  );
}

export const line = (vals: number[], W: number, H: number) => {
  const y = yAt(H);
  const step = W / vals.length;
  return vals.map((v, i) => `${i ? "L" : "M"}${(i * step + step / 2).toFixed(1)},${y(v)}`).join(" ");
};

export { generateCandles, movingAverage, rng };
