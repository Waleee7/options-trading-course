import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, applyChallenge, applyQuiz, parseProgress } from "./progress";
import { BADGES, getNextRank, getRank, nextModule } from "./gamification";
import { modules } from "@/data/modules";

const day = (s: string) => new Date(`${s}T12:00:00Z`);

describe("applyQuiz", () => {
  it("awards xp proportional to score and marks the module complete", () => {
    const { next, gained } = applyQuiz(EMPTY_PROGRESS, "a", 75, 100, day("2026-11-01"));
    expect(gained).toBe(75);
    expect(next.totalXp).toBe(75);
    expect(next.completedModules).toEqual(["a"]);
  });
  it("does not let retries farm xp, only improvement counts", () => {
    const first = applyQuiz(EMPTY_PROGRESS, "a", 50, 100, day("2026-11-01"));
    const again = applyQuiz(first.next, "a", 50, 100, day("2026-11-01"));
    expect(again.gained).toBe(0);
    const better = applyQuiz(again.next, "a", 100, 100, day("2026-11-01"));
    expect(better.gained).toBe(50);
    expect(better.next.totalXp).toBe(100);
    expect(better.next.quizScores.a).toBe(100);
  });
  it("keeps the best score when a retry is worse", () => {
    const first = applyQuiz(EMPTY_PROGRESS, "a", 100, 100, day("2026-11-01"));
    const worse = applyQuiz(first.next, "a", 25, 100, day("2026-11-02"));
    expect(worse.next.quizScores.a).toBe(100);
  });
  it("tracks streaks across consecutive days and resets after a gap", () => {
    let p = applyQuiz(EMPTY_PROGRESS, "a", 100, 10, day("2026-11-01")).next;
    p = applyQuiz(p, "b", 100, 10, day("2026-11-02")).next;
    p = applyQuiz(p, "c", 100, 10, day("2026-11-03")).next;
    expect(p.currentStreak).toBe(3);
    p = applyQuiz(p, "d", 100, 10, day("2026-11-06")).next;
    expect(p.currentStreak).toBe(1);
  });
  it("does not mutate its input", () => {
    const snap = JSON.stringify(EMPTY_PROGRESS);
    applyQuiz(EMPTY_PROGRESS, "a", 100, 10, day("2026-11-01"));
    expect(JSON.stringify(EMPTY_PROGRESS)).toBe(snap);
  });
});

describe("applyChallenge", () => {
  it("pays only the first correct answer", () => {
    const wrong = applyChallenge(EMPTY_PROGRESS, "s", false, 30, day("2026-11-01"));
    expect(wrong.gained).toBe(0);
    const right = applyChallenge(wrong.next, "s", true, 30, day("2026-11-01"));
    expect(right.gained).toBe(30);
    const again = applyChallenge(right.next, "s", true, 30, day("2026-11-01"));
    expect(again.gained).toBe(0);
    expect(again.next.challengeResults.s).toBe(true);
  });
});

describe("ranks and badges", () => {
  it("maps xp to ranks", () => {
    expect(getRank(0).title).toBe("Observer");
    expect(getRank(650).title).toBe("Analyst");
    expect(getRank(99999).title).toBe("Risk Manager");
    expect(getNextRank(99999)).toBeNull();
    expect(getNextRank(0)?.title).toBe("Student");
  });
  it("the full-course badge needs every module", () => {
    const full = BADGES.find((b) => b.id === "full-course")!;
    expect(full.check(EMPTY_PROGRESS)).toBe(false);
    expect(full.check({ ...EMPTY_PROGRESS, completedModules: modules.map((m) => m.id) })).toBe(true);
  });
});

