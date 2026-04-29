export interface GlossaryTerm {
  term: string;
  definition: string;
  category: "basics" | "options" | "greeks" | "strategy" | "trading";
  relatedModule?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Stock",
    definition: "A share of ownership in a company. When you buy a stock, you own a small piece of that company.",
    category: "basics",
    relatedModule: "intro-stock-market",
  },
  {
    term: "IPO (Initial Public Offering)",
    definition: "When a private company sells shares to the public for the first time to raise money.",
    category: "basics",
    relatedModule: "intro-stock-market",
  },
  {
    term: "Bull Market",
    definition: "A market condition where stock prices are generally rising. Think of a bull charging UP.",
    category: "basics",
    relatedModule: "intro-stock-market",
  },
  {
    term: "Bear Market",
    definition: "A market condition where stock prices are falling 20%+ from recent highs. Think of a bear swiping DOWN.",
    category: "basics",
    relatedModule: "intro-stock-market",
  },
  {
    term: "Volume",
    definition: "The number of shares or contracts traded during a given period. High volume = lots of activity and interest.",
    category: "basics",
    relatedModule: "intro-stock-market",
  },
  {
    term: "Market Cap",
    definition: "Total value of a company, calculated as share price × total shares outstanding.",
    category: "basics",
    relatedModule: "intro-stock-market",
  },
  {
    term: "Index",
    definition: "A group of stocks tracked together as a benchmark. The S&P 500 tracks 500 of the biggest U.S. companies.",
    category: "basics",
    relatedModule: "intro-stock-market",
  },
  {
    term: "Option",
    definition: "A contract giving you the right (not obligation) to buy or sell a stock at a specific price before a specific date.",
    category: "options",
    relatedModule: "what-are-options",
  },
  {
    term: "Call Option",
    definition: "The right to BUY 100 shares at the strike price. You buy calls when you think the stock is going UP (bullish).",
    category: "options",
    relatedModule: "calls-explained",
  },
  {
    term: "Put Option",
    definition: "The right to SELL 100 shares at the strike price. You buy puts when you think the stock is going DOWN (bearish).",
    category: "options",
    relatedModule: "puts-explained",
  },
  {
    term: "Strike Price",
    definition: "The price at which you can buy (call) or sell (put) the underlying stock when exercising the option.",
    category: "options",
    relatedModule: "what-are-options",
  },
  {
    term: "Expiration Date",
    definition: "The deadline for an option contract. After this date, the option ceases to exist.",
    category: "options",
    relatedModule: "what-are-options",
  },
  {
    term: "Premium",
    definition: "The price you pay to buy an option contract. This is your maximum risk as a buyer.",
    category: "options",
    relatedModule: "what-are-options",
  },
  {
    term: "Underlying",
    definition: "The stock or ETF that an option is based on. For example, Apple is the underlying for AAPL options.",
    category: "options",
    relatedModule: "what-are-options",
  },
  {
    term: "Contract",
    definition: "One options contract controls 100 shares. A $2.00 option costs $200 per contract (100 × $2.00).",
    category: "options",
    relatedModule: "what-are-options",
  },
  {
    term: "In-the-Money (ITM)",
    definition: "A call where stock price > strike price, or a put where stock price < strike price. The option has intrinsic value.",
    category: "options",
    relatedModule: "calls-explained",
  },
  {
    term: "At-the-Money (ATM)",
    definition: "When the stock price roughly equals the strike price. ATM options have ~0.50 delta.",
    category: "options",
    relatedModule: "calls-explained",
  },
  {
    term: "Out-of-the-Money (OTM)",
    definition: "A call where stock price < strike price, or a put where stock price > strike price. No intrinsic value.",
    category: "options",
    relatedModule: "calls-explained",
  },
  {
    term: "Break-even",
    definition: "The stock price needed at expiration to neither profit nor lose. Calls: strike + premium. Puts: strike - premium.",
    category: "options",
    relatedModule: "calls-explained",
  },
  {
    term: "Intrinsic Value",
    definition: "The real, tangible value of an option — how much it's in-the-money. ATM and OTM options have zero intrinsic value.",
    category: "options",
    relatedModule: "calls-explained",
  },
  {
    term: "Time Value",
    definition: "The extra premium beyond intrinsic value, representing the possibility the stock could move more before expiration.",
    category: "options",
    relatedModule: "calls-explained",
  },
  {
    term: "Protective Put",
    definition: "Buying a put on a stock you own as insurance against a big price drop. Also called a married put.",
    category: "options",
    relatedModule: "puts-explained",
  },
  {
    term: "Bid",
    definition: "The price buyers are willing to pay right now. This is what you'll get if you sell an option.",
    category: "trading",
    relatedModule: "reading-options-chain",
  },
  {
    term: "Ask",
    definition: "The price sellers are asking for right now. This is what you'll pay to buy an option.",
    category: "trading",
    relatedModule: "reading-options-chain",
  },
  {
    term: "Bid-Ask Spread",
    definition: "The difference between bid and ask. Tight spread = liquid, fair pricing. Wide spread = illiquid, hidden cost.",
    category: "trading",
    relatedModule: "reading-options-chain",
  },
  {
    term: "Open Interest (OI)",
    definition: "Total number of outstanding option contracts that haven't been closed or exercised. Indicates ongoing participation.",
    category: "trading",
    relatedModule: "reading-options-chain",
  },
  {
    term: "Options Chain",
    definition: "A table showing all available options for a stock — calls on left, puts on right, strikes down the middle.",
    category: "trading",
    relatedModule: "reading-options-chain",
  },
  {
    term: "Theta (Time Decay)",
    definition: "Measures how much value an option loses per day from time passing. Accelerates near expiration. Bad for buyers, good for sellers.",
    category: "greeks",
    relatedModule: "theta-greek",
  },
  {
    term: "Delta",
    definition: "How much an option's price changes per $1 stock move. Calls: 0 to 1.0. Puts: 0 to -1.0. Also approximates ITM probability.",
    category: "greeks",
    relatedModule: "delta-greek",
  },
  {
    term: "Gamma",
    definition: "The rate of change of delta per $1 stock move. If delta is speed, gamma is acceleration. Highest for ATM options near expiration.",
    category: "greeks",
    relatedModule: "gamma-greek",
  },
  {
    term: "Vega",
    definition: "How much an option's price changes per 1% move in implied volatility. Higher IV = higher option prices.",
    category: "greeks",
    relatedModule: "vega-greek",
  },
  {
    term: "Implied Volatility (IV)",
    definition: "The market's expectation of how much a stock will move. High IV = expensive options. Low IV = cheap options.",
    category: "greeks",
    relatedModule: "vega-greek",
  },
  {
    term: "IV Crush",
    definition: "A sharp drop in implied volatility after an anticipated event (earnings, FDA decisions). Can destroy option value even if direction is correct.",
    category: "greeks",
    relatedModule: "vega-greek",
  },
  {
    term: "IV Rank",
    definition: "Where current IV sits relative to the past year on a 0-100 scale. Above 50 = relatively high IV.",
    category: "greeks",
    relatedModule: "vega-greek",
  },
  {
    term: "0DTE (Zero Days to Expiration)",
    definition: "Options expiring the same day. Extremely high theta and gamma — very risky for buyers.",
    category: "trading",
    relatedModule: "theta-greek",
  },
  {
    term: "Support",
    definition: "A price level where a stock tends to stop falling and bounce up — a floor. Formed by buying pressure at that level.",
    category: "strategy",
    relatedModule: "support-resistance",
  },
  {
    term: "Resistance",
    definition: "A price level where a stock tends to stop rising and pull back — a ceiling. Formed by selling pressure at that level.",
    category: "strategy",
    relatedModule: "support-resistance",
  },
  {
    term: "Breakout",
    definition: "When a stock moves above resistance with conviction. Old resistance often becomes new support. Volume confirms legitimacy.",
    category: "strategy",
    relatedModule: "support-resistance",
  },
  {
    term: "Fake-out",
    definition: "A breakout or breakdown on low volume that reverses. Traps traders who acted too early without confirmation.",
    category: "strategy",
    relatedModule: "support-resistance",
  },
  {
    term: "Position Sizing",
    definition: "How much capital to risk per trade. Rule: never risk more than 2-5% of your trading account on a single options trade.",
    category: "strategy",
    relatedModule: "picking-contracts",
  },
  {
    term: "DTE (Days to Expiration)",
    definition: "Number of days until an option expires. 30-45 DTE is the sweet spot for most beginner trades.",
    category: "trading",
    relatedModule: "picking-contracts",
  },
  {
    term: "Vertical Spread (Debit Spread)",
    definition: "Buying one option and selling another at a different strike, same expiration. Defined risk and defined reward.",
    category: "strategy",
    relatedModule: "basic-spreads",
  },
  {
    term: "Bull Call Spread",
    definition: "Buy a lower strike call + sell a higher strike call. Used when moderately bullish. Cheaper than a single call.",
    category: "strategy",
    relatedModule: "basic-spreads",
  },
  {
    term: "Bear Put Spread",
    definition: "Buy a higher strike put + sell a lower strike put. Used when moderately bearish.",
    category: "strategy",
    relatedModule: "basic-spreads",
  },
  {
    term: "Leverage",
    definition: "Using options to control more shares for less money. Amplifies both gains and losses.",
    category: "options",
    relatedModule: "what-are-options",
  },
  {
    term: "Revenge Trading",
    definition: "Jumping into trades emotionally after a loss to 'make it back.' Almost always leads to bigger losses.",
    category: "strategy",
    relatedModule: "common-mistakes",
  },
  {
    term: "LEAPS",
    definition: "Long-term options with 60+ days (often 6-24 months) to expiration. Minimal daily theta, used for high-conviction bets.",
    category: "trading",
    relatedModule: "picking-contracts",
  },
];

export const GLOSSARY_CATEGORIES = {
  basics: { label: "Market Basics", color: "#3b82f6" },
  options: { label: "Options Fundamentals", color: "#8b5cf6" },
  greeks: { label: "The Greeks", color: "#f59e0b" },
  strategy: { label: "Strategy", color: "#10b981" },
  trading: { label: "Trading Mechanics", color: "#ef4444" },
} as const;
