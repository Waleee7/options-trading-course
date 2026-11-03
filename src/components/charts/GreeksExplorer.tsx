"use client";

import { useId, useMemo, useState } from "react";
import { bsGreeks, daysToYears, type Greeks, type OptionKind } from "@/lib/options/blackScholes";
import { clamp, linePath, linear, money, niceTicks, sample } from "./scale";
import { useElementWidth } from "./useElementWidth";

type Which = "delta" | "gamma" | "theta" | "vega";

interface Props {
  S0: number;
  sigma: number;
  dtes: number[];
  focus?: Which;
  caption?: string;
}

const COLORS = ["#eef1f5", "#ff5c61", "#2fd27d", "#94a0af"];
const DASH = ["", "", "", "5 3"];
const M = { l: 56, r: 14, t: 14, b: 30 };
const N = 161;

const META: Record<Which, { name: string; unit: string; fmt: (v: number) => string; scale: number }> = {
  delta: { name: "Delta", unit: "per share, per $1", fmt: (v) => v.toFixed(3), scale: 1 },
  gamma: { name: "Gamma", unit: "delta change per $1", fmt: (v) => v.toFixed(4), scale: 1 },
  theta: { name: "Theta", unit: "$ per contract per day", fmt: (v) => money(v, { decimals: 2 }), scale: 100 },
  vega: { name: "Vega", unit: "$ per contract per IV point", fmt: (v) => money(v, { decimals: 2 }), scale: 100 },
};

const dteLabel = (d: number) => (d < 1 ? `${Math.round(d * 24)}h` : `${d}d`);

