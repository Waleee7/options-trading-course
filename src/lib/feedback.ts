"use client";

import { useSyncExternalStore } from "react";

/**
 * Soft haptics and sound for learning moments. Everything is feature-detected, off when muted,
 * and vibration is skipped when the user asks for reduced motion.
 */
export type FeedbackKind = "select" | "correct" | "wrong" | "xp" | "complete";

export interface Tone {
  /** Hz. */
  f: number;
  /** Start offset in seconds. */
  at: number;
  /** Duration in seconds. */
  dur: number;
  /** Peak gain, kept very low on purpose. */
  gain: number;
}

export interface Pattern {
  vibrate: number[];
  tones: Tone[];
}

export const PATTERNS: Record<FeedbackKind, Pattern> = {
  select: { vibrate: [8], tones: [{ f: 540, at: 0, dur: 0.035, gain: 0.025 }] },
  correct: {
    vibrate: [12, 40, 12],
    tones: [
      { f: 523, at: 0, dur: 0.07, gain: 0.035 },
      { f: 784, at: 0.08, dur: 0.1, gain: 0.035 },
    ],
  },
  wrong: { vibrate: [30], tones: [{ f: 196, at: 0, dur: 0.12, gain: 0.035 }] },
  xp: {
    vibrate: [10, 30, 10, 30, 10],
    tones: [
      { f: 659, at: 0, dur: 0.05, gain: 0.03 },
      { f: 784, at: 0.06, dur: 0.05, gain: 0.03 },
      { f: 988, at: 0.12, dur: 0.09, gain: 0.03 },
    ],
  },
  complete: {
    vibrate: [15, 50, 15, 50, 30],
    tones: [
      { f: 523, at: 0, dur: 0.08, gain: 0.035 },
      { f: 659, at: 0.09, dur: 0.08, gain: 0.035 },
      { f: 784, at: 0.18, dur: 0.08, gain: 0.035 },
      { f: 1047, at: 0.27, dur: 0.16, gain: 0.035 },
    ],
  },
};

export const SOUND_KEY = "options-lab:v2:sound";

// ---- mute state (remembered in localStorage) ----
const listeners = new Set<() => void>();
export const isMuted = (): boolean => {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "off";
  } catch {
    return false;
  }
};
export function setMuted(muted: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, muted ? "off" : "on");
  } catch {
    /* private mode: the choice just will not persist */
  }
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
export const useMuted = (): boolean => useSyncExternalStore(subscribe, isMuted, () => false);

// ---- playback ----
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Call from inside a user gesture (click, key press). Safe to call anywhere. */
export function feedback(kind: FeedbackKind): void {
  if (typeof window === "undefined" || isMuted()) return;
  const p = PATTERNS[kind];

  if (!reducedMotion() && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(p.vibrate);
    } catch {
      /* some browsers throw without user activation */
    }
  }

  const a = audio();
  if (!a) return;
  const t0 = a.currentTime;
  for (const t of p.tones) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = "sine";
    osc.frequency.value = t.f;
    const start = t0 + t.at;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(t.gain, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
    osc.connect(g).connect(a.destination);
    osc.start(start);
    osc.stop(start + t.dur + 0.02);
  }
}
