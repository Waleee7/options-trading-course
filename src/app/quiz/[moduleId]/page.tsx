"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { modules, CATEGORIES } from "@/data/modules";
import { completeModule } from "@/lib/progress";
import TradingBackground from "@/components/TradingBackground";
import XpPopup from "@/components/XpPopup";
import { useTheme } from "@/lib/theme";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const moduleData = modules.find((m) => m.id === params.moduleId);

  useEffect(() => {
    if (moduleData) {
      setAnswers(new Array(moduleData.quiz.length).fill(null));
    }
  }, [moduleData]);

  if (!moduleData || moduleData.quiz.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Quiz not found</p>
      </div>
    );
  }

  const category = CATEGORIES[moduleData.category];
  const quiz = moduleData.quiz;
  const question = quiz[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const scorePercent = Math.round((correctCount / quiz.length) * 100);

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (answerIndex === question.correctAnswer) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const finalCorrect =
        selectedAnswer === question.correctAnswer
          ? correctCount
          : correctCount;
      const finalPercent = Math.round((finalCorrect / quiz.length) * 100);
      const xpEarned = Math.round(moduleData.xpReward * (finalPercent / 100));
      completeModule(moduleData.id, finalPercent, xpEarned);
      setQuizComplete(true);
      setShowXp(true);
      setTimeout(() => setShowXp(false), 3000);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setQuizComplete(false);
    setAnswers(new Array(quiz.length).fill(null));
  };

  if (quizComplete) {
    const xpEarned = Math.round(moduleData.xpReward * (scorePercent / 100));
    const moduleIndex = modules.indexOf(moduleData);
    const nextModule = modules[moduleIndex + 1];

    return (
      <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <TradingBackground />
        <XpPopup xp={xpEarned} show={showXp} />

        <div className="relative z-10 max-w-lg mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-8 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor:
                  scorePercent >= 70 ? "#10b98120" : "#ef444420",
              }}
            >
              <Trophy
                size={28}
                className={
                  scorePercent >= 70 ? "text-green-400" : "text-red-400"
                }
              />
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {scorePercent === 100
                ? "Perfect Score!"
                : scorePercent >= 70
                  ? "Great Job!"
                  : "Keep Learning!"}
            </h2>

            <p className="mb-6" style={{ color: "var(--text-muted)" }}>
              You scored {correctCount} out of {quiz.length} ({scorePercent}%)
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-2xl font-bold text-yellow-400">
                +{xpEarned} XP
              </span>
            </div>

            <div className="h-2 rounded-full overflow-hidden mb-8" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor:
                    scorePercent >= 70 ? "#10b981" : "#ef4444",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={restartQuiz}
                className="flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-lg border transition-colors"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                <RotateCcw size={16} />
                Retry Quiz
              </button>
              {nextModule ? (
                <Link
                  href={nextModule.category === "challenge" ? `/challenge?module=${nextModule.id}` : `/course/${nextModule.id}`}
                  className="flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: category.color }}
                >
                  {nextModule.category === "challenge" ? "Chart Challenge" : "Next Module"}
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/complete"
                  className="flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:brightness-110 transition-all"
                >
                  View Results
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <TradingBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href={`/course/${moduleData.id}`}
            className="transition-colors hover-lift p-2 rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: category.color + (isDark ? "20" : "10"),
                color: category.color,
              }}
            >
              Quiz
            </span>
            <h1 className="text-lg font-bold mt-1" style={{ color: "var(--text-primary)" }}>
              {moduleData.title}
            </h1>
          </div>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {currentQuestion + 1} / {quiz.length}
          </span>
        </div>

        <div className="mb-6">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: category.color }}
              animate={{
                width: `${((currentQuestion + 1) / quiz.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card rounded-xl p-6 mb-4">
              <p className="font-medium text-base mb-6" style={{ color: "var(--text-primary)" }}>
                {question.question}
              </p>

              <div className="space-y-3">
                {question.options.map((option, i) => {
                  let borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
                  let bgColor = "transparent";
                  let textStyle: React.CSSProperties = { color: "var(--text-secondary)" };

                  if (showResult) {
                    if (i === question.correctAnswer) {
                      borderColor = "#10b981";
                      bgColor = "rgba(16,185,129,0.1)";
                      textStyle = { color: "#10b981" };
                    } else if (i === selectedAnswer && !isCorrect) {
                      borderColor = "#ef4444";
                      bgColor = "rgba(239,68,68,0.1)";
                      textStyle = { color: "#ef4444" };
                    }
                  } else if (selectedAnswer === i) {
                    borderColor = category.color;
                    bgColor = category.color + "10";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${showResult ? "cursor-default" : "cursor-pointer"}`}
                      style={{ borderColor, backgroundColor: bgColor, ...textStyle }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-medium shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm flex-1 min-w-0 text-left">{option}</span>
                        {showResult && i === question.correctAnswer && (
                          <CheckCircle
                            size={18}
                            className="ml-auto text-green-400 shrink-0"
                          />
                        )}
                        {showResult &&
                          i === selectedAnswer &&
                          !isCorrect &&
                          i !== question.correctAnswer && (
                            <XCircle
                              size={18}
                              className="ml-auto text-red-400 shrink-0"
                            />
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`rounded-xl border p-4 mb-4 ${
                    isCorrect
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}
                  >
                    {isCorrect ? "Correct!" : "Not quite!"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {question.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {showResult && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg font-medium text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: category.color }}
                >
                  {currentQuestion < quiz.length - 1
                    ? "Next Question"
                    : "See Results"}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
