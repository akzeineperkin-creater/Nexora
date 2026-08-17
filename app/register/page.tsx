'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthSwitch } from '@/components/ui/auth-switch';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/providers/AuthProvider';
import {
  ShieldCheck,
  TrendingUp,
  Activity,
  Award,
  Layers,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-app antialiased relative flex flex-col justify-center">
      {/* Floating Theme Toggle in Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT SIDE: NEXRA BRAND HERO & SUBTLE FINANCIAL DECORATION */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-8 pr-0 lg:pr-6">
            {/* NEXRA BRAND LOGO */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-md shrink-0 border border-slate-800 dark:border-[#3A3A3D]">
                <Image
                  src="/logo.png"
                  alt="Nexra Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl text-slate-900 dark:text-[#F5F5F5] tracking-tight">
                  NEXRA
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-[#71717A] lowercase tracking-tight">
                  invest. grow. repeat.
                </span>
              </div>
            </div>

            {/* HEADLINE & DESCRIPTION */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-[#F5F5F5] tracking-tight leading-[1.15]">
                Learn to invest. <br />
                <span className="inline-block bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                  Build your future.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#A1A1AA] leading-relaxed max-w-lg font-normal">
                Master equities, ETFs, and market dynamics with risk-free simulated capital. Analyze live price action, test strategies, and build confidence before risking real money.
              </p>
            </div>

            {/* SUBTLE FINANCIAL / CHART DECORATION CARD */}
            <div className="bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-card p-5 shadow-card dark:shadow-dark-card max-w-lg relative overflow-hidden">
              {/* Top Card Metrics */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#3A3A3D]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#B8F500] ring-4 ring-[#B8F500]/20" />
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F5F5F5] uppercase tracking-wider">
                    Institutional Simulation Sandbox
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-[#A1A1AA] bg-slate-100 dark:bg-[#1E1E21] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#3A3A3D]">
                  Live Exchange Feeds
                </span>
              </div>

              {/* Minimalist SVG Chart Line Decoration */}
              <div className="py-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-slate-500 dark:text-[#A1A1AA] font-medium">Starting Sandbox Capital</span>
                  <span className="text-base font-extrabold font-mono text-slate-950 dark:text-[#F5F5F5]">$10,000.00</span>
                </div>
                <div className="relative h-14 w-full flex items-end">
                  <svg
                    viewBox="0 0 400 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGradientReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B8F500" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#B8F500" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 50 Q 50 42, 100 45 T 200 28 T 300 20 T 400 8 L 400 60 L 0 60 Z"
                      fill="url(#chartGradientReg)"
                    />
                    <path
                      d="M0 50 Q 50 42, 100 45 T 200 28 T 300 20 T 400 8"
                      stroke="#B8F500"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="400" cy="8" r="4" fill="#0F0B0A" stroke="#B8F500" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-[#3A3A3D] text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-100 dark:border-[#3A3A3D]">
                  <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-semibold uppercase">Risk</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-[#F5F5F5] mt-0.5">Zero ($0)</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-100 dark:border-[#3A3A3D]">
                  <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-semibold uppercase">Execution</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-[#F5F5F5] mt-0.5">Real-Time</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-100 dark:border-[#3A3A3D]">
                  <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-semibold uppercase">Curriculum</div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-[#F5F5F5] mt-0.5">10+ Modules</div>
                </div>
              </div>
            </div>

            {/* TRUST & SECURITY BADGES */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-[#71717A]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-[#A1A1AA]" />
                <span>Supabase PostgreSQL Security</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-700 dark:text-[#A1A1AA]" />
                <span>SSL Encrypted</span>
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: AUTH SWITCH CARD */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <AuthSwitch initialMode="signup" />
          </div>
        </div>
      </div>
    </div>
  );
}
