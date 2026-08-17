'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface SparklineProps {
  points?: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
}

export function Sparkline({
  points,
  isPositive = true,
  width = 80,
  height = 24,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const data = React.useMemo(() => {
    if (points && points.length > 1) return points;
    // Generate dummy smooth sparkline
    const res = [100];
    for (let i = 1; i < 12; i++) {
      const progress = i / 12;
      const slope = isPositive ? progress * 15 : -progress * 15;
      const wave = Math.sin(progress * Math.PI * 2) * 3;
      res.push(100 + slope + wave);
    }
    return res;
  }, [points, isPositive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max - min) || 1;

    const color = isPositive
      ? (isDark ? '#34D399' : '#10B981')
      : (isDark ? '#F87171' : '#EF4444');

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = isDark ? 2 : 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * (width - 4) + 2;
      const y = height - 2 - ((val - min) / range) * (height - 4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, isPositive, width, height, isDark]);

  return <canvas ref={canvasRef} className="shrink-0" />;
}
