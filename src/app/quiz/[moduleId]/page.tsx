import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Quiz from "@/components/Quiz";
import { modules } from "@/data/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return modules.map((m) => ({ moduleId: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }): Promise<Metadata> {
  const { moduleId } = await params;
  const m = modules.find((x) => x.id === moduleId);
  return { title: m ? `Quiz: ${m.title}` : "Quiz" };
}

export default async function QuizPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const m = modules.find((x) => x.id === moduleId);
  if (!m) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <p className="mono text-xs text-muted">
        <Link href={`/course/${m.id}`} className="link">← {m.title}</Link>
      </p>
      <h1 className="label mt-6">Quiz / {m.title}</h1>
      <div className="mt-4">
        <Quiz module={m} />
      </div>
    </div>
  );
}
