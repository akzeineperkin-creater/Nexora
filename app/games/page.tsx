'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Trophy,
  Users,
  Clock,
  ShieldCheck,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GameActionHeroCards } from '@/components/games/GameActionHeroCards';
import { GamesSection } from '@/components/games/GamesSection';
import { CreateGameModal } from '@/components/games/CreateGameModal';
import { useGames } from '@/hooks/useGames';
import { formatCurrency } from '@/lib/utils';

export default function GamesHubPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data } = useGames();
  const allGames = data?.games || [];
  const activeGames = allGames.filter((g) => g.status === 'active');
  const featuredGame = activeGames[0] || allGames[0];

  return (
    <div className="flex flex-col gap-8 max-w-[1440px] mx-auto">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              Trading Games & Tournaments
            </h1>
            <Badge variant="lime" size="sm">
              Live Arena
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-1">
            Compete in simulated equity trading tournaments with equal starting capital, live market prices, and risk-adjusted return leaderboards.
          </p>
        </div>

        <Button
          variant="lime"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="font-extrabold text-xs cursor-pointer shadow-lime shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          <span>Create Tournament</span>
        </Button>
      </div>

      {/* 2. PROMINENT VISUAL HERO CARDS (CREATE GAME & FIND GAME) */}
      <GameActionHeroCards />

      {/* 3. FEATURED TOURNAMENT HERO BANNER */}
      {featuredGame && (
        <div className="bg-gradient-to-br from-[#1E1E21] via-[#28282B] to-[#1E1E21] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-[#3A3A3D] shadow-dark-card">
          {/* Subtle geometric background grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B8F500_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-lime text-[#0F0B0A] text-[10px] font-extrabold uppercase tracking-wider">
                  Featured Championship
                </span>
                <span className="text-xs text-zinc-400 dark:text-[#A1A1AA] font-mono">
                  {featuredGame.category} • Equal Capital
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
                {featuredGame.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 dark:text-[#A1A1AA] leading-relaxed mb-4">
                {featuredGame.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-[#A1A1AA] flex-wrap">
                <span className="flex items-center gap-1.5 text-zinc-200 dark:text-[#F5F5F5]">
                  <ShieldCheck className="w-4 h-4 text-lime" />
                  <span>Starting Balance: <strong className="text-white font-mono">{formatCurrency(featuredGame.startingCapital, 0)}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-zinc-200 dark:text-[#F5F5F5]">
                  <Users className="w-4 h-4 text-zinc-400 dark:text-[#71717A]" />
                  <span><strong>{featuredGame.participantsCount.toLocaleString()}</strong> Active Traders</span>
                </span>
              </div>
            </div>

            {/* Right Action Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 w-full lg:w-auto">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-around gap-4 text-center font-mono">
                <div>
                  <div className="text-xl font-extrabold text-lime">14d 08h</div>
                  <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Time Remaining</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-xl font-extrabold text-white">{formatCurrency(featuredGame.startingCapital, 0)}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Virtual Pool</div>
                </div>
              </div>

              <Link href={`/games/${featuredGame.slug}`} className="w-full">
                <Button
                  variant="lime"
                  size="lg"
                  className="w-full justify-center font-extrabold text-xs cursor-pointer shadow-lime"
                >
                  <span>Enter Championship Arena</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. PLATFORM HIGHLIGHT STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-muted dark:text-[#A1A1AA] text-xs mb-1">
            <Gamepad2 className="w-4 h-4 text-slate-600 dark:text-[#A1A1AA]" />
            <span className="font-bold">Active Arenas</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5]">
            {activeGames.length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-muted dark:text-[#A1A1AA] text-xs mb-1">
            <Users className="w-4 h-4 text-slate-600 dark:text-[#A1A1AA]" />
            <span className="font-bold">Total Sim Traders</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5]">
            2,950+
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-muted dark:text-[#A1A1AA] text-xs mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold">Asset Universe</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5]">
            80+ Equities & ETFs
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-muted dark:text-[#A1A1AA] text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-lime-900 dark:text-lime" />
            <span className="font-bold">Sim Mode</span>
          </div>
          <div className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mt-1">
            100% Virtual Capital
          </div>
        </Card>
      </div>

      {/* 5. MAIN GAMES SECTION WITH TABS */}
      <GamesSection
        title="Browse All Competitions"
        subtitle="Filter by active tournaments, upcoming challenges, and historical archives."
        showHeroCards={false}
      />

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
