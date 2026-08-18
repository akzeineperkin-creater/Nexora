'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, BarChart3 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export function NexraHero() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandLetters = ['N', 'e', 'x', 'r', 'a'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const letterVariants = {
    hidden: { y: '110%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const rightContentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        delay: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="w-screen h-screen min-h-screen max-h-screen overflow-hidden bg-[#050807] text-[#F5F5F5] selection:bg-lime/30 selection:text-white p-2.5 sm:p-4 md:p-5 lg:p-6 flex flex-col justify-between box-border">
      {/* ========================================================================= */}
      {/* 1. ROUNDED FULL-SCREEN CINEMATIC CONTAINER */}
      {/* ========================================================================= */}
      <div className="relative w-full h-full flex-1 flex flex-col justify-between rounded-[22px] sm:rounded-[32px] md:rounded-[42px] overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-[#0B1510] via-[#070E0A] to-[#050807]">
        {/* ========================================================================= */}
        {/* 2. ELEGANT ABSTRACT BACKGROUND (Soft lights, gradients & subtle grain) */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[55vh] bg-[radial-gradient(ellipse_at_center,rgba(184,245,0,0.07)_0%,rgba(16,185,129,0.04)_40%,transparent_70%)] blur-[100px]" />
          <div className="absolute -bottom-[25%] -right-[10%] w-[50vw] h-[50vh] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[45vw] h-[45vh] bg-[radial-gradient(ellipse_at_center,rgba(184,245,0,0.05)_0%,transparent_70%)] blur-[100px]" />

          {/* Deep Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(5,8,7,0.85)_100%)]" />

          {/* Minimal Film Grain Texture */}
          <div
            className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* ========================================================================= */}
        {/* 3. FLOATING BLACK NAVBAR (Top Notch / Pill Layout from Prisma) */}
        {/* ========================================================================= */}
        <motion.header
          variants={navVariants}
          initial="hidden"
          animate="visible"
          className="relative z-30 w-full pt-0 flex items-center justify-between px-4 sm:px-6 md:px-8"
        >
          {/* Top Notch Floating Navigation Pill (Centered on Desktop) */}
          <div className="w-full flex items-center justify-between sm:justify-center relative">
            {/* Nexra Mobile / Left Logo */}
            <Link
              href="/"
              className="sm:absolute sm:left-0 flex items-center gap-2 group select-none py-3"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/20 group-hover:border-lime/60 transition-colors shrink-0 shadow-md">
                <Image
                  src="/logo.png"
                  alt="Nexra"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span className="font-display font-black text-base sm:text-lg text-white tracking-tight group-hover:text-lime transition-colors">
                Nexra
              </span>
            </Link>

            {/* Centered Prisma-Style Floating Black Pill Tab */}
            <div className="hidden sm:flex items-center gap-7 px-8 py-3 rounded-b-2xl bg-[#090D0B]/85 backdrop-blur-xl border-x border-b border-white/10 shadow-2xl text-xs font-semibold text-zinc-300">
              <Link
                href="/markets"
                className="hover:text-white hover:text-lime transition-colors"
              >
                Markets
              </Link>
              <Link
                href="/academy"
                className="hover:text-white hover:text-lime transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/academy"
                className="hover:text-white hover:text-lime transition-colors"
              >
                Learn
              </Link>
              <Link
                href="/markets"
                className="hover:text-white hover:text-lime transition-colors"
              >
                About
              </Link>
            </div>

            {/* Right CTAs */}
            <div className="sm:absolute sm:right-0 hidden sm:flex items-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs hover:bg-lime-hover transition-all shadow-lime flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs hover:bg-lime-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lime flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Start Trading</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-full bg-black/60 border border-white/15 text-zinc-200 hover:text-white focus:outline-none backdrop-blur-md"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </motion.header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sm:hidden absolute top-16 left-4 right-4 z-40 bg-[#07110C]/95 backdrop-blur-2xl rounded-2xl border border-white/15 p-5 flex flex-col gap-3 shadow-2xl"
            >
              <Link
                href="/markets"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1"
              >
                Markets
              </Link>
              <Link
                href="/academy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1"
              >
                How It Works
              </Link>
              <Link
                href="/academy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1"
              >
                Learn
              </Link>
              <Link
                href="/markets"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1"
              >
                About
              </Link>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs text-center shadow-lime"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2 rounded-full bg-white/5 border border-white/10 text-center text-xs font-bold text-white"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs text-center shadow-lime"
                    >
                      Start Trading
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Center Space */}
        <div className="flex-1 min-h-[40px] sm:min-h-[80px]" />

        {/* ========================================================================= */}
        {/* 4. ASYMMETRIC PRISMA HERO BOTTOM COMPOSITION */}
        {/* ========================================================================= */}
        <div className="relative z-20 w-full p-4 sm:p-6 md:p-8 lg:p-12 pb-4 sm:pb-6 md:pb-8 lg:pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 lg:gap-14">
            {/* LEFT / BOTTOM: Giant Oversized "Nexra*" Typography */}
            <div className="overflow-hidden select-none shrink-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex items-baseline"
              >
                {brandLetters.map((letter, idx) => (
                  <div key={idx} className="overflow-hidden inline-block">
                    <motion.span
                      variants={letterVariants}
                      className="inline-block font-display font-black text-[22vw] sm:text-[19vw] md:text-[16vw] lg:text-[14.5vw] tracking-[-0.045em] leading-[0.84] text-white drop-shadow-md"
                    >
                      {letter}
                    </motion.span>
                  </div>
                ))}
                {/* Asterisk from PrismaHero */}
                <div className="overflow-hidden inline-block">
                  <motion.span
                    variants={letterVariants}
                    className="inline-block font-display font-black text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] text-lime leading-none ml-1 -translate-y-4 sm:-translate-y-6 md:-translate-y-8"
                  >
                    *
                  </motion.span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT / BOTTOM: Editorial Message & Rounded CTA Button */}
            <motion.div
              variants={rightContentVariants}
              initial="hidden"
              animate="visible"
              className="max-w-lg lg:max-w-md xl:max-w-lg flex flex-col justify-end space-y-3.5 sm:space-y-4 lg:pb-2"
            >
              {/* Tagline */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span className="font-extrabold text-xs sm:text-sm uppercase tracking-widest text-lime">
                  Learn. Trade. Grow.
                </span>
              </div>

              {/* Main Short Description */}
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
                Nexra is an investment simulator that helps you learn how financial markets work through real market data and virtual money.
              </p>

              {/* Strong Statement */}
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 leading-snug">
                Trade without risk. Build your strategy. Understand the market.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs sm:text-sm hover:bg-lime-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lime flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Start Trading</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/markets"
                  className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm hover:border-white/30 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <span>Explore Markets</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
