import type { Metadata } from "next";
import GlossaryBrowser from "@/components/GlossaryBrowser";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Plain-English definitions of every options term used in the course, linked back to the lesson.",
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <p className="label">Glossary</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">The vocabulary, without the fog.</h1>
      <div className="mt-10">
        <GlossaryBrowser />
      </div>
    </div>
  );
}
