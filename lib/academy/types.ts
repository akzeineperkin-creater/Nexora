export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'calculation'
  | 'chart_analysis'
  | 'scenario_decision'
  | 'buy_hold_sell'
  | 'concept_match';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'challenge';

export interface AcademyQuestion {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  xpReward: number;
  title?: string;
  question: string;
  context?: string; // Additional scenario context or financial data
  chartData?: {
    type: 'candle' | 'line' | 'bar';
    points: { label: string; value: number; open?: number; high?: number; low?: number; close?: number }[];
    highlightLabel?: string;
  };
  financialMetrics?: { label: string; value: string | number }[];
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface AcademyLevel {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  description: string;
  summary: string;
  estimatedMinutes: number;
  totalXpReward: number;
  keyConcepts: string[];
  questions: AcademyQuestion[];
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  score: number; // number of correct answers
  totalQuestions: number;
  accuracy: number; // percentage (e.g. 90)
  stars: number; // 1, 2, or 3 stars
  completedAt?: string;
}

export interface UserAcademyProgress {
  currentLevel: number;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string;
  completedLevelIds: number[];
  levelProgressMap: Record<number, LevelProgress>;
}

export interface AcademyStats {
  userLevel: number;
  rankTitle: string;
  currentLevelXp: number;
  nextLevelXpRequired: number;
  overallXp: number;
  completedCount: number;
  totalLevels: number;
  streakDays: number;
  accuracyRate: number;
  totalAnswered: number;
  totalCorrect: number;
}
