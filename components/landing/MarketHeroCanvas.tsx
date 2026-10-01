'use client';

import React, { useEffect, useRef } from 'react';

interface FloatingTicker {
  symbol: string;
  change: string;
  price: string;
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  layer: number; // 0 = distant/small, 1 = mid, 2 = foreground/larger
}

interface Candle {
  x: number;
  y: number;
  width: number;
  bodyHeight: number;
  wickTop: number;
  wickBottom: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
}

const TICKER_DATA = [
  { symbol: 'AAPL', change: '+2.84%', price: '$306.14' },
  { symbol: 'NVDA', change: '+4.71%', price: '$184.72' },
  { symbol: 'TSLA', change: '+3.26%', price: '$341.27' },
  { symbol: 'MSFT', change: '+1.92%', price: '$448.90' },
  { symbol: 'AMZN', change: '+2.41%', price: '$218.35' },
  { symbol: 'META', change: '+3.87%', price: '$594.10' },
  { symbol: 'GOOGL', change: '+1.65%', price: '$192.40' },
  { symbol: 'AMD', change: '+5.12%', price: '$162.80' },
  { symbol: 'SPY', change: '+1.45%', price: '$588.20' },
  { symbol: 'QQQ', change: '+2.18%', price: '$512.90' },
];

export function MarketHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle mouse move for gentle parallax
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = width / 2;
      const centerY = height / 2;
      mouseRef.current.targetX = (e.clientX - centerX) / centerX;
      mouseRef.current.targetY = (e.clientY - centerY) / centerY;
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      width = canvas.width = w * dpr;
      height = canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      initElements();
    };

    // 1. Initialize Floating Tickers
    let tickers: FloatingTicker[] = [];
    const isMobile = window.innerWidth < 768;
    const tickerCount = isMobile ? 8 : 16;

    const initElements = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      tickers = [];
      for (let i = 0; i < tickerCount; i++) {
        const item = TICKER_DATA[i % TICKER_DATA.length];
        const layer = Math.random() < 0.35 ? 0 : Math.random() < 0.75 ? 1 : 2;
        const size = layer === 0 ? 11 : layer === 1 ? 13 : 15;
        const maxOpacity = layer === 0 ? 0.35 : layer === 1 ? 0.65 : 0.9;

        tickers.push({
          symbol: item.symbol,
          change: item.change,
          price: item.price,
          x: Math.random() * w,
          y: Math.random() * h,
          speedY: (0.25 + Math.random() * 0.45) * (layer === 0 ? 0.7 : layer === 1 ? 1.0 : 1.3),
          speedX: (Math.random() - 0.5) * 0.2,
          size,
          opacity: Math.random() * maxOpacity,
          maxOpacity,
          layer,
        });
      }
    };

    initElements();

    // 2. Initialize Subtle Background Candlesticks
    const candles: Candle[] = [];
    const candleCount = isMobile ? 12 : 24;
    for (let i = 0; i < candleCount; i++) {
      const x = (i / candleCount) * window.innerWidth + Math.random() * 20;
      const baseH = window.innerHeight * 0.75;
      const y = baseH - (i / candleCount) * (window.innerHeight * 0.45) + (Math.random() - 0.5) * 60;
      const bodyHeight = 15 + Math.random() * 45;
      const wickTop = 8 + Math.random() * 18;
      const wickBottom = 8 + Math.random() * 18;
      candles.push({
        x,
        y,
        width: isMobile ? 6 : 9,
        bodyHeight,
        wickTop,
        wickBottom,
        opacity: 0.08 + Math.random() * 0.12,
      });
    }

    // 3. Initialize Floating Bokeh Particles
    const particles: Particle[] = [];
    const particleCount = isMobile ? 15 : 35;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 1 + Math.random() * 2.5,
        speedY: 0.2 + Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: 0.15 + Math.random() * 0.35,
      });
    }

    let time = 0;

    // Set initial size
    handleResize();
    window.addEventListener('resize', handleResize);
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Main 60 FPS Render Loop
    const render = () => {
      time += 0.016;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Clear & Background Gradient (Deep fintech black/green)
      ctx.fillStyle = '#050807';
      ctx.fillRect(0, 0, w, h);

      // Radial glowing ambient light at top-right & bottom-left
      const gradBg = ctx.createRadialGradient(
        w * 0.65 + mouseRef.current.x * 30,
        h * 0.45 + mouseRef.current.y * 30,
        50,
        w * 0.5,
        h * 0.5,
        w * 0.8
      );
      gradBg.addColorStop(0, 'rgba(16, 185, 129, 0.09)');
      gradBg.addColorStop(0.5, 'rgba(7, 17, 12, 0.5)');
      gradBg.addColorStop(1, 'rgba(5, 8, 7, 1)');
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, w, h);

      // A. Draw Subtle Background Grid
      ctx.strokeStyle = 'rgba(58, 58, 61, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = isMobile ? 60 : 80;
      const offsetX = (mouseRef.current.x * 12) % gridSize;
      const offsetY = (mouseRef.current.y * 12) % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = offsetY; y < h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // B. Draw Subtle Background Candlesticks
      candles.forEach((c) => {
        const cx = c.x + mouseRef.current.x * 15;
        const cy = c.y + mouseRef.current.y * 15;

        ctx.fillStyle = `rgba(184, 245, 0, ${c.opacity})`;
        ctx.strokeStyle = `rgba(184, 245, 0, ${c.opacity * 1.5})`;
        ctx.lineWidth = 1;

        // Top wick
        ctx.beginPath();
        ctx.moveTo(cx + c.width / 2, cy - c.wickTop);
        ctx.lineTo(cx + c.width / 2, cy);
        // Bottom wick
        ctx.moveTo(cx + c.width / 2, cy + c.bodyHeight);
        ctx.lineTo(cx + c.width / 2, cy + c.bodyHeight + c.wickBottom);
        ctx.stroke();

        // Candle Body
        ctx.fillRect(cx, cy, c.width, c.bodyHeight);
      });

      // C. Draw Rising Animated Stock Graphs (Multiple Layered Waves)
      const drawStockLine = (
        baseYRatio: number,
        amplitude: number,
        speed: number,
        color: string,
        fillGradientColor: string,
        lineWidth: number,
        withNodes = false,
        pulsePoint = false
      ) => {
        const baseY = h * baseYRatio + mouseRef.current.y * 25;
        const pts: { x: number; y: number }[] = [];
        const step = isMobile ? 30 : 20;

        for (let x = -50; x <= w + 50; x += step) {
          const normX = x / w;
          // Upward slope with oscillating waves
          const upwardSlope = -normX * (h * 0.42);
          const wave1 = Math.sin(normX * 6 + time * speed) * amplitude;
          const wave2 = Math.cos(normX * 12 - time * (speed * 0.8)) * (amplitude * 0.4);
          const wave3 = Math.sin(normX * 2.5 + time * 0.5) * (amplitude * 0.6);
          const y = baseY + upwardSlope + wave1 + wave2 + wave3;
          pts.push({ x, y });
        }

        // Draw filled area under curve
        if (fillGradientColor) {
          const fillGrad = ctx.createLinearGradient(0, baseY - h * 0.4, 0, h);
          fillGrad.addColorStop(0, fillGradientColor);
          fillGrad.addColorStop(1, 'rgba(5, 8, 7, 0)');

          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.lineTo(pts[pts.length - 1].x, h);
          ctx.lineTo(pts[0].x, h);
          ctx.closePath();
          ctx.fillStyle = fillGrad;
          ctx.fill();
        }

        // Draw line curve
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i].x + pts[i - 1].x) / 2;
          const yc = (pts[i].y + pts[i - 1].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw glowing nodes at intervals
        if (withNodes) {
          for (let i = 3; i < pts.length - 3; i += 4) {
            const p = pts[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#B8F500';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(184, 245, 0, 0.25)';
            ctx.fill();
          }
        }

        // Traveling glowing pulse point
        if (pulsePoint) {
          const pulseProgress = (time * 0.35) % 1;
          const pulseIdx = Math.floor(pulseProgress * (pts.length - 1));
          const p = pts[pulseIdx] || pts[0];

          // Outer beacon ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(184, 245, 0, 0.15)';
          ctx.fill();

          // Mid glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(184, 245, 0, 0.6)';
          ctx.fill();

          // Center spark
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
      };

      // Layer 1: Background slow wave
      drawStockLine(0.85, 24, 0.4, 'rgba(52, 211, 153, 0.25)', 'rgba(52, 211, 153, 0.04)', 1.5, false, false);
      // Layer 2: Mid-ground wave with nodes
      drawStockLine(0.78, 32, 0.7, 'rgba(16, 185, 129, 0.45)', 'rgba(16, 185, 129, 0.07)', 2, true, false);
      // Layer 3: Prominent Foreground rising green chart line with live glowing head pulse
      drawStockLine(0.72, 40, 1.0, '#B8F500', 'rgba(184, 245, 0, 0.12)', 3, true, true);

      // D. Draw Floating Rising Particles / Embers
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.y -= p.speedY;
          p.x += p.speedX;
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x + mouseRef.current.x * 10, p.y + mouseRef.current.y * 10, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 245, 0, ${p.alpha})`;
        ctx.fill();
      });

      // E. Draw Floating Stock Tickers & Price Badges (Moving upward continuously)
      tickers.forEach((t) => {
        if (!prefersReducedMotion) {
          t.y -= t.speedY;
          t.x += t.speedX;

          // Wrap around top to bottom
          if (t.y < -40) {
            t.y = h + 40;
            t.x = Math.random() * w;
          }
        }

        // Fade in when entering from bottom, fade out near top
        const distFromBottom = h - t.y;
        const distFromTop = t.y;
        let fade = 1;
        if (distFromBottom < 100) fade = distFromBottom / 100;
        if (distFromTop < 100) fade = distFromTop / 100;
        const currentOpacity = t.maxOpacity * Math.max(0, Math.min(1, fade));

        if (currentOpacity <= 0.02) return;

        const posX = t.x + mouseRef.current.x * (t.layer === 0 ? 8 : t.layer === 1 ? 16 : 24);
        const posY = t.y + mouseRef.current.y * (t.layer === 0 ? 8 : t.layer === 1 ? 16 : 24);

        // Keep center safe margin for headline typography on desktop
        const centerDistX = Math.abs(posX - w / 2);
        const centerDistY = Math.abs(posY - h / 2);
        if (!isMobile && centerDistX < 260 && centerDistY < 180) {
          // Dim elements that drift directly over center text
          ctx.globalAlpha = currentOpacity * 0.25;
        } else {
          ctx.globalAlpha = currentOpacity;
        }

        // Render Glass Ticker Pill
        const pillHeight = t.size + 14;
        const text = `${t.symbol}  ▲ ${t.change}`;
        ctx.font = `800 ${t.size}px 'JetBrains Mono', monospace`;
        const metrics = ctx.measureText(text);
        const pillWidth = metrics.width + 20;

        // Rounded pill background
        ctx.fillStyle = t.layer === 2 ? 'rgba(30, 30, 33, 0.75)' : 'rgba(15, 11, 10, 0.55)';
        ctx.strokeStyle = t.layer === 2 ? 'rgba(184, 245, 0, 0.4)' : 'rgba(58, 58, 61, 0.4)';
        ctx.lineWidth = 1;

        const r = pillHeight / 2;
        ctx.beginPath();
        ctx.moveTo(posX + r, posY);
        ctx.lineTo(posX + pillWidth - r, posY);
        ctx.quadraticCurveTo(posX + pillWidth, posY, posX + pillWidth, posY + r);
        ctx.lineTo(posX + pillWidth, posY + pillHeight - r);
        ctx.quadraticCurveTo(posX + pillWidth, posY + pillHeight, posX + pillWidth - r, posY + pillHeight);
        ctx.lineTo(posX + r, posY + pillHeight);
        ctx.quadraticCurveTo(posX, posY + pillHeight, posX, posY + pillHeight - r);
        ctx.lineTo(posX, posY + r);
        ctx.quadraticCurveTo(posX, posY, posX + r, posY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Symbol text (White)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(t.symbol, posX + 10, posY + pillHeight * 0.68);

        // Up arrow and change percent (Lime Green)
        ctx.fillStyle = '#B8F500';
        const symbolW = ctx.measureText(`${t.symbol}  `).width;
        ctx.fillText(`▲ ${t.change}`, posX + 10 + symbolW, posY + pillHeight * 0.68);

        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 select-none"
    />
  );
}
