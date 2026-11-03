import type { GlossaryCategory, GlossaryTerm } from "./types";

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, string> = {
  contract: "Contract",
  value: "Value",
  greeks: "Greeks",
  volatility: "Volatility",
  strategy: "Strategy",
  risk: "Risk and mind",
};

export const glossary: GlossaryTerm[] = [
  // Contract
  { id: "underlying", term: "Underlying", category: "contract", module: "calls-and-puts", definition: "The asset an option is written on, such as a stock or ETF." },
  { id: "call", term: "Call", category: "contract", module: "calls-and-puts", definition: "A contract giving the buyer the right, not the obligation, to buy the underlying at the strike on or before expiration." },
  { id: "put", term: "Put", category: "contract", module: "calls-and-puts", definition: "A contract giving the buyer the right, not the obligation, to sell the underlying at the strike on or before expiration." },
  { id: "strike", term: "Strike price", category: "contract", module: "calls-and-puts", definition: "The fixed price at which the option holder may buy (call) or sell (put) the underlying." },
  { id: "expiration", term: "Expiration", category: "contract", module: "calls-and-puts", definition: "The date after which the option no longer exists. Extrinsic value is zero at expiration." },
  { id: "premium", term: "Premium", category: "contract", module: "calls-and-puts", definition: "The price of an option, quoted per share. Multiply by 100 for the dollar cost of one standard contract." },
  { id: "contract-multiplier", term: "Contract multiplier", category: "contract", module: "calls-and-puts", definition: "The number of shares one contract controls. For standard US equity and ETF options it is 100." },
  { id: "exercise", term: "Exercise", category: "contract", module: "exercise-and-liquidity", definition: "The buyer using the right to buy (call) or sell (put) at the strike. Usually forfeits remaining extrinsic value." },
  { id: "assignment", term: "Assignment", category: "contract", module: "exercise-and-liquidity", definition: "The seller being required to perform after a buyer exercises: deliver shares on a short call, buy shares on a short put." },
  { id: "american-style", term: "American-style", category: "contract", module: "exercise-and-liquidity", definition: "Can be exercised at any time up to expiration. Applies to options on individual US stocks and most ETFs." },
  { id: "european-style", term: "European-style", category: "contract", module: "exercise-and-liquidity", definition: "Can be exercised only at expiration. Applies to cash-settled index options such as SPX." },
  { id: "bid-ask-spread", term: "Bid-ask spread", category: "contract", module: "exercise-and-liquidity", definition: "The gap between the highest price a buyer offers (bid) and the lowest a seller asks. You pay it every time you cross it." },
  { id: "mid-price", term: "Mid price", category: "contract", module: "exercise-and-liquidity", definition: "The midpoint of bid and ask. A reference point, not a price you are owed." },
  { id: "open-interest", term: "Open interest", category: "contract", module: "exercise-and-liquidity", definition: "The number of contracts currently outstanding. Higher open interest usually means easier trading." },
  { id: "volume", term: "Volume", category: "contract", module: "exercise-and-liquidity", definition: "The number of contracts traded in a session. Shows live activity, unlike open interest, which can be stale." },
  { id: "limit-order", term: "Limit order", category: "contract", module: "exercise-and-liquidity", definition: "An order to buy or sell at a specified price or better. Protects you from filling at a poor price on a wide spread." },
  { id: "leverage", term: "Leverage", category: "contract", module: "the-truth", definition: "Controlling a large notional position with a small amount of capital. Magnifies both gains and losses." },

  // Value
  { id: "intrinsic-value", term: "Intrinsic value", category: "value", module: "value-and-breakeven", definition: "What an option would be worth if exercised now: underlying minus strike for a call, strike minus underlying for a put, never below zero." },
  { id: "extrinsic-value", term: "Extrinsic value", category: "value", module: "value-and-breakeven", definition: "Premium minus intrinsic value. Also called time value; it decays to zero by expiration." },
  { id: "itm", term: "In the money (ITM)", category: "value", module: "value-and-breakeven", definition: "A call with the underlying above the strike, or a put with the underlying below it." },
  { id: "atm", term: "At the money (ATM)", category: "value", module: "value-and-breakeven", definition: "Strike approximately equal to the underlying price." },
  { id: "otm", term: "Out of the money (OTM)", category: "value", module: "value-and-breakeven", definition: "A call with the underlying below the strike, or a put with the underlying above it. All of its premium is extrinsic." },
  { id: "breakeven", term: "Breakeven", category: "value", module: "value-and-breakeven", definition: "The underlying price at expiration where P&L is zero. Long call: strike + premium. Long put: strike - premium." },

  // Greeks
  { id: "delta", term: "Delta", category: "greeks", module: "delta-gamma", definition: "Change in option price per $1 move in the underlying. Calls 0 to 1, puts -1 to 0." },
  { id: "gamma", term: "Gamma", category: "greeks", module: "delta-gamma", definition: "Change in delta per $1 move in the underlying. Highest at the money and rising into expiry." },
  { id: "position-delta", term: "Position delta", category: "greeks", module: "delta-gamma", definition: "The net delta of all legs, in share equivalents. Read this, not the delta of one leg." },
  { id: "theta", term: "Theta", category: "greeks", module: "theta-vega", definition: "Change in option price per day from the passage of time alone. Negative for long options." },
  { id: "time-decay", term: "Time decay", category: "greeks", module: "theta-vega", definition: "The erosion of extrinsic value as expiration approaches. It accelerates for at-the-money options near the end." },
  { id: "vega", term: "Vega", category: "greeks", module: "theta-vega", definition: "Change in option price per one-point change in implied volatility. Positive for long options." },
  { id: "rho", term: "Rho", category: "greeks", module: "theta-vega", definition: "Change in option price per one-point change in interest rates. Usually minor for short-dated trades." },
  { id: "zero-dte", term: "0DTE", category: "greeks", module: "zero-dte", definition: "An option that expires today. Very low cost in dollars, extreme gamma and theta." },
  { id: "pin-risk", term: "Pin risk", category: "greeks", module: "zero-dte", definition: "The uncertainty around expiration when the underlying finishes near a strike and you cannot know whether a short option will be assigned." },

  // Volatility
  { id: "implied-volatility", term: "Implied volatility (IV)", category: "volatility", module: "implied-volatility", definition: "The volatility that, plugged into a pricing model, reproduces the option's market price. A price of uncertainty, not a forecast of direction." },
  { id: "realized-volatility", term: "Realized volatility", category: "volatility", module: "implied-volatility", definition: "The volatility the underlying actually exhibited over a period, usually measured from returns." },
  { id: "iv-rank", term: "IV rank", category: "volatility", module: "implied-volatility", definition: "Where current IV sits between its 52-week low and high: (IV - low) / (high - low)." },
  { id: "iv-percentile", term: "IV percentile", category: "volatility", module: "implied-volatility", definition: "The share of days in the past year on which IV was lower than it is now." },
  { id: "expected-move", term: "Expected move", category: "volatility", module: "implied-volatility", definition: "A one-standard-deviation range implied by IV: price x IV x sqrt(days / 365). A yardstick, not a prediction." },
  { id: "skew", term: "Skew", category: "volatility", module: "implied-volatility", definition: "The pattern of different IVs across strikes in the same expiry." },
  { id: "iv-crush", term: "IV crush", category: "volatility", module: "iv-crush", definition: "The sharp fall in implied volatility after a known event resolves, removing extrinsic value from options." },

  // Strategy
  { id: "vertical-spread", term: "Vertical spread", category: "strategy", module: "vertical-spreads", definition: "Buying one option and selling another of the same type and expiry at a different strike." },
  { id: "debit-spread", term: "Debit spread", category: "strategy", module: "vertical-spreads", definition: "A spread that costs money to open. Max loss is the debit; max profit is width minus the debit." },
  { id: "credit-spread", term: "Credit spread", category: "strategy", module: "vertical-spreads", definition: "A spread that pays you to open. Max profit is the credit; max loss is width minus the credit." },
  { id: "width", term: "Width", category: "strategy", module: "vertical-spreads", definition: "The distance between a spread's strikes. Width x 100 is the most one spread can be worth." },
  { id: "max-loss", term: "Maximum loss", category: "strategy", module: "vertical-spreads", definition: "The worst dollar outcome of a position. The number that drives position size." },
  { id: "covered-call", term: "Covered call", category: "strategy", module: "income-strategies", definition: "Owning 100 shares and selling one call against them. Collects premium and caps the upside." },
  { id: "cash-secured-put", term: "Cash-secured put", category: "strategy", module: "income-strategies", definition: "Selling a put while holding the cash to buy the shares if assigned." },
  { id: "cost-basis", term: "Cost basis", category: "strategy", module: "income-strategies", definition: "What you effectively paid for a position. Premium collected on a covered call lowers it." },
  { id: "wheel", term: "The wheel", category: "strategy", module: "income-strategies", definition: "Alternating cash-secured puts and covered calls on the same stock. Its results depend on the stock chosen." },
  { id: "iron-condor", term: "Iron condor", category: "strategy", module: "iron-condors", definition: "A short put spread plus a short call spread on the same expiry. Profits if price stays between the short strikes." },
  { id: "wing", term: "Wing", category: "strategy", module: "iron-condors", definition: "The long, protective option on each side of an iron condor that caps the loss." },
  { id: "short-volatility", term: "Short volatility", category: "strategy", module: "iron-condors", definition: "A position that profits when implied volatility falls or realized movement is smaller than priced." },

  // Risk and mind
  { id: "position-sizing", term: "Position sizing", category: "risk", module: "position-sizing", definition: "Choosing how many contracts to trade so that a loss equals a pre-set fraction of the account." },
  { id: "r-multiple", term: "R-multiple", category: "risk", module: "position-sizing", definition: "A result measured in units of the amount risked. A trade that makes twice its risk is +2R." },
  { id: "expectancy", term: "Expectancy", category: "risk", module: "position-sizing", definition: "Average result per trade: win rate x average win minus loss rate x average loss." },
  { id: "drawdown", term: "Drawdown", category: "risk", module: "position-sizing", definition: "The decline from a peak in account value to a subsequent low." },
  { id: "portfolio-heat", term: "Portfolio heat", category: "risk", module: "position-sizing", definition: "Total open risk across positions, counting correlated positions together." },
  { id: "trade-plan", term: "Trade plan", category: "risk", module: "plans-and-journal", definition: "A written statement made before entry: thesis, trigger, invalidation, max loss, targets, time stop, size." },
  { id: "invalidation", term: "Invalidation", category: "risk", module: "plans-and-journal", definition: "The price or condition that proves your thesis wrong. Your pre-agreed exit." },
  { id: "journal", term: "Trade journal", category: "risk", module: "plans-and-journal", definition: "A record of every trade and skipped trade with results, rule adherence, and mistakes." },
  { id: "revenge-trading", term: "Revenge trading", category: "risk", module: "psychology", definition: "Re-entering right after a loss to win it back, often larger or in a worse setup." },
  { id: "overtrading", term: "Overtrading", category: "risk", module: "psychology", definition: "Taking more or lower-quality trades than your plan calls for." },
  { id: "fomo", term: "FOMO", category: "risk", module: "psychology", definition: "Fear of missing out. Chasing a move after it already happened." },
  { id: "circuit-breaker", term: "Circuit breaker", category: "risk", module: "psychology", definition: "A pre-committed rule that stops trading automatically, such as a daily loss limit or a cooldown." },
  { id: "vwap", term: "VWAP", category: "risk", module: "how-i-trade", definition: "Volume-weighted average price for the session. A common intraday reference level." },
];
