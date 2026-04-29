"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { modules, CATEGORIES } from "@/data/modules";
import { useTheme } from "@/lib/theme";
import TradingBackground from "@/components/TradingBackground";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Brain,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const tipConfig = {
  tip: { icon: Lightbulb, color: "#3b82f6", bg: "blue", label: "Pro Tip" },
  warning: { icon: AlertTriangle, color: "#ef4444", bg: "red", label: "Watch Out" },
  example: { icon: Sparkles, color: "#8b5cf6", bg: "purple", label: "Real Example" },
  think: { icon: Brain, color: "#f59e0b", bg: "yellow", label: "Think About It" },
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const moduleData = modules.find((m) => m.id === params.moduleId);

  useEffect(() => {
    setCurrentSection(0);
    window.scrollTo(0, 0);
  }, [params.moduleId]);

  if (!moduleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-muted)" }}>Module not found</p>
      </div>
    );
  }

  const category = CATEGORIES[moduleData.category];
  const totalSections = moduleData.content.length;
  const isLastSection = currentSection === totalSections - 1;
  const hasQuiz = moduleData.quiz.length > 0;
  const hasChallenge = !!moduleData.challenge;

  const moduleIndex = modules.indexOf(moduleData);
  const nextModule = modules[moduleIndex + 1];
  const prevModule = modules[moduleIndex - 1];

  const currentTip = moduleData.tips[currentSection % moduleData.tips.length];

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <TradingBackground />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="transition-colors hover-lift p-2 rounded-lg"
              style={{ color: "var(--text-muted)" }}
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
                  style={{
                    backgroundColor: categoryColor(category.color, isDark),
                    color: category.color,
                  }}
                >
                  {category.label}
                </span>
                <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                  {currentSection + 1} of {totalSections}
                </span>
              </div>
              <h1
                className="text-lg sm:text-xl font-bold mt-1 leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {moduleData.title}
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: category.color }}
              animate={{
                width: `${((currentSection + 1) / totalSections) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="glass-card rounded-2xl p-6 sm:p-8 mb-5">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen size={16} style={{ color: category.color }} />
                <span
                  className="text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Lesson Content
                </span>
              </div>
              <div
                className="leading-relaxed text-sm space-y-4"
                style={{ color: "var(--text-secondary)" }}
                dangerouslySetInnerHTML={{
                  __html: moduleData.content[currentSection]
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      `<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>`
                    )
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>

            {moduleData.contentImages?.find(img => img.afterSection === currentSection) && (() => {
              const img = moduleData.contentImages!.find(i => i.afterSection === currentSection)!;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass-card rounded-2xl overflow-hidden mb-5"
                >
                  <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
                    <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: category.color }}>
                      Real Chart Example
                    </span>
                  </div>
                  <img src={img.imageUrl} alt="Chart example" className="w-full object-cover" draggable={false} />
                  <div className="px-5 py-3">
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{img.caption}</p>
                  </div>
                </motion.div>
              );
            })()}

            {currentTip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="animate-float-slow mb-5"
              >
                <div
                  className="glass-card rounded-xl p-4 border-l-4"
                  style={{ borderLeftColor: tipConfig[currentTip.type].color }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {(() => {
                      const TipIcon = tipConfig[currentTip.type].icon;
                      return (
                        <TipIcon
                          size={14}
                          style={{ color: tipConfig[currentTip.type].color }}
                        />
                      );
                    })()}
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: tipConfig[currentTip.type].color }}
                    >
                      {tipConfig[currentTip.type].label}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {currentTip.text}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {isLastSection && moduleData.chartExample && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl overflow-hidden mb-5"
          >
            <div
              className="flex items-center gap-2 px-5 py-3 border-b"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: category.color }}>
                Real Chart Example
              </span>
            </div>
            <img
              src={moduleData.chartExample.imageUrl}
              alt="Chart example"
              className="w-full object-cover"
            />
            <div className="px-5 py-3">
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {moduleData.chartExample.caption}
              </p>
            </div>
          </motion.div>
        )}

        {isLastSection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 mb-6 border-l-4"
            style={{ borderLeftColor: "#eab308" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-yellow-500" />
              <span className="text-sm font-bold text-yellow-500">
                Key Takeaways
              </span>
            </div>
            <ul className="space-y-2.5">
              {moduleData.keyTakeaways.map((takeaway, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <CheckCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-yellow-500"
                  />
                  {takeaway}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (currentSection > 0) setCurrentSection(currentSection - 1);
              else if (prevModule) router.push(`/course/${prevModule.id}`);
            }}
            disabled={currentSection === 0 && !prevModule}
            className="flex items-center gap-2 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover-lift px-3 py-2 rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {isLastSection ? (
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              {hasChallenge && (
                <Link
                  href={`/challenge?module=${moduleData.id}`}
                  className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-all hover-lift font-medium"
                  style={{
                    borderColor: category.color + "50",
                    color: category.color,
                  }}
                >
                  Chart Challenge
                  <ArrowRight size={16} />
                </Link>
              )}
              {hasQuiz ? (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={`/quiz/${moduleData.id}`}
                    className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold text-white transition-all"
                    style={{ backgroundColor: category.color }}
                  >
                    Take Quiz
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ) : nextModule ? (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={nextModule.category === "challenge" ? `/challenge?module=${nextModule.id}` : `/course/${nextModule.id}`}
                    className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold text-white transition-all"
                    style={{ backgroundColor: category.color }}
                  >
                    {nextModule.category === "challenge" ? "Chart Challenge" : "Next Module"}
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-500 transition-colors"
                >
                  <CheckCircle size={16} />
                  Dashboard
                </Link>
              )}
            </div>
          ) : (
            <motion.button
              onClick={() => setCurrentSection(currentSection + 1)}
              className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold text-white transition-all"
              style={{ backgroundColor: category.color }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Continue
              <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

function categoryColor(color: string, isDark: boolean) {
  return isDark ? color + "15" : color + "10";
}
