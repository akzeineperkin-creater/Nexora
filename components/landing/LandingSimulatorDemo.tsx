'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  DollarSign,
  Lock,
} from 'lucide-react';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { formatCurrency } from '@/lib/utils';

export function LandingSimulatorDemo() {
  const [selectedStock, setSelectedStock] = useState('NVDA');
  const [shares, setShares] = useState(5);
  const [orderExecuted, setOrderExecuted] = useState(false);

  const stockPrices: Record<string, { price: number; change: string; name: string }> = {
    NVDA: { price: 184.72, change: '+4.71%', name: 'NVIDIA Corporation' },
    AAPL: { price: 306.14, change: '+2.84%', name: 'Apple Inc.' },
    TSLA: { price: 341.27, change: '+3.26%', name: 'Tesla Inc.' },
    MSFT: { price: 448.90, change: '+1.92%', name: 'Microsoft Corporation' },
  };

  const current = stockPrices[selectedStock] || stockPrices['NVDA'];
  const totalValue = (shares * current.price).toFixed(2);

  const handleSimulateTrade = () => {
    setOrderExecuted(true);
    setTimeout(() => setOrderExecuted(false), 3500);
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#050807] relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-lime mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Simulator Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 font-display">
            Real Market Data. <br />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-lime bg-clip-text text-transparent">
              Zero Financial Risk.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Execute real-time simulated market orders against live equity prices. Practice position sizing, risk management, and test swing strategies before risking real capital.
          </p>
        </div>

        {/* Mockup Terminal Box */}
        <div className="bg-[#1E1E21]/90 rounded-3xl border border-[#3A3A3D] p-5 sm:p-8 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto">
          {/* Top Terminal Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3A3A3D]/70">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400 ml-2">
                NEXRA SIMULATION ENGINE v2.4
              </span>
            </div>

            {/* Quick Stock Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {Object.keys(stockPrices).map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => setSelectedStock(ticker)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    selectedStock === ticker
                      ? 'bg-lime text-[#0F0B0A] shadow-sm'
                      : 'bg-[#28282B] text-zinc-300 hover:bg-[#323236]'
                  }`}
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Left Col: Stock Chart & Live Price */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo ticker={selectedStock} name={current.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-white font-display">
                          {current.name}
                        </h3>
                        <span className="text-xs font-bold font-mono text-lime px-2 py-0.5 rounded-md bg-lime/10 border border-lime/20">
                          {selectedStock}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">NASDAQ • Real-Time Stream</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-2xl font-black text-white">
                      ${current.price.toFixed(2)}
                    </div>
                    <div className="text-xs font-bold text-lime flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{current.change} Today</span>
                    </div>
                  </div>
                </div>

                {/* SVG Live Simulation Chart */}
                <div className="h-44 sm:h-52 w-full bg-[#0F0B0A]/70 rounded-2xl border border-[#3A3A3D]/60 p-4 flex flex-col justify-between relative overflow-hidden mt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>52W Low: ${(current.price * 0.72).toFixed(2)}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                      <span className="text-zinc-300 font-bold">LIVE FEED</span>
                    </div>
                    <span>52W High: ${(current.price * 1.28).toFixed(2)}</span>
                  </div>

                  {/* Dynamic SVG Waveform */}
                  <div className="relative h-28 w-full flex items-end">
                    <svg
                      viewBox="0 0 500 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#B8F500" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#B8F500" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 80 Q 80 50, 150 65 T 300 35 T 420 20 T 500 8 L 500 100 L 0 100 Z"
                        fill="url(#demoGrad)"
                      />
                      <path
                        d="M0 80 Q 80 50, 150 65 T 300 35 T 420 20 T 500 8"
                        stroke="#B8F500"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="500" cy="8" r="5" fill="#050807" stroke="#B8F500" strokeWidth="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Volume: 28.4M</span>
                    <span>Execution: ~12ms</span>
                    <span>Spread: $0.01</span>
                  </div>
                </div>
              </div>

              {/* Simulation Sandbox Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#28282B] border border-[#3A3A3D] text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Virtual Balance</span>
                  <span className="font-mono font-extrabold text-sm text-white">$10,000.00</span>
                </div>
                <div className="p-3 rounded-xl bg-[#28282B] border border-[#3A3A3D] text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Risk Exposure</span>
                  <span className="font-mono font-extrabold text-sm text-lime">$0.00</span>
                </div>
                <div className="p-3 rounded-xl bg-[#28282B] border border-[#3A3A3D] text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Exchange Feed</span>
                  <span className="font-mono font-extrabold text-sm text-white">Live Real-Time</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Simulated Order Panel */}
            <div className="lg:col-span-5 bg-[#28282B] rounded-2xl border border-[#3A3A3D] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#3A3A3D]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Simulate Market Order
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-lime px-2 py-0.5 rounded-full bg-lime/10">
                    Zero Risk Paper Trading
                  </span>
                </div>

                {/* Shares Stepper */}
                <div className="my-5">
                  <label className="text-xs font-bold text-zinc-300 block mb-2">
                    Quantity (Shares)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShares((s) => Math.max(1, s - 1))}
                      className="w-10 h-10 rounded-xl bg-[#1E1E21] border border-[#3A3A3D] text-white font-bold hover:bg-[#323236] transition-colors cursor-pointer text-base"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={shares}
                      onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 h-10 text-center font-mono font-black text-white bg-[#1E1E21] border border-[#3A3A3D] rounded-xl focus:outline-none focus:border-lime"
                    />
                    <button
                      onClick={() => setShares((s) => s + 1)}
                      className="w-10 h-10 rounded-xl bg-[#1E1E21] border border-[#3A3A3D] text-white font-bold hover:bg-[#323236] transition-colors cursor-pointer text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Order Summary Calculation */}
                <div className="space-y-2 p-3 rounded-xl bg-[#1E1E21] border border-[#3A3A3D] text-xs font-mono mb-5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Share Price:</span>
                    <span className="text-white font-bold">${current.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Virtual Starting Cash:</span>
                    <span className="text-white font-bold">$10,000.00</span>
                  </div>
                  <div className="pt-2 border-t border-[#3A3A3D] flex justify-between font-extrabold text-sm">
                    <span className="text-white">Simulated Total:</span>
                    <span className="text-lime">${totalValue}</span>
                  </div>
                </div>

                {/* Feedback Message */}
                {orderExecuted && (
                  <div className="mb-4 p-3 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Simulated Order Executed: {shares} {selectedStock} @ ${current.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleSimulateTrade}
                  className="w-full py-3.5 rounded-xl bg-lime text-[#0F0B0A] font-extrabold text-xs uppercase tracking-wider hover:bg-lime-300 active:scale-[0.98] transition-all shadow-lime cursor-pointer"
                >
                  Simulate Buy {shares} {selectedStock} (${totalValue})
                </button>

                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Open Full Sandbox Trading Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
