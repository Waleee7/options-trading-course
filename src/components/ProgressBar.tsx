"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  current,
  max,
  color = "#3b82f6",
  height = 8,
  showLabel = true,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1" style={{ color: isDark ? "#6b7280" : "#94a3b8" }}>
          <span>{current} / {max}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height,
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
        }}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
              opacity: 0.5,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
