'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, footer, size = 'md', className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-[420px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[800px]',
    xl: 'max-w-[1020px]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F0B0A]/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 w-full bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-card-lg shadow-xl dark:shadow-dark-card overflow-hidden flex flex-col max-h-[90vh] text-slate-dark dark:text-[#F5F5F5]',
              sizes[size],
              className
            )}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div className="px-6 py-4 border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between">
                <div>
                  {title && <h3 className="text-lg font-extrabold text-slate-dark dark:text-[#F5F5F5] leading-tight">{title}</h3>}
                  {subtitle && <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-muted dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#323236] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#1E1E21] border-t border-slate-border dark:border-[#3A3A3D] flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
