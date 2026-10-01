'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function LandingNavbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050807]/85 backdrop-blur-xl border-b border-[#3A3A3D]/50 shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Nexra Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-md border border-slate-800 dark:border-[#3A3A3D] group-hover:border-lime/60 transition-colors shrink-0">
            <Image
              src="/logo.png"
              alt="Nexra Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl text-white tracking-tight group-hover:text-lime transition-colors">
              Nexra
            </span>
            <span className="text-[10px] font-bold text-zinc-400 lowercase tracking-wider -mt-1">
              {t('nav.brandSlogan')}
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-300">
          <Link
            href="/markets"
            className="hover:text-white transition-colors hover:text-lime"
          >
            {t('nav.markets')}
          </Link>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors hover:text-lime"
          >
            {t('nav.howItWorks')}
          </a>
          <Link
            href="/academy"
            className="hover:text-white transition-colors hover:text-lime"
          >
            {t('nav.learn')}
          </Link>
          <a
            href="#about"
            className="hover:text-white transition-colors hover:text-lime"
          >
            {t('nav.about')}
          </a>
        </nav>

        {/* Right: Language Switcher & Auth CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <LanguageSwitcher variant="dropdown" />

          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 rounded-xl bg-lime text-[#0F0B0A] font-extrabold text-xs hover:bg-lime-300 transition-all shadow-lime flex items-center gap-1.5"
            >
              <span>{t('nav.goToDashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                {t('nav.logIn')}
              </Link>
              <Link
                href="/register"
                className="px-4 sm:px-5 py-2 rounded-xl bg-lime text-[#0F0B0A] font-extrabold text-xs hover:bg-lime-300 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lime flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('nav.startTrading')}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07110C]/95 backdrop-blur-2xl border-b border-[#3A3A3D] px-4 pt-4 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/markets"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-zinc-200 hover:text-lime py-2"
          >
            {t('nav.markets')}
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-zinc-200 hover:text-lime py-2"
          >
            {t('nav.howItWorks')}
          </a>
          <Link
            href="/academy"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-zinc-200 hover:text-lime py-2"
          >
            {t('nav.learn')}
          </Link>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-zinc-200 hover:text-lime py-2"
          >
            {t('nav.about')}
          </a>

          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-zinc-400 font-bold mb-2">{t('nav.language')}</div>
            <LanguageSwitcher variant="menu" />
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-lime text-[#0F0B0A] font-extrabold text-xs text-center shadow-lime"
              >
                {t('nav.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-bold text-white hover:bg-white/10"
                >
                  {t('nav.logIn')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-lime text-[#0F0B0A] font-extrabold text-xs text-center shadow-lime"
                >
                  {t('nav.startTrading')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
