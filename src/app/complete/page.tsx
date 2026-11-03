import type { Metadata } from "next";
import CompletePanel from "@/components/CompletePanel";

export const metadata: Metadata = { title: "Your progress" };

export default function CompletePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
      <div className="reading p-6 sm:p-10">
      <CompletePanel />
      </div>
    </div>
  );
}
