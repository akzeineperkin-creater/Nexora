'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { MarketHero } from '@/components/landing/MarketHero';
import { TickerMarquee } from '@/components/landing/TickerMarquee';
import { LandingSimulatorDemo } from '@/components/landing/LandingSimulatorDemo';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050807] text-[#F5F5F5] selection:bg-lime/30 selection:text-white antialiased overflow-x-hidden flex flex-col justify-between">
      {/* 1. Transparent Glass Navbar */}
      <LandingNavbar />

      {/* 2. Main Full-Screen Hero with Dynamic Stock Market Canvas Animation */}
      <main className="flex-1 w-full">
        <MarketHero />

        {/* 3. Live Equities Ticker Marquee Ribbon */}
        <TickerMarquee />

        {/* 4. Interactive Simulator Preview Terminal */}
        <LandingSimulatorDemo />

        {/* 5. How It Works (3-Step Roadmap) */}
        <LandingHowItWorks />

        {/* 6. Feature Toolkit & Capabilities */}
        <LandingFeatures />

        {/* 7. Conversion CTA Banner */}
        <LandingCTA />
      </main>

      {/* 8. Minimalist Footer */}
      <LandingFooter />
    </div>
  );
}
