'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
  Star,
  PieChart,
  Newspaper,
  PlusCircle,
  BarChart3,
  Building2,
  Layers,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { NewsImage } from '@/components/news/NewsImage';
import { useNews } from '@/hooks/useNews';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWatchlist } from '@/hooks/useWatchlist';
import { formatTimeAgo } from '@/lib/utils';
import { detectCategory, extractMentionedTickers } from '@/lib/news/news-service';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'watchlist' | 'portfolio'>('all');
  const [now, setNow] = useState<number>(Date.now());

  // 1. Fetch real news with auto-refresh hooks & pagination (24 articles per page)
  const {
    articles,
    isLoading,
    isFetching,
    isError,
    lastSyncAt,
    hasMore,
    loadMore,
    totalCount,
    marketMovers,
    newStoriesCount,
    showNewStories,
    refreshNews,
    isRefreshing,
  } = useNews({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchQuery || undefined,
    limit: 24,
  });

  // 2. Fetch User Portfolio & Watchlist for personalized news filtering
  const { data: portfolio } = usePortfolio();
  const { data: watchlist } = useWatchlist();

  // Tick relative time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const portfolioTickers = useMemo(() => {
    const list = portfolio?.holdings?.map((h) => h.asset?.ticker?.toUpperCase()).filter((t): t is string => Boolean(t)) || [];
    return new Set<string>(list);
  }, [portfolio]);

  const watchlistTickers = useMemo(() => {
    const list = watchlist?.map((w) => w.asset?.ticker?.toUpperCase()).filter((t): t is string => Boolean(t)) || [];
    return new Set<string>(list);
  }, [watchlist]);

  // Filter articles by Portfolio or Watchlist if selected
  const displayedList = useMemo(() => {
    if (!articles) return [];
    let list = articles;

    if (filterMode === 'portfolio') {
      if (portfolioTickers.size === 0) return [];
      list = list.filter((a) => {
        const text = `${a.title} ${a.summary}`.toUpperCase();
        return Array.from(portfolioTickers).some((t) => t && text.includes(t));
      });
    } else if (filterMode === 'watchlist') {
      if (watchlistTickers.size === 0) return [];
      list = list.filter((a) => {
        const text = `${a.title} ${a.summary}`.toUpperCase();
        return Array.from(watchlistTickers).some((t) => t && text.includes(t));
      });
    }

    return list;
  }, [articles, filterMode, portfolioTickers, watchlistTickers]);

  // 16 Standard Financial Categories (Strictly NO CRYPTO)
  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'market', label: 'Market News' },
    { id: 'companies', label: 'Company News' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'technology', label: 'Technology' },
    { id: 'economy', label: 'Economy' },
    { id: 'fed', label: 'Federal Reserve' },
    { id: 'rates', label: 'Interest Rates' },
    { id: 'inflation', label: 'Inflation' },
    { id: 'm&a', label: 'M&A' },
    { id: 'ipo', label: 'IPO' },
    { id: 'banking', label: 'Banking' },
    { id: 'energy', label: 'Energy' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'consumer', label: 'Consumer' },
    { id: 'industrials', label: 'Industrials' },
    { id: 'global', label: 'Global Markets' },
  ];

  const featuredArticle = displayedList.length > 0 ? displayedList[0] : null;
  const standardArticles = displayedList.length > 1 ? displayedList.slice(1) : [];

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              Financial News & Market Intelligence
            </h1>
            <Badge variant="lime" size="sm">
              Live Wire Feed
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-muted dark:text-[#A1A1AA] mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Updated {formatTimeAgo(lastSyncAt)}</span>
            </span>
            <span>•</span>
            <span>Server Aggregated Institutional Feeds</span>
          </div>
        </div>

        {/* Manual Refresh CTA */}
        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="glass"
            size="sm"
            onClick={() => refreshNews()}
            disabled={isRefreshing}
            className="cursor-pointer font-bold text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-lime-900 dark:text-lime' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Feed...' : 'Refresh Wire'}</span>
          </GlassButton>
        </div>
      </div>

      {/* 2. NEW STORIES FLOATING BANNER */}
      {newStoriesCount > 0 && (
        <div className="sticky top-20 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-[#1E1E21] text-white rounded-2xl shadow-xl border border-[#3A3A3D] flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="flex items-center gap-2.5 pl-2">
              <Sparkles className="w-4 h-4 text-lime animate-bounce" />
              <span className="text-xs font-bold text-white">
                {newStoriesCount} new {newStoriesCount === 1 ? 'story' : 'stories'} available
              </span>
            </div>
            <button
              onClick={showNewStories}
              className="px-3.5 py-1.5 rounded-full bg-lime text-[#0F0B0A] text-xs font-extrabold shadow-sm hover:bg-lime-300 transition-colors cursor-pointer"
            >
              View new stories
            </button>
          </div>
        </div>
      )}

      {/* 3. FILTER & SEARCH CONTROLS */}
      <GlassCard className="p-3 sm:p-4 flex flex-col gap-3">
        {/* Top: 16 Curated Category Pills */}
        <div className="overflow-x-auto no-scrollbar pb-1 max-w-full">
          <div className="flex items-center gap-1.5 min-w-max">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id);
                  setFilterMode('all');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[32px] cursor-pointer ${
                  selectedCategory === c.id && filterMode === 'all'
                    ? 'bg-lime text-[#0F0B0A] shadow-sm'
                    : 'bg-slate-100 dark:bg-[#1E1E21] hover:bg-slate-200 dark:hover:bg-[#323236] text-slate-600 dark:text-[#A1A1AA] dark:hover:text-[#F5F5F5]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: Personalized Watchlist / Portfolio Filter & Search Box */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#3A3A3D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="overflow-x-auto no-scrollbar max-w-full pb-0.5">
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#1E1E21] p-1 rounded-full border border-slate-200 dark:border-[#3A3A3D] shrink-0">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 sm:px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap min-h-[30px] ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-[#28282B] text-slate-dark dark:text-[#F5F5F5] shadow-sm'
                    : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                }`}
              >
                All Stories
              </button>
              <button
                onClick={() => setFilterMode('watchlist')}
                className={`px-3 sm:px-3.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[30px] ${
                  filterMode === 'watchlist'
                    ? 'bg-amber-400 text-slate-900 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterMode === 'watchlist' ? 'fill-slate-900' : ''}`} />
                <span>Watchlist</span>
                {watchlistTickers.size > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-900/10 dark:bg-black/30 text-[10px]">
                    {watchlistTickers.size}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterMode('portfolio')}
                className={`px-3 sm:px-3.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[30px] ${
                  filterMode === 'portfolio'
                    ? 'bg-lime text-[#0F0B0A] shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Portfolio</span>
                {portfolioTickers.size > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-900/10 dark:bg-black/30 text-[10px]">
                    {portfolioTickers.size}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, topics, tickers..."
              className="w-full pl-9 pr-8 py-1.5 text-xs font-semibold bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl focus:outline-none focus:border-[#B8F500]/60 transition-all placeholder:text-slate-400 dark:placeholder:text-[#71717A] text-slate-dark dark:text-[#F5F5F5]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-[#F5F5F5] text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 4. MARKET MOVERS STRIP */}
      {marketMovers && marketMovers.length > 0 && (
        <GlassCard className="p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-dark dark:text-[#F5F5F5]">
              Market Movers in Financial Wire
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {marketMovers.map((mover) => (
              <Link
                key={mover.ticker}
                href={`/markets/${mover.ticker}`}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] hover:border-lime/50 dark:hover:border-lime/50 hover:bg-lime-50/40 dark:hover:bg-[#323236] transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] font-mono group-hover:text-lime-950 dark:group-hover:text-lime">
                    ${mover.ticker}
                  </span>
                  <Badge
                    variant={mover.sentiment === 'Bullish' ? 'lime' : mover.sentiment === 'Bearish' ? 'down' : 'neutral'}
                    size="sm"
                  >
                    {mover.sentiment}
                  </Badge>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-[#71717A] mt-1">
                  {mover.count} {mover.count === 1 ? 'headline' : 'headlines'}
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}

      {/* 5. NEWS ARTICLES FEED */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="h-96 rounded-2xl bg-slate-200 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]" />
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]" />
          </div>
        </div>
      ) : filterMode === 'watchlist' && watchlistTickers.size === 0 ? (
        /* Empty Watchlist Guidance */
        <GlassCard className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <h3 className="text-base font-bold text-slate-dark dark:text-[#F5F5F5]">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1 mb-4 max-w-sm mx-auto">
            Add stocks to your Watchlist to see personalized news tailored specifically to the companies you track.
          </p>
          <Link href="/markets">
            <GlassButton variant="lime" size="sm">
              <span>Browse Markets & Add Stocks</span>
            </GlassButton>
          </Link>
        </GlassCard>
      ) : displayedList.length > 0 ? (
        <div className="space-y-6">
          {/* 5A. FEATURED HERO ARTICLE */}
          {featuredArticle && (
            <GlassCard className="p-0 overflow-hidden border border-slate-200 dark:border-[#3A3A3D] hover:border-slate-300 dark:hover:border-[#4A4A4E] transition-all group shadow-sm dark:shadow-dark-card">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                {/* Featured Large Thumbnail */}
                <div className="lg:col-span-7 p-4 sm:p-6 flex items-center justify-center bg-slate-900/5 dark:bg-[#1E1E21]/60">
                  <NewsImage
                    src={featuredArticle.image_url}
                    alt={featuredArticle.title}
                    aspectRatio="featured"
                    priority
                    className="w-full h-full min-h-[220px] sm:min-h-[280px]"
                  />
                </div>

                {/* Featured Content Details */}
                <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between">
                  <div>
                    {/* Top Metadata */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[11px] px-2.5 py-0.5 rounded-full bg-slate-dark dark:bg-[#1E1E21] text-lime border border-transparent dark:border-[#3A3A3D]">
                          {featuredArticle.source_name}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#A1A1AA]">
                          {detectCategory(featuredArticle.title, featuredArticle.summary)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 dark:text-[#71717A] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(featuredArticle.published_at)}
                        </span>
                        <Badge
                          variant={
                            featuredArticle.sentiment === 'Bullish'
                              ? 'lime'
                              : featuredArticle.sentiment === 'Bearish'
                              ? 'down'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {featuredArticle.sentiment}
                        </Badge>
                      </div>
                    </div>

                    {/* Mentioned Ticker Pills */}
                    {(() => {
                      const tickers = extractMentionedTickers(featuredArticle.title, featuredArticle.summary);
                      return tickers.length > 0 ? (
                        <div className="flex items-center gap-1.5 mb-2.5">
                          {tickers.map((t) => (
                            <Link
                              key={t}
                              href={`/markets/${t}`}
                              className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded bg-lime-50 dark:bg-lime/10 text-lime-900 dark:text-lime border border-lime-300 dark:border-lime/30 hover:bg-lime-100 dark:hover:bg-lime/20 transition-colors"
                            >
                              ${t}
                            </Link>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    {/* Headline */}
                    <a
                      href={featuredArticle.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group-hover:text-lime-900 dark:group-hover:text-lime transition-colors"
                    >
                      <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-dark dark:text-[#F5F5F5] leading-tight tracking-tight mb-3">
                        {featuredArticle.title}
                      </h2>
                    </a>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A1A1AA] leading-relaxed line-clamp-3 mb-4">
                      {(featuredArticle.summary || '').split('Why it matters:')[0]?.trim()}
                    </p>

                    {/* Educational Takeaway */}
                    {featuredArticle.summary?.includes('Why it matters:') && (
                      <div className="p-3 rounded-xl bg-lime-50/70 dark:bg-lime/10 border border-lime-200 dark:border-lime/30 mb-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-lime-950 dark:text-lime mb-0.5">
                          <Sparkles className="w-3 h-3 text-lime-900 dark:text-lime" />
                          <span>Educational Insight</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-[#F5F5F5] font-medium leading-relaxed">
                          {featuredArticle.summary.split('Why it matters:')[1]?.trim()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Read Article CTA */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 dark:text-[#71717A] font-mono">Lead Story</span>
                    <a
                      href={featuredArticle.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-dark dark:text-[#F5F5F5] hover:text-lime-900 dark:hover:text-lime transition-colors group-hover:translate-x-1 duration-150"
                    >
                      <span>Read Full Article</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 5B. SECONDARY ARTICLES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {standardArticles.map((article) => {
              const category = detectCategory(article.title, article.summary);
              const summaryParts = (article.summary || '').split('Why it matters:');
              const mainSummary = summaryParts[0]?.trim();
              const whyItMatters = summaryParts[1]?.trim();
              const tickers = extractMentionedTickers(article.title, article.summary);

              return (
                <GlassCard
                  key={article.id}
                  className="p-5 flex flex-col justify-between border border-slate-200 dark:border-[#3A3A3D] hover:border-slate-300 dark:hover:border-[#4A4A4E] transition-all group shadow-sm dark:shadow-dark-card"
                >
                  <div>
                    {/* Top Row: Thumbnail + Header info */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-3 items-start">
                      {/* Thumbnail Container */}
                      <div className="sm:col-span-5">
                        <NewsImage
                          src={article.image_url}
                          alt={article.title}
                          aspectRatio="thumbnail"
                          className="w-full"
                        />
                      </div>

                      {/* Header & Badges */}
                      <div className="sm:col-span-7 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs gap-1.5 flex-wrap mb-1.5">
                          <span className="font-bold text-slate-dark dark:text-[#F5F5F5] text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D]">
                            {article.source_name}
                          </span>
                          <Badge
                            variant={
                              article.sentiment === 'Bullish'
                                ? 'lime'
                                : article.sentiment === 'Bearish'
                                ? 'down'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {article.sentiment}
                          </Badge>
                        </div>

                        {tickers.length > 0 && (
                          <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                            {tickers.map((t) => (
                              <Link
                                key={t}
                                href={`/markets/${t}`}
                                className="text-[9px] font-extrabold font-mono px-1.5 py-0.2 rounded bg-lime-50 dark:bg-lime/10 text-lime-900 dark:text-lime border border-lime-300 dark:border-lime/30 hover:bg-lime-100 dark:hover:bg-lime/20 transition-colors"
                              >
                                ${t}
                              </Link>
                            ))}
                          </div>
                        )}

                        <div className="text-[10px] font-mono text-slate-400 dark:text-[#71717A] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(article.published_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Article Headline */}
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group-hover:text-lime-900 dark:group-hover:text-lime transition-colors"
                    >
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-dark dark:text-[#F5F5F5] leading-snug tracking-tight mb-2">
                        {article.title}
                      </h3>
                    </a>

                    {/* Excerpt */}
                    {mainSummary && (
                      <p className="text-xs text-slate-600 dark:text-[#A1A1AA] line-clamp-2 leading-relaxed mb-3">
                        {mainSummary}
                      </p>
                    )}

                    {/* Educational "Why It Matters" Callout */}
                    {whyItMatters && (
                      <div className="p-2.5 rounded-xl bg-lime-50/60 dark:bg-lime/10 border border-lime-200/80 dark:border-lime/30 mb-2">
                        <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-lime-950 dark:text-lime mb-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-lime-900 dark:text-lime" />
                          <span>Educational Insight</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-[#F5F5F5] font-medium leading-relaxed">
                          {whyItMatters}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 dark:text-[#71717A] uppercase font-bold tracking-wider">
                      {category}
                    </span>
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-xs text-slate-dark dark:text-[#F5F5F5] hover:text-lime-900 dark:hover:text-lime transition-colors group-hover:translate-x-0.5 duration-150"
                    >
                      <span>Read Story</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* 5C. LOAD MORE ARTICLES BUTTON */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={() => loadMore()}
                disabled={isFetching}
                className="px-6 py-3 rounded-2xl bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-[#323236] shadow-sm transition-all cursor-pointer flex items-center gap-2.5 disabled:opacity-50"
              >
                <span>{isFetching ? 'Loading stories...' : 'Load More Financial News'}</span>
                <PlusCircle className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <GlassCard className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1E1E21] text-slate-400 dark:text-[#71717A] flex items-center justify-center mx-auto mb-3">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-dark dark:text-[#F5F5F5]">No Articles Found</h3>
          <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1 mb-4 max-w-sm mx-auto">
            {filterMode === 'portfolio'
              ? 'No recent stories matched instruments in your portfolio. Try viewing All News.'
              : filterMode === 'watchlist'
              ? 'No recent stories matched instruments in your watchlist. Try viewing All News.'
              : 'Try searching for a different keyword or resetting your category filters.'}
          </p>
          <GlassButton
            variant="lime"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setFilterMode('all');
            }}
          >
            Reset Filters
          </GlassButton>
        </GlassCard>
      )}
    </div>
  );
}
