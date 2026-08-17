'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Sparkles, Newspaper, Trophy, ArrowUpRight, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';

export function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllAsRead, handleNotificationClick } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'market_alert':
      case 'price':
        return <Sparkles className="w-3 h-3 text-lime-600 dark:text-lime-400 shrink-0" />;
      case 'news':
        return <Newspaper className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />;
      case 'tournament':
      case 'challenge':
        return <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />;
      case 'trade':
        return <ArrowUpRight className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />;
      default:
        return <Bell className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full bg-white/85 dark:bg-slate-900/85 border border-slate-border dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all shadow-subtle cursor-pointer focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-border dark:border-slate-800 rounded-card shadow-card-hover p-0 z-50 overflow-hidden"
          >
            <div className="p-3.5 border-b border-slate-border dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-dark dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-lime-400 text-slate-900">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-lime-700 dark:text-lime-400 font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item, () => setIsOpen(false))}
                    className={`p-3 transition-colors cursor-pointer group flex items-start justify-between gap-2 ${
                      item.is_read
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900 opacity-75 hover:opacity-100'
                        : 'bg-lime-50/50 dark:bg-lime-950/20 hover:bg-lime-100/50 dark:hover:bg-lime-900/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        <span className="font-bold text-slate-dark dark:text-slate-200 flex items-center gap-1.5 truncate">
                          {getNotificationIcon(item.type)}
                          <span className="truncate">{item.title}</span>
                        </span>
                        <span className="font-mono text-[10px] shrink-0 ml-1">{item.time_ago || 'Recent'}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-300 leading-snug line-clamp-2">
                        {item.message}
                      </div>
                    </div>
                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
