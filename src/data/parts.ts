import type { Part } from "./types";

export const PARTS: Part[] = [
  { id: "truth", numeral: "00", title: "The truth", blurb: "What the evidence says about people who trade options, before anything else." },
  { id: "mechanics", numeral: "I", title: "Mechanics", blurb: "Contracts, value, breakevens, exercise, and the real cost of getting in and out." },
  { id: "greeks", numeral: "II", title: "The Greeks", blurb: "Delta, gamma, theta, vega with numbers, and why expiry day behaves differently." },
  { id: "volatility", numeral: "III", title: "Volatility", blurb: "Implied vs realized, IV rank, and why a correct call can still lose around earnings." },
  { id: "strategies", numeral: "IV", title: "Defined-risk strategies", blurb: "Verticals, covered calls, cash-secured puts, and iron condors, with live payoff charts." },
  { id: "risk", numeral: "V", title: "Risk and mind", blurb: "Sizing, trade plans, journaling, and the psychology that decides outcomes." },
  { id: "process", numeral: "VI", title: "How I actually trade", blurb: "The checklist and scoring behind my own options decision engine." },
];
