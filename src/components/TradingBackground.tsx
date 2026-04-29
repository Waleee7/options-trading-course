"use client";

import { useTheme } from "@/lib/theme";

export default function TradingBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Wallpaper — same image both modes, opacity differs */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: `url('/trading-bg-1.jpg')`,
          opacity: isDark ? 0.3 : 0.18,
          filter: isDark
            ? "brightness(0.7) saturate(1.2) contrast(1.1)"
            : "brightness(0.5) saturate(0.9) contrast(1.05)",
        }}
      />

      {/* Subtle color atmosphere — no white overlay that kills the image */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: isDark
            ? `
              radial-gradient(ellipse at 15% 15%, rgba(59,130,246,0.10) 0%, transparent 45%),
              radial-gradient(ellipse at 85% 20%, rgba(139,92,246,0.08) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)
            `
            : `
              radial-gradient(ellipse at 60% 30%, rgba(45,27,105,0.55) 0%, rgba(26,20,64,0.75) 45%, rgba(13,11,30,0.88) 100%)
            `,
        }}
      />

      {/* Grid */}
      <svg
        className="absolute inset-0 w-full h-full transition-opacity duration-500"
        style={{ opacity: isDark ? 0.035 : 0.025 }}
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
