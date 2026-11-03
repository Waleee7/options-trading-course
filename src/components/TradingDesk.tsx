import { generateCandles, movingAverage, type Candle } from "@/lib/desk";

/**
 * Decorative trading-desk atmosphere, behind all content. Pure CSS/SVG, no JS, no canvas.
 * Abstract on purpose: no tickers, prices, or P&L. Only transform/opacity animate.
 * Low contrast by design (ink at about 6 to 9% opacity) so the course text always wins.
 */
const TILE_W = 1600;
const TILE_H = 900;
const N = 64;
const STEP = TILE_W / N;

const candles = generateCandles(N, 20241102);
const fast = movingAverage(candles, 6);
const slow = movingAverage(candles, 18);

const yAt = (H: number) => (v: number) => (H * (1 - v)).toFixed(1);
const y = yAt(TILE_H);
const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${(i * STEP + STEP / 2).toFixed(1)},${y(v)}`).join(" ");

function Candles({ data, w = STEP, body = 0.6, H = TILE_H }: { data: Candle[]; w?: number; body?: number; H?: number }) {
  const y = yAt(H);
  return (
    <>
      {data.map((c, i) => {
        const x = i * w + w / 2;
        const up = c.c >= c.o;
        const top = Math.min(+y(c.o), +y(c.c));
        const h = Math.max(2, Math.abs(+y(c.o) - +y(c.c)));
        const fill = up ? "var(--gain)" : "var(--accent)";
        return (
          <g key={i} fill={fill} stroke={fill}>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <rect x={x - (w * body) / 2} y={top} width={w * body} height={h} stroke="none" />
          </g>
        );
      })}
    </>
  );
}

function Tile() {
  return (
    <svg width={TILE_W} height="100%" viewBox={`0 0 ${TILE_W} ${TILE_H}`} preserveAspectRatio="none" aria-hidden focusable="false" className="desk-tile">
      <Candles data={candles} />
      <path d={line(fast)} fill="none" stroke="var(--ink)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <path d={line(slow)} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const monitorCandles = generateCandles(22, 99);

function Monitor({ className }: { className: string }) {
  return (
    <svg className={className} width="300" height="210" viewBox="0 0 300 210" aria-hidden focusable="false">
      <rect x="6" y="6" width="288" height="168" rx="3" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <rect x="16" y="16" width="268" height="148" fill="var(--ink)" fillOpacity="0.5" />
      <svg x="20" y="22" width="260" height="136" viewBox="0 0 220 100" preserveAspectRatio="none">
        <Candles data={monitorCandles} w={10} body={0.55} H={100} />
      </svg>
      <path d="M130 174 h40 l8 22 h-56 z" fill="var(--ink)" />
      <rect x="104" y="196" width="92" height="6" fill="var(--ink)" />
    </svg>
  );
}

export default function TradingDesk() {
  return (
    <div className="desk" aria-hidden>
      <div className="desk-glow desk-glow-a" />
      <div className="desk-glow desk-glow-b" />
      <svg className="desk-grid" width="100%" height="100%" focusable="false">
        <defs>
          <pattern id="desk-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0H0V80" fill="none" stroke="var(--ink)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#desk-grid)" />
      </svg>
      <div className="desk-track">
        <Tile />
        <Tile />
      </div>
      <div className="desk-monitors">
        <Monitor className="desk-monitor desk-monitor-a" />
        <Monitor className="desk-monitor desk-monitor-b" />
      </div>
    </div>
  );
}
