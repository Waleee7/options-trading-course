"use client";

import { useTheme } from "@/lib/theme";

const headlines = [
  "AAPL +2.4% on strong earnings beat",
  "Fed holds rates steady — markets rally",
  "TSLA options volume surges 340%",
  "SPY breaks above key resistance at $520",
  "NVDA implied volatility spikes ahead of earnings",
  "Market breadth improves — bulls in control",
  "VIX drops below 15 — low volatility environment",
  "AMD breaks out from consolidation pattern",
  "10-Year Treasury yield holds at 4.2%",
  "Retail traders drive record options volume",
  "MSFT hits new all-time high",
  "Oil futures drop 3% on supply concerns",
  "Bitcoin ETF sees massive inflows",
  "Gamma squeeze potential in meme stocks",
  "Earnings season kicks off — IV rising across the board",
];

export default function NewsTicker() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const doubledHeadlines = [...headlines, ...headlines];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md transition-colors duration-300"
      style={{
        background: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)",
        borderColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
      }}
    >
      <div className="flex items-center h-9 overflow-hidden">
        <div className="bg-red-600 text-white text-[10px] font-bold px-3 h-full flex items-center shrink-0 tracking-wider">
          LIVE
        </div>
        <div className="flex items-center gap-8 whitespace-nowrap animate-ticker">
          {doubledHeadlines.map((headline, i) => (
            <span
              key={i}
              className="text-[11px] transition-colors duration-300"
              style={{ color: isDark ? "#6b7280" : "#64748b" }}
            >
              <span className="text-blue-500 mr-2">●</span>
              {headline}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
