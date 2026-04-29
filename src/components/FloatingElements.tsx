"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

const floatingPrices = [
  { symbol: "AAPL", price: "189.42", change: "+2.31%", positive: true, x: "8%", y: "15%" },
  { symbol: "TSLA", price: "248.50", change: "-1.87%", positive: false, x: "78%", y: "10%" },
  { symbol: "NVDA", price: "824.18", change: "+4.12%", positive: true, x: "85%", y: "48%" },
  { symbol: "SPY", price: "521.33", change: "+0.67%", positive: true, x: "5%", y: "68%" },
  { symbol: "AMD", price: "172.90", change: "-0.43%", positive: false, x: "72%", y: "82%" },
  { symbol: "MSFT", price: "425.52", change: "+1.15%", positive: true, x: "15%", y: "88%" },
  { symbol: "META", price: "512.78", change: "+3.24%", positive: true, x: "42%", y: "7%" },
  { symbol: "GOOG", price: "178.33", change: "-0.92%", positive: false, x: "60%", y: "72%" },
  { symbol: "AMZN", price: "198.45", change: "+1.78%", positive: true, x: "25%", y: "38%" },
  { symbol: "NFLX", price: "687.20", change: "-2.14%", positive: false, x: "92%", y: "88%" },
  { symbol: "JPM", price: "247.15", change: "+0.89%", positive: true, x: "3%", y: "28%" },
  { symbol: "V", price: "312.60", change: "+1.42%", positive: true, x: "48%", y: "62%" },
  { symbol: "DIS", price: "114.30", change: "-1.33%", positive: false, x: "35%", y: "92%" },
  { symbol: "BA", price: "178.90", change: "+2.67%", positive: true, x: "88%", y: "15%" },
  { symbol: "COIN", price: "265.44", change: "-3.81%", positive: false, x: "18%", y: "55%" },
];

const floatingGreeks = [
  { label: "Δ 0.65", x: "92%", y: "22%", delay: 0 },
  { label: "Θ -0.04", x: "3%", y: "42%", delay: 1 },
  { label: "Γ 0.08", x: "88%", y: "68%", delay: 2 },
  { label: "V 0.12", x: "10%", y: "94%", delay: 3 },
  { label: "Δ 0.33", x: "50%", y: "96%", delay: 1.5 },
  { label: "Θ -0.11", x: "95%", y: "55%", delay: 2.5 },
];

const floatingPnL = [
  { value: "+$487", positive: true, x: "20%", y: "5%", delay: 0.5 },
  { value: "-$312", positive: false, x: "65%", y: "18%", delay: 1.2 },
  { value: "+$95", positive: true, x: "90%", y: "35%", delay: 0.8 },
  { value: "-$728", positive: false, x: "4%", y: "52%", delay: 1.8 },
  { value: "+$156", positive: true, x: "75%", y: "58%", delay: 0.3 },
  { value: "-$1,000", positive: false, x: "40%", y: "90%", delay: 2.1 },
  { value: "+$500", positive: true, x: "55%", y: "4%", delay: 1.5 },
  { value: "-$63", positive: false, x: "30%", y: "75%", delay: 0.9 },
  { value: "+$234", positive: true, x: "12%", y: "22%", delay: 0.4 },
  { value: "-$891", positive: false, x: "82%", y: "30%", delay: 1.6 },
  { value: "+$412", positive: true, x: "45%", y: "45%", delay: 2.3 },
  { value: "-$177", positive: false, x: "58%", y: "85%", delay: 0.7 },
  { value: "+$333", positive: true, x: "70%", y: "42%", delay: 1.1 },
  { value: "-$550", positive: false, x: "15%", y: "78%", delay: 1.9 },
  { value: "+$68", positive: true, x: "38%", y: "32%", delay: 2.5 },
  { value: "-$445", positive: false, x: "88%", y: "75%", delay: 0.6 },
  { value: "+$275", positive: true, x: "52%", y: "52%", delay: 1.3 },
  { value: "-$129", positive: false, x: "7%", y: "88%", delay: 2.0 },
];

export default function FloatingElements() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {floatingPrices.map((item, i) => (
        <motion.div
          key={item.symbol}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.15, duration: 0.8 }}
        >
          <div
            className="animate-float rounded-lg px-3 py-2 backdrop-blur-sm border"
            style={{
              animationDelay: `${i * 0.6}s`,
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
              borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.18)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)" }}
              >
                {item.symbol}
              </span>
              <span
                className="text-[10px]"
                style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.5)" }}
              >
                ${item.price}
              </span>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: item.positive
                    ? isDark ? "rgba(16,185,129,0.5)" : "rgba(52,211,153,0.9)"
                    : isDark ? "rgba(239,68,68,0.5)" : "rgba(248,113,113,0.9)",
                }}
              >
                {item.change}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {floatingPnL.map((item, i) => (
        <motion.div
          key={`pnl-${i}`}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + item.delay, duration: 0.6 }}
        >
          <div
            className="animate-float-slow"
            style={{ animationDelay: `${item.delay * 1.2}s` }}
          >
            <div
              className="rounded-md px-2.5 py-1 backdrop-blur-sm border"
              style={{
                background: item.positive
                  ? isDark ? "rgba(16,185,129,0.06)" : "rgba(52,211,153,0.1)"
                  : isDark ? "rgba(239,68,68,0.06)" : "rgba(248,113,113,0.1)",
                borderColor: item.positive
                  ? isDark ? "rgba(16,185,129,0.12)" : "rgba(52,211,153,0.3)"
                  : isDark ? "rgba(239,68,68,0.12)" : "rgba(248,113,113,0.3)",
              }}
            >
              <span
                className="text-[10px] font-mono font-bold"
                style={{
                  color: item.positive
                    ? isDark ? "rgba(16,185,129,0.45)" : "rgba(52,211,153,1)"
                    : isDark ? "rgba(239,68,68,0.45)" : "rgba(248,113,113,1)",
                }}
              >
                {item.value}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {floatingGreeks.map((item) => (
        <motion.div
          key={item.label}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 + item.delay * 0.3, duration: 0.6 }}
        >
          <div
            className="animate-float-slow"
            style={{ animationDelay: `${item.delay * 1.5}s` }}
          >
            <span
              className="text-xs font-mono font-bold px-2 py-1 rounded"
              style={{
                color: isDark ? "rgba(96,165,250,0.2)" : "rgba(196,181,253,0.95)",
                background: isDark ? "rgba(96,165,250,0.03)" : "rgba(139,92,246,0.12)",
              }}
            >
              {item.label}
            </span>
          </div>
        </motion.div>
      ))}

      <motion.div
        className="absolute top-[30%] left-[45%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="animate-pulse-glow">
          <div
            className="w-32 h-32 rounded-full blur-3xl"
            style={{ background: isDark ? "rgba(59,130,246,0.02)" : "rgba(139,92,246,0.25)" }}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[25%] right-[20%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <div className="animate-pulse-glow" style={{ animationDelay: "1.5s" }}>
          <div
            className="w-24 h-24 rounded-full blur-3xl"
            style={{ background: isDark ? "rgba(139,92,246,0.02)" : "rgba(59,130,246,0.2)" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
