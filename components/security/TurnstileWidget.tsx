'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export interface TurnstileWidgetRef {
  reset: () => void;
}

export interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (errorCode?: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          callback: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  function TurnstileWidget(
    { onSuccess, onError, onExpire, theme = 'auto', className },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDevBypass, setIsDevBypass] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Read real sitekey from environment
    const rawSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim();
    // Use configured sitekey or fallback to official Cloudflare test key
    const effectiveSiteKey = rawSiteKey || '1x00000000000000000000AA';

    const safeRemoveWidget = () => {
      if (typeof window === 'undefined' || !window.turnstile || !widgetIdRef.current) return;
      const currentWidgetId = widgetIdRef.current;
      widgetIdRef.current = null;

      try {
        const container = containerRef.current;
        if (container && document.body.contains(container) && container.hasChildNodes()) {
          window.turnstile.remove(currentWidgetId);
        }
      } catch {
        // Suppress any removal races during unmount
      }
    };

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (typeof window !== 'undefined' && window.turnstile && widgetIdRef.current) {
          try {
            const container = containerRef.current;
            if (container && document.body.contains(container) && container.hasChildNodes()) {
              window.turnstile.reset(widgetIdRef.current);
            }
          } catch {
            // Ignore reset issues
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;
      let timeoutId: any = null;

      // 1. If key is missing or empty, log warning and bypass to prevent form freeze
      if (!rawSiteKey) {
        console.warn(
          '[Cloudflare Turnstile] Warning: NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing or empty. Operating in development mode to prevent form freeze.'
        );
        setIsDevBypass(true);
        setIsLoaded(true);
        onSuccess('turnstile_test_token_ok');
        return;
      }

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;

        // Clean up previous widget instance if needed
        safeRemoveWidget();
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        try {
          // Timeout guard: If Turnstile hangs on "Verifying..." (e.g. localhost domain restriction in Cloudflare)
          timeoutId = setTimeout(() => {
            if (!isMounted) return;
            const isLocal =
              typeof window !== 'undefined' &&
              (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

            if (isLocal) {
              console.warn(
                '[Cloudflare Turnstile] Challenge pending on localhost. If restricted to production domain in Cloudflare dashboard, add "localhost" to Turnstile domain whitelist. Bypassing locally to prevent freeze.'
              );
              setIsDevBypass(true);
              onSuccess('turnstile_test_token_ok');
            } else {
              setError('Verification challenge is taking longer than expected. Please retry.');
            }
          }, 8000);

          const id = window.turnstile.render(containerRef.current, {
            sitekey: effectiveSiteKey,
            theme,
            callback: (token: string) => {
              if (!isMounted) return;
              if (timeoutId) clearTimeout(timeoutId);
              setError(null);
              setIsLoaded(true);
              onSuccess(token);
            },
            'error-callback': (errCode: string) => {
              if (!isMounted) return;
              if (timeoutId) clearTimeout(timeoutId);
              console.warn('[Cloudflare Turnstile] Verification notice:', errCode);

              const isLocal =
                typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

              if (isLocal) {
                console.warn(
                  '[Cloudflare Turnstile] Domain restriction error on localhost (' + errCode + '). Using dev test token.'
                );
                setIsDevBypass(true);
                onSuccess('turnstile_test_token_ok');
              } else {
                setError(`Verification challenge error (${errCode || 'notice'}). Please retry.`);
                onError?.(errCode);
              }
            },
            'expired-callback': () => {
              if (!isMounted) return;
              setError('Verification expired. Please verify again.');
              onExpire?.();
            },
          });

          widgetIdRef.current = id;
          setIsLoaded(true);
        } catch (err: any) {
          console.warn('[Cloudflare Turnstile] Render warning:', err.message);
          const isLocal =
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
          if (isLocal) {
            setIsDevBypass(true);
            onSuccess('turnstile_test_token_ok');
          } else {
            setError('Verification widget could not be rendered. Please retry.');
          }
        }
      };

      // Check if script is already present
      if (typeof window !== 'undefined') {
        if (window.turnstile) {
          renderWidget();
        } else {
          // Load script dynamically
          const existingScript = document.getElementById('cf-turnstile-script') as HTMLScriptElement | null;
          if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'cf-turnstile-script';
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.onerror = () => {
              console.warn('[Cloudflare Turnstile] Failed to load Turnstile script from Cloudflare.');
              const isLocal =
                typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
              if (isLocal) {
                setIsDevBypass(true);
                onSuccess('turnstile_test_token_ok');
              } else {
                setError('Verification service unreachable. Check ad-blocker.');
              }
            };
            script.onload = () => {
              if (isMounted) renderWidget();
            };
            document.head.appendChild(script);
          } else {
            existingScript.addEventListener('load', renderWidget);
          }
        }
      }

      return () => {
        isMounted = false;
        if (timeoutId) clearTimeout(timeoutId);
        safeRemoveWidget();
      };
    }, [rawSiteKey, effectiveSiteKey, theme, onSuccess, onError, onExpire]);

    return (
      <div className={`flex flex-col items-center justify-center my-3 ${className || ''}`}>
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
        {isDevBypass && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-lime font-medium mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Development Verification Active</span>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center gap-1 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);
