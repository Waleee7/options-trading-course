"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Module } from "@/data/types";
import { modules } from "@/data/modules";
import { recordQuiz } from "@/lib/progress";
import { feedback } from "@/lib/feedback";
import CountUp from "./CountUp";

export default function Quiz({ module: m }: { module: Module }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [gained, setGained] = useState<number | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  const q = m.quiz[i];
  const finished = gained !== null;
  const idx = modules.findIndex((x) => x.id === m.id);
  const next = modules[idx + 1];

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    feedback("select");
    setTimeout(() => feedback(n === q.correct ? "correct" : "wrong"), 90);
  };

  const advance = () => {
    if (picked === null) return;
    const all = [...answers, picked];
    if (i < m.quiz.length - 1) {
      setAnswers(all);
      setI(i + 1);
      setPicked(null);
      requestAnimationFrame(() => headRef.current?.focus());
      return;
    }
    const right = all.filter((a, k) => a === m.quiz[k].correct).length;
    const pct = Math.round((right / m.quiz.length) * 100);
    setAnswers(all);
    const g = recordQuiz(m.id, pct, m.xp);
    setGained(g);
    feedback("complete");
    if (g > 0) setTimeout(() => feedback("xp"), 520);
  };

  const restart = () => {
    setI(0);
    setPicked(null);
    setAnswers([]);
    setGained(null);
  };

  if (finished) {
    const right = answers.filter((a, k) => a === m.quiz[k].correct).length;
    const pct = Math.round((right / m.quiz.length) * 100);
    return (
      <div className="reveal" role="status">
        <p className="label">Result</p>
        <p className="display mt-2 text-6xl sm:text-7xl">
          {right}/{m.quiz.length}
        </p>
        <p className="mono mt-3 text-sm text-fg-muted">
          {pct}% - {gained && gained > 0 ? <span className="font-bold text-accent">+<CountUp value={gained} /> XP</span> : "no new XP (your best score still counts)"}
        </p>
        <ul className="mt-8 divide-y divide-line border-y border-line-strong">
          {m.quiz.map((qq, k) => {
            const ok = answers[k] === qq.correct;
            return (
              <li key={qq.id} className="py-4">
                <p className="mono text-xs font-semibold" style={{ color: ok ? "var(--gain)" : "var(--loss)" }}>
                  {ok ? "CORRECT" : "MISSED"} - Q{k + 1}
                </p>
                <p className="mt-1 text-lg font-bold leading-snug text-fg">{qq.question}</p>
                {!ok && <p className="mono mt-1 text-xs text-fg-muted">You chose: {qq.options[answers[k]]}</p>}
                <p className="mono mt-1 text-xs text-fg">Answer: {qq.options[qq.correct]}</p>
                <p className="mt-1 text-[15px] leading-snug">{qq.explanation}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-ghost" onClick={restart}>Retake quiz</button>
          <Link href={`/course/${m.id}`} className="btn btn-ghost">Re-read lesson</Link>
          {next ? (
            <Link href={`/course/${next.id}`} className="btn">Next: {next.title} →</Link>
          ) : (
            <Link href="/complete" className="btn">See your results →</Link>
          )}
        </div>
      </div>
    );
  }

  const correct = picked === q.correct;
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="label">Question {i + 1} of {m.quiz.length}</p>
        <div className="flex gap-1" aria-hidden>
          {m.quiz.map((_, k) => (
            <span key={k} className="h-1.5 w-8" style={{ background: k <= i ? "var(--accent)" : "var(--line)" }} />
          ))}
        </div>
      </div>
      <h2 ref={headRef} tabIndex={-1} className="display mt-4 text-3xl leading-tight sm:text-4xl" style={{ outline: "none" }}>
        {q.question}
      </h2>
      <div role="radiogroup" aria-label="Answer choices" className="mt-8 grid gap-3">
        {q.options.map((o, n) => {
          const state = picked === null ? "idle" : n === q.correct ? "right" : n === picked ? "wrong" : "dim";
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={picked === n}
              disabled={picked !== null}
              onClick={() => choose(n)}
              className="t100 grid grid-cols-[2rem_1fr] items-baseline gap-3 border-2 px-4 py-3.5 text-left text-lg disabled:cursor-default"
              style={{
                borderColor: state === "right" ? "var(--gain)" : state === "wrong" ? "var(--loss)" : "var(--line-strong)",
                background: state === "right" ? "var(--gain)" : state === "wrong" ? "var(--loss)" : "transparent",
                color: state === "right" || state === "wrong" ? "#08110c" : state === "dim" ? "var(--fg-muted)" : "var(--fg)",
              }}
            >
              <span className="mono text-sm font-bold">{String.fromCharCode(65 + n)}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="reveal mt-6 border-l-[10px] border-line-strong bg-surface p-4" role="status">
          <p className="mono text-xs font-bold" style={{ color: correct ? "var(--gain)" : "var(--loss)" }}>
            {correct ? "CORRECT" : "NOT QUITE"}
          </p>
          <p className="mt-1 text-[17px] leading-snug">{q.explanation}</p>
          <button type="button" className="btn mt-4" onClick={advance} autoFocus>
            {i < m.quiz.length - 1 ? "Next question →" : "Finish →"}
          </button>
        </div>
      )}
    </div>
  );
}
