"use client";

import { motion } from "framer-motion";
import { UserProgress, BADGES } from "@/lib/types";
import {
  Rocket, Star, Brain, Flame, Mountain,
  Crosshair, Target, Crown, Lock, LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket, star: Star, brain: Brain, flame: Flame,
  mountain: Mountain, crosshair: Crosshair, target: Target, crown: Crown,
};

interface BadgesPanelProps {
  progress: UserProgress;
}

export default function BadgesPanel({ progress }: BadgesPanelProps) {
  const earned = BADGES.filter((b) => b.check(progress));

  return (
    <div className="px-4 pt-1 pb-4">
      {/* Divider */}
      <div style={{ height: 1, background: "rgba(59,130,246,0.12)", marginBottom: 14 }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(148,163,184,0.55)" }}>
          ACHIEVEMENTS.LOG
        </p>
        <span
          className="text-[9px] font-bold font-mono px-2 py-0.5 rounded"
          style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899", border: "1px solid rgba(236,72,153,0.2)" }}
        >
          {earned.length}/{BADGES.length}
        </span>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 gap-2">
        {BADGES.map((badge, i) => {
          const isEarned = badge.check(progress);
          const Icon = iconMap[badge.icon] || Star;
          return (
            <motion.div
              key={badge.id}
              className="group relative flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: isEarned ? 1 : 0.35, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5"
                style={{
                  background: isEarned
                    ? `linear-gradient(135deg, ${badge.color}18, ${badge.color}30)`
                    : "rgba(255,255,255,0.03)",
                  border: isEarned
                    ? `1px solid ${badge.color}50`
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isEarned ? `0 0 12px ${badge.color}30` : "none",
                }}
                whileHover={isEarned ? { scale: 1.15, rotate: [0, -5, 5, 0] } : {}}
              >
                {isEarned ? (
                  <Icon size={18} style={{ color: badge.color }} />
                ) : (
                  <Lock size={13} style={{ color: "rgba(148,163,184,0.25)" }} />
                )}
              </motion.div>
              <span
                className="text-[8px] font-mono text-center leading-tight"
                style={{ color: isEarned ? "rgba(226,232,240,0.7)" : "rgba(148,163,184,0.3)" }}
              >
                {badge.title}
              </span>

              {/* Tooltip */}
              <div
                className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-[9px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                style={{
                  background: "#0d0b1e",
                  color: "rgba(226,232,240,0.8)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}
              >
                {badge.description}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
