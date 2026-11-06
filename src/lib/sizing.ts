/** Largest number the calculators will work with, so absurd input can't print "$∞". */
export const MAX_AMOUNT = 1e12;

/** Whatever someone typed, as a usable amount. Blank, negative and non-numeric all mean 0. */
export function parseAmount(text: string, max = MAX_AMOUNT): number {
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
}

export function sizeTrade(account: number, riskPct: number, maxLossPerContract: number) {
  const budget = (account * riskPct) / 100;
  const contracts = maxLossPerContract > 0 ? Math.floor(budget / maxLossPerContract) : 0;
  const atRisk = contracts * maxLossPerContract;
  return { budget, contracts, atRisk, pctOfAccount: account > 0 ? (atRisk / account) * 100 : 0 };
}
