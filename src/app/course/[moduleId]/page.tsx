import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/BlockRenderer";
import PremiumFloorCard from "@/components/PremiumFloorCard";
import { glossary } from "@/data/glossary";
import { modules } from "@/data/modules";
import { PARTS } from "@/data/parts";
import { readMinutes } from "@/lib/content";
import PathBar from "@/components/PathBar";
import ReadingProgress from "@/components/ReadingProgress";

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
    <>
      <ReadingProgress />
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10 lg:pt-10">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start" aria-label="Where you are">
          <div className="panel p-4">
            <p className="mono text-4xl font-bold text-accent">{part.numeral}</p>
            <p className="label mt-1">{part.title}</p>
            <ol className="mt-4 hidden gap-1 lg:grid">
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/course/${s.id}`}
                    aria-current={s.id === m.id ? "page" : undefined}
                    className={`t100 mono block border-l-4 px-3 py-1.5 text-xs leading-snug ${s.id === m.id ? "border-accent bg-raised font-bold text-fg" : "border-line text-fg-muted hover:border-fg-muted hover:text-fg"}`}
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mono mt-5 hidden text-xs text-fg-muted lg:block">
              Module {idx + 1} of {modules.length}
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <PathBar current={idx} />
          <article className="reading">
            <header className="border-b border-line p-6 sm:p-9">
              <nav aria-label="Breadcrumb" className="mono text-xs text-fg-muted">
                <Link href="/" className="link">Course</Link> / Part {part.numeral} / Module {String(idx + 1).padStart(2, "0")}
              </nav>
              <h1 className="display mt-4 max-w-3xl text-[clamp(2.2rem,5.4vw,4.1rem)]">{m.title}</h1>
              <p className="mt-5 max-w-2xl text-xl leading-snug text-fg">{m.lede}</p>
              <p className="mono mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-fg-muted">
                <span>{readMinutes(m)} min read</span>
                <span>{m.quiz.length}-question quiz</span>
                <span>{m.xp} XP</span>
              </p>
            </header>

            <div className="p-6 sm:p-9">
              <BlockRenderer blocks={m.blocks} />

              <section className="mt-14 border border-line-strong bg-deep p-5 sm:p-7" aria-labelledby="tk-h">
                <p className="label">Recap</p>
                <h2 id="tk-h" className="display mt-1 text-3xl">Key takeaways</h2>
                <ol className="mt-4 grid gap-3">
                  {m.takeaways.map((t, i) => (
                    <li key={i} className="grid grid-cols-[2rem_1fr] gap-2 text-[17px] leading-snug text-fg-2">
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
                      <div key={g.id} className="border-t border-line pt-2">
                        <dt className="mono text-sm font-bold text-fg">{g.term}</dt>
                        <dd className="text-[15px] leading-snug text-fg-2">{g.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>

            <footer className="grid gap-3 border-t border-line-strong bg-deep p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
              <div>
                <p className="label">Next step</p>
                <p className="mt-1 text-xl font-bold leading-snug text-fg">Check what stuck, then move on.</p>
                <p className="mt-1 text-[15px] text-fg-muted">
                  {next ? <>After the quiz: <span className="text-fg">{next.title}</span></> : "This is the last module."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {prev && <Link href={`/course/${prev.id}`} className="btn btn-ghost">← Back</Link>}
                <Link href={`/quiz/${m.id}`} className="btn">Take the quiz →</Link>
              </div>
            </footer>
          </article>

          {m.pf && <PremiumFloorCard moduleId={m.id} variant={m.pf} />}
        </div>
      </div>
    </>
  );
}