describe("nextModule", () => {
  it("starts at the first module, then moves along, then ends", () => {
    expect(nextModule(EMPTY_PROGRESS)?.id).toBe(modules[0].id);
    expect(nextModule({ ...EMPTY_PROGRESS, completedModules: [modules[0].id] })?.id).toBe(modules[1].id);
    expect(nextModule({ ...EMPTY_PROGRESS, completedModules: modules.map((m) => m.id) })).toBeNull();
  });
  it("returns the first gap even when later modules are done", () => {
    expect(nextModule({ ...EMPTY_PROGRESS, completedModules: [modules[1].id, modules[2].id] })?.id).toBe(modules[0].id);
  });
});

describe("parseProgress", () => {
  it("returns an empty save for anything that isn't a save", () => {
    for (const bad of [null, "", "not json {{{", "null", "5", "[]", '"text"']) expect(parseProgress(bad)).toEqual(EMPTY_PROGRESS);
  });
  it("replaces fields of the wrong type", () => {
    const raw = JSON.stringify({ completedModules: "abc", quizScores: "x", moduleXp: 7, challengeResults: [], totalXp: "lots", currentStreak: {}, lastActivity: 42 });
    expect(parseProgress(raw)).toEqual(EMPTY_PROGRESS);
    const nulls = JSON.stringify({ completedModules: null, quizScores: null, moduleXp: null, challengeResults: null, totalXp: null, currentStreak: null, lastActivity: null });
    expect(parseProgress(nulls)).toEqual(EMPTY_PROGRESS);
  });
  it("keeps the good parts of a partly damaged save", () => {
    const raw = JSON.stringify({ completedModules: ["a", 5], quizScores: { a: 75, b: "x" }, moduleXp: { a: 30 }, challengeResults: { c: true, d: "yes" }, totalXp: 30, currentStreak: 2, lastActivity: "2026-11-01" });
    expect(parseProgress(raw)).toEqual({ completedModules: ["a"], quizScores: { a: 75 }, moduleXp: { a: 30 }, challengeResults: { c: true }, totalXp: 30, currentStreak: 2, lastActivity: "2026-11-01" });
  });
  it("round-trips a real save", () => {
    const { next } = applyQuiz(EMPTY_PROGRESS, "a", 75, 100, day("2026-11-01"));
    expect(parseProgress(JSON.stringify(next))).toEqual(next);
  });
});

describe("streaks count the learner's own calendar days", () => {
  const save = (lastActivity: string, currentStreak: number) => ({ ...EMPTY_PROGRESS, lastActivity, currentStreak });
  const streakAfter = (first: Date, second: Date) => {
    const a = applyQuiz(EMPTY_PROGRESS, "a", 100, 100, first);
    return applyQuiz(a.next, "b", 100, 100, second).next.currentStreak;
  };

  it("runs in a timezone where UTC is a different day in the evening", () => {
    expect(new Date(2026, 10, 5, 21).toISOString().slice(0, 10)).toBe("2026-11-06");
  });
  it("studying morning and evening on one day is still one day", () => {
    expect(streakAfter(new Date(2026, 10, 5, 8), new Date(2026, 10, 5, 21))).toBe(1);
  });
  it("evening one day and morning the next is two days", () => {
    expect(streakAfter(new Date(2026, 10, 5, 21), new Date(2026, 10, 6, 8))).toBe(2);
  });
  it("skipping a whole day resets the streak", () => {
    expect(streakAfter(new Date(2026, 10, 5, 21), new Date(2026, 10, 7, 8))).toBe(1);
  });
  it("handles the 25-hour day when the clocks go back", () => {
    // Nov 1 2026 is 25 hours long in the US, so "24 hours ago" from late Nov 1 is still Nov 1
    expect(streakAfter(new Date(2026, 9, 31, 23, 30), new Date(2026, 10, 1, 23, 30))).toBe(2);
    expect(streakAfter(new Date(2026, 10, 1, 0, 30), new Date(2026, 10, 2, 0, 30))).toBe(2);
  });
  it("carries across a month and a year", () => {
    expect(applyQuiz(save("2026-12-31", 4), "a", 100, 100, new Date(2027, 0, 1, 9)).next.currentStreak).toBe(5);
  });
});
