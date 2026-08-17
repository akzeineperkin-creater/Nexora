'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export interface AuthSwitchProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  className?: string;
}

export function AuthSwitch({
  initialMode = 'signin',
  onSuccess,
  className,
}: AuthSwitchProps) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const resetFormErrors = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetFormErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormErrors();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    // Validation
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp) {
      if (!nickname.trim()) {
        setErrorMsg('Please choose your nickname.');
        return;
      }
      if (nickname.trim().length < 2) {
        setErrorMsg('Nickname must be at least 2 characters.');
        return;
      }
      if (cleanPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp(cleanEmail, cleanPassword, nickname.trim());
        if (res?.error) {
          setErrorMsg(res.error.message || 'Failed to create account.');
          setIsLoading(false);
          return;
        }

        if (!res?.data?.user) {
          setErrorMsg('Failed to create account in Supabase. Please try again.');
          setIsLoading(false);
          return;
        }

        setSuccessMsg('Account created successfully! Redirecting...');
        if (onSuccess) {
          onSuccess();
        }
        router.replace('/dashboard');
        router.refresh();
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        }, 800);
      } else {
        const res = await signIn(cleanEmail, cleanPassword);
        if (res?.error) {
          setErrorMsg(res.error.message || 'Invalid login credentials.');
          setIsLoading(false);
          return;
        }

        if (!res?.data?.user && !res?.data?.session) {
          setErrorMsg('Invalid login credentials.');
          setIsLoading(false);
          return;
        }

        setSuccessMsg('Signed in successfully! Redirecting...');
        if (onSuccess) {
          onSuccess();
        }
        router.replace('/dashboard');
        router.refresh();
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-md bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-card-lg p-6 sm:p-8 shadow-card dark:shadow-dark-card transition-all',
        className
      )}
    >
      {/* 1. TOP SWITCHER (Sign In / Sign Up Tabs) */}
      <div className="relative flex items-center p-1 bg-slate-100 dark:bg-[#1E1E21] rounded-full border border-slate-200/80 dark:border-[#3A3A3D] mb-6 select-none">
        <button
          type="button"
          onClick={() => handleModeSwitch('signin')}
          className={cn(
            'relative flex-1 py-2 text-xs sm:text-sm font-bold transition-colors z-10 text-center rounded-full',
            !isSignUp ? 'text-slate-900 dark:text-[#F5F5F5]' : 'text-slate-500 hover:text-slate-800 dark:text-[#71717A] dark:hover:text-[#F5F5F5]'
          )}
        >
          {!isSignUp && (
            <motion.div
              layoutId="auth-pill-active"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 bg-white dark:bg-[#28282B] rounded-full shadow-subtle border border-slate-200/60 dark:border-[#3A3A3D]"
            />
          )}
          <span className="relative z-10">Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeSwitch('signup')}
          className={cn(
            'relative flex-1 py-2 text-xs sm:text-sm font-bold transition-colors z-10 text-center rounded-full',
            isSignUp ? 'text-slate-900 dark:text-[#F5F5F5]' : 'text-slate-500 hover:text-slate-800 dark:text-[#71717A] dark:hover:text-[#F5F5F5]'
          )}
        >
          {isSignUp && (
            <motion.div
              layoutId="auth-pill-active"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 bg-white dark:bg-[#28282B] rounded-full shadow-subtle border border-slate-200/60 dark:border-[#3A3A3D]"
            />
          )}
          <span className="relative z-10">Sign Up</span>
        </button>
      </div>

      {/* 2. FORM HEADER */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-muted dark:text-[#A1A1AA] mt-1 leading-relaxed">
          {isSignUp
            ? 'Start your risk-free journey with $10,000.00 in virtual trading capital.'
            : 'Access your portfolio, real-time market data, and simulation engine.'}
        </p>
      </div>

      {/* 3. ALERT BANNERS */}
      <AnimatePresence mode="wait">
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-xs font-semibold text-red-700 dark:text-red-300 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. AUTHENTICATION FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nickname (Sign Up only) */}
        <AnimatePresence>
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] block mb-1.5">
                Nickname
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 dark:text-[#71717A] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required={isSignUp}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Choose your nickname (e.g. TraderX)"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-xs sm:text-sm text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#71717A] font-medium transition-all shadow-subtle focus:outline-none focus:border-[#B8F500]/60 focus:ring-2 focus:ring-lime/20"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Address */}
        <div>
          <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] block mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-400 dark:text-[#71717A] absolute left-3.5 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@nexra.finance"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-xs sm:text-sm text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#71717A] font-medium transition-all shadow-subtle focus:outline-none focus:border-[#B8F500]/60 focus:ring-2 focus:ring-lime/20"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] block">
              Password
            </label>
            {!isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('Password reset link has been dispatched to your email if registered.');
                }}
                className="text-[11px] font-semibold text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-[#F5F5F5] transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 dark:text-[#71717A] absolute left-3.5 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-xs sm:text-sm text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#71717A] font-medium transition-all shadow-subtle focus:outline-none focus:border-[#B8F500]/60 focus:ring-2 focus:ring-lime/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 dark:text-[#71717A] hover:text-slate-700 dark:hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password (Sign Up only) */}
        <AnimatePresence>
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] block mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-[#71717A] absolute left-3.5 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required={isSignUp}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-xs sm:text-sm text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#71717A] font-medium transition-all shadow-subtle focus:outline-none focus:border-[#B8F500]/60 focus:ring-2 focus:ring-lime/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 dark:text-[#71717A] hover:text-slate-700 dark:hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign Up Virtual Capital Notice */}
        {isSignUp && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200/80 dark:border-[#3A3A3D] flex items-center gap-2 text-xs text-slate-700 dark:text-[#A1A1AA]">
            <Sparkles className="w-3.5 h-3.5 text-lime shrink-0" />
            <span>Includes <strong>$10,000.00</strong> zero-risk virtual trading sandbox.</span>
          </div>
        )}

        {/* 5. PRIMARY LIME CTA BUTTON (#B8F500) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-full bg-[#B8F500] hover:bg-[#A6DE00] active:scale-[0.98] text-[#0F0B0A] font-extrabold text-xs sm:text-sm transition-all duration-180 shadow-lime flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#0F0B0A] border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <>
              <span>{isSignUp ? 'Create Account' : 'Sign In to Nexra'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* 6. BOTTOM SWITCH PROMPT */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#3A3A3D] text-center text-xs text-slate-600 dark:text-[#A1A1AA]">
        <span>{isSignUp ? 'Already have an account?' : "Don't have an account yet?"}</span>{' '}
        <button
          type="button"
          onClick={() => handleModeSwitch(isSignUp ? 'signin' : 'signup')}
          className="font-bold text-slate-950 dark:text-lime hover:underline cursor-pointer ml-1"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}
