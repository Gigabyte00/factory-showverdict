'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useABTest } from '@/hooks/useABTest';

const headingVariants = [
  "Wait — Don't miss our best deals!",
  "Before you go — check out what's trending",
];

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { variant: heading, trackConversion } = useABTest('exit_heading', headingVariants);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !sessionStorage.getItem('exit_popup_shown')) {
      setShow(true);
      sessionStorage.setItem('exit_popup_shown', '1');
      trackEvent('exit_intent_shown', { page: window.location.pathname });
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('exit_popup_shown')) return;
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubStatus('loading');
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'exit-intent' }) });
      if (!res.ok) throw new Error();
      setSubStatus('success');
      trackEvent('exit_intent_subscribe', { page: window.location.pathname });
    } catch { setSubStatus('error'); }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShow(false)}>
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
        <h2 className="text-2xl font-serif font-bold mb-2">{heading}</h2>
        <p className="text-muted-foreground mb-6">Explore our expert reviews, comparisons, and the best deals — curated just for you.</p>
        <Link href="/offers" onClick={() => { trackConversion(); trackEvent('exit_intent_click', { cta: 'browse_deals' }); }} className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition">Browse Top Deals</Link>
        <Link href="/blog" onClick={() => trackEvent('exit_intent_click', { cta: 'read_guides' })} className="block w-full text-center border border-primary text-primary py-2.5 rounded-lg font-semibold hover:bg-primary/5 transition mt-2">Read Our Guides</Link>
        <div className="mt-5 pt-5 border-t border-border">
          {subStatus === 'success' ? (
            <div className="flex items-center gap-2 text-green-600 text-sm justify-center"><CheckCircle2 className="h-4 w-4" /><span>You&apos;re subscribed! Check your inbox.</span></div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground text-center mb-3">Or get expert tips &amp; deal alerts by email</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" disabled={subStatus === 'loading'} />
                <button type="submit" disabled={subStatus === 'loading'} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1">{subStatus === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Subscribe'}</button>
              </form>
              {subStatus === 'error' && <p className="text-xs text-red-500 text-center mt-1">Something went wrong. Try again.</p>}
              <p className="text-[10px] text-muted-foreground text-center mt-2">No spam. Unsubscribe anytime.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
