"use client";

import { feedback, setMuted, useMuted } from "@/lib/feedback";

export default function SoundToggle() {
  const muted = useMuted();
  return (
    <button
      type="button"
      aria-pressed={!muted}
      aria-label={muted ? "Sound off. Turn sound and haptics on" : "Sound on. Mute sound and haptics"}
      onClick={() => {
        const nextMuted = !muted;
        setMuted(nextMuted);
        if (!nextMuted) feedback("select");
      }}
      className="t100 mono flex min-h-9 flex-none items-center gap-2 border border-line-strong px-2.5 text-xs font-semibold text-fg hover:bg-raised"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 6v4h3l4 3V3L5 6H2z" fill="currentColor" stroke="none" />
        {muted ? <path d="M11.5 5.5l3 5m0-5l-3 5" /> : <path d="M11.5 5.5c1 1.2 1 3.8 0 5M13.5 3.8c2 2.4 2 5.9 0 8.4" />}
      </svg>
      <span className="hidden sm:inline">{muted ? "Sound off" : "Sound on"}</span>
    </button>
  );
}
