"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Module } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import {
  TrendingUp, TrendingDown, Clock, Move, Zap, Activity,
  Key, Building, Table, GitBranch, Target, AlertTriangle,
  Layers, Crosshair, Eye, BarChart2, Lock, CheckCircle2,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  clock: Clock,
  move: Move,
  zap: Zap,
  activity: Activity,
  key: Key,
  building: Building,
  table: Table,
  "git-branch": GitBranch,
  target: Target,
  "alert-triangle": AlertTriangle,
  layers: Layers,
  crosshair: Crosshair,
  eye: Eye,
  "bar-chart-2": BarChart2,
};

interface ModuleCardProps {
  module: Module;
  index: number;
  isCompleted: boolean;
  isLocked: boolean;
  quizScore?: number;
  categoryColor: string;
}

export default function ModuleCard({
  module,
  index,
  isCompleted,
  isLocked,
  quizScore,
  categoryColor,
}: ModuleCardProps) {
  const Icon = iconMap[module.icon] || Key;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={isLocked ? {} : { y: -6, transition: { duration: 0.2 } }}
      whileTap={isLocked ? {} : { scale: 0.98 }}
    >
      <div
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"
        }`}
        style={{
          borderColor: isCompleted
            ? categoryColor + "80"
            : isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.25)",
          background: isCompleted
            ? isDark
              ? `linear-gradient(135deg, #1a1535, ${categoryColor}22)`
              : `linear-gradient(135deg, #ffffff, ${categoryColor}18)`
            : isDark
              ? "#13102a"
              : "#ffffff",
          boxShadow: isDark
            ? `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 4px 20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.8)`,
        }}
      >
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: index * 0.05 + 0.2 }}
            >
              <CheckCircle2 size={18} style={{ color: categoryColor }} />
            </motion.div>
          </div>
        )}

        {isLocked && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="text-[9px] font-medium" style={{ color: isDark ? "#4b5563" : "#9ca3af" }}>
              Complete previous
            </span>
            <Lock size={14} style={{ color: isDark ? "#4b5563" : "#9ca3af" }} />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: categoryColor + (isDark ? "25" : "18") }}
              whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
            >
              <Icon size={20} style={{ color: categoryColor }} />
            </motion.div>
            <span className="text-[10px] font-semibold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
              +{module.xpReward} XP
            </span>
          </div>

          <h3
            className="font-semibold text-sm mb-1.5 transition-colors duration-200"
            style={{ color: isDark ? "#ffffff" : "#0f172a" }}
          >
            {module.title}
          </h3>
          <p
            className="text-xs leading-relaxed"
            style={{ color: isDark ? "#7c8590" : "#64748b" }}
          >
            {module.subtitle}
          </p>

          {quizScore !== undefined && (
            <div className="mt-4 flex items-center gap-2">
              <div
                className="h-1.5 flex-1 rounded-full overflow-hidden"
                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: quizScore === 100 ? "#10b981" : categoryColor,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${quizScore}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isDark ? "#9ca3af" : "#64748b" }}
              >
                {quizScore}%
              </span>
            </div>
          )}
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: categoryColor }}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );

  if (isLocked) return card;
  const href = module.category === "challenge"
    ? `/challenge?module=${module.id}`
    : `/course/${module.id}`;
  return <Link href={href}>{card}</Link>;
}
