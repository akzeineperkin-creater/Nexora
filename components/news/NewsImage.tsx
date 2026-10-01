'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TrendingUp, Newspaper, BarChart3 } from 'lucide-react';

interface NewsImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: 'featured' | 'thumbnail' | 'square';
  priority?: boolean;
}

export function NewsImage({
  src,
  alt,
  className = '',
  aspectRatio = 'thumbnail',
  priority = false,
}: NewsImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const aspectClass =
    aspectRatio === 'featured'
      ? 'aspect-[16/9] md:aspect-[21/9]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'aspect-[16/10] sm:aspect-[16/9]';

  // Minimalist Nexra financial placeholder when image is missing or errors
  if (!src || hasError) {
    return (
      <div
        className={`w-full ${aspectClass} rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/60 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none ${className}`}
      >
        {/* Subtle geometric financial grid lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#B8F500_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Subtle decorative chart waveform */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 opacity-20 flex items-end">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-lime fill-current">
            <path d="M0 35 Q 20 10, 40 25 T 70 15 T 100 5 L 100 40 L 0 40 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
          <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-lime/30 flex items-center justify-center text-lime shadow-inner">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
            NEXRA FINANCIAL WIRE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-0" />
      )}

      {/* Real Article Banner Image */}
      <Image
        src={src}
        alt={alt || 'Financial news banner'}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
