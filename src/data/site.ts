/** Single source of truth for links and the one citation set this course is allowed to use. */

export const SITE_URL = "https://optionstradingcourse.vercel.app";
export const REPO_URL = "https://github.com/Waleee7/options-trading-course";
export const AUTHOR = { name: "Akinwale Dare", url: "https://josh-dare.vercel.app" } as const;

/** Exact PremiumFloor link. Do not append tracking params or change the path. */
export const PREMIUMFLOOR_URL = "https://whop.com/premiumfloor";

export const SOURCES = {
  sebi: {
    label: "SEBI press release, 23 Sep 2024",
    url: "https://www.sebi.gov.in/media-and-notifications/press-releases/sep-2024/updated-sebi-study-reveals-93-of-individual-traders-incurred-losses-in-equity-fando-between-fy22-and-fy24-aggregate-losses-exceed-1-8-lakh-crores-over-three-years_86906.html",
  },
  brazil: {
    label: "Chague, De-Losso & Giovannetti, \"Day Trading for a Living?\" (FGV EESP working paper, 2019)",
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101",
  },
} as const;

export const DISCLAIMER_SHORT =
  "Educational only. Not financial advice. Most traders lose money. Past results do not guarantee future results.";

export const DISCLAIMER_LONG =
  "Everything on this site is for education. It is not financial, investment, tax, or legal advice, and nothing here is a recommendation to buy or sell any security. Options are leveraged and you can lose your entire premium or more. Most traders lose money. Past results, including any shown on this site, do not guarantee future results. Pricing models are simplifications; real fills, spreads, taxes, and fees will differ.";
