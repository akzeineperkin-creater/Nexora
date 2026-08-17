'use client';

import React from 'react';
import {
  Lock,
  CheckCircle2,
  Play,
  Clock,
  Zap,
  Star,
  BookOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AcademyLevel, LevelProgress } from '@/lib/academy/types';

interface LevelCardProps {
  level: AcademyLevel;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress?: LevelProgress;
  onSelect: (levelId: number) => void;
}

export function LevelCard({
  level,
  isUnlocked,
  isCompleted,
  progress,
  onSelect,
}: LevelCardProps) {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <Card
      variant="interactive"
      onClick={() => {
        if (isUnlocked) onSelect(level.id);
      }}
      className={`flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
        !isUnlocked
          ? 'opacity-65 bg-slate-50/50 dark:bg-[#1E1E21]/50 cursor-not-allowed border-dashed'
          : isCompleted
          ? 'border-emerald-500/30 dark:border-emerald-500/30 shadow-subtle'
          : 'border-lime/40 dark:border-lime/30 shadow-sm'
      }`}
    >
      <div>
        {/* Top Header: Level # & Category */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-extrabold ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : isUnlocked
                  ? 'bg-lime text-[#0F0B0A] shadow-lime'
                  : 'bg-slate-200 dark:bg-[#323236] text-slate-500 dark:text-[#71717A]'
              }`}
            >
              {pad(level.id)}
            </span>
            <Badge
              variant={
                level.difficulty === 'Beginner'
                  ? 'lime'
                  : level.difficulty === 'Intermediate'
                  ? 'blue'
                  : level.difficulty === 'Advanced'
                  ? 'neutral'
                  : 'down'
              }
              size="sm"
            >
              {level.difficulty}
            </Badge>
          </div>

          {/* Reward XP */}
          <span className="text-[11px] font-mono font-bold text-lime-700 dark:text-lime flex items-center gap-1">
            <Zap className="w-3 h-3" /> +{level.totalXpReward} XP
          </span>
        </div>

        {/* Level Title & Summary */}
        <h3 className="text-base font-extrabold text-slate-dark dark:text-[#F5F5F5] leading-snug tracking-tight">
          {level.title}
        </h3>
        <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1 line-clamp-2 leading-relaxed">
          {level.description}
        </p>

        {/* Concept Chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {level.keyConcepts.slice(0, 3).map((concept, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA] border border-slate-200 dark:border-[#3A3A3D]"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Status & Action Button */}
      <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-border dark:border-[#3A3A3D] text-xs">
        {/* Status Indicator */}
        <div>
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {progress?.score || level.questions.length}/{progress?.totalQuestions || level.questions.length} Correct
              </span>
              <div className="flex items-center text-amber-400 ml-1">
                {[...Array(progress?.stars || 3)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-current" />
                ))}
              </div>
            </div>
          ) : isUnlocked ? (
            <div className="flex items-center gap-1 text-slate-500 dark:text-[#71717A] text-[11px] font-mono">
              <Clock className="w-3 h-3" /> {level.estimatedMinutes}m • {level.questions.length} Tasks
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 dark:text-[#71717A] text-[11px] font-bold">
              <Lock className="w-3 h-3" /> Level {level.id - 1} Required
            </div>
          )}
        </div>

        {/* Action Button */}
        {isCompleted ? (
          <Button variant="outline" size="xs" className="font-bold text-xs cursor-pointer">
            Review
          </Button>
        ) : isUnlocked ? (
          <Button variant="lime" size="xs" className="font-extrabold text-xs shadow-lime cursor-pointer">
            <Play className="w-3 h-3 mr-1 fill-current" />
            <span>Start</span>
          </Button>
        ) : (
          <Button variant="outline" size="xs" disabled className="text-xs opacity-50 cursor-not-allowed">
            Locked
          </Button>
        )}
      </div>
    </Card>
  );
}
