'use client';

import React, { useEffect, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';

export interface Slice {
  label: string;
  value: number;
  color: string;
}

interface AllocationDonutProps {
  slices: Slice[];
  totalValue?: number;
  size?: number;
}

export function AllocationDonut({ slices, totalValue = 12483.27, size = 160 }: AllocationDonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.42;
    const strokeWidth = size * 0.16;

    let currentAngle = -Math.PI / 2;

    slices.forEach((slice) => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.strokeStyle = slice.color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();

      currentAngle += sliceAngle;
    });
  }, [slices, total, size]);

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-extrabold font-mono text-base text-slate-dark leading-tight">
            ${(totalValue / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] font-bold text-slate-muted uppercase">Total</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {slices.map((slice) => {
          const pct = ((slice.value / total) * 100).toFixed(1);
          return (
            <div key={slice.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-slate-700 font-medium">{slice.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-dark">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
