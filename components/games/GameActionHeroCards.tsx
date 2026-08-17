'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  PlusCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateGameModal } from './CreateGameModal';
import { JoinGameModal } from './JoinGameModal';

interface GameActionHeroCardsProps {
  className?: string;
  onExploreClick?: () => void;
}

export function GameActionHeroCards({
  className = '',
  onExploreClick,
}: GameActionHeroCardsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${className}`}>
        {/* ========================================================================= */}
        {/* HERO CARD 1: CREATE GAME */}
        {/* ========================================================================= */}
        <div
          onClick={() => setIsCreateOpen(true)}
          className="relative overflow-hidden rounded-2xl border border-slate-800 shadow-xl min-h-[270px] sm:min-h-[290px] flex flex-col justify-between p-6 sm:p-7 group cursor-pointer select-none transition-all duration-300 hover:border-lime/40"
        >
          {/* Full Card Background Image Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
              alt="Building and hosting a trading competition"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
            {/* Subtle dark charcoal gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40 group-hover:via-slate-950/70 transition-all duration-500" />
            {/* Subtle geometric dot matrix pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#B8F500_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>

          {/* Layered Content on Top of Image */}
          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Top Row: Tag + Icon */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-lime text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Host Tournament
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lime backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                <PlusCircle className="w-4 h-4" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="mb-5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight mb-2 group-hover:text-lime transition-colors">
                Create a Trading Game
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                Set custom rules, select equal starting virtual capital, invite friends or colleagues, and launch a public or private simulated tournament.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono text-slate-400">
                Sandbox Mode • Virtual Cash
              </span>
              <Button
                variant="lime"
                size="sm"
                className="font-extrabold text-xs shadow-lime cursor-pointer pointer-events-none group-hover:translate-x-1 transition-transform"
              >
                <span>Create Game</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO CARD 2: FIND / JOIN GAME */}
        {/* ========================================================================= */}
        <div
          onClick={() => setIsJoinOpen(true)}
          className="relative overflow-hidden rounded-2xl border border-slate-800 shadow-xl min-h-[270px] sm:min-h-[290px] flex flex-col justify-between p-6 sm:p-7 group cursor-pointer select-none transition-all duration-300 hover:border-lime/40"
        >
          {/* Full Card Background Image Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"
              alt="Financial markets trading screens and competition arena"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
            {/* Subtle dark charcoal gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40 group-hover:via-slate-950/70 transition-all duration-500" />
            {/* Subtle geometric dot matrix pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#B8F500_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>

          {/* Layered Content on Top of Image */}
          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Top Row: Tag + Icon */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                Active Arenas
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="mb-5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight mb-2 group-hover:text-lime transition-colors">
                Find & Join Tournaments
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                Explore live public trading arenas, search tournaments by code or category, and test your execution against simulated global equity traders.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono text-slate-400">
                Live Leaderboards • Real Stock Prices
              </span>
              <Button
                variant="outline"
                size="sm"
                className="font-extrabold text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white cursor-pointer pointer-events-none group-hover:translate-x-1 transition-transform"
              >
                <span>Find Game</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE GAME MODAL */}
      <CreateGameModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* FIND / JOIN GAME MODAL */}
      <JoinGameModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
    </>
  );
}
