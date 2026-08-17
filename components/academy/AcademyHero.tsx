'use client';

import React from 'react';
import {
  Trophy,
  Flame,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AcademyLevel, AcademyStats } from '@/lib/academy/types';

interface AcademyHeroProps {
  stats: AcademyStats;
  nextLevel: AcademyLevel;
  onContinue: () => void;
}

export function AcademyHero({ stats, nextLevel, onContinue }: AcademyHeroProps) {
  const currentLevelXp = stats.currentLevelXp;
  const nextRequired = stats.nextLevelXpRequired;
  const progressPct = Math.min(100, Math.round((currentLevelXp / (nextRequired || 1000)) * 100));

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1E1E21] via-[#28282B] to-[#18181A] border border-[#3A3A3D] p-6 sm:p-8 text-white shadow-lg dark:shadow-dark-card relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lime/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Title & Level Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-lime flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Financial Progression System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nexra Academy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 dark:text-[#A1A1AA] mt-1 max-w-xl">
              Master equities, technical charting, corporate valuation, and asymmetric portfolio risk through interactive levels.
            </p>
          </div>

          {/* Current Rank Badge */}
          <div className="flex items-center gap-3 bg-white/5 dark:bg-[#1E1E21] border border-white/10 dark:border-[#3A3A3D] p-3 px-4 rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-lime text-[#0F0B0A] flex items-center justify-center font-extrabold font-mono text-base shadow-lime">
              {stats.userLevel}
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase font-bold tracking-wider">
                Current Rank
              </div>
              <div className="text-sm font-extrabold text-white">
                {stats.rankTitle}
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-black/20 border border-white/5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 dark:text-[#A1A1AA] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-lime" />
              <span>LEVEL {stats.userLevel} PROGRESS</span>
            </span>
            <span className="font-extrabold text-white">
              {stats.overallXp.toLocaleString()} / {stats.nextLevelXpRequired.toLocaleString()} XP
            </span>
          </div>

          {/* Bar track */}
          <div className="h-3 w-full bg-[#1E1E21] rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-lime-400 to-lime rounded-full transition-all duration-500 shadow-lime"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Stats Ribbon & Primary CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-2 border-t border-white/10">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 font-mono">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lime shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">
                  {stats.completedCount} / {stats.totalLevels}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">
                  Levels Passed
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">
                  {stats.streakDays} {stats.streakDays === 1 ? 'Day' : 'Days'}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">
                  Daily Streak
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">
                  {stats.accuracyRate}%
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">
                  Accuracy
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lime shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-lime">
                  +{stats.overallXp.toLocaleString()} XP
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">
                  Total Earned
                </div>
              </div>
            </div>
          </div>

          {/* Continue Learning CTA */}
          <Button
            variant="lime"
            size="lg"
            onClick={onContinue}
            className="font-extrabold text-xs sm:text-sm shadow-lime shrink-0 cursor-pointer justify-center"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Continue: Level {nextLevel.id} • {nextLevel.title}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
