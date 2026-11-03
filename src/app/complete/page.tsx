import type { Metadata } from "next";
import CompletePanel from "@/components/CompletePanel";

export const metadata: Metadata = { title: "Your progress" };

export default function CompletePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <CompletePanel />
    </div>
  );
}
