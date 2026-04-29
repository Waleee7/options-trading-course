"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { modules, CATEGORIES } from "@/data/modules";
import { saveChallengeResult, getProgress } from "@/lib/progress";
import TradingBackground from "@/components/TradingBackground";
import XpPopup from "@/components/XpPopup";
import { useTheme } from "@/lib/theme";
import {
  ArrowLeft, ArrowRight, TrendingUp, TrendingDown,
  CheckCircle, XCircle, ImageOff, MousePointer2,
} from "lucide-react";
import Link from "next/link";

function ChallengeContent() {
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("module");
  const [selected, setSelected] = useState<string | null>(null);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const moduleData = modules.find((m) => m.id === moduleId);
  const challenge = moduleData?.challenge;

  if (!moduleData || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Challenge not found</p>
      </div>
    );
  }

  const category = CATEGORIES[moduleData.category];
  const qType = challenge.questionType ?? "callput";

  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showResult) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setClickPos({ x, y });
    setSelected("clicked");
  };

  const handleSubmit = () => {
    if (!selected) return;
    setShowResult(true);

    let correct = false;
    if (qType === "direction") {
      correct = selected === challenge.correctAnswer;
    } else if (qType === "callput") {
      correct = selected === challenge.correctAnswer;
    } else if (qType === "click") {
      const zone = challenge.entryZone;
      if (zone && clickPos) {
        correct = clickPos.x >= zone.xStart - 8 && clickPos.x <= zone.xEnd + 8;
      } else {
        correct = false;
      }
    }

    const xp = correct ? 75 : 0;
    saveChallengeResult(challenge.id, correct, xp);
    if (correct) {
      setShowXp(true);
      setTimeout(() => setShowXp(false), 3000);
    }
  };

  const isCorrect = (() => {
    if (!showResult) return false;
    if (qType === "click") {
      const zone = challenge.entryZone;
      if (!zone || !clickPos) return false;
      return clickPos.x >= zone.xStart - 8 && clickPos.x <= zone.xEnd + 8;
    }
    return selected === challenge.correctAnswer;
  })();

  const moduleIndex = modules.indexOf(moduleData);
  const nextModule = modules[moduleIndex + 1];

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <TradingBackground />
      <XpPopup xp={75} show={showXp} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href={`/course/${moduleData.id}`}
            className="transition-colors hover-lift p-2 rounded-lg shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: category.color + (isDark ? "20" : "15"),
                color: category.color,
              }}
            >
              Chart Challenge
            </span>
            <h1 className="text-base sm:text-lg font-bold mt-1 leading-tight" style={{ color: "var(--text-primary)" }}>
              {challenge.title}
            </h1>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-6">
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            {challenge.description}
          </p>

          {/* Chart */}
          <div
            ref={imgRef}
            className="relative rounded-lg border overflow-hidden mb-6"
            style={{
              borderColor: "var(--border-primary)",
              background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.03)",
              cursor: qType === "click" && !showResult ? "crosshair" : "default",
              aspectRatio: "16/9",
            }}
            onClick={qType === "click" ? handleChartClick : undefined}
          >
            {challenge.imageUrl ? (
              <img
                src={challenge.imageUrl}
                alt="Trading chart"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                <div className="text-center">
                  <ImageOff size={48} className="mx-auto mb-3" />
                  <p className="text-sm">Chart screenshot</p>
                </div>
              </div>
            )}

            {/* Click pin */}
            {qType === "click" && clickPos && (
              <div
                className="absolute pointer-events-none z-10"
                style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-yellow-400 bg-yellow-400/30" />
                  <div className="absolute inset-0 rounded-full border border-yellow-400 animate-ping opacity-50" />
                </motion.div>
              </div>
            )}

            {/* Entry zone overlay after submit */}
            {qType === "click" && showResult && challenge.entryZone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-y-0 pointer-events-none z-10"
                style={{
                  left: `${challenge.entryZone.xStart}%`,
                  width: `${challenge.entryZone.xEnd - challenge.entryZone.xStart}%`,
                  background: "rgba(16,185,129,0.18)",
                  borderLeft: "2px solid rgba(16,185,129,0.7)",
                  borderRight: "2px solid rgba(16,185,129,0.7)",
                }}
              >
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap"
                  style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}
                >
                  Ideal Entry Zone
                </div>
              </motion.div>
            )}

            {/* Click hint */}
            {qType === "click" && !showResult && !clickPos && (
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.7)" }}
              >
                <MousePointer2 size={11} />
                Click the chart to mark your entry
              </div>
            )}
          </div>

          {/* Answer area */}
          {!showResult ? (
            <>
              {/* DIRECTION question */}
              {qType === "direction" && (
                <>
                  <p className="text-sm mb-4 text-center" style={{ color: "var(--text-muted)" }}>
                    Is this setup bullish or bearish?
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { value: "bullish", label: "Bullish", sub: "Prices going UP", Icon: TrendingUp, color: "#10b981" },
                      { value: "bearish", label: "Bearish", sub: "Prices going DOWN", Icon: TrendingDown, color: "#ef4444" },
                    ].map(({ value, label, sub, Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setSelected(value)}
                        className="p-5 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: selected === value ? color : "var(--border-primary)",
                          background: selected === value ? `${color}18` : "transparent",
                        }}
                      >
                        <Icon size={28} className="mx-auto mb-2" style={{ color: selected === value ? color : "var(--text-muted)" }} />
                        <p className="font-semibold text-center" style={{ color: selected === value ? color : "var(--text-secondary)" }}>{label}</p>
                        <p className="text-xs text-center mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* CALLPUT question */}
              {qType === "callput" && (
                <>
                  <p className="text-sm mb-4 text-center" style={{ color: "var(--text-muted)" }}>
                    Based on this chart, would you buy a call or a put?
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { value: "call", label: "Buy Calls", sub: "Bullish — stock goes up", Icon: TrendingUp, color: "#10b981" },
                      { value: "put", label: "Buy Puts", sub: "Bearish — stock goes down", Icon: TrendingDown, color: "#ef4444" },
                    ].map(({ value, label, sub, Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setSelected(value)}
                        className="p-5 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: selected === value ? color : "var(--border-primary)",
                          background: selected === value ? `${color}18` : "transparent",
                        }}
                      >
                        <Icon size={28} className="mx-auto mb-2" style={{ color: selected === value ? color : "var(--text-muted)" }} />
                        <p className="font-semibold text-center" style={{ color: selected === value ? color : "var(--text-secondary)" }}>{label}</p>
                        <p className="text-xs text-center mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* CLICK question — submit shows after clicking */}
              {qType === "click" && (
                <p className="text-sm mb-6 text-center" style={{ color: "var(--text-muted)" }}>
                  {clickPos ? "Happy with your entry? Submit to see the ideal zone." : "Study the chart, then click where you'd enter."}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!selected && !clickPos}
                className="w-full py-3 rounded-lg font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                style={{ backgroundColor: selected || clickPos ? category.color : "var(--text-muted)" }}
              >
                Submit Answer
              </button>
            </>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`rounded-xl border p-5 mb-6 ${isCorrect ? "border-green-500/30 bg-green-500/5" : "border-orange-500/30 bg-orange-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect
                      ? <CheckCircle size={20} className="text-green-400" />
                      : <XCircle size={20} className="text-orange-400" />}
                    <span className={`font-semibold ${isCorrect ? "text-green-400" : "text-orange-400"}`}>
                      {isCorrect ? "Correct!" : qType === "click" ? "Close — check the zone" : "Not quite!"}
                    </span>
                    {isCorrect && <span className="ml-auto text-yellow-400 font-medium text-sm">+75 XP</span>}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {challenge.explanation}
                  </p>
                  {qType !== "click" && (
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      Correct answer:{" "}
                      <span className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                        {challenge.correctAnswer}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  {nextModule ? (
                    <Link
                      href={`/course/${nextModule.id}`}
                      className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:brightness-110"
                      style={{ backgroundColor: category.color }}
                    >
                      Next Module <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-500 transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ChallengeContent />
    </Suspense>
  );
}
