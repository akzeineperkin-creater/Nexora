'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Star,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AcademyLevel, AcademyQuestion } from '@/lib/academy/types';

interface LevelPlayerModalProps {
  level: AcademyLevel;
  isOpen: boolean;
  onClose: () => void;
  onFinish: (levelId: number, score: number, totalQuestions: number, earnedXp: number) => {
    isFirstCompletion: boolean;
    unlockedNextLevel: boolean;
  };
  onNextLevel?: (nextLevelId: number) => void;
}

export function LevelPlayerModal({
  level,
  isOpen,
  onClose,
  onFinish,
  onNextLevel,
}: LevelPlayerModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, { selected: number; isCorrect: boolean }>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    isFirstCompletion: boolean;
    unlockedNextLevel: boolean;
  } | null>(null);

  const totalQuestions = level.questions.length;
  const currentQuestion: AcademyQuestion = level.questions[currentIdx] || level.questions[0];

  // Calculate Running Score & XP
  const correctCount = useMemo(() => {
    return Object.values(userAnswers).filter((a) => a.isCorrect).length;
  }, [userAnswers]);

  const earnedXp = useMemo(() => {
    let xp = 0;
    Object.entries(userAnswers).forEach(([qIdx, ans]) => {
      if (ans.isCorrect) {
        const q = level.questions[parseInt(qIdx, 10)];
        xp += q?.xpReward || 10;
      }
    });
    // Add completion bonus if >= 70% accuracy
    if (correctCount / totalQuestions >= 0.7) {
      xp += 50;
    }
    return xp;
  }, [userAnswers, level.questions, correctCount, totalQuestions]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQuestion.correctIndex;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: { selected: idx, isCorrect },
    }));
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Level Finished!
      const finalCorrect = Object.values(userAnswers).filter((a) => a.isCorrect).length;
      const res = onFinish(level.id, finalCorrect, totalQuestions, earnedXp);
      setCompletionResult(res);
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setIsComplete(false);
    setCompletionResult(null);
  };

  const accuracyPct = Math.round((correctCount / totalQuestions) * 100);
  const passed = accuracyPct >= 70;
  const starsEarned = accuracyPct === 100 ? 3 : accuracyPct >= 85 ? 2 : passed ? 1 : 0;

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isComplete ? 'Level Complete' : `Level ${level.id}: ${level.title}`}
      subtitle={isComplete ? 'Performance Breakdown & XP Rewards' : `${level.difficulty} • Question ${currentIdx + 1} of ${totalQuestions}`}
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {/* ========================================================================= */}
        {/* CASE 1: LEVEL COMPLETION SUMMARY SCREEN */}
        {/* ========================================================================= */}
        {isComplete ? (
          <div className="flex flex-col items-center text-center gap-5 py-3">
            {/* Trophy & Stars Header */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-lime/20 to-lime/40 border border-lime text-[#0F0B0A] dark:text-lime flex items-center justify-center shadow-lime">
                <Trophy className="w-8 h-8" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1.5">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < starsEarned ? 'fill-current' : 'text-slate-300 dark:text-[#3A3A3D]'
                    }`}
                  />
                ))}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
                {passed ? 'LEVEL COMPLETED!' : 'Keep Practicing!'}
              </h2>
              <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1 max-w-sm mx-auto">
                {passed
                  ? `Outstanding work! You have mastered the core concepts of ${level.title}.`
                  : 'You scored below the 70% passing threshold. Review the explanations and try again!'}
              </p>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-3 w-full font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] text-center">
                <div className="text-[10px] text-slate-400 dark:text-[#71717A] uppercase font-bold">Accuracy</div>
                <div className="text-xl font-extrabold text-slate-dark dark:text-[#F5F5F5] mt-0.5">
                  {accuracyPct}%
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#71717A] mt-0.5">
                  {correctCount} / {totalQuestions} Correct
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-lime-50 dark:bg-lime/10 border border-lime-200 dark:border-lime/30 text-center">
                <div className="text-[10px] text-lime-800 dark:text-lime uppercase font-bold">XP Awarded</div>
                <div className="text-xl font-extrabold text-lime-950 dark:text-lime mt-0.5">
                  +{earnedXp} XP
                </div>
                <div className="text-[10px] text-lime-700 dark:text-lime/80 mt-0.5 font-bold">
                  Score Boosted
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] text-center">
                <div className="text-[10px] text-slate-400 dark:text-[#71717A] uppercase font-bold">Status</div>
                <div
                  className={`text-xl font-extrabold mt-0.5 ${
                    passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {passed ? 'PASSED' : 'RETRY'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#71717A] mt-0.5">
                  {starsEarned} / 3 Stars
                </div>
              </div>
            </div>

            {/* Next Level Unlocked Banner */}
            {completionResult?.unlockedNextLevel && (
              <div className="w-full p-3.5 rounded-xl bg-gradient-to-r from-lime-500/15 via-lime-500/5 to-transparent border border-lime-500/30 flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-lime-600 dark:text-lime shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5]">
                      Level {level.id + 1} Unlocked!
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#A1A1AA]">
                      The next learning level is now ready to play.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 w-full pt-3 border-t border-slate-100 dark:border-[#3A3A3D]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="font-bold text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Replay Level</span>
              </Button>

              {passed && level.id < 15 && onNextLevel ? (
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onNextLevel(level.id + 1);
                  }}
                  className="font-extrabold text-xs shadow-lime cursor-pointer"
                >
                  <span>Continue to Level {level.id + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  variant="lime"
                  size="sm"
                  onClick={onClose}
                  className="font-extrabold text-xs shadow-lime cursor-pointer"
                >
                  <span>Return to Academy</span>
                  <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASE 2: ACTIVE QUESTION PLAYER */
          /* ========================================================================= */
          <div className="flex flex-col gap-4">
            {/* Progress Header Track */}
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <span className="text-slate-500 dark:text-[#71717A] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-lime" />
                <span>Task {currentIdx + 1} of {totalQuestions}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-lime-700 dark:text-lime bg-lime-50 dark:bg-lime/10 px-2 py-0.5 rounded-full border border-lime-200 dark:border-lime/30">
                  +{currentQuestion.xpReward} XP
                </span>
                <span className="text-slate-400 dark:text-[#71717A]">
                  Score: {correctCount}
                </span>
              </div>
            </div>

            {/* Smooth Progress Bar */}
            <div className="h-2 w-full bg-slate-100 dark:bg-[#1E1E21] rounded-full overflow-hidden border border-slate-200 dark:border-[#3A3A3D]">
              <div
                className="h-full bg-lime rounded-full transition-all duration-300 shadow-lime"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Context / Scenario Box (if available) */}
            {currentQuestion.context && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] text-xs text-slate-700 dark:text-[#D4D4D8] leading-relaxed">
                {currentQuestion.title && (
                  <strong className="block mb-1 text-slate-dark dark:text-[#F5F5F5] font-bold">
                    {currentQuestion.title}
                  </strong>
                )}
                <span>{currentQuestion.context}</span>
              </div>
            )}

            {/* Question Prompt */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] shadow-subtle flex flex-col gap-3.5">
              <div className="font-extrabold text-sm sm:text-base text-slate-dark dark:text-[#F5F5F5] leading-snug">
                {currentQuestion.question}
              </div>

              {/* Options List */}
              <div className="flex flex-col gap-2 pt-1">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let optionStyle =
                    'bg-slate-50 dark:bg-[#28282B] hover:bg-slate-100 dark:hover:bg-[#323236] text-slate-800 dark:text-[#F5F5F5] border-slate-200 dark:border-[#3A3A3D]';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle =
                        'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold shadow-sm';
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        'bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800';
                    } else {
                      optionStyle =
                        'opacity-50 bg-slate-50 dark:bg-[#1E1E21] border-slate-200 dark:border-[#3A3A3D] text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-white dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug pt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Educational Explanation Box */}
              {isAnswerSubmitted && (
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed transition-all mt-1 ${
                    selectedOption === currentQuestion.correctIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800/50'
                  }`}
                >
                  <div className="font-extrabold flex items-center gap-1.5 mb-1">
                    {selectedOption === currentQuestion.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Correct! (+{currentQuestion.xpReward} XP)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                  <div>{currentQuestion.explanation}</div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#3A3A3D]">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Exit
              </Button>

              {isAnswerSubmitted && (
                <Button
                  variant="lime"
                  size="sm"
                  onClick={handleNextQuestion}
                  className="font-extrabold text-xs shadow-lime cursor-pointer"
                >
                  <span>
                    {currentIdx + 1 < totalQuestions ? 'Next Question' : 'Complete Level'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
