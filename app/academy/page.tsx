'use client';

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  Filter,
  Flame,
} from 'lucide-react';
import { AcademyHero } from '@/components/academy/AcademyHero';
import { LevelCard } from '@/components/academy/LevelCard';
import { LevelPlayerModal } from '@/components/academy/LevelPlayerModal';
import { useAcademy } from '@/hooks/useAcademy';
import { isLevelUnlocked } from '@/lib/academy/academy-service';
import { PillTabs } from '@/components/ui/Tabs';

export default function AcademyPage() {
  const {
    isLoaded,
    progress,
    stats,
    levels,
    nextLevelToPlay,
    activeLevel,
    startLevel,
    closeLevel,
    finishLevel,
  } = useAcademy();

  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Master'>('All');

  // Filter levels by difficulty
  const filteredLevels = useMemo(() => {
    if (categoryFilter === 'All') return levels;
    return levels.filter((lvl) => lvl.difficulty === categoryFilter);
  }, [levels, categoryFilter]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6 max-w-[1440px] mx-auto py-8">
        <div className="h-64 bg-slate-100 dark:bg-[#1E1E21] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-[#1E1E21] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1440px] mx-auto pb-12">
      {/* 1. HERO PROGRESSION DASHBOARD */}
      <AcademyHero
        stats={stats}
        nextLevel={nextLevelToPlay}
        onContinue={() => startLevel(nextLevelToPlay.id)}
      />

      {/* 2. CURRICULUM ROADMAP & LEVEL SELECTOR */}
      <div className="flex flex-col gap-5">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-lime-600 dark:text-lime" />
              <span>15-Level Financial Curriculum</span>
            </h2>
            <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-0.5">
              Complete each level to earn XP, unlock subsequent tiers, and rise through the ranks.
            </p>
          </div>

          <PillTabs
            tabs={[
              { id: 'All', label: 'All Levels (15)' },
              { id: 'Beginner', label: 'Beginner (1–5)' },
              { id: 'Intermediate', label: 'Intermediate (6–11)' },
              { id: 'Advanced', label: 'Advanced (12–14)' },
              { id: 'Master', label: 'Capstone (15)' },
            ]}
            activeId={categoryFilter}
            onChange={(tabId) => setCategoryFilter(tabId as any)}
          />
        </div>

        {/* 15 Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLevels.map((level) => {
            const isUnlocked = isLevelUnlocked(level.id, progress.completedLevelIds);
            const isCompleted = progress.completedLevelIds.includes(level.id);
            const levelProg = progress.levelProgressMap[level.id];

            return (
              <LevelCard
                key={level.id}
                level={level}
                isUnlocked={isUnlocked}
                isCompleted={isCompleted}
                progress={levelProg}
                onSelect={(id) => startLevel(id)}
              />
            );
          })}
        </div>
      </div>

      {/* 3. INTERACTIVE LEVEL PLAYER MODAL */}
      {activeLevel && (
        <LevelPlayerModal
          level={activeLevel}
          isOpen={!!activeLevel}
          onClose={closeLevel}
          onFinish={finishLevel}
          onNextLevel={(nextId) => startLevel(nextId)}
        />
      )}
    </div>
  );
}
