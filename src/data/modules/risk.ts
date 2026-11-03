import type { Module } from "../types";

export const riskModules: Module[] = [
  {
    id: "position-sizing",
    part: "risk",
    title: "Position sizing and risk of ruin",
    lede: "Strategy gets the attention. Sizing decides whether you are still in the game after a bad month.",
    xp: 150,
    blocks: [
      { t: "p", text: "You cannot control whether a given trade wins. You can control how much it costs when it loses. Position sizing is the one lever that is entirely yours." },
      { t: "formula", text: "Contracts = floor( Account x Risk % per trade / Max loss per contract )", note: "Use the real worst case at the stop or at expiry. For long options and spreads, that is usually the full debit or width minus credit." },
      { t: "table", caption: "How many contracts fit a 1% risk budget? Max loss per contract from this course's model examples.", head: ["Account", "1% budget", "Long call ($359)", "Bull call spread ($294)", "Bull put spread ($407)", "Iron condor ($306)"], rows: [
        ["$10,000", "$100", "0", "0", "0", "0"],
        ["$25,000", "$250", "0", "0", "0", "0"],
        ["$50,000", "$500", "1", "1", "1", "1"],
        ["$100,000", "$1,000", "2", "3", "2", "3"],
      ] },
      { t: "callout", tone: "truth", title: "When the answer is zero", text: "On a $10,000 account with a 1% rule, none of these trades fit. That is the formula telling you the truth: the trade is too large for your plan. Your options are a narrower spread, a cheaper underlying, a bigger risk budget (which means accepting more risk), or no trade. Many traders ignore the zero and round up to one. That decision is where accounts get hurt." },
      { t: "sizing" },
      { t: "h", text: "The arithmetic of drawdowns" },
      { t: "p", text: "Losses hurt more than the headline number because recovery is measured against a smaller balance." },
      { t: "table", head: ["You lose", "You then need to gain to get back"], rows: [
        ["10%", "11.1%"],
        ["20%", "25%"],
        ["33.3%", "50%"],
        ["50%", "100%"],
        ["75%", "300%"],
      ] },
      { t: "p", text: "Losing streaks happen to everyone with any strategy. Here is what ten losses in a row leave behind at different risk-per-trade levels, using plain compounding:" },
      { t: "table", head: ["Risk per trade", "Account left after 10 straight losses"], rows: [
        ["1%", "90.4%"],
        ["5%", "59.9%"],
        ["10%", "34.9%"],
      ] },
      { t: "h", text: "Expectancy beats win rate" },
      { t: "formula", text: "Expectancy (in R) = p x W - (1 - p) x L", note: "p is the win rate, W the average win and L the average loss, both measured in R, where 1R is the amount you risk per trade." },
      { t: "list", items: [
        "Hypothetical: win 40% of the time, wins average 2R, losses average 1R. Expectancy = 0.4 x 2 - 0.6 x 1 = +0.2R per trade.",
        "Hypothetical: win 85% of the time, wins average 0.2R, losses average 1R. Expectancy = 0.85 x 0.2 - 0.15 x 1 = +0.02R. Still positive, but one extra loss in twenty trades turns it negative.",
        "A high win rate with small wins and big losses is the credit-spread shape. A low win rate with large wins is the long-option shape. Neither is better by itself.",
      ] },
      { t: "h", text: "Portfolio heat" },
      { t: "p", text: "Add up the maximum loss of everything open. If you hold long SPY calls, long QQQ calls, and a long NVDA call, that is mostly one bet: the market goes up. Treat correlated positions as one position when you count risk, and set a cap on total open risk, not just risk per trade." },
      { t: "callout", tone: "note", title: "Set limits before you need them", text: "Decide a maximum loss per trade, per day, and per week, in advance and in writing. A rule you write when calm is worth ten you improvise after a loss." },
    ],
    takeaways: [
      "Contracts = floor(account x risk % / max loss per contract). If the result is zero, the trade does not fit.",
      "Recovering from a 50% drawdown requires a 100% gain. Avoid the holes.",
      "Ten straight losses at 1% risk leave 90.4%; at 10% risk they leave 34.9%.",
      "Judge a strategy by expectancy and drawdown, not win rate. Count correlated positions as one when summing risk.",
    ],
    terms: ["position-sizing", "r-multiple", "expectancy", "drawdown", "portfolio-heat"],
    quiz: [
      {
        id: "ps-1",
        question: "Account $40,000, risk per trade 1%, max loss per contract $320. How many contracts?",
        options: ["0", "1", "1.25", "4"],
        correct: 1,
        explanation: "Budget = $400. 400 / 320 = 1.25, round DOWN to 1 contract.",
      },
      {
        id: "ps-2",
        question: "You lose 50% of your account. What gain do you need to get back to even?",
        options: ["50%", "75%", "100%", "150%"],
        correct: 2,
        explanation: "You are at 0.5 of the starting balance. To return to 1.0 you must double: +100%.",
      },
      {
        id: "ps-3",
        question: "Win rate 80%, average win 0.15R, average loss 1R. Expectancy per trade?",
        options: ["+0.12R", "-0.08R", "+0.55R", "0R"],
        correct: 1,
        explanation: "0.8 x 0.15 - 0.2 x 1 = 0.12 - 0.20 = -0.08R. A high win rate does not rescue a bad payoff ratio.",
      },
      {
        id: "ps-4",
        question: "You hold long SPY calls, long QQQ calls, and a long NVDA call. How should you count the risk?",
        options: [
          "As three independent bets",
          "As largely one correlated market bet",
          "As zero risk because they are calls",
          "As half risk because they are different tickers",
        ],
        correct: 1,
        explanation: "These tend to move together. Cap the total exposure to the correlated group, not just each position.",
      },
    ],
  },
  {
    id: "plans-and-journal",
    part: "risk",
    title: "Trade plans and the journal",
    lede: "A plan turns a feeling into a testable claim. A journal turns your trades into data you can learn from.",
    xp: 120,
    blocks: [
      { t: "p", text: "A trade plan is a short written statement made before you enter. It answers: why this trade, why now, what proves me wrong, how much can I lose, and when do I leave. The goal is not to predict. It is to remove improvisation from the moment when your emotions are loudest." },
      { t: "template", title: "Pre-trade plan", body: `PRE-TRADE PLAN
Date / underlying:
Thesis (one falsifiable sentence):
Trigger (why now):
Structure, strikes, expiry:
IV context (rank, percentile, event inside window?):
Max loss ($ and % of account):
Breakeven (price and % move needed):
Profit target(s):
Invalidation (the underlying price that proves me wrong):
Time stop (exit by when if nothing happens):
Contracts, and how I computed the size:
Liquidity: spread % of mid, open interest, volume:
Would I still take this if I had just won? Just lost?` },
      { t: "h", text: "The journal" },
      { t: "p", text: "After every trade, including the ones you skipped, write what happened and why. Review weekly. Track whether you followed your plan separately from whether you made money. A winning trade that broke the plan is a bad trade that got lucky." },
      { t: "template", title: "Post-trade journal entry", body: `POST-TRADE ENTRY
Result in R (and $):
Did I follow the plan? (yes / no, and where I deviated):
Mistake tags (chased, oversized, moved stop, revenge, exited early, held too long, ignored IV, no plan):
What did the market do versus what I expected?
How did I feel at entry, at the worst point, at exit?
One rule I will add, change, or remove:` },
      { t: "h", text: "What to measure" },
      { t: "list", items: [
        "**Plan adherence rate.** The share of trades where you followed your own rules. This is the metric you control.",
        "**Average win and average loss in R**, and your realized expectancy.",
        "**Maximum drawdown** and the longest losing streak you have lived through.",
        "**Mistake tags by frequency.** If 'moved stop' shows up in half of your losses, that is your next rule.",
        "**Skipped trades.** Record the setups you passed on and what happened. Discipline you cannot see you cannot improve.",
      ] },
      { t: "callout", tone: "think", title: "Keep it honest", text: "Do not delete losers. Do not round up. Do not screenshot only winners. A journal that flatters you is a diary, and diaries do not teach." },
    ],
    takeaways: [
      "Write the plan before the trade: thesis, trigger, invalidation, max loss, targets, time stop, size.",
      "Journal every trade and every skipped trade. Separate 'followed the plan' from 'made money'.",
      "Tag mistakes. Your most frequent tag becomes your next rule.",
      "A journal that hides losers is useless.",
    ],
    terms: ["trade-plan", "invalidation", "r-multiple", "journal"],
    quiz: [
      {
        id: "pj-1",
        question: "What is the purpose of defining invalidation before entering a trade?",
        options: [
          "To predict the exact price target",
          "To pre-commit to the price that proves your thesis wrong so you do not improvise under stress",
          "To guarantee the stop is never hit",
          "To satisfy your broker",
        ],
        correct: 1,
        explanation: "Invalidation is your pre-agreed exit for being wrong, decided while calm.",
      },
      {
        id: "pj-2",
        question: "You made money on a trade but broke your own rules. How should the journal score it?",
        options: ["A good trade", "A bad trade that got lucky", "Neutral, ignore it", "A perfect trade"],
        correct: 1,
        explanation: "Process is what you can repeat. Rewarding rule-breaking because it paid trains the wrong habit.",
      },
      {
        id: "pj-3",
        question: "Which metric is fully under your control?",
        options: ["Win rate", "Plan adherence rate", "Next week's P&L", "Implied volatility"],
        correct: 1,
        explanation: "You cannot control outcomes. You can control whether you followed your plan.",
      },
      {
        id: "pj-4",
        question: "Why record trades you skipped?",
        options: [
          "To brag about them",
          "To audit whether passing was disciplined or just fear, and to see what your filters are catching",
          "Brokers require it",
          "It reduces taxes",
        ],
        correct: 1,
        explanation: "Skipped trades show whether your filters work. They also reveal fear-driven passes.",
      },
    ],
  },
  {
    id: "psychology",
    part: "risk",
    title: "Psychology: revenge trading, overtrading, and the loops",
    lede: "Your strategy is not what usually breaks. Your behaviour on the third loss of the day is.",
    xp: 130,
    blocks: [
      { t: "p", text: "Remember the one behavioural number in this course: in SEBI's data, over 75% of the traders who lost money kept trading. The pattern is not ignorance of the rules. It is the difficulty of stopping when the position, the P&L, and your self-image are all moving at once." },
      { t: "h", text: "Patterns to name out loud" },
      { t: "table", head: ["Pattern", "What it looks like", "Counter-rule"], rows: [
        ["Revenge trading", "Re-entering right after a loss to 'get it back', usually larger or in a worse setup", "After a stop-out, no new entry on the same name for a fixed cooldown"],
        ["Overtrading", "Taking marginal setups because you are bored or want action", "Cap trades per day; require the written plan before every entry"],
        ["Chasing (FOMO)", "Buying after the move already happened", "Define an entry zone; if price is outside it, you missed it"],
        ["Averaging down", "Adding to a losing option because it is 'cheaper'", "Max loss is set at entry. Never add to a loser"],
        ["Moving the stop", "Widening it when price approaches", "Stops move only in the direction that reduces risk"],
        ["Cutting winners, holding losers", "Taking quick small gains while letting losses drift", "Exit rules for both sides, in writing, before entry"],
        ["Oversizing after a win", "Feeling invincible and doubling risk", "Size is a formula of the account, not of your mood"],
      ] },
      { t: "h", text: "Build circuit breakers" },
      { t: "p", text: "Willpower is a weak control. Rules that stop you automatically are stronger. Common breakers:" },
      { t: "list", items: [
        "**Daily loss limit.** When you hit it, you are done. Close the platform.",
        "**Consecutive-loss cooldown.** After two losses in a row, take a fixed break before the next trade.",
        "**Per-name lockout.** After a loss on a ticker, do not touch that ticker for a set period.",
        "**Trade-count cap and no-trade windows.** Some parts of the day are low-quality for you. Mark them as off-limits.",
        "**Profit lock.** If you are up on the day and give back a large share of the peak, stop. A green day should not round-trip into red.",
        "**Mandatory plan.** No written plan, no trade.",
      ] },
      { t: "callout", tone: "note", title: "I encoded these", text: "Every breaker above exists as a hard gate in my own trading engine. You will see the exact settings in the How I actually trade module." },
      { t: "h", text: "An exercise" },
      { t: "p", text: "Write five if-then rules for the moments you are most likely to break discipline. For example: if I take two losses in a row, then I stop for 45 minutes. If price is outside my entry zone, then I do not chase. Put them where you can see them while you trade." },
    ],
    takeaways: [
      "The behaviour that sinks most traders is repeating losing patterns, not lacking a strategy.",
      "Name your patterns: revenge, overtrading, chasing, averaging down, moving stops.",
      "Automatic rules beat willpower: daily loss limit, loss-streak cooldown, per-name lockout, profit lock.",
      "Write if-then rules in advance for the moments you are most likely to break discipline.",
    ],
    terms: ["revenge-trading", "overtrading", "fomo", "circuit-breaker"],
    quiz: [
      {
        id: "psy-1",
        question: "You get stopped out of a trade and immediately re-enter larger. What is this called?",
        options: ["Scaling in", "Revenge trading", "Hedging", "Position sizing"],
        correct: 1,
        explanation: "Trying to win the loss back immediately, often bigger, is the classic revenge trade.",
      },
      {
        id: "psy-2",
        question: "Which control is hardest to defeat in the heat of the moment?",
        options: [
          "A promise to be disciplined",
          "A rule that blocks the action (for example, a cooldown or a daily loss limit)",
          "A motivational quote",
          "Checking social media",
        ],
        correct: 1,
        explanation: "Automatic or pre-committed constraints work because they do not depend on your mood.",
      },
      {
        id: "psy-3",
        question: "You are up on the day but have given back half of your peak profit. A profit-lock rule says:",
        options: [
          "Trade larger to recover the peak",
          "Stop for the day and keep the green",
          "Switch to 0DTE",
          "Ignore it, the day is long",
        ],
        correct: 1,
        explanation: "Profit lock protects a good day from becoming a bad one.",
      },
      {
        id: "psy-4",
        question: "Which move is always against a sound risk plan?",
        options: [
          "Taking profits at a pre-set target",
          "Adding to a losing option because it is cheaper now",
          "Skipping a setup outside your entry zone",
          "Exiting at your time stop",
        ],
        correct: 1,
        explanation: "Averaging down increases risk on a position that is already proving you wrong.",
      },
    ],
  },
];
