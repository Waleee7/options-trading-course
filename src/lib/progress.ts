"use client";

import { useSyncExternalStore } from "react";

export interface UserProgress {
  completedModules: string[];
  quizScores: Record<string, number>;
  /** XP already awarded per module, so retries cannot farm XP. */
  moduleXp: Record<string, number>;
  challengeResults: Record<string, boolean>;
  totalXp: number;
  currentStreak: number;
  lastActivity: string;
}

export const STORAGE_KEY = "options-lab:v2:progress";

export const EMPTY_PROGRESS: UserProgress = {
  completedModules: [],
  quizScores: {},
  moduleXp: {},
  challengeResults: {},
  totalXp: 0,
  currentStreak: 0,
  lastActivity: "",
};

/** The learner's own calendar day, not UTC's, so evening study doesn't land on "tomorrow". */
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function bumpStreak(p: UserProgress, now: Date): Pick<UserProgress, "currentStreak" | "lastActivity"> {
  const today = dayKey(now);
  if (p.lastActivity === today) return { currentStreak: p.currentStreak, lastActivity: today };
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  return { currentStreak: p.lastActivity === yesterday ? p.currentStreak + 1 : 1, lastActivity: today };
}

/** Pure: record a finished quiz. XP is awarded only for improvement on your best score. */
export function applyQuiz(p: UserProgress, moduleId: string, scorePct: number, moduleXp: number, now = new Date()): { next: UserProgress; gained: number } {
  const earned = Math.round(moduleXp * (scorePct / 100));
  const already = p.moduleXp[moduleId] ?? 0;
  const gained = Math.max(0, earned - already);
  const next: UserProgress = {
    ...p,
    completedModules: p.completedModules.includes(moduleId) ? p.completedModules : [...p.completedModules, moduleId],
    quizScores: { ...p.quizScores, [moduleId]: Math.max(p.quizScores[moduleId] ?? 0, scorePct) },
    moduleXp: { ...p.moduleXp, [moduleId]: Math.max(already, earned) },
    totalXp: p.totalXp + gained,
    ...bumpStreak(p, now),
  };
  return { next, gained };
}

/** Pure: record a challenge answer. Only the first correct answer earns XP. */
export function applyChallenge(p: UserProgress, id: string, correct: boolean, xp: number, now = new Date()): { next: UserProgress; gained: number } {
  const alreadyRight = p.challengeResults[id] === true;
  const gained = correct && !alreadyRight ? xp : 0;
  return {
    next: {
      ...p,
      challengeResults: { ...p.challengeResults, [id]: alreadyRight || correct },
      totalXp: p.totalXp + gained,
      ...bumpStreak(p, now),
    },
    gained,
  };
}

const count = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const scores = (v: unknown) => Object.fromEntries(Object.entries(isRecord(v) ? v : {}).filter(([, n]) => typeof n === "number" && Number.isFinite(n))) as Record<string, number>;

/** Saves can be old, edited or damaged. Keep what is usable and never let the rest reach the UI. */
export function parseProgress(raw: string | null): UserProgress {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const v: unknown = JSON.parse(raw);
    if (!isRecord(v)) return EMPTY_PROGRESS;
    return {
      completedModules: Array.isArray(v.completedModules) ? v.completedModules.filter((m): m is string => typeof m === "string") : [],
      quizScores: scores(v.quizScores),
      moduleXp: scores(v.moduleXp),
      challengeResults: Object.fromEntries(Object.entries(isRecord(v.challengeResults) ? v.challengeResults : {}).filter(([, b]) => typeof b === "boolean")) as Record<string, boolean>,
      totalXp: count(v.totalXp),
      currentStreak: count(v.currentStreak),
      lastActivity: typeof v.lastActivity === "string" ? v.lastActivity : "",
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

let cacheRaw: string | null | undefined;
let cacheVal: UserProgress = EMPTY_PROGRESS;
const listeners = new Set<() => void>();

function read(): UserProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_PROGRESS;
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheVal = parseProgress(raw);
  }
  return cacheVal;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function saveProgress(p: UserProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* private mode: progress simply won't persist */
  }
  listeners.forEach((l) => l());
}

export function recordQuiz(moduleId: string, scorePct: number, moduleXp: number): number {
  const { next, gained } = applyQuiz(read(), moduleId, scorePct, moduleXp);
  saveProgress(next);
  return gained;
}

export function recordChallenge(id: string, correct: boolean, xp: number): number {
  const { next, gained } = applyChallenge(read(), id, correct, xp);
  saveProgress(next);
  return gained;
}

export function resetProgress() {
  saveProgress(EMPTY_PROGRESS);
}

export function useProgress(): UserProgress {
  return useSyncExternalStore(subscribe, read, () => EMPTY_PROGRESS);
}
