import type { Module } from "../types";

export const truthModules: Module[] = [
  {
    id: "the-truth",
    part: "truth",
    title: "The truth first",
    lede: "Most people who trade options lose money. Start there, and decide what you want from this course with your eyes open.",
    xp: 100,
    blocks: [
      { t: "p", text: "Most course sites open with a screenshot of a green account. This one opens with the evidence on how retail traders actually do. Two sources, cited in full, and nothing else is added to them." },
      { t: "evidence" },
      { t: "h", text: "What these numbers do and do not say" },
      { t: "p", text: "They describe specific groups. SEBI studied individual equity futures and options traders in India. The Brazilian paper studied day traders of mini-index futures, not options. Neither is a forecast for you, and neither proves every retail options trader loses. What they show is a pattern: for most people who trade actively, costs and mistakes beat skill, and a large share of the people who lose keep going." },
      { t: "p", text: "That second point is the one to take personally. In the SEBI data, over 75% of loss-makers kept trading anyway. Losing is common. Continuing without changing anything is the choice you control." },
      { t: "h", text: "Why options are unforgiving" },
      { t: "list", items: [
        "**You must be right about three things.** Direction, size of the move, and timing. A stock trade only needs direction. A long option can lose when you are right on direction but wrong on the other two.",
        "**Time works against the buyer.** Every day, a long option loses time value. You will see exactly how much in the Greeks module.",
        "**Costs are paid on every round trip.** You buy at the ask and sell at the bid. Before fees, the buyer's gain is the seller's loss, and after the spread and commissions, the pair is net negative.",
        "**Leverage shortens your margin for error.** A small account can control a large notional position, so a short run of bad trades does disproportionate damage.",
        "**Behaviour compounds the above.** Revenge trades, oversizing after a win, and holding losers are not rare edge cases. They are the default human response to fast, leveraged P&L.",
      ] },
      { t: "h", text: "What this course will and will not do" },
      { t: "p", text: "It will teach you how an option is priced, what you are really paying for, how to define your risk before entering, and how to size so that being wrong is survivable. It includes interactive payoff charts built on Black-Scholes, unit-tested, so you can break trades before they cost you money." },
      { t: "p", text: "It will not give you a system that wins. There is no such thing to give. If you finish the course and decide the honest answer is to trade small, trade rarely, or not trade options at all, that is a good outcome." },
      { t: "callout", tone: "truth", title: "The pre-trade honesty test", text: "Before any trade, answer in writing: (1) What is my maximum loss in dollars? (2) Where is my breakeven at expiry? (3) What has to be true about direction, size, and timing for this to profit? (4) Is implied volatility high or low, and does it matter for this structure? If you cannot answer all four, you are guessing." },
      { t: "callout", tone: "warn", title: "Practice first", text: "Paper trade every structure in this course before risking money, and only ever risk money you can afford to lose entirely." },
    ],
    takeaways: [
      "93% of over 10 million individual equity F&O traders in SEBI's study lost money between FY22 and FY24, and over 75% of the losers kept trading.",
      "The Brazilian study found 97% of persistent day traders (300+ days) lost money. It covers futures, so treat it as a pattern, not a prediction.",
      "An option buyer must be right on direction, magnitude, and timing. Know your max loss and breakeven in dollars before you enter.",
      "Finishing this course and choosing to trade less, or not at all, is a legitimate result.",
    ],
    terms: ["premium", "leverage", "bid-ask-spread"],
    quiz: [
      {
        id: "truth-1",
        question: "In SEBI's study of individual equity F&O traders (FY22 to FY24), what share lost money?",
        options: ["About 43%", "About 67%", "93%", "100%"],
        correct: 2,
        explanation: "SEBI reported that 93% of over 1 crore (10 million+) individual equity F&O traders lost money, with an average loss of about 2 lakh rupees per trader including transaction costs.",
      },
      {
        id: "truth-2",
        question: "Which SEBI finding is about behaviour after losing?",
        options: [
          "Most losers stopped trading after a year",
          "Over 75% of loss-makers kept trading anyway",
          "Losers traded less in later years",
          "Losses were concentrated in a few large accounts",
        ],
        correct: 1,
        explanation: "More than three quarters of the people who lost money continued to trade. The lesson is to change something, not to keep repeating the same approach.",
      },
      {
        id: "truth-3",
        question: "What is the honest way to use the Brazilian day-trader result?",
        options: [
          "As proof that every options trader will lose",
          "As proof that day trading cannot be profitable for anyone",
          "As a pattern showing how hard persistence-without-edge is, while remembering it studied futures day traders in one market",
          "Ignore it, because it is not about options",
        ],
        correct: 2,
        explanation: "The paper found 97% of those who persisted more than 300 days lost money. It is evidence about a specific group. It supports caution; it does not predict your result.",
      },
      {
        id: "truth-4",
        question: "Which number must you know, in dollars, before entering any options trade?",
        options: ["The expected profit", "The maximum loss", "The win rate of the strategy", "The delta"],
        correct: 1,
        explanation: "Your maximum loss is the one number that is knowable up front for a defined-risk trade, and it sets your position size.",
      },
    ],
  },
];
