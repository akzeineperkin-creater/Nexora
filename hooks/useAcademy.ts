'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ACADEMY_LEVELS } from '@/lib/academy/curriculum-data';
import {
  AcademyLevel,
  AcademyStats,
  UserAcademyProgress,
} from '@/lib/academy/types';
import {
  loadUserProgress,
  saveUserProgress,
  recordLevelCompletion,
  computeAcademyStats,
  isLevelUnlocked,
  getDefaultProgress,
} from '@/lib/academy/academy-service';

export function useAcademy() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserAcademyProgress>(getDefaultProgress());
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  // Load progress on mount
  useEffect(() => {
    const loaded = loadUserProgress();
    setProgress(loaded);
    setIsLoaded(true);
  }, []);

  const stats: AcademyStats = useMemo(() => {
    return computeAcademyStats(progress);
  }, [progress]);

  // Find next recommended level (the first uncompleted, unlocked level)
  const nextLevelToPlay = useMemo(() => {
    for (const lvl of ACADEMY_LEVELS) {
      if (!progress.completedLevelIds.includes(lvl.id)) {
        if (isLevelUnlocked(lvl.id, progress.completedLevelIds)) {
          return lvl;
        }
      }
    }
    return ACADEMY_LEVELS[ACADEMY_LEVELS.length - 1];
  }, [progress]);

  const activeLevel = useMemo(() => {
    if (activeLevelId === null) return null;
    return ACADEMY_LEVELS.find((l) => l.id === activeLevelId) || null;
  }, [activeLevelId]);

  const startLevel = useCallback(
    (levelId: number) => {
      if (isLevelUnlocked(levelId, progress.completedLevelIds)) {
        setActiveLevelId(levelId);
      }
    },
    [progress.completedLevelIds]
  );

  const closeLevel = useCallback(() => {
    setActiveLevelId(null);
  }, []);

  const finishLevel = useCallback(
    (levelId: number, score: number, totalQuestions: number, earnedXp: number) => {
      const result = recordLevelCompletion(
        levelId,
        score,
        totalQuestions,
        earnedXp,
        user?.id
      );
      setProgress({ ...result.progress });
      return result;
    },
    [user?.id]
  );

  return {
    isLoaded,
    progress,
    stats,
    levels: ACADEMY_LEVELS,
    nextLevelToPlay,
    activeLevel,
    startLevel,
    closeLevel,
    finishLevel,
  };
}
