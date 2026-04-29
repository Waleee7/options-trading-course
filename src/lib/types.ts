export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ChartChallenge {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  questionType: "direction" | "callput" | "click";
  correctAnswer: "bullish" | "bearish" | "call" | "put";
  explanation: string;
  entryZone?: { xStart: number; xEnd: number; label: string };
}

export interface ProTip {
  text: string;
  type: "tip" | "warning" | "example" | "think";
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: "fundamentals" | "core" | "greeks" | "strategy" | "challenge";
  content: string[];
  tips: ProTip[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  challenge?: ChartChallenge;
  xpReward: number;
  chartExample?: { imageUrl: string; caption: string };
  contentImages?: { afterSection: number; imageUrl: string; caption: string }[];
}

export interface UserProgress {
  completedModules: string[];
  quizScores: Record<string, number>;
  totalXp: number;
  currentStreak: number;
  lastActivity: string;
  challengeResults: Record<string, boolean>;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  check: (progress: UserProgress) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Complete your first module",
    icon: "rocket",
    color: "#3b82f6",
    check: (p) => p.completedModules.length >= 1,
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Score 100% on any quiz",
    icon: "star",
    color: "#eab308",
    check: (p) => Object.values(p.quizScores).some((s) => s === 100),
  },
  {
    id: "greek-scholar",
    title: "Greek Scholar",
    description: "Complete all Greeks modules",
    icon: "brain",
    color: "#f59e0b",
    check: (p) =>
      ["theta-greek", "delta-greek", "gamma-greek", "vega-greek"].every((id) =>
        p.completedModules.includes(id)
      ),
  },
  {
    id: "streak-3",
    title: "On Fire",
    description: "Reach a 3-day streak",
    icon: "flame",
    color: "#f97316",
    check: (p) => p.currentStreak >= 3,
  },
  {
    id: "halfway",
    title: "Halfway There",
    description: "Complete 7 modules",
    icon: "mountain",
    color: "#8b5cf6",
    check: (p) => p.completedModules.length >= 7,
  },
  {
    id: "chart-master",
    title: "Chart Master",
    description: "Get all chart challenges correct",
    icon: "crosshair",
    color: "#ef4444",
    check: (p) => {
      const results = Object.values(p.challengeResults);
      return results.length >= 4 && results.every(Boolean);
    },
  },
  {
    id: "strategist",
    title: "Strategist",
    description: "Complete all strategy modules",
    icon: "target",
    color: "#10b981",
    check: (p) =>
      ["support-resistance", "picking-contracts", "common-mistakes", "basic-spreads"].every((id) =>
        p.completedModules.includes(id)
      ),
  },
  {
    id: "market-wizard",
    title: "Market Wizard",
    description: "Complete the entire course",
    icon: "crown",
    color: "#ec4899",
    check: (p) => p.completedModules.length >= 14,
  },
];

export const RANKS = [
  { title: "Rookie Trader", minXp: 0, color: "#6b7280" },
  { title: "Market Student", minXp: 100, color: "#3b82f6" },
  { title: "Chart Reader", minXp: 300, color: "#8b5cf6" },
  { title: "Options Analyst", minXp: 600, color: "#f59e0b" },
  { title: "Greek Master", minXp: 1000, color: "#10b981" },
  { title: "Options Strategist", minXp: 1500, color: "#ef4444" },
  { title: "Market Wizard", minXp: 2000, color: "#ec4899" },
] as const;

export function getRank(xp: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(xp: number) {
  for (const rank of RANKS) {
    if (xp < rank.minXp) return rank;
  }
  return null;
}
