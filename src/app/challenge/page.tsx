import type { Metadata } from "next";
import ChallengeRunner from "@/components/ChallengeRunner";

export const metadata: Metadata = {
  title: "Challenge",
  description: "Seven scenarios where intuition and the pricing model disagree. Predict first, then see the computed result.",
};

export default function ChallengePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
      <div className="reading p-6 sm:p-10">
      <p className="label">Challenge</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">Predict, then check the math.</h1>
      <p className="mt-5 max-w-2xl text-xl leading-snug">
        Seven situations where intuition and the pricing model disagree. Commit to an answer first. The result is computed by the same engine as the charts, so there is no hand-waving to argue with.
      </p>
      <div className="mt-12 border-t-2 border-line-strong pt-8">
        <ChallengeRunner />
      </div>
      </div>
    </div>
  );
}
