import { describe, expect, it } from "vitest";
import { PATTERNS, SOUND_KEY, type FeedbackKind } from "./feedback";

const kinds = Object.keys(PATTERNS) as FeedbackKind[];

describe("feedback patterns", () => {
  it("covers every learning moment", () => {
    expect(kinds.sort()).toEqual(["complete", "correct", "select", "wrong", "xp"]);
  });
  it("keeps every sound very soft and very short", () => {
    for (const k of kinds) {
      for (const t of PATTERNS[k].tones) {
        expect(t.gain, k).toBeLessThanOrEqual(0.04);
        expect(t.gain, k).toBeGreaterThan(0);
        expect(t.dur, k).toBeLessThanOrEqual(0.2);
        expect(t.f, k).toBeGreaterThan(100);
        expect(t.f, k).toBeLessThan(2000);
      }
      const end = Math.max(...PATTERNS[k].tones.map((t) => t.at + t.dur));
      expect(end, k).toBeLessThan(0.6);
    }
  });
  it("keeps vibration patterns gentle", () => {
    for (const k of kinds) {
      const total = PATTERNS[k].vibrate.reduce((s, n) => s + n, 0);
      expect(total, k).toBeLessThanOrEqual(250);
    }
  });
  it("remembers mute under a stable key", () => {
    expect(SOUND_KEY).toBe("options-lab:v2:sound");
  });
});
