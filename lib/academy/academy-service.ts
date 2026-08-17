import { supabase } from '@/lib/supabase/client';
import { ACADEMY_LEVELS } from './curriculum-data';
import {
  AcademyLevel,
  AcademyStats,
  LevelProgress,
  UserAcademyProgress,
} from './types';

const STORAGE_KEY = 'nexra_academy_progress_v2';

export const RANK_TITLES: { level: number; title: string; minXp: number; maxXp: number }[] = [
  { level: 1, title: 'Market Novice', minXp: 0, maxXp: 200 },
  { level: 2, title: 'Equity Apprentice', minXp: 200, maxXp: 450 },
  { level: 3, title: 'Junior Trader', minXp: 450, maxXp: 750 },
  { level: 4, title: 'Chartist', minXp: 750, maxXp: 1100 },
  { level: 5, title: 'Execution Specialist', minXp: 1100, maxXp: 1500 },
  { level: 6, title: 'Financial Analyst', minXp: 1500, maxXp: 1950 },
  { level: 7, title: 'Accounting Sleuth', minXp: 1950, maxXp: 2450 },
  { level: 8, title: 'Valuation Specialist', minXp: 2450, maxXp: 3000 },
  { level: 9, title: 'Dividend Aristocrat', minXp: 3000, maxXp: 3600 },
  { level: 10, title: 'Risk Architect', minXp: 3600, maxXp: 4250 },
  { level: 11, title: 'Portfolio Strategist', minXp: 4250, maxXp: 4950 },
  { level: 12, title: 'Moat Evaluator', minXp: 4950, maxXp: 5700 },
  { level: 13, title: 'Senior Quantitative Analyst', minXp: 5700, maxXp: 6500 },
  { level: 14, title: 'Chief Investment Officer', minXp: 6500, maxXp: 7400 },
  { level: 15, title: 'Grand Master of Markets', minXp: 7400, maxXp: 10000 },
];

export function getRankForXp(xp: number) {
  for (let i = RANK_TITLES.length - 1; i >= 0; i--) {
    if (xp >= RANK_TITLES[i].minXp) {
      return RANK_TITLES[i];
    }
  }
  return RANK_TITLES[0];
}

export function getDefaultProgress(): UserAcademyProgress {
  return {
    currentLevel: 1,
    totalXp: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedLevelIds: [],
    levelProgressMap: {},
  };
}

export function loadUserProgress(): UserAcademyProgress {
  if (typeof window === 'undefined') return getDefaultProgress();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed: UserAcademyProgress = JSON.parse(raw);

    // Update streak if needed
    const today = new Date().toISOString().split('T')[0];
    const lastActive = parsed.lastActiveDate || today;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastActive === yesterday) {
        parsed.streakDays = (parsed.streakDays || 0) + 1;
      } else {
        parsed.streakDays = 1;
      }
      parsed.lastActiveDate = today;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return getDefaultProgress();
  }
}

export function saveUserProgress(progress: UserAcademyProgress, userId?: string) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }

  // If user is authenticated, sync with Supabase profiles table
  if (userId && !userId.startsWith('guest-') && !userId.startsWith('bot-')) {
    try {
      const rankInfo = getRankForXp(progress.totalXp);
      (supabase as any)
        .from('profiles')
        .update({
          xp: progress.totalXp,
          level: rankInfo.level,
        })
        .eq('id', userId)
        .then(() => {})
        .catch(() => {});
    } catch {}
  }
}

export function isLevelUnlocked(levelId: number, completedIds: number[]): boolean {
  if (levelId === 1) return true;
  return completedIds.includes(levelId - 1);
}

export function recordLevelCompletion(
  levelId: number,
  score: number,
  totalQuestions: number,
  earnedXp: number,
  userId?: string
): {
  progress: UserAcademyProgress;
  isFirstCompletion: boolean;
  unlockedNextLevel: boolean;
} {
  const current = loadUserProgress();
  const accuracy = Math.round((score / totalQuestions) * 100);
  const passed = accuracy >= 70; // 70% threshold to pass level

  let stars = 1;
  if (accuracy === 100) stars = 3;
  else if (accuracy >= 85) stars = 2;

  const isFirstCompletion = passed && !current.completedLevelIds.includes(levelId);

  const existingProgress = current.levelProgressMap[levelId];
  const newBestScore = Math.max(existingProgress?.score || 0, score);
  const newBestAccuracy = Math.max(existingProgress?.accuracy || 0, accuracy);
  const newBestStars = Math.max(existingProgress?.stars || 0, stars);

  const levelProgress: LevelProgress = {
    levelId,
    completed: passed || Boolean(existingProgress?.completed),
    score: newBestScore,
    totalQuestions,
    accuracy: newBestAccuracy,
    stars: newBestStars,
    completedAt: new Date().toISOString(),
  };

  current.levelProgressMap[levelId] = levelProgress;

  if (isFirstCompletion) {
    current.completedLevelIds.push(levelId);
    current.completedLevelIds.sort((a, b) => a - b);
    current.totalXp += earnedXp;

    if (current.currentLevel === levelId && levelId < ACADEMY_LEVELS.length) {
      current.currentLevel = levelId + 1;
    }
  } else {
    // Replay small bonus (+25 XP)
    current.totalXp += Math.round(earnedXp * 0.2);
  }

  saveUserProgress(current, userId);

  return {
    progress: current,
    isFirstCompletion,
    unlockedNextLevel: isFirstCompletion && levelId < ACADEMY_LEVELS.length,
  };
}

export function computeAcademyStats(progress: UserAcademyProgress): AcademyStats {
  const rankInfo = getRankForXp(progress.totalXp);
  const completedCount = progress.completedLevelIds.length;
  const totalLevels = ACADEMY_LEVELS.length;

  let totalAnswered = 0;
  let totalCorrect = 0;

  Object.values(progress.levelProgressMap).forEach((lp) => {
    totalAnswered += lp.totalQuestions;
    totalCorrect += lp.score;
  });

  const accuracyRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;

  return {
    userLevel: rankInfo.level,
    rankTitle: rankInfo.title,
    currentLevelXp: progress.totalXp,
    nextLevelXpRequired: rankInfo.maxXp,
    overallXp: progress.totalXp,
    completedCount,
    totalLevels,
    streakDays: Math.max(1, progress.streakDays || 1),
    accuracyRate,
    totalAnswered,
    totalCorrect,
  };
}
