import { positionPnL, presetEntry, PRESETS, type Market, type PresetId } from "@/lib/options/strategies";

export type Outcome = "gain" | "loss" | "flat";

/** Within this many dollars of zero a result counts as "roughly flat". */
export const FLAT_BAND = 10;

export interface Scenario {
  id: string;
  title: string;
  xp: number;
  preset: PresetId;
  /** What you did. */
  setup: string;
  /** What happened. */
  event: string;
  /** Market state used to mark the position. */
  now: Market;
  question: string;
  outcome: Outcome;
  explanation: string;
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  gain: `Gain of more than $${FLAT_BAND}`,
  loss: `Loss of more than $${FLAT_BAND}`,
  flat: `Roughly flat (within $${FLAT_BAND})`,
};

export const classify = (pnl: number): Outcome => (pnl > FLAT_BAND ? "gain" : pnl < -FLAT_BAND ? "loss" : "flat");

export const scenarioPnL = (s: Scenario): number => {
  const p = PRESETS[s.preset];
  return positionPnL(p.legs, presetEntry(p), s.now);
};

export const scenarios: Scenario[] = [
  {
    id: "earnings-right-way",
    title: "Right on direction",
    xp: 30,
    preset: "earnings-call",
    setup: "You buy one 7-day 100 call on a $100 stock at 80% IV, the day before earnings. It costs $4.45 ($445).",
    event: "The stock reports and rises 3% to $103. Implied volatility drops from 80% to 40%. Six days remain.",
    now: { S: 103, days: 6, sigma: 0.4 },
    question: "What is your P&L per contract the next morning?",
    outcome: "loss",
    explanation: "The call is worth $3.96. You lose about $50 despite being right on direction. The market priced an 11% move; you got 3%, and the IV crush removed more value than the rise added.",
  },
  {
    id: "flat-stock-time",
    title: "Nothing happens",
    xp: 25,
    preset: "long-call",
    setup: "You buy one 30-day 100 call for $3.59 ($359) with the stock at $100 and IV at 30%.",
    event: "Twenty days pass. The stock is still exactly $100. IV is unchanged. Ten days remain.",
    now: { S: 100, days: 10, sigma: 0.3 },
    question: "What is your P&L per contract?",
    outcome: "loss",
    explanation: "Time decay has taken about 43% of what you paid: roughly -$156. A flat stock is a losing trade for an option buyer.",
  },
  {
    id: "buyer-early-profit",
    title: "Profit below breakeven",
    xp: 25,
    preset: "long-call",
    setup: "Same long 100 call at $3.59 ($359). The expiry breakeven is $103.59.",
    event: "After 10 days the stock is at $103, still below the expiry breakeven. IV is unchanged. Twenty days remain.",
    now: { S: 103, days: 20, sigma: 0.3 },
    question: "What is your P&L per contract if you sell now?",
    outcome: "gain",
    explanation: "The call still has extrinsic value. It is worth about $4.73, so you are up roughly $114. The expiry breakeven only applies if you hold to the end.",
  },
  {
    id: "spread-right-small",
    title: "A spread that was right",
    xp: 30,
    preset: "bull-call-spread",
    setup: "You buy the 100/110 call spread for $2.94 ($294) with the stock at $100.",
    event: "You hold to expiration. The stock is up 3% at $103.",
    now: { S: 103, days: 0, sigma: 0.3 },
    question: "What is your P&L at expiry?",
    outcome: "flat",
    explanation: "At 103, the 100 call is worth $3 and the 110 call is worth zero. The spread is worth $300 against $294 paid: about +$6. A correct 3% rally barely breaks even on this structure.",
  },
  {
    id: "credit-spread-fell",
    title: "The stock fell and you still won",
    xp: 30,
    preset: "bull-put-spread",
    setup: "You sell the 95/90 put spread for a $0.93 credit ($93) with the stock at $100.",
    event: "The stock slides 3% to $97 and finishes there at expiry.",
    now: { S: 97, days: 0, sigma: 0.3 },
    question: "What is your P&L at expiry?",
    outcome: "gain",
    explanation: "Both puts expire worthless because $97 is above the short 95 strike. You keep the full $93 credit. The same trade loses nearly the full $407 if the stock finishes below $90. That asymmetry is the cost of the high win rate.",
  },
  {
    id: "condor-iv-spike",
    title: "Same price, higher fear",
    xp: 35,
    preset: "iron-condor",
    setup: "You sell the 90/95/105/110 iron condor for $1.94 ($194) with the stock at $100 and IV at 30%.",
    event: "Fifteen days later the stock is still at $100, but implied volatility has risen to 45%.",
    now: { S: 100, days: 15, sigma: 0.45 },
    question: "What is your P&L if you close now?",
    outcome: "loss",
    explanation: "The condor is short vega. The higher IV makes your short options more valuable to buy back, so the position is down about $14 even though price never moved.",
  },
  {
    id: "covered-call-dip",
    title: "Selling premium on a dip",
    xp: 30,
    preset: "covered-call",
    setup: "You own 100 shares at $100 and sell the 105 call for $1.66 ($166).",
    event: "At expiration the stock is $95.",
    now: { S: 95, days: 0, sigma: 0.3 },
    question: "What is your total P&L at expiry?",
    outcome: "loss",
    explanation: "The call expires worthless and you keep $166, but the shares are down $500. Net: about -$334. The premium cushions the loss; it does not remove it.",
  },
];
