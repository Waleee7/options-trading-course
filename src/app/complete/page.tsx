"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProgress } from "@/lib/progress";
import { UserProgress, getRank, BADGES } from "@/lib/types";
import { modules } from "@/data/modules";
import { useTheme } from "@/lib/theme";
import TradingBackground from "@/components/TradingBackground";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Trophy,
  Crown,
  Star,
  Rocket,
  Brain,
  Flame,
  Mountain,
  Crosshair,
  Target,
  ArrowLeft,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  star: Star,
  brain: Brain,
  flame: Flame,
  mountain: Mountain,
  crosshair: Crosshair,
  target: Target,
  crown: Crown,
};

const DEFAULT_PROGRESS: UserProgress = {
  completedModules: [],
  quizScores: {},
  totalXp: 0,
  currentStreak: 0,
  lastActivity: "",
  challengeResults: {},
};

export default function CompletePage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setProgress(getProgress());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const rank = getRank(progress.totalXp);
  const totalModules = modules.length;
  const completed = progress.completedModules.length;
  const avgScore =
    Object.values(progress.quizScores).length > 0
      ? Math.round(
          Object.values(progress.quizScores).reduce((a, b) => a + b, 0) /
            Object.values(progress.quizScores).length
        )
      : 0;
  const perfectQuizzes = Object.values(progress.quizScores).filter(
    (s) => s === 100
  ).length;
  const earnedBadges = BADGES.filter((b) => b.check(progress));

  return (
    <div
      className="relative min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <TradingBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="transition-colors hover-lift p-2 rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={20} />
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${rank.color}30, ${rank.color}10)`,
              border: `2px solid ${rank.color}50`,
            }}
            animate={{
              boxShadow: [
                `0 0 20px ${rank.color}20`,
                `0 0 40px ${rank.color}30`,
                `0 0 20px ${rank.color}20`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Crown size={40} style={{ color: rank.color }} />
          </motion.div>

          <motion.h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {completed >= totalModules
              ? "Course Complete!"
              : "Great Progress!"}
          </motion.h1>
          <motion.p
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {completed >= totalModules
              ? "You've mastered the fundamentals of options trading. Time to put it into practice."
              : `You've completed ${completed} of ${totalModules} modules. Keep going!`}
          </motion.p>
        </motion.div>

        <motion.div
          className="glass-card rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Your Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Modules", value: `${completed}/${totalModules}`, color: "#3b82f6" },
              { label: "Total XP", value: progress.totalXp.toLocaleString(), color: "#eab308" },
              { label: "Avg Score", value: `${avgScore}%`, color: "#10b981" },
              { label: "Perfect Quizzes", value: perfectQuizzes, color: "#ec4899" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-3 rounded-xl"
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <p className="text-xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p
                  className="text-[10px] font-medium uppercase tracking-wider mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="glass-card rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Badges Earned
            </h2>
            <span className="text-xs font-bold" style={{ color: "#ec4899" }}>
              {earnedBadges.length} / {BADGES.length}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {BADGES.map((badge, i) => {
              const isEarned = badge.check(progress);
              const Icon = iconMap[badge.icon] || Star;
              return (
                <motion.div
                  key={badge.id}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
                    style={{
                      backgroundColor: isEarned
                        ? badge.color + (isDark ? "20" : "15")
                        : isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.03)",
                      border: isEarned ? `1px solid ${badge.color}30` : "none",
                      opacity: isEarned ? 1 : 0.3,
                    }}
                  >
                    <Icon
                      size={20}
                      style={{
                        color: isEarned ? badge.color : "var(--text-muted)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[8px] font-medium text-center leading-tight"
                    style={{
                      color: isEarned
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                      opacity: isEarned ? 1 : 0.4,
                    }}
                  >
                    {badge.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {completed >= totalModules && (
          <motion.div
            className="glass-card rounded-2xl p-6 mb-6"
            style={{ borderLeft: `3px solid #10b981` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: "#10b981" }}
            >
              What&apos;s Next?
            </h2>
            <ul className="space-y-2.5">
              {[
                "Paper trade with a simulator before using real money",
                "Start with 1-2 contracts max per trade using the 30-45 DTE framework",
                "Keep a trading journal — track every trade and review weekly",
                "Focus on risk management first, profits second",
                "Revisit the Greeks modules when you see them in real trades",
              ].map((tip, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <Trophy
                    size={14}
                    className="mt-0.5 shrink-0 text-green-500"
                  />
                  {tip}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          className="flex justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:brightness-110 transition-all"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/glossary"
            className="flex items-center gap-2 text-sm px-6 py-3 rounded-xl font-medium border transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-secondary)",
            }}
          >
            View Glossary
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
