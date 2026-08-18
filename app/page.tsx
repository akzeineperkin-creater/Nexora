'use client';

import React from 'react';
import { NexraHero } from '@/components/ui/prisma-hero';
import { TickerMarquee } from '@/components/landing/TickerMarquee';
import { LandingSimulatorDemo } from '@/components/landing/LandingSimulatorDemo';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050807] text-[#F5F5F5] selection:bg-lime/30 selection:text-white antialiased overflow-x-hidden flex flex-col justify-between">
      {/* 1. Cinematic Nexra Hero (Redesigned with Prisma-style visual foundation, video background, and massive typography) */}
      <main className="flex-1 w-full">
        <NexraHero />

        {/* 2. Live Equities Ticker Ribbon */}
        <TickerMarquee />

        {/* 3. Interactive Simulator Preview Terminal */}
        <LandingSimulatorDemo />

        {/* 4. How It Works (3-Step Roadmap) */}
        <LandingHowItWorks />

        {/* 5. Feature Toolkit & Capabilities */}
        <LandingFeatures />

        {/* 6. Conversion CTA Banner */}
        <LandingCTA />
      </main>

      {/* 7. Minimalist Footer */}
      <LandingFooter />
    </div>
  );
}
