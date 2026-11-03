import type { Metadata } from "next";
import LabClient from "@/components/LabClient";

export const metadata: Metadata = {
  title: "Strategy lab",
  description: "Drag the underlying price, implied volatility, and days to expiry on ten option structures and watch the P&L update.",
};

export default function LabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <p className="label">Strategy lab</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">Break the trade before it costs you.</h1>
      <p className="mt-5 max-w-2xl text-xl leading-snug">
        Ten structures, one Black-Scholes engine. Drag the price. Scrub time. Move implied volatility. Watch what the diagram in a textbook hides.
      </p>
      <div className="mt-12 border-t-2 border-ink pt-8">
        <LabClient />
      </div>
    </div>
  );
}
