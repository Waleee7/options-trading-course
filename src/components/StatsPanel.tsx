"use client";

import { motion } from "framer-motion";
import { UserProgress, getRank, getNextRank } from "@/lib/types";
import { modules } from "@/data/modules";
import { Trophy, Flame, BookOpen, Zap, Star } from "lucide-react";

interface StatsPanelProps {
  progress: UserProgress;
}

export default function StatsPanel({ progress }: StatsPanelProps) {
  const rank = getRank(progress.totalXp);
  const nextRank = getNextRank(progress.totalXp);
  const totalModules = modules.length;
  const completed = progress.completedModules.length;
  const pct = Math.round((completed / totalModules) * 100);
  const xpPct = nextRank
    ? Math.round((progress.totalXp / nextRank.minXp) * 100)
    : 100;

  return (
    <div className="px-4 pt-4 pb-2 space-y-4">
      {/* Rank row */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: rank.color + "22", border: `1px solid ${rank.color}44` }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
        >
          <Trophy size={18} style={{ color: rank.color }} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm font-mono" style={{ color: rank.color }}>
            {rank.title}
          </p>
          <p className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.7)" }}>
            {progress.totalXp} XP EARNED
          </p>
        </div>
      </div>

      {/* XP progress */}
      {nextRank && (
        <div>
          <div className="flex justify-between text-[9px] font-mono mb-1.5" style={{ color: "rgba(148,163,184,0.55)" }}>
            <span>NEXT › {nextRank.title}</span>
            <span>{nextRank.minXp - progress.totalXp} XP</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${nextRank.color}99, ${nextRank.color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(59,130,246,0.12)" }} />

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: BookOpen, value: completed, label: "DONE", color: "#3b82f6" },
          { icon: Flame, value: progress.currentStreak, label: "STREAK", color: "#f97316" },
          { icon: Zap, value: progress.totalXp, label: "XP", color: "#eab308" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="rounded-lg p-2.5 text-center"
            style={{
              background: `${stat.color}0d`,
              border: `1px solid ${stat.color}22`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            whileHover={{ y: -2 }}
          >
            <stat.icon size={13} className="mx-auto mb-1" style={{ color: stat.color }} />
            <p className="font-bold text-sm font-mono" style={{ color: "#f1f5f9" }}>
              {stat.value}
            </p>
            <p className="text-[8px] font-mono tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Course progress */}
      <div className="rounded-lg p-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(148,163,184,0.55)" }}>
            COURSE PROGRESS
          </p>
          <div className="flex items-center gap-1">
            <Star size={9} style={{ color: "#eab308" }} />
            <span className="text-[10px] font-bold font-mono" style={{ color: "#10b981" }}>
              {pct}%
            </span>
          </div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #059669, #10b981, #34d399)" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
        </div>
        <p className="text-[9px] font-mono mt-1.5" style={{ color: "rgba(148,163,184,0.4)" }}>
          {completed} / {totalModules} MODULES
        </p>
      </div>
    </div>
  );
}
