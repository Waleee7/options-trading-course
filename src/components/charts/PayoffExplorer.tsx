"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  PRESETS,
  chartRange,
  entryCost,
  expiryPnL,
  expirySummary,
  positionGreeks,
  positionPnL,
  presetEntry,
  type PresetId,
} from "@/lib/options/strategies";
import { clamp, linePath, linear, money, niceTicks, sample } from "./scale";
import { useElementWidth } from "./useElementWidth";

interface Props {
  preset: PresetId;
  caption?: string;
  start?: { S?: number; days?: number; sigma?: number };
}

const N = 121;
const M = { l: 58, r: 14, t: 14, b: 30 };

export default function PayoffExplorer({ preset, caption, start }: Props) {
  const p = PRESETS[preset];
  const uid = useId();
  const [wrapRef, width] = useElementWidth(640);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  const init = { S: start?.S ?? p.S0, days: start?.days ?? p.days, sigma: start?.sigma ?? p.sigma };
  const [S, setS] = useState(init.S);
  const [days, setDays] = useState(init.days);
  const [sigma, setSigma] = useState(init.sigma);

  const entry = useMemo(() => presetEntry(p), [p]);
  const cost = useMemo(() => entryCost(p.legs, entry), [p, entry]);
  const summary = useMemo(() => expirySummary(p.legs, cost), [p, cost]);
  const [xLo, xHi] = useMemo(() => chartRange(p.S0, p.legs, p.sigma, p.days), [p]);

  const xs = useMemo(() => sample(xLo, xHi, N), [xLo, xHi]);
  const expiryY = useMemo(() => xs.map((x) => expiryPnL(p.legs, cost, x)), [xs, p, cost]);
  const todayY = useMemo(
    () => xs.map((x) => positionPnL(p.legs, entry, { S: x, days, sigma })),
    [xs, p, entry, days, sigma],
  );

  const yAll = [...expiryY, ...todayY, 0];
  const yMin = Math.min(...yAll);
  const yMax = Math.max(...yAll);
  const pad = (yMax - yMin) * 0.08 || 10;
  const y0 = yMin - pad;
  const y1 = yMax + pad;

  const w = Math.max(280, width);
  const h = clamp(Math.round(w * 0.52), 250, 360);
  const x = linear(xLo, xHi, M.l, w - M.r);
  const y = linear(y0, y1, h - M.b, M.t);
  const zeroY = y(0);

  const pts = (ys: number[]): Array<[number, number]> => xs.map((xv, i) => [x(xv), y(ys[i])]);
  const expiryPts = pts(expiryY);
  const todayPts = pts(todayY);
  const areaPath = `${linePath(expiryPts)} L${x(xHi).toFixed(1)},${zeroY.toFixed(1)} L${x(xLo).toFixed(1)},${zeroY.toFixed(1)} Z`;

  const pnlNow = positionPnL(p.legs, entry, { S, days, sigma });
  const pnlExpiry = expiryPnL(p.legs, cost, S);
  const g = positionGreeks(p.legs, { S, days, sigma });
  const handleX = x(S);
  const handleY = y(pnlNow);

  const yTicks = niceTicks(y0, y1, 5);
  const xTicks = niceTicks(xLo, xHi, w < 480 ? 4 : 7);

  const stepS = p.S0 >= 200 ? 0.5 : 0.25;
  const dayStep = p.days <= 10 ? 0.25 : 0.5;
  const dirty = S !== init.S || days !== init.days || sigma !== init.sigma;

  const setFromPointer = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    setS(clamp(Math.round(x.invert(px) / stepS) * stepS, xLo, xHi));
  };

  const onKey = (e: React.KeyboardEvent) => {
    const big = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") setS((v) => clamp(v + stepS * big, xLo, xHi));
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setS((v) => clamp(v - stepS * big, xLo, xHi));
    else if (e.key === "Home") setS(xLo);
    else if (e.key === "End") setS(xHi);
    else return;
    e.preventDefault();
  };

  const maxLossTxt = summary.maxLoss === Infinity ? "Unlimited" : money(summary.maxLoss);
  const maxProfitTxt = summary.maxProfit === Infinity ? "Unlimited" : money(summary.maxProfit);
  const beTxt = summary.breakevens.map((b) => `$${b.toFixed(2)}`).join(" / ") || "none";
  const entryTxt = cost >= 0 ? `${money(cost, { decimals: 2 })} debit` : `${money(-cost, { decimals: 2 })} credit`;

  const good = pnlNow >= 0;
  const label = `${p.name}. Price ${S.toFixed(2)}, ${days} days left, IV ${Math.round(sigma * 100)} percent. Profit and loss now ${money(pnlNow)}. At expiry ${money(pnlExpiry)}.`;

  return (
    <figure className="panel my-10 p-4 sm:p-6" aria-labelledby={`${uid}-t`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div>
          <p className="label">Interactive payoff - Black-Scholes</p>
          <h4 id={`${uid}-t`} className="mt-1 font-mono text-base font-semibold text-fg">
            {p.name}
          </h4>
        </div>
        <ul className="font-mono text-xs text-fg-muted" style={{ color: "var(--fg-muted)" }}>
          {p.legsText.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div ref={wrapRef} className="mt-4 select-none touch-pan-y">
        <svg
          ref={svgRef}
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="group"
          aria-label={label}
          className="block max-w-full"
          onPointerDown={(e) => {
            dragging.current = true;
            (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
            setFromPointer(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && setFromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          style={{ cursor: "ew-resize", touchAction: "pan-y" }}
        >
          <defs>
            <clipPath id={`${uid}-up`}>
              <rect x={M.l} y={0} width={w - M.l - M.r} height={Math.max(0, zeroY)} />
            </clipPath>
            <clipPath id={`${uid}-dn`}>
              <rect x={M.l} y={zeroY} width={w - M.l - M.r} height={Math.max(0, h - zeroY)} />
            </clipPath>
          </defs>

          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={w - M.r} y1={y(t)} y2={y(t)} stroke="#28313c" strokeWidth={1} />
              <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#94a0af" fontFamily="var(--font-mono)">
                {money(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={x(t)} y={h - 9} textAnchor="middle" fontSize={11} fill="#94a0af" fontFamily="var(--font-mono)">
              {t % 1 === 0 ? t : t.toFixed(1)}
            </text>
          ))}

          <path d={areaPath} fill="#2fd27d" fillOpacity={0.2} clipPath={`url(#${uid}-up)`} />
          <path d={areaPath} fill="#ff5c61" fillOpacity={0.2} clipPath={`url(#${uid}-dn)`} />
          <line x1={M.l} x2={w - M.r} y1={zeroY} y2={zeroY} stroke="#eef1f5" strokeWidth={1.5} />

          {/* entry price */}
          <line x1={x(p.S0)} x2={x(p.S0)} y1={M.t} y2={h - M.b} stroke="#94a0af" strokeWidth={1} strokeDasharray="2 4" />
          <text x={x(p.S0) + 5} y={M.t + 10} fontSize={10} fill="#94a0af" fontFamily="var(--font-mono)">
            entry
          </text>

          <path d={linePath(expiryPts)} fill="none" stroke="#94a0af" strokeWidth={2} strokeDasharray="6 4" />
          <path d={linePath(todayPts)} fill="none" stroke="#eef1f5" strokeWidth={2.75} strokeLinejoin="round" />

          {summary.breakevens.map((b) => (
            <g key={b}>
              <path d={`M${x(b) - 5},${zeroY + 10} L${x(b) + 5},${zeroY + 10} L${x(b)},${zeroY + 2} Z`} fill="#eef1f5" />
            </g>
          ))}

          {/* draggable handle */}
          <line x1={handleX} x2={handleX} y1={M.t} y2={h - M.b} stroke={good ? "#2fd27d" : "#ff5c61"} strokeWidth={1.5} />
          <g
            role="slider"
            tabIndex={0}
            aria-label="Underlying price"
            aria-valuemin={xLo}
            aria-valuemax={xHi}
            aria-valuenow={Number(S.toFixed(2))}
            aria-valuetext={`${S.toFixed(2)} dollars, profit and loss ${money(pnlNow)}`}
            onKeyDown={onKey}
            style={{ outline: "none" }}
            className="focus-visible:[&>rect]:stroke-[#ffb224]"
          >
            <rect x={handleX - 14} y={handleY - 14} width={28} height={28} fill="transparent" stroke="transparent" strokeWidth={2} />
            <circle cx={handleX} cy={handleY} r={7} fill={good ? "#2fd27d" : "#ff5c61"} stroke="#090c10" strokeWidth={2.5} />
          </g>
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
        <span>
          <svg width="22" height="8" aria-hidden className="inline align-middle"><line x1="0" x2="22" y1="4" y2="4" stroke="#eef1f5" strokeWidth="3" /></svg> today (model)
        </span>
        <span>
          <svg width="22" height="8" aria-hidden className="inline align-middle"><line x1="0" x2="22" y1="4" y2="4" stroke="#94a0af" strokeWidth="2" strokeDasharray="5 3" /></svg> at expiry
        </span>
        <span>
          <svg width="10" height="10" aria-hidden className="inline align-middle"><path d="M0,10 L10,10 L5,1 Z" fill="#eef1f5" /></svg> breakeven
        </span>
      </div>

      {/* readout */}
      <dl className="mt-5 grid grid-cols-2 gap-px bg-line font-mono text-sm sm:grid-cols-4" style={{ background: "var(--line)" }}>
        <Cell k="P&L now" v={money(pnlNow, { sign: true })} tone={good ? "gain" : "loss"} big />
        <Cell k="P&L at expiry here" v={money(pnlExpiry, { sign: true })} tone={pnlExpiry >= 0 ? "gain" : "loss"} big />
        <Cell k="Entry" v={entryTxt} />
        <Cell k="Breakeven (expiry)" v={beTxt} />
        <Cell k="Max profit" v={maxProfitTxt} />
        <Cell k="Max loss" v={maxLossTxt} />
        <Cell k="Delta / Gamma" v={`${g.delta.toFixed(1)} / ${g.gamma.toFixed(2)}`} />
        <Cell k="Theta/day | Vega/pt" v={`${money(g.theta, { decimals: 2 })} | ${money(g.vega, { decimals: 2 })}`} />
      </dl>

      {/* controls */}
      <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-3">
        <Control id={`${uid}-s`} label="Underlying price" value={`$${S.toFixed(2)}`}>
          <input id={`${uid}-s`} className="slider" type="range" min={xLo} max={xHi} step={stepS} value={S} onChange={(e) => setS(Number(e.target.value))} />
        </Control>
        <Control id={`${uid}-d`} label="Days to expiry" value={`${days}d`}>
          <input id={`${uid}-d`} className="slider" type="range" min={0} max={p.days} step={dayStep} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        </Control>
        <Control id={`${uid}-v`} label="Implied volatility" value={`${Math.round(sigma * 100)}%`}>
          <input id={`${uid}-v`} className="slider" type="range" min={0.05} max={1.5} step={0.01} value={sigma} onChange={(e) => setSigma(Number(e.target.value))} />
        </Control>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setS(init.S);
            setDays(init.days);
            setSigma(init.sigma);
          }}
          disabled={!dirty}
          className="t100 border-2 border-fg px-3 py-2 font-mono text-xs font-semibold text-fg hover:bg-canvas hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setDays(0)}
          className="t100 border-2 border-fg px-3 py-2 font-mono text-xs font-semibold text-fg hover:bg-canvas hover:text-fg"
        >
          Jump to expiry
        </button>
        <p className="max-w-md font-mono text-[11px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Theoretical mid prices, flat IV, 4% rate, no dividends, no fees. Real fills are worse.
        </p>
      </div>

      {caption ? (
        <figcaption className="mt-5 border-t border-line pt-4 text-[15px] leading-relaxed" style={{ borderColor: "var(--line)", color: "var(--fg-muted)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Cell({ k, v, tone, big }: { k: string; v: string; tone?: "gain" | "loss"; big?: boolean }) {
  const color = tone === "gain" ? "var(--gain)" : tone === "loss" ? "var(--loss)" : "var(--fg)";
  return (
    <div className="p-3" style={{ background: "var(--deep)" }}>
      <dt className="label">{k}</dt>
      <dd className={big ? "mt-1 text-lg font-bold" : "mt-1 text-[13px] font-semibold"} style={{ color }}>
        {v}
      </dd>
    </div>
  );
}

function Control({ id, label, value, children }: { id: string; label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono">
        <label htmlFor={id} className="label">
          {label}
        </label>
        <span className="text-sm font-semibold text-fg">{value}</span>
      </div>
      {children}
    </div>
  );
}
