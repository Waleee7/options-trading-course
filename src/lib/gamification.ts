import type { UserProgress } from "./progress";
import { modules } from "@/data/modules";
import { scenarios } from "@/data/challenges";
import type { PartId } from "@/data/types";

export const RANKS = [
  { title: "Observer", minXp: 0 },
  { title: "Student", minXp: 200 },
  { title: "Analyst", minXp: 600 },
  { title: "Practitioner", minXp: 1100 },
  { title: "Strategist", minXp: 1600 },
  { title: "Risk Manager", minXp: 2100 },
] as const;

export function getRank(xp: number) {
  let r: (typeof RANKS)[number] = RANKS[0];
  for (const x of RANKS) if (xp >= x.minXp) r = x;
  return r;
}

export function getNextRank(xp: number) {
  return RANKS.find((r) => xp < r.minXp) ?? null;
}

const idsOf = (part: PartId) => modules.filter((m) => m.part === part).map((m) => m.id);
const doneAll = (p: UserProgress, ids: string[]) => ids.every((id) => p.completedModules.includes(id));

export interface Badge {
  id: string;
  title: string;
  description: string;
  /** Two-character monogram shown in the plate. */
  mark: string;
  check: (p: UserProgress) => boolean;
}

export const BADGES: Badge[] = [
  { id: "eyes-open", title: "Eyes open", description: "Finished the truth-first module", mark: "00", check: (p) => doneAll(p, idsOf("truth")) },
  { id: "mechanics", title: "Mechanics", description: "Completed every mechanics module", mark: "I", check: (p) => doneAll(p, idsOf("mechanics")) },
  { id: "greek-fluent", title: "Greek fluent", description: "Completed every Greeks module", mark: "II", check: (p) => doneAll(p, idsOf("greeks")) },
  { id: "vol-literate", title: "Vol literate", description: "Completed both volatility modules", mark: "III", check: (p) => doneAll(p, idsOf("volatility")) },
  { id: "defined-risk", title: "Defined risk", description: "Completed every strategy module", mark: "IV", check: (p) => doneAll(p, idsOf("strategies")) },
  { id: "sized-right", title: "Sized right", description: "Completed sizing, planning, and psychology", mark: "V", check: (p) => doneAll(p, idsOf("risk")) },
  { id: "process", title: "Process", description: "Read the How I actually trade module", mark: "VI", check: (p) => doneAll(p, idsOf("process")) },
  { id: "perfect-read", title: "Perfect read", description: "Scored 100% on any quiz", mark: "100", check: (p) => Object.values(p.quizScores).some((s) => s === 100) },
  { id: "sharp", title: "Sharp", description: "Answered every challenge scenario correctly", mark: "7/7", check: (p) => scenarios.every((s) => p.challengeResults[s.id] === true) },
  { id: "steady", title: "Steady", description: "Studied three days in a row", mark: "3D", check: (p) => p.currentStreak >= 3 },
  { id: "full-course", title: "Full course", description: "Completed all modules", mark: "OL", check: (p) => modules.every((m) => p.completedModules.includes(m.id)) },
];

/** The first module the learner has not finished, or null when they have finished all of them. */
export function nextModule(p: UserProgress) {
  return modules.find((m) => !p.completedModules.includes(m.id)) ?? null;
}
