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
    const [error, setError] = useState<string | null>(null);

    // Official Cloudflare dummy test sitekey if not specified in environment
    // 1x00000000000000000000AA always passes
    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
      '1x00000000000000000000AA';

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (typeof window !== 'undefined' && window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            // Ignore reset issues
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;

        // Clean up previous widget instance if needed
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Ignore
          }
          widgetIdRef.current = null;
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            callback: (token: string) => {
              if (!isMounted) return;
              setError(null);
              onSuccess(token);
            },
            'error-callback': (errCode: string) => {
              if (!isMounted) return;
              console.warn('[Cloudflare Turnstile] Verification notice:', errCode);
              setError('Verification challenge requires attention. Please retry.');
              onError?.(errCode);
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
        }
      };

      // Check if script is already present
      if (typeof window !== 'undefined') {
        if (window.turnstile) {
          renderWidget();
        } else {
          // Load script dynamically
          const existingScript = document.getElementById('cf-turnstile-script');
          if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'cf-turnstile-script';
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
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
        if (typeof window !== 'undefined' && window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Ignore
          }
        }
      };
    }, [siteKey, theme, onSuccess, onError, onExpire]);

    return (
      <div className={`flex flex-col items-center justify-center my-3 ${className || ''}`}>
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
