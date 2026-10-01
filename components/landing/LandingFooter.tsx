'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#050807] border-t border-[#3A3A3D]/70 py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[#3A3A3D]">
            <Image
              src="/logo.png"
              alt="Nexra"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-display font-black text-sm text-white tracking-tight">
              Nexra
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Learn. Trade. Grow. • Educational Investment Simulator
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 font-semibold flex-wrap justify-center">
          <Link href="/markets" className="hover:text-white transition-colors">
            Markets
          </Link>
          <Link href="/academy" className="hover:text-white transition-colors">
            Academy
          </Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link href="/login" className="hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/register" className="hover:text-white transition-colors">
            Register
          </Link>
        </div>
      </div>

      {/* Legal & Educational Disclaimer */}
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-[10px] text-zinc-500 text-center leading-relaxed">
        <p>
          Disclaimer: Nexra is strictly an educational investment simulator. All trades, portfolios, and capital balances displayed are entirely virtual ($0 real-money value). No real brokerage transactions occur. Real-time market data is provided for educational demonstration purposes only.
        </p>
        <p className="mt-2 text-zinc-600">
          © {new Date().getFullYear()} Nexra Technologies. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
