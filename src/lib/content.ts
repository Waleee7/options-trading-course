import type { Block, Module } from "@/data/types";

/** Plain text of one block, for word counts. */
function blockText(b: Block): string {
  switch (b.t) {
    case "p":
    case "h":
      return b.text;
    case "list":
      return b.items.join(" ");
    case "callout":
      return `${b.title ?? ""} ${b.text}`;
    case "table":
      return [...b.head, ...b.rows.flat()].join(" ");
    case "worked":
      return `${b.title} ${b.rows.flat().join(" ")} ${b.result ?? ""}`;
    case "formula":
      return `${b.text} ${b.note ?? ""}`;
    case "payoff":
    case "greeks":
      return b.caption;
    case "template":
      return b.body;
    default:
      return "";
  }
}

export const wordCount = (m: Module): number =>
  m.blocks.map(blockText).join(" ").split(/\s+/).filter(Boolean).length + m.lede.split(/\s+/).length;

/** Reading time in minutes, +1 for each interactive block (people play with them). */
export function readMinutes(m: Module): number {
  const interactive = m.blocks.filter((b) => b.t === "payoff" || b.t === "greeks" || b.t === "sizing").length;
  return Math.max(2, Math.round(wordCount(m) / 220) + interactive);
}

export type Inline =
  | { k: "text"; v: string }
  | { k: "strong"; v: string }
  | { k: "code"; v: string }
  | { k: "link"; v: string; href: string };

/** Tiny inline markup: **bold**, `code`, [label](url). Anything else is literal text. */
export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m.index > last) out.push({ k: "text", v: src.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ k: "strong", v: m[1] });
    else if (m[2] !== undefined) out.push({ k: "code", v: m[2] });
    else out.push({ k: "link", v: m[3], href: m[4] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ k: "text", v: src.slice(last) });
  return out;
}
