import Image from "next/image";
import { receipts as all, sortReceipts, type Receipt } from "@/data/receipts";

/**
 * Renders ONLY when there is at least one real receipt. With the shipped empty
 * array it returns null, so no heading, no placeholder, and no implied results.
 */
export default function Receipts({ items = all }: { items?: readonly Receipt[] }) {
  if (items.length === 0) return null;
  const list = sortReceipts(items);
  return (
    <section aria-labelledby="receipts-h" className="my-14">
      <p className="label">Receipts</p>
      <h2 id="receipts-h" className="display mt-2 text-3xl">
        Real trades, dated, unedited
      </h2>
      <p className="mt-2 max-w-xl text-base">Screenshots exactly as taken. Wins and losses are both included. Past results do not guarantee future results.</p>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {list.map((r) => (
          <li key={r.image} className="border-2 border-ink bg-paper-2">
            <Image src={r.image} alt={r.caption} width={r.width ?? 1200} height={r.height ?? 800} className="h-auto w-full" />
            <div className="border-t-2 border-ink p-3">
              <p className="mono text-xs text-muted">
                <time dateTime={r.date}>{r.date}</time>
              </p>
              <p className="mt-1 text-base">{r.caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
