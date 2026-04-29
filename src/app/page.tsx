"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TradingBackground from "@/components/TradingBackground";
import NewsTicker from "@/components/NewsTicker";
import ModuleCard from "@/components/ModuleCard";
import StatsPanel from "@/components/StatsPanel";
import BadgesPanel from "@/components/BadgesPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { modules, CATEGORIES } from "@/data/modules";
import { getProgress, resetProgress } from "@/lib/progress";
import { useTheme } from "@/lib/theme";
import { UserProgress } from "@/lib/types";
import { RotateCcw, FlaskConical, BookOpen } from "lucide-react";
import Link from "next/link";

const DEFAULT_PROGRESS: UserProgress = {
  completedModules: [],
  quizScores: {},
  totalXp: 0,
  currentStreak: 0,
  lastActivity: "",
  challengeResults: {},
};

export default function Home() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setProgress(getProgress());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const categories = Object.entries(CATEGORIES) as [
    keyof typeof CATEGORIES,
    (typeof CATEGORIES)[keyof typeof CATEGORIES],
  ][];

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <TradingBackground />
      <NewsTicker />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2.5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                }}
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <FlaskConical size={24} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Options
                  </span>{" "}
                  <span style={{ color: "var(--text-primary)" }}>Lab</span>
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Master options trading — from zero to strategist
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/glossary"
                className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border transition-colors hover-lift font-medium"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-secondary)",
                }}
              >
                <BookOpen size={14} />
                <span className="hidden sm:inline">Glossary</span>
              </Link>
              <ThemeToggle />
              <button
                onClick={() => {
                  if (confirm("Reset all progress? This cannot be undone.")) {
                    resetProgress();
                    setProgress(getProgress());
                  }
                }}
                className="p-2 rounded-lg transition-colors hover-lift"
                style={{ color: "var(--text-muted)" }}
                title="Reset Progress"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-10">
            {categories.map(([key, category], catIndex) => {
              const categoryModules = modules.filter((m) => m.category === key);
              if (categoryModules.length === 0) return null;

              return (
                <motion.section
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-5 px-1">
                    <div
                      className="w-1 h-8 rounded-full"
                      style={{
                        backgroundColor: category.color,
                        boxShadow: `0 0 10px ${category.color}88`,
                      }}
                    />
                    <div>
                      <h2
                        className="text-base font-bold tracking-wide uppercase"
                        style={{ color: category.color, letterSpacing: "0.06em" }}
                      >
                        {category.label}
                      </h2>
                      <p
                        className="text-xs"
                        style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)" }}
                      >
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                    {categoryModules.map((mod, i) => {
                      const globalIndex = modules.indexOf(mod);
                      const isLocked = false;
                      return (
                        <ModuleCard
                          key={mod.id}
                          module={mod}
                          index={i}
                          isCompleted={progress.completedModules.includes(mod.id)}
                          isLocked={isLocked}
                          quizScore={progress.quizScores[mod.id]}
                          categoryColor={category.color}
                        />
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-8">
              {/* Monitor bezel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: "linear-gradient(160deg, #2c2c2c 0%, #1a1a1a 60%, #111111 100%)",
                  borderRadius: "16px 16px 10px 10px",
                  padding: "10px 10px 18px",
                  boxShadow: "0 30px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Screen */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    background: "#060a14",
                    borderRadius: "8px",
                    border: "2px solid #0a0e1a",
                    boxShadow: "inset 0 0 50px rgba(0,10,40,0.8), 0 0 1px rgba(59,130,246,0.4)",
                  }}
                >
                  {/* Scanlines */}
                  <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
                      borderRadius: "6px",
                    }}
                  />

                  {/* Screen glare */}
                  <div
                    className="absolute top-0 left-0 w-2/3 h-1/3 pointer-events-none z-10"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)",
                      borderRadius: "6px 0 0 0",
                    }}
                  />

                  {/* Title bar */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 border-b"
                    style={{ borderColor: "rgba(59,130,246,0.12)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
                    </div>
                    <span
                      className="text-[9px] font-mono tracking-widest ml-1"
                      style={{ color: "rgba(96,165,250,0.45)" }}
                    >
                      TRADER_STATS.EXE
                    </span>
                    <motion.div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "#10b981" }}
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </div>

                  {/* Panel content */}
                  <StatsPanel progress={progress} />
                  <BadgesPanel progress={progress} />
                </div>

                {/* Bottom bezel */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <span
                    className="text-[8px] font-mono tracking-[0.25em] uppercase"
                    style={{ color: "rgba(255,255,255,0.18)" }}
                  >
                    Options Lab
                  </span>
                </div>
              </motion.div>

              {/* Monitor neck */}
              <div className="flex flex-col items-center">
                <div style={{ width: 36, height: 14, background: "linear-gradient(180deg, #1a1a1a, #141414)" }} />
                <div style={{ width: 90, height: 7, background: "linear-gradient(180deg, #161616, #111111)", borderRadius: "0 0 8px 8px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
