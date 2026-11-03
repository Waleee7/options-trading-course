"use client";

import { useState } from "react";

export default function CopyTemplate({ title, body }: { title: string; body: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  };
  return (
    <figure className="my-10 border border-line-strong bg-deep">
      <div className="flex items-center justify-between gap-3 border-b border-line-strong px-4 py-2">
        <figcaption className="label" style={{ color: "var(--fg-muted)" }}>{title}</figcaption>
        <button type="button" onClick={copy} className="btn btn-ghost !min-h-9 !px-3 !py-1.5 !text-xs">
          {state === "copied" ? "Copied" : state === "failed" ? "Select and copy" : "Copy template"}
        </button>
      </div>
      <pre className="mono overflow-x-auto whitespace-pre-wrap p-4 text-[13px] leading-relaxed text-fg" tabIndex={0}>{body}</pre>
      <span className="sr-only" role="status">{state === "copied" ? "Template copied to clipboard" : ""}</span>
    </figure>
  );
}
