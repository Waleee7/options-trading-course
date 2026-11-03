/**
 * Receipts: real, dated screenshots of real trades, added by Josh.
 *
 * The array is intentionally EMPTY. The Receipts section renders only when
 * this array has at least one entry, so nothing is shown (and nothing is
 * implied) until real evidence exists.
 *
 * To add one:
 *   1. Put the image in /public/receipts (for example /public/receipts/2026-11-14-spy.png).
 *   2. Append an entry below with the true date and a plain caption.
 *
 * Rules: do not edit screenshots, do not hide losers, do not add P&L claims
 * to captions that the screenshot does not show.
 */
export interface Receipt {
  /** Path under /public, for example "/receipts/2026-11-14-spy.png". */
  image: string;
  /** ISO date the trade happened or was closed, YYYY-MM-DD. */
  date: string;
  /** Plain description of what the screenshot shows. Also used as alt text. */
  caption: string;
  /** Intrinsic pixel size of the image, used to reserve layout space. */
  width?: number;
  height?: number;
}

export const receipts: Receipt[] = [];

/** Newest first. Pure so it can be unit-tested. */
export function sortReceipts(list: readonly Receipt[]): Receipt[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}
