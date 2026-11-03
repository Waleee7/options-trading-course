import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, applyChallenge, applyQuiz } from "./progress";
import { BADGES, getNextRank, getRank } from "./gamification";
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
