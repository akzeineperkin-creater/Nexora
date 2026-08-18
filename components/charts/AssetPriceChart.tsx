'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { HistoricalPricePoint, Timeframe } from '@/lib/market-data/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

interface AssetPriceChartProps {
  data?: HistoricalPricePoint[];
  currentPrice?: number;
  timeframe?: Timeframe;
  height?: number;
  isPositive?: boolean;
}

export function AssetPriceChart({
  data = [],
  currentPrice = 100,
  timeframe = '1M',
  height = 340,
  isPositive = true,
}: AssetPriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverData, setHoverData] = useState<{ point: HistoricalPricePoint; x: number; y: number; index: number } | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Compute points
  const points = useMemo(() => {
    if (data && data.length > 1) return data;
    return [];
  }, [data]);

  const startPrice = points.length > 0 ? (points[0].price || points[0].close || currentPrice) : currentPrice;
  const latestPrice = points.length > 0 ? (points[points.length - 1].price || points[points.length - 1].close || currentPrice) : currentPrice;

  // Active price & change calculations
  const activePrice = hoverData ? (hoverData.point.price || hoverData.point.close || currentPrice) : latestPrice;
  const activeChangeDollar = Number((activePrice - startPrice).toFixed(2));
  const activeChangePct = startPrice > 0 ? Number(((activeChangeDollar / startPrice) * 100).toFixed(2)) : 0;
  const isPeriodPositive = activeChangeDollar >= 0;

  // Render Time Axis Ticks for 1D (US Eastern Time: 9:30 AM, 11:00 AM, 1:00 PM, 3:00 PM, 4:00 PM) or Date Ticks for multi-day
  const timeLabels = useMemo(() => {
    if (points.length < 2) return [];
    if (timeframe === '1D') {
      const step = Math.max(1, Math.floor((points.length - 1) / 5));
      const labels: { label: string; index: number }[] = [];
      for (let i = 0; i < points.length; i += step) {
        if (points[i]?.date) {
          labels.push({ label: points[i].date, index: i });
        }
      }
      // Ensure last point label is present
      if (labels[labels.length - 1]?.index !== points.length - 1 && points[points.length - 1]?.date) {
        labels.push({ label: points[points.length - 1].date, index: points.length - 1 });
      }
      return labels;
    } else {
      const step = Math.max(1, Math.floor((points.length - 1) / 4));
      const labels: { label: string; index: number }[] = [];
      for (let i = 0; i < points.length; i += step) {
        if (points[i]?.date) {
          labels.push({ label: points[i].date, index: i });
        }
      }
      if (labels[labels.length - 1]?.index !== points.length - 1 && points[points.length - 1]?.date) {
        labels.push({ label: points[points.length - 1].date, index: points.length - 1 });
      }
      return labels;
    }
  }, [points, timeframe]);

  const [redrawKey, setRedrawKey] = useState(0);

  // ResizeObserver for dynamic canvas redraw on mobile orientation / screen resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      setRedrawKey((prev) => prev + 1);
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

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

    const padding = { top: 25, right: 20, bottom: 40, left: 20 };
    const chartW = Math.max(10, rect.width - padding.left - padding.right);
    const chartH = Math.max(10, height - padding.top - padding.bottom);

    const vals = points.map((p) => p.price || p.close || currentPrice);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const range = maxVal - minVal || 1;
    const yMin = minVal - range * 0.08;
    const yMax = maxVal + range * 0.08;

    const getX = (idx: number) => padding.left + (idx / (points.length - 1)) * chartW;
    const getY = (val: number) => padding.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

    // Clear
    ctx.clearRect(0, 0, rect.width, height);

    // Subtle horizontal grid lines
    ctx.strokeStyle = isDark ? '#3A3A3D' : '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let g = 0; g <= 4; g++) {
      const gy = padding.top + (g / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, gy);
      ctx.lineTo(rect.width - padding.right, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Gradient fill under price line
    const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    if (isPeriodPositive) {
      grad.addColorStop(0, isDark ? 'rgba(184, 245, 0, 0.28)' : 'rgba(184, 245, 0, 0.45)');
      grad.addColorStop(0.5, isDark ? 'rgba(184, 245, 0, 0.04)' : 'rgba(184, 245, 0, 0.12)');
      grad.addColorStop(1, isDark ? 'rgba(40, 40, 43, 0)' : 'rgba(255, 255, 255, 0)');
    } else {
      grad.addColorStop(0, isDark ? 'rgba(239, 68, 68, 0.24)' : 'rgba(239, 68, 68, 0.28)');
      grad.addColorStop(0.5, isDark ? 'rgba(239, 68, 68, 0.04)' : 'rgba(239, 68, 68, 0.06)');
      grad.addColorStop(1, isDark ? 'rgba(40, 40, 43, 0)' : 'rgba(255, 255, 255, 0)');
    }

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(vals[0]));
    for (let i = 1; i < points.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(vals[i - 1]);
      const curX = getX(i);
      const curY = getY(vals[i]);
      const midX = (prevX + curX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, curY, curX, curY);
    }
    ctx.lineTo(getX(points.length - 1), height - padding.bottom);
    ctx.lineTo(getX(0), height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Primary Stroke Line
    ctx.beginPath();
    ctx.strokeStyle = isPeriodPositive ? (isDark ? '#B8F500' : '#65A30D') : '#EF4444';
    ctx.lineWidth = isDark ? 2.85 : 2.75;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(getX(0), getY(vals[0]));
    for (let i = 1; i < points.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(vals[i - 1]);
      const curX = getX(i);
      const curY = getY(vals[i]);
      const midX = (prevX + curX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, curY, curX, curY);
    }
    ctx.stroke();

    // Bottom Time Axis Labels (US Eastern Time / Date)
    ctx.fillStyle = isDark ? '#71717A' : '#94A3B8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    timeLabels.forEach(({ label, index }) => {
      const tx = getX(index);
      ctx.fillText(label, tx, height - 12);
    });

    // Hover crosshair & point marker
    if (hoverData) {
      const hx = hoverData.x;
      const hy = hoverData.y;

      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#71717A' : '#94A3B8';
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = isDark ? '#52525B' : '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(hx, padding.top);
      ctx.lineTo(hx, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fillStyle = isPeriodPositive ? 'rgba(184, 245, 0, 0.4)' : 'rgba(239, 68, 68, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0F0B0A' : '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = isPeriodPositive ? '#B8F500' : '#EF4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [points, height, isPeriodPositive, currentPrice, hoverData, isDark, timeLabels, redrawKey]);

  const updateHoverFromClientX = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const paddingLeft = 15;
    const chartW = Math.max(10, rect.width - 30);

    const normalizedX = Math.max(0, Math.min(1, (x - paddingLeft) / chartW));
    const idx = Math.round(normalizedX * (points.length - 1));
    const point = points[idx];

    const vals = points.map((p) => p.price || p.close || currentPrice);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const range = maxVal - minVal || 1;
    const yMin = minVal - range * 0.08;
    const yMax = maxVal + range * 0.08;
    const chartH = Math.max(10, height - 60);
    const py = 25 + chartH - (((point.price || point.close || currentPrice) - yMin) / (yMax - yMin)) * chartH;
    const px = paddingLeft + (idx / (points.length - 1)) * chartW;

    setHoverData({ point, x: px, y: py, index: idx });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updateHoverFromClientX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updateHoverFromClientX(e.touches[0].clientX);
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const displayedDate = hoverData?.point.date;

  return (
    <div className="w-full max-w-full select-none overflow-hidden">
      {/* Interactive Price Header */}
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            {formatCurrency(activePrice)}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-0.5 text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-md ${
                isPeriodPositive
                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50'
                  : 'text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50'
              }`}
            >
              {isPeriodPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isPeriodPositive ? '+' : ''}{formatCurrency(activeChangeDollar)} ({isPeriodPositive ? '+' : ''}{activeChangePct.toFixed(2)}%)
            </span>
            <span className="text-xs text-slate-400 dark:text-[#71717A] font-medium">
              {hoverData ? 'at point' : `past ${timeframe}`}
            </span>
          </div>
        </div>

        {displayedDate && (
          <div className="text-xs font-mono font-semibold text-slate-500 dark:text-[#A1A1AA] bg-slate-100 dark:bg-[#28282B] px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#3A3A3D]">
            {displayedDate} {timeframe === '1D' ? 'EDT' : ''}
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="relative w-full max-w-full" style={{ height: `${height}px` }}>
        {points.length < 2 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-[#28282B]/40 rounded-xl border border-slate-border dark:border-[#3A3A3D]">
            <span>Loading live market chart...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseLeave}
            className="cursor-crosshair block w-full touch-none"
          />
        )}

        {/* Hover Tooltip Overlay */}
        {hoverData && (
          <div
            className="absolute pointer-events-none bg-slate-900/95 dark:bg-[#28282B] text-white rounded-xl px-3.5 py-2 text-xs shadow-2xl border border-white/15 dark:border-[#3A3A3D] z-20 -translate-x-1/2 -translate-y-full mb-3 whitespace-nowrap backdrop-blur-md"
            style={{ left: `${Math.max(60, Math.min((containerRef.current?.clientWidth || 300) - 60, hoverData.x))}px`, top: `${hoverData.y}px` }}
          >
            <div className="text-slate-400 dark:text-[#71717A] text-[10px] font-mono mb-0.5">
              {hoverData.point.date} {timeframe === '1D' ? 'EDT' : ''}
            </div>
            <div className="font-extrabold font-mono text-base text-lime flex items-center gap-1.5">
              <span>{formatCurrency(hoverData.point.price || hoverData.point.close || currentPrice)}</span>
              <span className="text-[11px] font-normal text-slate-300 dark:text-[#A1A1AA]">
                ({isPeriodPositive ? '+' : ''}{activeChangePct.toFixed(2)}%)
              </span>
            </div>
            {hoverData.point.volume ? (
              <div className="text-slate-400 dark:text-[#71717A] text-[10px] font-mono mt-0.5">
                Volume: {hoverData.point.volume.toLocaleString()}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* High / Low Period Range Bar */}
      {points.length >= 2 && (
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-[#71717A] pt-2.5 border-t border-slate-100 dark:border-[#3A3A3D] flex-wrap gap-2">
          <div>
            <span className="text-slate-500 dark:text-[#A1A1AA] font-medium">Period Low: </span>
            <span className="font-bold text-slate-700 dark:text-[#F5F5F5]">{formatCurrency(Math.min(...points.map((p) => p.price || currentPrice)))}</span>
          </div>
          <span className="text-slate-400 dark:text-[#71717A] font-semibold hidden sm:inline">
            {timeframe === '1D' ? 'US Eastern Time (EDT) Live Session' : `${timeframe} Interactive Window`}
          </span>
          <div>
            <span className="text-slate-500 dark:text-[#A1A1AA] font-medium">Period High: </span>
            <span className="font-bold text-slate-700 dark:text-[#F5F5F5]">{formatCurrency(Math.max(...points.map((p) => p.price || currentPrice)))}</span>
          </div>
        </div>
      )}
    </div>
  );
}
