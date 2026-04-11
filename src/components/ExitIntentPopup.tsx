'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const COOKIE_KEY = 'exit_popup_dismissed';
const COOKIE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours
const MIN_TIME_ON_PAGE_MS = 30 * 1000; // 30 seconds before popup is eligible

function setCookieDismissed() {
  const expires = new Date(Date.now() + COOKIE_TTL_MS).toUTCString();
  document.cookie = `${COOKIE_KEY}=1; expires=${expires}; path=/; SameSite=Lax`;
}

function isCookieDismissed(): boolean {
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE_KEY}=`));
}

interface ExitIntentPopupProps {
  niche?: string | null;
  siteId?: string;
}

export function ExitIntentPopup({ niche, siteId }: ExitIntentPopupProps) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const enteredAt = useRef<number>(Date.now());
  const eligibleRef = useRef(false);

  const triggerPopup = useCallback(() => {
    if (eligibleRef.current && !isCookieDismissed() && !show) {
      setShow(true);
      trackEvent('exit_intent_shown', { page: window.location.pathname });
    }
  }, [show]);

  useEffect(() => {
    // Mark eligible after 30 seconds on page
    const timer = setTimeout(() => {
      eligibleRef.current = true;
    }, MIN_TIME_ON_PAGE_MS);

    // Desktop: mouse leaves top of viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) triggerPopup();
    };

    // Mobile: back button / history navigation (popstate)
    const handlePopState = () => triggerPopup();

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [triggerPopup]);

  const dismiss = useCallback(() => {
    setShow(false);
    setCookieDismissed();
    trackEvent('exit_intent_dismissed', { page: window.location.pathname });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit-intent', site_id: siteId }),
      });
      if (!res.ok) throw new Error();
      setSubStatus('success');
      trackEvent('exit_intent_subscribe', { page: window.location.pathname });
      setTimeout(() => { setShow(false); setCookieDismissed(); }, 2500);
    } catch {
      setSubStatus('error');
    }
  };

  if (!show) return null;

  const nicheLabel = niche ? niche.toLowerCase() : 'product';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={dismiss}
    >
      <div
        className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          Wait — before you go
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Don't miss our best {nicheLabel} picks
        </h2>
        <p className="text-muted-foreground mb-5 text-sm">
          Get our expert {nicheLabel} reviews and top deals — straight to your inbox, free.
        </p>

        {subStatus === 'success' ? (
          <div className="flex items-center gap-2 text-green-600 py-3 justify-center">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">You're in! Check your inbox.</span>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubscribe} className="space-y-2 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={subStatus === 'loading'}
                required
              />
              <button
                type="submit"
                disabled={subStatus === 'loading'}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {subStatus === 'loading' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Subscribing...</>
                ) : (
                  'Get Free Picks & Deals'
                )}
              </button>
            </form>
            {subStatus === 'error' && (
              <p className="text-xs text-red-500 text-center mb-2">Something went wrong. Please try again.</p>
            )}
            <p className="text-[10px] text-muted-foreground text-center">No spam. Unsubscribe anytime.</p>
          </>
        )}

        <div className="mt-5 pt-4 border-t border-border flex gap-2">
          <Link
            href="/best"
            onClick={() => { dismiss(); trackEvent('exit_intent_click', { cta: 'browse_picks' }); }}
            className="flex-1 text-center border border-primary text-primary py-2 rounded-lg text-sm font-medium hover:bg-primary/5 transition"
          >
            Browse Top Picks
          </Link>
          <Link
            href="/blog"
            onClick={() => { dismiss(); trackEvent('exit_intent_click', { cta: 'read_guides' }); }}
            className="flex-1 text-center border border-border text-muted-foreground py-2 rounded-lg text-sm font-medium hover:bg-muted transition"
          >
            Read Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
