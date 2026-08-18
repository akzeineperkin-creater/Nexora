'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Wallet,
    title: 'Claim $10,000 Virtual Capital',
    description:
      'Create your free account instantly with zero paperwork. You are immediately credited with a $10,000.00 isolated virtual balance to practice equity investing.',
    highlight: 'No Credit Card • Instant Setup',
  },
  {
    step: '02',
    icon: TrendingUp,
    title: 'Execute Real Market Trades',
    description:
      'Explore live stock feeds from the NYSE and NASDAQ. Practice order execution, watch volume profiles, build diversified portfolios, and test technical strategies.',
    highlight: 'Real-Time Price Feeds • Live Orders',
  },
  {
    step: '03',
    icon: Award,
    title: 'Master Skills & Compete in Arenas',
    description:
      'Advance through our 15-Level Academy curriculum, join equal-capital trading tournaments, and climb the live performance return leaderboards.',
    highlight: 'Gamified XP • Global Leaderboards',
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#07110C] relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-lime mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frictionless 3-Step Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 font-display">
            How Nexra Works
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Everything you need to master equity investing, risk management, and market mechanics without endangering a single penny of your hard-earned savings.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#1E1E21]/80 rounded-3xl border border-[#3A3A3D] p-6 sm:p-8 flex flex-col justify-between hover:border-lime/60 hover:bg-[#28282B] transition-all duration-300 group shadow-xl relative overflow-hidden"
              >
                {/* Step watermarked number */}
                <div className="absolute top-4 right-6 text-5xl font-black font-mono text-white/5 group-hover:text-lime/10 transition-colors pointer-events-none select-none">
                  {s.step}
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-lime/10 border border-lime/20 text-lime flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-lime group-hover:text-[#0F0B0A] transition-all">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-3 font-display">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono font-bold text-lime">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{s.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
