import { bsGreeks, daysToYears } from "@/lib/options/blackScholes";
import CountUp from "../CountUp";
import { Candles, GAIN, LOSS, generateCandles, line, movingAverage, rng } from "./shapes";

/**
 * Abstract trading-desk panels. They are design elements: shapes are seeded and illustrative,
 * labelled as such, and never carry tickers, prices, or P&L. The only numbers are Greeks
 * computed by the course's own Black-Scholes engine for a stated model option.
 */

const W = 640;
const H = 250;
const candles = generateCandles(46, 7312);
const maFast = movingAverage(candles, 5);
const maSlow = movingAverage(candles, 14);

function Bar({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="panel-bar">
      <span className="flex items-center">
        <span className="dot" />
        {left}
      </span>
      {right ? <span className="hidden sm:inline">{right}</span> : null}
    </div>
  );
}

export function CandlePanel() {
  const r = rng(5);
  const vols = candles.map((c) => 0.25 + Math.abs(c.c - c.o) * 6 + r() * 0.25);
  const maxV = Math.max(...vols);
  const step = W / candles.length;
  return (
    <section className="panel" aria-label="Illustrative candlestick and volume chart">
      <Bar left="Chart / illustrative" right="Not market data" />
      <div className="p-3 pb-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Abstract candlestick chart with two moving averages. Decorative, not real prices." focusable="false">
          {[0.2, 0.4, 0.6, 0.8].map((g) => (
            <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="var(--line)" strokeWidth={1} />
          ))}
          <Candles data={candles} W={W} H={H} tickLast />
          <path d={line(maSlow, W, H)} className="draw" pathLength={1} strokeDasharray={1} style={{ ["--len" as string]: 1 }} fill="none" stroke="var(--accent)" strokeWidth={2} />
          <path d={line(maFast, W, H)} className="draw" pathLength={1} strokeDasharray={1} style={{ ["--len" as string]: 1, animationDelay: "0.7s" }} fill="none" stroke="var(--fg)" strokeWidth={1.5} opacity={0.8} />
        </svg>
        <svg viewBox={`0 0 ${W} 56`} className="mt-1 block w-full" aria-hidden focusable="false">
          {vols.map((v, i) => {
            const h = (v / maxV) * 52;
            const up = candles[i].c >= candles[i].o;
            return <rect key={i} className="vol" style={{ ["--i" as string]: i }} x={i * step + step * 0.21} y={56 - h} width={step * 0.58} height={h} fill={up ? GAIN : LOSS} opacity={0.55} />;
          })}
        </svg>
      </div>
    </section>
  );
}

export function LadderPanel() {
  const r = rng(23);
  const asks = Array.from({ length: 6 }, () => 18 + r() * 78);
  const bids = Array.from({ length: 6 }, () => 18 + r() * 78);
  return (
    <section className="panel" aria-label="Illustrative order book ladder">
      <Bar left="Ladder" right="Illustrative" />
      <div className="mono grid gap-[3px] p-3 text-[10px]" aria-hidden>
        {asks.map((w, i) => (
          <div key={`a${i}`} className="flex items-center justify-end gap-2" style={{ ["--i" as string]: i }}>
            <span className="text-fg-muted">A{6 - i}</span>
            <div className="h-3.5 flex-1">
              <div className="ladder-row ladder-pulse ml-auto h-full" style={{ ["--i" as string]: i, width: `${w}%`, background: "rgba(255,92,97,0.55)" }} />
            </div>
          </div>
        ))}
        <div className="my-1 flex items-center gap-2 border-y border-line-strong py-1 text-[10px] font-bold tracking-widest text-accent">
          <span>SPREAD</span>
          <span className="h-px flex-1 bg-line-strong" />
        </div>
        {bids.map((w, i) => (
          <div key={`b${i}`} className="flex items-center gap-2" style={{ ["--i" as string]: i + 6 }}>
            <span className="text-fg-muted">B{i + 1}</span>
            <div className="h-3.5 flex-1">
              <div className="ladder-row bid ladder-pulse h-full" style={{ ["--i" as string]: i + 6, width: `${w}%`, background: "rgba(47,210,125,0.55)" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const g = bsGreeks("call", { S: 100, K: 100, T: daysToYears(30), sigma: 0.3, r: 0.04 });

export function GaugePanel() {
  const rot = -90 + 180 * g.delta;
  const ticks = Array.from({ length: 11 }, (_, i) => -90 + i * 18);
  return (
    <section className="panel" aria-label="Greeks gauge for a model option">
      <Bar left="Greeks" right="30D ATM call" />
      <div className="p-3">
        <svg viewBox="0 0 200 112" className="block w-full" role="img" aria-label={`Delta gauge showing ${g.delta.toFixed(2)}`} focusable="false">
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--line-strong)" strokeWidth={10} />
          <path d="M20 100 A80 80 0 0 1 100 20" fill="none" stroke="var(--line)" strokeWidth={10} />
          {ticks.map((a) => (
            <line key={`t${a}`} x1={100} y1={14} x2={100} y2={a % 90 === 0 ? 26 : 22} stroke="var(--fg-muted)" strokeWidth={1.2} transform={`rotate(${a} 100 100)`} />
          ))}
          <g className="needle" style={{ ["--rot" as string]: `${rot}deg` }}>
            <line x1={100} y1={100} x2={100} y2={30} stroke="var(--accent)" strokeWidth={3} />
          </g>
          <circle cx={100} cy={100} r={6} fill="var(--accent)" />
          <text x={16} y={110} className="mono" fontSize={8} fill="var(--fg-muted)">0</text>
          <text x={176} y={110} className="mono" fontSize={8} fill="var(--fg-muted)">1</text>
        </svg>
        <dl className="mono mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div>
            <dt className="label">Delta</dt>
            <dd className="text-xl font-bold text-fg"><CountUp value={g.delta} decimals={3} /></dd>
          </div>
          <div>
            <dt className="label">Gamma</dt>
            <dd className="text-xl font-bold text-fg"><CountUp value={g.gamma} decimals={3} /></dd>
          </div>
          <div>
            <dt className="label">Theta / day</dt>
            <dd className="font-bold text-loss"><CountUp value={g.theta * 100} decimals={2} prefix="$" /></dd>
          </div>
          <div>
            <dt className="label">Vega / pt</dt>
            <dd className="font-bold text-gain"><CountUp value={g.vega * 100} decimals={2} prefix="$" /></dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/** The hero composition: one wide chart panel over a ladder and a gauge. */
export default function DeskWall() {
  return (
    <div className="grid gap-3">
      <CandlePanel />
      <div className="grid gap-3 sm:grid-cols-2">
        <GaugePanel />
        <LadderPanel />
      </div>
      <p className="mono text-[10px] leading-relaxed text-fg-muted">
        Shapes are illustrative, not market data. The Greeks are computed by this course&rsquo;s Black-Scholes engine for a 30-day at-the-money call (underlying 100, IV 30%), per contract.
      </p>
    </div>
  );
}