export default function GreeksExplorer({ S0, sigma: sigma0, dtes, focus = "delta", caption }: Props) {
  const uid = useId();
  const [wrapRef, width] = useElementWidth(640);
  const [which, setWhich] = useState<Which>(focus);
  const [kind, setKind] = useState<OptionKind>("call");
  const [sigma, setSigma] = useState(sigma0);
  const [S, setS] = useState(S0);

  const maxD = Math.max(...dtes);
  const half = clamp(sigma * Math.sqrt(maxD / 365) * 1.6, 0.04, 0.3) * S0;
  const lo = S0 - half;
  const hi = S0 + half;
  const xs = useMemo(() => sample(lo, hi, N), [lo, hi]);

  const val = (s: number, d: number, g: Which) => {
    const gr: Greeks = bsGreeks(kind, { S: s, K: S0, T: daysToYears(d), sigma, r: 0.04 });
    return gr[g] * META[g].scale;
  };

  const curves = useMemo(
    () => dtes.map((d) => xs.map((s) => val(s, d, which))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dtes, xs, which, kind, sigma, S0],
  );

  const all = curves.flat();
  let y0 = Math.min(...all, which === "delta" ? (kind === "put" ? -1 : 0) : 0);
  let y1 = Math.max(...all, which === "delta" && kind === "call" ? 1 : 0);
  const pad = (y1 - y0) * 0.06 || 0.01;
  y0 -= which === "gamma" || which === "vega" ? 0 : pad;
  y1 += pad;

  const w = Math.max(280, width);
  const h = clamp(Math.round(w * 0.5), 240, 340);
  const x = linear(lo, hi, M.l, w - M.r);
  const y = linear(y0, y1, h - M.b, M.t);
  const yTicks = niceTicks(y0, y1, 5);
  const xTicks = niceTicks(lo, hi, w < 480 ? 4 : 7);
  const m = META[which];
  const yFmt = (t: number) => (which === "theta" || which === "vega" ? money(t) : which === "gamma" ? t.toFixed(2) : t.toFixed(1));

  return (
    <figure className="panel my-10 p-4 sm:p-6" aria-labelledby={`${uid}-t`}>
      <p className="label">Interactive Greeks - Black-Scholes</p>
      <h4 id={`${uid}-t`} className="mt-1 font-mono text-base font-semibold text-fg">
        {m.name} of a {S0} strike {kind}, versus the underlying
      </h4>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a Greek">
        {(Object.keys(META) as Which[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={which === k}
            onClick={() => setWhich(k)}
            className={`t100 border-2 px-3 py-2 font-mono text-xs font-semibold ${which === k ? "border-fg bg-base text-fg" : "border-line text-fg hover:border-fg"}`}
            style={which === k ? undefined : { borderColor: "var(--line)" }}
          >
            {META[k].name}
          </button>
        ))}
        <span className="mx-1 hidden w-px bg-line sm:block" style={{ background: "var(--line)" }} />
        {(["call", "put"] as OptionKind[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`t100 border-2 px-3 py-2 font-mono text-xs font-semibold ${kind === k ? "border-fg bg-base text-fg" : "border-line text-fg hover:border-fg"}`}
            style={kind === k ? undefined : { borderColor: "var(--line)" }}
          >
            {k === "call" ? "Call" : "Put"}
          </button>
        ))}
      </div>

      <div ref={wrapRef} className="mt-4">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${m.name} versus underlying price for expiries ${dtes.map(dteLabel).join(", ")}`} className="block max-w-full">
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={w - M.r} y1={y(t)} y2={y(t)} stroke="#28313c" />
              <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#94a0af" fontFamily="var(--font-mono)">
                {yFmt(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={x(t)} y={h - 9} textAnchor="middle" fontSize={11} fill="#94a0af" fontFamily="var(--font-mono)">
              {Math.round(t * 10) / 10}
            </text>
          ))}
          <line x1={x(S0)} x2={x(S0)} y1={M.t} y2={h - M.b} stroke="#94a0af" strokeDasharray="2 4" />
          {curves.map((c, i) => (
            <path
              key={dtes[i]}
              d={linePath(xs.map((xv, j) => [x(xv), y(c[j])] as [number, number]))}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              strokeDasharray={DASH[i % DASH.length]}
              strokeLinejoin="round"
            />
          ))}
          <line x1={x(S)} x2={x(S)} y1={M.t} y2={h - M.b} stroke="#eef1f5" strokeWidth={1} />
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
        {dtes.map((d, i) => (
          <span key={d}>
            <svg width="22" height="8" aria-hidden className="inline align-middle">
              <line x1="0" x2="22" y1="4" y2="4" stroke={COLORS[i % COLORS.length]} strokeWidth="3" strokeDasharray={DASH[i % DASH.length]} />
            </svg>{" "}
            {dteLabel(d)} to expiry
          </span>
        ))}
        <span>{m.unit}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: "var(--line)" }}>
        {dtes.map((d, i) => (
          <div key={d} className="p-3" style={{ background: "var(--deep)" }}>
            <p className="label">at {S.toFixed(1)} - {dteLabel(d)}</p>
            <p className="mt-1 font-mono text-lg font-bold" style={{ color: COLORS[i % COLORS.length] }}>
              {m.fmt(val(S, d, which))}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between font-mono">
            <label htmlFor={`${uid}-s`} className="label">Underlying price</label>
            <span className="text-sm font-semibold text-fg">${S.toFixed(1)}</span>
          </div>
          <input id={`${uid}-s`} className="slider" type="range" min={lo} max={hi} step={S0 >= 200 ? 0.25 : 0.1} value={S} onChange={(e) => setS(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex items-baseline justify-between font-mono">
            <label htmlFor={`${uid}-v`} className="label">Implied volatility</label>
            <span className="text-sm font-semibold text-fg">{Math.round(sigma * 100)}%</span>
          </div>
          <input id={`${uid}-v`} className="slider" type="range" min={0.05} max={1.2} step={0.01} value={sigma} onChange={(e) => setSigma(Number(e.target.value))} />
        </div>
      </div>

      {caption ? (
        <figcaption className="mt-5 border-t pt-4 text-[15px] leading-relaxed" style={{ borderColor: "var(--line)", color: "var(--fg-muted)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
