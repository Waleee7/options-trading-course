import type { Block } from "@/data/types";
import RichText from "./RichText";
import Evidence from "./Evidence";
import Receipts from "./Receipts";
import PayoffExplorer from "./charts/PayoffExplorer";
import GreeksExplorer from "./charts/GreeksExplorer";
import SizingCalculator from "./SizingCalculator";
import CopyTemplate from "./CopyTemplate";

const TONE: Record<string, { label: string; cls: string }> = {
  truth: { label: "The truth", cls: "bg-ink text-paper border-ink on-ink" },
  warn: { label: "Warning", cls: "bg-paper border-accent" },
  note: { label: "Note", cls: "bg-paper-2 border-ink" },
  think: { label: "Think", cls: "bg-paper border-ink border-dashed" },
};

function Callout({ b }: { b: Extract<Block, { t: "callout" }> }) {
  const t = TONE[b.tone];
  const truth = b.tone === "truth";
  return (
    <aside className={`callout my-9 border-2 border-l-[10px] p-5 ${t.cls}`}>
      <p className="label" style={truth ? { color: "var(--accent-bright)" } : b.tone === "warn" ? { color: "var(--accent)" } : undefined}>
        {t.label}
        {b.title ? ` / ${b.title}` : ""}
      </p>
      <p className="!my-2 !text-[1.0625rem] !leading-relaxed" style={truth ? { color: "var(--on-ink)" } : undefined}>
        <RichText text={b.text} />
      </p>
    </aside>
  );
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="lesson">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return (
              <p key={i}>
                <RichText text={b.text} />
              </p>
            );
          case "h":
            return <h2 key={i}>{b.text}</h2>;
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <RichText text={it} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "callout":
            return <Callout key={i} b={b} />;
          case "formula":
            return (
              <div key={i} className="formula my-8 border-y-2 border-ink py-4">
                <p className="mono !my-0 !text-base font-semibold text-ink sm:!text-lg">{b.text}</p>
                {b.note && <p className="mono !mb-0 !mt-2 !text-xs !leading-relaxed text-muted">{b.note}</p>}
              </div>
            );
          case "table":
            return (
              <div key={i} className="ledger-wrap" tabIndex={0} role="region" aria-label={b.caption ?? "Table"}>
                <table className="ledger">
                  {b.caption && <caption>{b.caption}</caption>}
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} scope="col">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) =>
                          k === 0 ? (
                            <th key={k} scope="row">{c}</th>
                          ) : (
                            <td key={k}>{c}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "worked":
            return (
              <section key={i} className="worked my-9 border-2 border-ink bg-paper-2" aria-label={b.title}>
                <p className="label border-b-2 border-ink px-4 py-2" style={{ color: "var(--ink)" }}>{b.title}</p>
                <dl className="mono divide-y divide-rule text-[13px]">
                  {b.rows.map(([k, v]) => (
                    <div key={k} className="grid gap-x-4 px-4 py-2.5 sm:grid-cols-[13rem_1fr]">
                      <dt className="text-muted">{k}</dt>
                      <dd className="font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                {b.result && (
                  <p className="!my-0 border-t-2 border-ink bg-paper px-4 py-3 !text-base !leading-relaxed">
                    <RichText text={b.result} />
                  </p>
                )}
              </section>
            );
          case "payoff":
            return <PayoffExplorer key={i} preset={b.preset} caption={b.caption} start={b.start} />;
          case "greeks":
            return <GreeksExplorer key={i} S0={b.S0} sigma={b.sigma} dtes={b.dtes} focus={b.focus} caption={b.caption} />;
          case "evidence":
            return (
              <div key={i} className="my-10">
                <Evidence />
              </div>
            );
          case "sizing":
            return <SizingCalculator key={i} />;
          case "template":
            return <CopyTemplate key={i} title={b.title} body={b.body} />;
          case "receipts":
            return <Receipts key={i} />;
        }
      })}
    </div>
  );
}
