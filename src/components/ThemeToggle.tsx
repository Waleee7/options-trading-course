"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover-lift"
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.2)",
        color: isDark ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.8)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span>{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </motion.button>
  );
}
