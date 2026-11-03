import { Candles, generateCandles, line, movingAverage } from "./desk/shapes";

/**
 * The visible desk behind the course: a drifting candle wall, soft glows, and monitor frames
 * in the gutters. CSS/SVG only. Lesson text always sits on solid panels, so readability
 * does not depend on this layer being quiet.
 */
const TW = 1600;
const TH = 900;
const tile = generateCandles(64, 20241102);
const fast = movingAverage(tile, 6);

function Tile() {
  return (
    <svg width={TW} height="100%" viewBox={`0 0 ${TW} ${TH}`} preserveAspectRatio="none" aria-hidden focusable="false" className="desk-tile">
      <Candles data={tile} W={TW} H={TH} animate={false} />
      <path d={line(fast, TW, TH)} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const mon = generateCandles(26, 99);
const monMa = movingAverage(mon, 6);

function Monitor({ className }: { className: string }) {
  return (
    <svg className={className} width="360" height="250" viewBox="0 0 360 250" aria-hidden focusable="false">
      <rect x="4" y="4" width="352" height="196" rx="4" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="3" />
      <rect x="16" y="16" width="328" height="172" fill="var(--deep)" />
      <svg x="22" y="24" width="316" height="120" viewBox="0 0 316 120">
        <Candles data={mon} W={316} H={120} animate={false} />
        <path d={line(monMa, 316, 120)} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      </svg>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={24 + i * 19.5} y={190 - ((i * 37) % 31) - 8} width="12" height={((i * 37) % 31) + 8} fill={i % 3 ? "var(--gain)" : "var(--loss)"} opacity="0.5" transform="translate(0,-4)" />
      ))}
      <path d="M156 200 h48 l10 30 h-68 z" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <rect x="120" y="230" width="120" height="8" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
    </svg>
  );
}

export default function DeskBackdrop() {
  return (
    <div className="desk-back" aria-hidden>
      <div className="desk-glow desk-glow-a" />
      <div className="desk-glow desk-glow-b" />
      <svg className="desk-grid" width="100%" height="100%" focusable="false">
        <defs>
          <pattern id="desk-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
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
