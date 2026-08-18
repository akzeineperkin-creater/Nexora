'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export interface NexraHeroProps {
  videoSrc?: string;
  posterSrc?: string;
}

export function NexraHero({
  videoSrc = 'https://assets.mixkit.co/videos/preview/mixkit-financial-district-at-night-with-car-traffic-43405-large.mp4',
  posterSrc,
}: NexraHeroProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: muted video autoplay
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  const brandLetters = 'Nexra'.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.25,
      },
    },
  };

  const letterVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const contentFadeVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#050807] text-[#F5F5F5] selection:bg-lime/30 selection:text-white p-3 sm:p-5 md:p-6 lg:p-8">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO CONTAINER WITH ROUNDED CORNERS */}
      {/* ========================================================================= */}
      <div className="relative w-full flex-1 flex flex-col justify-between rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl min-h-[90vh] sm:min-h-[92vh]">
        {/* ========================================================================= */}
        {/* 2. FULLSCREEN BACKGROUND VIDEO & CINEMATIC GRADIENT OVERLAYS */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          {/* Ambient Video */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-85' : 'opacity-40'
            }`}
          >
            <source src={videoSrc} type="video/mp4" />
            {/* Fallback secondary high-tech market stream */}
            <source
              src="https://cdn.pixabay.com/video/2020/05/25/40149-425175496_large.mp4"
              type="video/mp4"
            />
          </video>

          {/* Deep Cinematic Overlay: Top subtle gradient for Navbar */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050807]/80 via-transparent to-transparent z-[1]" />

          {/* Deep Cinematic Overlay: Bottom heavy vignette for typography & CTA contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-[#050807]/75 to-transparent z-[2]" />

          {/* Radial Center Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(5,8,7,0.75)_100%)] z-[3]" />

          {/* Subtle Noise Texture Overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none z-[4] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* ========================================================================= */}
        {/* 3. MINIMAL FLOATING TOP NAVBAR */}
        {/* ========================================================================= */}
        <header className="relative z-30 w-full p-4 sm:p-6 md:p-8 flex items-center justify-between">
          {/* Left: Nexra Brand Mark */}
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/20 group-hover:border-lime/60 transition-colors shrink-0 shadow-lg">
              <Image
                src="/logo.png"
                alt="Nexra"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-display font-black text-lg sm:text-xl text-white tracking-tight group-hover:text-lime transition-colors">
              Nexra
            </span>
          </Link>

          {/* Center: Floating Navigation Pill (Inspired by Prisma Pill Navbar) */}
          <nav className="hidden md:flex items-center gap-7 px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-semibold text-zinc-300">
            <Link
              href="/markets"
              className="hover:text-white hover:text-lime transition-colors"
            >
              Markets
            </Link>
            <a
              href="#how-it-works"
              className="hover:text-white hover:text-lime transition-colors"
            >
              How It Works
            </a>
            <Link
              href="/academy"
              className="hover:text-white hover:text-lime transition-colors"
            >
              Learn
            </Link>
            <a
              href="#about"
              className="hover:text-white hover:text-lime transition-colors"
            >
              About
            </a>
          </nav>

          {/* Right: Auth Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs hover:bg-lime-hover transition-all shadow-lime flex items-center gap-1.5 cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs hover:bg-lime-hover hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lime flex items-center gap-1.5 cursor-pointer"
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
            className="md:hidden p-2.5 rounded-full bg-black/50 border border-white/15 text-zinc-200 hover:text-white focus:outline-none backdrop-blur-md"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-20 left-4 right-4 z-40 bg-[#07110C]/95 backdrop-blur-2xl rounded-2xl border border-white/15 p-5 flex flex-col gap-3 shadow-2xl"
            >
              <Link
                href="/markets"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1.5"
              >
                Markets
              </Link>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1.5"
              >
                How It Works
              </a>
              <Link
                href="/academy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1.5"
              >
                Learn
              </Link>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-zinc-200 hover:text-lime py-1.5"
              >
                About
              </a>

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
                      className="w-full py-2.5 rounded-full bg-white/5 border border-white/10 text-center text-xs font-bold text-white"
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

        {/* Center / Ambient Empty Space for Cinematic Video Visual */}
        <div className="flex-1 min-h-[100px] sm:min-h-[160px] md:min-h-[220px]" />

        {/* ========================================================================= */}
        {/* 4. BOTTOM HERO COMPOSITION: MASSIVE TYPOGRAPHY & EDITORIAL CONTENT */}
        {/* ========================================================================= */}
        <div className="relative z-20 w-full p-4 sm:p-6 md:p-8 lg:p-10 pb-6 sm:pb-8 md:pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 lg:gap-12">
            {/* Left: Massive Nexra Brand Display Typography (Pull Up Animation) */}
            <div className="overflow-hidden select-none">
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
                      className="inline-block font-display font-black text-[22vw] sm:text-[19vw] md:text-[16vw] lg:text-[14vw] tracking-[-0.04em] leading-[0.88] text-white"
                    >
                      {letter}
                    </motion.span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Editorial Message, Description & Interactive CTAs */}
            <motion.div
              variants={contentFadeVariants}
              initial="hidden"
              animate="visible"
              className="max-w-xl flex flex-col justify-end space-y-4 sm:space-y-5 lg:pb-3"
            >
              {/* Tagline Badge */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span className="font-extrabold text-xs sm:text-sm uppercase tracking-widest text-lime">
                  Learn. Trade. Grow.
                </span>
              </div>

              {/* Main Product Description */}
              <p className="text-sm sm:text-base md:text-lg text-zinc-200 leading-relaxed font-normal">
                Nexra is an investment simulator that helps you learn how financial markets work through real market data and virtual money.
              </p>

              {/* Supporting Statement */}
              <p className="text-xs sm:text-sm font-semibold text-zinc-400">
                Trade without risk. Build your strategy. Understand the market.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/register"
                  className="px-7 py-3.5 rounded-full bg-lime text-[#0F0B0A] font-extrabold text-xs sm:text-sm hover:bg-lime-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lime flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Start Trading</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/markets"
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm hover:border-white/30 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <span>Explore Markets</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
