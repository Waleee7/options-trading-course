import type { PresetId } from "@/lib/options/strategies";

export type PartId = "truth" | "mechanics" | "greeks" | "volatility" | "strategies" | "risk" | "process";

export interface Part {
  id: PartId;
  numeral: string;
  title: string;
  blurb: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** Index into options. */
  correct: number;
  explanation: string;
}

export type Tone = "truth" | "note" | "warn" | "think";

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "callout"; tone: Tone; title?: string; text: string }
  | { t: "table"; caption?: string; head: string[]; rows: string[][] }
  | { t: "worked"; title: string; rows: [string, string][]; result?: string }
  | { t: "formula"; text: string; note?: string }
  | {
      t: "payoff";
      preset: PresetId;
      caption: string;
      /** Open the explorer at a scenario instead of at entry. */
      start?: { S?: number; days?: number; sigma?: number };
    }
  | {
      t: "greeks";
      caption: string;
      focus?: "delta" | "gamma" | "theta" | "vega";
      /** Underlying and strike (at the money). */
      S0: number;
      sigma: number;
      /** Days to expiry for each plotted curve, longest first. */
      dtes: number[];
    }
  | { t: "evidence" }
  | { t: "sizing" }
  | { t: "template"; title: string; body: string }
  | { t: "receipts" };

export type PfCard = "compact" | "full";

export interface Module {
  id: string;
  part: PartId;
  title: string;
  lede: string;
  blocks: Block[];
  takeaways: string[];
  /** Glossary term ids shown at the end of the lesson. */
  terms: string[];
  quiz: QuizQuestion[];
  xp: number;
  pf?: PfCard;
}

export type GlossaryCategory = "contract" | "value" | "greeks" | "volatility" | "strategy" | "risk";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: GlossaryCategory;
  module?: string;
}
