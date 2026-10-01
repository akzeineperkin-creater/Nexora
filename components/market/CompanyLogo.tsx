'use client';

import React, { useState } from 'react';

interface CompanyLogoProps {
  ticker?: string;
  name?: string;
  domain?: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Known company domain mappings for fallback
const KNOWN_DOMAINS: Record<string, string> = {
  AAPL: 'apple.com',
  NVDA: 'nvidia.com',
  MSFT: 'microsoft.com',
  AMZN: 'amazon.com',
  GOOGL: 'google.com',
  GOOG: 'google.com',
  META: 'meta.com',
  TSLA: 'tesla.com',
  JPM: 'jpmorganchase.com',
  V: 'visa.com',
  WMT: 'walmart.com',
  LLY: 'lilly.com',
  AMD: 'amd.com',
  NFLX: 'netflix.com',
  SPY: 'ssga.com',
  QQQ: 'invesco.com',
  DIA: 'ssga.com',
  INTC: 'intel.com',
  COST: 'costco.com',
  AVGO: 'broadcom.com',
  ORCL: 'oracle.com',
  CRM: 'salesforce.com',
  DIS: 'disney.com',
  BAC: 'bankofamerica.com',
  KO: 'coca-cola.com',
  PEP: 'pepsico.com',
  NKE: 'nike.com',
  BA: 'boeing.com',
  UBER: 'uber.com',
  ABNB: 'airbnb.com',
  PLTR: 'palantir.com',
  // Kazakh Market Leaders
  KSPI: 'kaspi.kz',
  KAP: 'kazatomprom.kz',
  KMGZ: 'kmg.kz',
  HSBK: 'halykbank.kz',
  KEGC: 'kegoc.kz',
  AIRA: 'airastana.com',
  KZTK: 'telecom.kz',
  ASBN: 'fortebank.com',
  CCBN: 'bcc.kz',
  // Global Oil & Energy Leaders
  XOM: 'corporate.exxonmobil.com',
  CVX: 'chevron.com',
  COP: 'conocophillips.com',
  SHEL: 'shell.com',
  BP: 'bp.com',
  TTE: 'totalenergies.com',
  OXY: 'oxy.com',
  EOG: 'eogresources.com',
  SLB: 'slb.com',
  CNQ: 'cnrl.com',
  EQNR: 'equinor.com',
  FANG: 'diamondbackenergy.com',
  MPC: 'marathonpetroleum.com',
  VLO: 'valero.com',
  PSX: 'phillips66.com',
  HAL: 'halliburton.com',
  BKR: 'bakerhughes.com',
  WMB: 'williams.com',
  KMI: 'kindermorgan.com',
  ET: 'energytransfer.com',
  ENB: 'enbridge.com',
  E: 'eni.com',
};

export function CompanyLogo({
  ticker = '',
  name = '',
  domain,
  logoUrl,
  size = 'md',
  className = '',
}: CompanyLogoProps) {
  const [imgErrorIndex, setImgErrorIndex] = useState(0);
  const cleanTicker = (ticker || '').toUpperCase().trim();
  const cleanDomain = domain || KNOWN_DOMAINS[cleanTicker] || `${cleanTicker.toLowerCase()}.com`;

  // Multi-tier reliable logo URLs in priority order
  const logoCandidates: string[] = [];
  if (logoUrl) logoCandidates.push(logoUrl);
  if (cleanTicker) {
    logoCandidates.push(`https://assets.parqet.com/logos/symbol/${cleanTicker}?format=png`);
  }
  if (cleanDomain) {
    logoCandidates.push(`https://logo.clearbit.com/${cleanDomain}`);
    logoCandidates.push(`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`);
  }

  const currentLogoSrc = logoCandidates[imgErrorIndex];
  const isFailed = imgErrorIndex >= logoCandidates.length || !currentLogoSrc;

  // Sizing definitions
  const sizeClasses = {
    sm: 'w-7 h-7 min-w-[28px] text-[10px] rounded-lg',
    md: 'w-9 h-9 min-w-[36px] text-xs rounded-xl',
    lg: 'w-12 h-12 min-w-[48px] text-sm rounded-2xl',
    xl: 'w-16 h-16 min-w-[64px] text-base rounded-2xl',
  };

  const imgSizes = {
    sm: 20,
    md: 26,
    lg: 36,
    xl: 48,
  };

  const initials = (cleanTicker || name || '--').slice(0, 2).toUpperCase();

  // Fallback initial badge if all logo sources fail
  if (isFailed) {
    return (
      <div
        className={`${sizeClasses[size]} bg-slate-100 dark:bg-[#323236] border border-slate-200/90 dark:border-[#3A3A3D] text-slate-700 dark:text-[#F5F5F5] font-extrabold flex items-center justify-center select-none shrink-0 shadow-2xs ${className}`}
        aria-label={`${cleanTicker || name} logo`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-white dark:bg-[#28282B] border border-slate-200/90 dark:border-[#3A3A3D] flex items-center justify-center p-1 relative overflow-hidden select-none shrink-0 shadow-2xs group-hover:border-slate-300 dark:group-hover:border-[#4A4A4E] transition-all ${className}`}
      aria-label={`${cleanTicker || name} company logo`}
    >
      <img
        src={currentLogoSrc}
        alt={`${cleanTicker || name} logo`}
        width={imgSizes[size]}
        height={imgSizes[size]}
        loading="lazy"
        onError={() => setImgErrorIndex((prev) => prev + 1)}
        className="object-contain max-w-full max-h-full transition-transform duration-200 group-hover:scale-105"
      />
    </div>
  );
}
