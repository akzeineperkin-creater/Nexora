'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  Shield,
  GraduationCap,
  Trophy,
  PieChart,
  Newspaper,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Activity,
    title: 'Live Exchange Market Data',
    description:
      'Practice with authentic, real-time prices across US equities and ETFs. Experience genuine market volatility, bid/ask spreads, and daily percentage shifts.',
  },
  {
    icon: Shield,
    title: 'Risk-Free Virtual Sandbox',
    description:
      'Trade with $10,000 in simulated capital. Make mistakes, learn position sizing, test swing-trading theses, and build confidence with zero risk.',
  },
  {
    icon: GraduationCap,
    title: '15-Level Trader Academy',
    description:
      'Structured financial modules covering everything from P/E ratios and balance sheets to technical indicators, macro economics, and portfolio diversification.',
  },
  {
    icon: Trophy,
    title: 'Equal-Capital Arena Tournaments',
    description:
      'Compete in trading challenges where every participant begins with an equal bankroll. Win placements and earn exclusive XP badges.',
  },
  {
    icon: PieChart,
    title: 'Institutional Portfolio Analytics',
    description:
      'Track your return on investment, realized gains, asset allocation donut charts, win rates, and compare your alpha against the S&P 500 benchmark.',
  },
  {
    icon: Newspaper,
    title: 'Curated Financial Intelligence',
    description:
      'Stay ahead of market-moving catalysts with real-time news headlines, earnings calendars, and macro event tracking tailored to your watchlist.',
  },
];

export function LandingFeatures() {
  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#050807] relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-lime mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Built for Modern Learners</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 font-display">
            A Complete Trading Toolkit
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Engineered with the speed and precision of an institutional workstation, designed with the intuitive simplicity of modern fintech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-[#1E1E21]/60 border border-[#3A3A3D]/70 hover:border-lime/60 hover:bg-[#28282B] transition-all duration-300 group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center mb-5 group-hover:bg-lime group-hover:text-[#0F0B0A] transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2.5 font-display group-hover:text-lime transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
