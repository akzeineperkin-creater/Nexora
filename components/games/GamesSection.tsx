'use client';

import React, { useState } from 'react';
import {
  Trophy,
  PlusCircle,
  ShieldCheck,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PillTabs } from '@/components/ui/Tabs';
import { GameCard } from './GameCard';
import { GameActionHeroCards } from './GameActionHeroCards';
import { CreateGameModal } from './CreateGameModal';
import { useGames } from '@/hooks/useGames';
import { useTranslation } from '@/providers/LanguageProvider';

interface GamesSectionProps {
  title?: string;
  subtitle?: string;
  showHeroCards?: boolean;
  className?: string;
}

export function GamesSection({
  title,
  subtitle,
  showHeroCards = true,
  className = '',
}: GamesSectionProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t('games.title');
  const displaySubtitle = subtitle ?? t('games.subtitle');

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useGames(activeTab !== 'all' ? activeTab : undefined);
  const games = data?.games || [];

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* 1. PROMINENT HERO ACTION CARDS (CREATE GAME & FIND GAME) */}
      {showHeroCards && (
        <GameActionHeroCards />
      )}

      {/* 2. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {displayTitle}
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-lime text-slate-dark border border-lime-400">
              {t('games.badge')}
            </span>
          </div>
          <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            {displaySubtitle}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="lime"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="font-extrabold text-xs cursor-pointer shadow-lime"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            <span>{t('games.createGameBtn')}</span>
          </Button>
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="overflow-x-auto pb-1">
        <PillTabs
          items={[
            { id: 'all', label: t('games.allTournaments') },
            { id: 'active', label: t('games.liveActive') },
            { id: 'upcoming', label: t('games.upcoming') },
            { id: 'completed', label: t('games.completed') },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          variant="lime"
        />
      </div>

      {/* 4. GAMES GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]" />
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]" />
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]" />
        </div>
      ) : games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-2xl shadow-subtle dark:shadow-dark-card">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1E1E21] text-slate-500 dark:text-[#A1A1AA] flex items-center justify-center mx-auto mb-2">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-dark dark:text-[#F5F5F5]">{t('games.noTournamentsTitle')}</h4>
          <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-0.5 mb-3">
            {t('games.noTournamentsDesc')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="dark:border-[#3A3A3D] dark:text-[#F5F5F5] dark:hover:bg-[#323236]"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" /> {t('games.createGameBtn')}
          </Button>
        </div>
      )}

      {/* CREATE GAME MODAL */}
      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
