"use client";

import { UserProgress } from "./types";

const STORAGE_KEY = "options-course-progress";

const DEFAULT_PROGRESS: UserProgress = {
  completedModules: [],
  quizScores: {},
  totalXp: 0,
  currentStreak: 0,
  lastActivity: "",
  challengeResults: {},
};

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PROGRESS;
  return JSON.parse(stored);
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeModule(moduleId: string, quizScore: number, xpEarned: number): UserProgress {
  const progress = getProgress();
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
  }
  progress.quizScores[moduleId] = Math.max(progress.quizScores[moduleId] || 0, quizScore);
  progress.totalXp += xpEarned;

  const today = new Date().toDateString();
  if (progress.lastActivity === today) {
    // same day, streak stays
  } else {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    progress.currentStreak = progress.lastActivity === yesterday ? progress.currentStreak + 1 : 1;
  }
  progress.lastActivity = today;

  saveProgress(progress);
  return progress;
}

export function saveChallengeResult(challengeId: string, correct: boolean, xp: number): UserProgress {
  const progress = getProgress();
  progress.challengeResults[challengeId] = correct;
  if (correct) progress.totalXp += xp;
  saveProgress(progress);
  return progress;
}

export function resetProgress(): void {
  saveProgress(DEFAULT_PROGRESS);
}
