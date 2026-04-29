"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { glossaryTerms, GLOSSARY_CATEGORIES } from "@/data/glossary";
import { useTheme } from "@/lib/theme";
import TradingBackground from "@/components/TradingBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft, Search, BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";

type CategoryKey = keyof typeof GLOSSARY_CATEGORIES;

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">("all");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const filtered = glossaryTerms.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.entries(GLOSSARY_CATEGORIES) as [CategoryKey, (typeof GLOSSARY_CATEGORIES)[CategoryKey]][];

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
            <div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: "#8b5cf6" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Reference
                </span>
              </div>
              <h1 className="text-xl font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
                Glossary
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="glass-card rounded-xl p-3 mb-5">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-transparent outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={{
              backgroundColor: activeCategory === "all"
                ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)")
                : "transparent",
              color: activeCategory === "all" ? "var(--text-primary)" : "var(--text-muted)",
              border: `1px solid ${activeCategory === "all" ? "var(--border-hover)" : "var(--border-primary)"}`,
            }}
          >
            All ({glossaryTerms.length})
          </button>
          {categories.map(([key, cat]) => {
            const count = glossaryTerms.filter((t) => t.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  backgroundColor: activeCategory === key ? cat.color + (isDark ? "20" : "10") : "transparent",
                  color: activeCategory === key ? cat.color : "var(--text-muted)",
                  border: `1px solid ${activeCategory === key ? cat.color + "40" : "var(--border-primary)"}`,
                }}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No terms found for &ldquo;{search}&rdquo;
              </p>
            </div>
          )}
          {filtered.map((term, i) => {
            const cat = GLOSSARY_CATEGORIES[term.category];
            const isExpanded = expandedTerm === term.term;
            return (
              <motion.div
                key={term.term}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <button
                  onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                  className="w-full text-left glass-card rounded-xl p-4 transition-all"
                  style={{
                    borderLeft: `3px solid ${cat.color}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {term.term}
                      </h3>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: cat.color + (isDark ? "15" : "08"),
                          color: cat.color,
                        }}
                      >
                        {cat.label}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {term.definition}
                        </p>
                        {term.relatedModule && (
                          <Link
                            href={`/course/${term.relatedModule}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium transition-colors hover:brightness-110"
                            style={{ color: cat.color }}
                          >
                            <BookOpen size={10} />
                            Go to lesson
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
