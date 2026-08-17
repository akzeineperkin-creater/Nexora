'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeProvider';

export interface PerformancePoint {
  date: string;
  value: number;
  benchmarkValue?: number;
}

interface PerformanceChartProps {
  data?: PerformancePoint[];
  baseValue?: number;
  height?: number;
  showBenchmark?: boolean;
}

export function PerformanceChart({
  data,
  baseValue = 12483.27,
  height = 300,
  showBenchmark = true,
}: PerformanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'>('1M');
  const [hoverData, setHoverData] = useState<{ point: PerformancePoint; x: number; y: number } | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Generate dynamic time-series points if not passed directly
  const points: PerformancePoint[] = React.useMemo(() => {
    if (data && data.length > 0) return data;

    const count = timeframe === '1W' ? 25 : timeframe === '1M' ? 35 : timeframe === '3M' ? 45 : 60;
    const res: PerformancePoint[] = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000 * (timeframe === '1W' ? 0.3 : 1));
      const progress = (count - i) / count;
      const wave = Math.sin(progress * Math.PI * 3) * 0.03 + Math.cos(progress * Math.PI * 2) * 0.02;
      const trendValue = baseValue * (0.88 + 0.12 * progress + wave);
      const bmTrend = 500 * (0.92 + 0.08 * progress + wave * 0.5);

      res.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: trendValue,
        benchmarkValue: bmTrend,
      });
    }

    if (res.length > 0) {
      res[res.length - 1].value = baseValue;
    }

    return res;
  }, [data, baseValue, timeframe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || points.length < 2) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 15, bottom: 25, left: 15 };
    const chartW = rect.width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const vals = points.map((p) => p.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const range = maxVal - minVal || 1;
    const yMin = minVal - range * 0.08;
    const yMax = maxVal + range * 0.08;

    const getX = (idx: number) => padding.left + (idx / (points.length - 1)) * chartW;
    const getY = (val: number) => padding.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

    // Clear
    ctx.clearRect(0, 0, rect.width, height);

    // Subtle Horizontal Gridlines
    ctx.strokeStyle = isDark ? '#3A3A3D' : '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let g = 0; g <= 3; g++) {
      const gy = padding.top + (g / 3) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, gy);
      ctx.lineTo(rect.width - padding.right, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw S&P 500 Benchmark Line
    if (showBenchmark) {
      const bmVals = points.map((p) => p.benchmarkValue ?? 500);
      const bmMin = Math.min(...bmVals);
      const bmMax = Math.max(...bmVals);
      const bmRange = bmMax - bmMin || 1;
      const getBmY = (val: number) =>
        padding.top + chartH - ((val - bmMin) / bmRange) * (chartH * 0.65) - chartH * 0.18;

      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#71717A' : '#94A3B8';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 5]);

      points.forEach((point, i) => {
        const x = getX(i);
        const y = getBmY(point.benchmarkValue ?? 500);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Gradient Fill under Lime Line
    const grad = ctx.createLinearGradient(0, padding.top, 0, height);
    grad.addColorStop(0, isDark ? 'rgba(184, 245, 0, 0.28)' : 'rgba(184, 238, 50, 0.38)');
    grad.addColorStop(0.65, isDark ? 'rgba(184, 245, 0, 0.04)' : 'rgba(184, 238, 50, 0.08)');
    grad.addColorStop(1, isDark ? 'rgba(40, 40, 43, 0)' : 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(points[0].value));
    for (let i = 1; i < points.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(points[i - 1].value);
      const curX = getX(i);
      const curY = getY(points[i].value);
      const midX = (prevX + curX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, curY, curX, curY);
    }
    ctx.lineTo(getX(points.length - 1), height - padding.bottom);
    ctx.lineTo(getX(0), height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Primary Signature Lime Line Stroke
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#B8F500' : '#69A300';
    ctx.lineWidth = 2.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(getX(0), getY(points[0].value));
    for (let i = 1; i < points.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(points[i - 1].value);
      const curX = getX(i);
      const curY = getY(points[i].value);
      const midX = (prevX + curX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, curY, curX, curY);
    }
    ctx.stroke();

    // Crosshair Guide if Hovering
    if (hoverData) {
      const hx = hoverData.x;
      const hy = hoverData.y;

      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#71717A' : '#94A3B8';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(hx, padding.top);
      ctx.lineTo(hx, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(184, 245, 0, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0F0B0A' : '#0F172A';
      ctx.fill();
      ctx.strokeStyle = '#B8F500';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [points, height, showBenchmark, hoverData, isDark]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const paddingLeft = 15;
    const chartW = rect.width - 30;

    const normalizedX = Math.max(0, Math.min(1, (x - paddingLeft) / chartW));
    const idx = Math.round(normalizedX * (points.length - 1));
    const point = points[idx];

    const vals = points.map((p) => p.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const range = maxVal - minVal || 1;
    const yMin = minVal - range * 0.08;
    const yMax = maxVal + range * 0.08;
    const chartH = height - 45;
    const py = 20 + chartH - ((point.value - yMin) / (yMax - yMin)) * chartH;
    const px = paddingLeft + (idx / (points.length - 1)) * chartW;

    setHoverData({ point, x: px, y: py });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const timeframes: Array<'1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'> = [
    '1W',
    '1M',
    '3M',
    '6M',
    'YTD',
    '1Y',
    'ALL',
  ];

  return (
    <div className="w-full">
      {/* Header with Timeframes */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <span className="text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            Simulated Performance
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            {formatCurrency(hoverData ? hoverData.point.value : baseValue)}
          </div>
        </div>

        <div className="inline-flex bg-slate-100 dark:bg-[#0F0B0A] p-1 rounded-xl border border-slate-border dark:border-[#3A3A3D] gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-lime text-[#0F0B0A] shadow-sm'
                  : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="relative w-full" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair block w-full"
        />

        {/* Hover Tooltip */}
        {hoverData && (
          <div
            className="absolute pointer-events-none bg-slate-900/95 dark:bg-[#28282B] text-white rounded-xl px-3.5 py-2 text-xs shadow-xl border border-white/15 dark:border-[#3A3A3D] z-20 -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap backdrop-blur-md"
            style={{ left: `${hoverData.x}px`, top: `${hoverData.y}px` }}
          >
            <div className="text-slate-400 dark:text-[#71717A] text-[11px] font-mono">{hoverData.point.date}</div>
            <div className="font-extrabold font-mono text-sm text-lime">{formatCurrency(hoverData.point.value)}</div>
            {showBenchmark && hoverData.point.benchmarkValue && (
              <div className="text-slate-400 dark:text-[#71717A] text-[11px] font-mono">
                S&P 500: ${hoverData.point.benchmarkValue.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Benchmark Legend */}
      {showBenchmark && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-border dark:border-[#3A3A3D] text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-[#F5F5F5]">
              <span className="w-2 h-2 rounded-full bg-lime border border-lime-800" />
              <span>Simulated Portfolio</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-[#71717A]">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-[#71717A]" />
              <span>S&P 500 Benchmark</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
