'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TickerTape } from './TickerTape';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { TradeModal } from '@/components/trade/TradeModal';
import { useAuth } from '@/providers/AuthProvider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Public authentication routes
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // If user is unauthenticated on a protected route, trigger client redirect to /register
  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      router.replace('/register');
    }
  }, [isLoading, user, isAuthPage, router]);

  // For /login and /register routes, render without persistent shell
  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-app antialiased w-full overflow-x-hidden">{children}</main>;
  }

  // Prevent ANY flash of trader/dashboard UI while checking auth session or if unauthenticated
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-app flex flex-col items-center justify-center antialiased select-none w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-md border border-slate-800 animate-pulse">
            <Image
              src="/logo.png"
              alt="Nexra"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-app antialiased w-full overflow-x-hidden">
      {/* Fixed Left Sidebar (228px on Desktop, Native Drawer on Mobile) */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (Fixed 228px left margin on desktop) */}
      <div className="lg:ml-[228px] flex-1 flex flex-col min-w-0 min-h-screen max-w-full overflow-x-hidden">
        {/* Sticky Topbar */}
        <Topbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickTrade={() => setIsTradeOpen(true)}
        />

        {/* Real-time Ticker Tape */}
        <TickerTape />

        {/* Dynamic Page Viewport (Safe bottom padding on mobile for MobileBottomNav) */}
        <main className="flex-1 p-3 sm:p-5 md:p-8 pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto animate-in fade-in duration-150 overflow-x-hidden">
          {children}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (< 1024px) */}
        <MobileBottomNav
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickTrade={() => setIsTradeOpen(true)}
        />
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Global Quick Trade Modal */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
      />
    </div>
  );
}
