import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/BlockRenderer";
import PremiumFloorCard from "@/components/PremiumFloorCard";
import { glossary } from "@/data/glossary";
import { modules } from "@/data/modules";
import { PARTS } from "@/data/parts";
import { readMinutes } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return modules.map((m) => ({ moduleId: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }): Promise<Metadata> {
  const { moduleId } = await params;
  const m = modules.find((x) => x.id === moduleId);
  return m ? { title: m.title, description: m.lede } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx < 0) notFound();
  const m = modules[idx];
  const part = PARTS.find((p) => p.id === m.part)!;
  const prev = modules[idx - 1];
  const next = modules[idx + 1];
  const siblings = modules.filter((x) => x.part === m.part);
  const terms = m.terms.map((t) => glossary.find((g) => g.id === t)).filter((g) => !!g);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[13rem_1fr] lg:gap-14 lg:pt-12">
      <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Where you are">
        <p className="mono text-5xl font-bold text-accent">{part.numeral}</p>
        <p className="label mt-1">{part.title}</p>
        <ol className="mt-5 hidden gap-1 lg:grid">
          {siblings.map((s) => (
            <li key={s.id}>
              <Link
                href={`/course/${s.id}`}
                aria-current={s.id === m.id ? "page" : undefined}
                className={`t100 mono block border-l-4 px-3 py-1.5 text-xs leading-snug ${s.id === m.id ? "border-accent bg-paper-2 font-bold text-ink" : "border-rule text-muted hover:border-ink hover:text-ink"}`}
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ol>
        <p className="mono mt-6 hidden text-xs text-muted lg:block">
          Module {idx + 1} of {modules.length}
        </p>
      </aside>

      <article>
        <nav aria-label="Breadcrumb" className="mono text-xs text-muted">
          <Link href="/" className="link">Course</Link> / Part {part.numeral} / Module {String(idx + 1).padStart(2, "0")}
        </nav>
        <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)]">{m.title}</h1>
        <p className="mt-5 max-w-2xl font-serif text-2xl leading-snug text-ink">{m.lede}</p>
        <p className="mono mt-5 flex flex-wrap gap-x-5 gap-y-1 border-y-2 border-ink py-2 text-xs text-muted">
          <span>{readMinutes(m)} min read</span>
          <span>{m.quiz.length}-question quiz</span>
          <span>{m.xp} XP</span>
        </p>

        <BlockRenderer blocks={m.blocks} />

        <section className="mt-16 border-2 border-ink bg-paper-2 p-5 sm:p-7" aria-labelledby="tk-h">
          <p className="label">Recap</p>
          <h2 id="tk-h" className="display mt-1 text-3xl">Key takeaways</h2>
          <ol className="mt-4 grid gap-3">
            {m.takeaways.map((t, i) => (
              <li key={i} className="grid grid-cols-[2rem_1fr] gap-2 text-[17px] leading-snug">
                <span className="mono text-sm font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </section>

        {terms.length > 0 && (
          <section className="mt-10" aria-labelledby="terms-h">
            <h2 id="terms-h" className="label">Terms in this lesson</h2>
            <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {terms.map((g) => (
                <div key={g.id} className="border-t border-rule pt-2">
                  <dt className="mono text-sm font-bold text-ink">{g.term}</dt>
                  <dd className="text-[15px] leading-snug">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t-2 border-ink pt-6">
          <Link href={`/quiz/${m.id}`} className="btn">Take the quiz →</Link>
          {prev && <Link href={`/course/${prev.id}`} className="btn btn-ghost">← {prev.title}</Link>}
          {next && <Link href={`/course/${next.id}`} className="btn btn-ghost">Skip to: {next.title}</Link>}
        </div>

        {m.pf && <PremiumFloorCard moduleId={m.id} variant={m.pf} />}
      </article>
    </div>
  );
}
