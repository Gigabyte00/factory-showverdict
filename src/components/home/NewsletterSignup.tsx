'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface NewsletterSignupProps {
  siteId: string;
  niche?: string | null;
  variant?: 'default' | 'minimal' | 'banner' | 'sticky';
}

/**
 * Newsletter signup form
 *
 * Features:
 * - Client-side form handling
 * - Supabase integration for email storage
 * - Success/error states
 * - Privacy note
 *
 * Requires 'use client' for form state
 */
export function NewsletterSignup({ siteId, niche, variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, site_id: siteId }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox for confirmation.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (variant === 'minimal') {
    return <MinimalNewsletter email={email} setEmail={setEmail} status={status} onSubmit={handleSubmit} />;
  }

  if (variant === 'banner') {
    return <BannerNewsletter email={email} setEmail={setEmail} status={status} message={message} onSubmit={handleSubmit} niche={niche} />;
  }

  if (variant === 'sticky') {
    return <StickyNewsletter email={email} setEmail={setEmail} status={status} message={message} onSubmit={handleSubmit} niche={niche} />;
  }

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="container">
        <div className="max-w-4xl mx-auto rounded-2xl border border-primary/10 bg-background/80 backdrop-blur-sm p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Copy — left column */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
                Newsletter
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Stay in the Loop
              </h2>
              <p className="text-muted-foreground">
                Get the latest {niche || 'product'} reviews, deals, and expert tips delivered straight to your inbox.
              </p>
            </div>

            {/* Form — right column */}
            <div>
              {status === 'success' ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 text-green-600 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{message}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={status === 'loading'}
                  />
                  <Button type="submit" size="lg" className="w-full" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Subscribe Free
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Error message */}
              {status === 'error' && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{message}</span>
                </div>
              )}

              {/* Trust micro-copy */}
              <p className="text-xs text-muted-foreground mt-3">
                No spam. Unsubscribe anytime.{' '}
                <a href="/privacy" className="underline hover:text-primary">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Minimal variant - just the form inline
 */
function MinimalNewsletter({
  email,
  setEmail,
  status,
  onSubmit,
}: {
  email: string;
  setEmail: (value: string) => void;
  status: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle2 className="w-4 h-4" />
        <span>Subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-3 py-2 text-sm rounded border border-input bg-background"
        disabled={status === 'loading'}
      />
      <Button type="submit" size="sm" disabled={status === 'loading'}>
        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
      </Button>
    </form>
  );
}

/**
 * Sticky bottom bar — slides up after 60% page scroll, dismissable with a cookie
 */
function StickyNewsletter({
  email,
  setEmail,
  status,
  message,
  onSubmit,
  niche,
}: {
  email: string;
  setEmail: (value: string) => void;
  status: string;
  message: string;
  onSubmit: (e: React.FormEvent) => void;
  niche?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Respect previous dismissal stored in sessionStorage
    if (sessionStorage.getItem('newsletter_sticky_dismissed')) {
      setDismissed(true);
      return;
    }
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total > 0.6) setVisible(true);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-dismiss 3 seconds after successful subscription
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => dismiss(), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('newsletter_sticky_dismissed', '1');
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/20 bg-background/95 shadow-lg backdrop-blur-sm">
      <div className="container py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm font-semibold">
              Get the best {niche || 'product'} deals &amp; tips — free
            </span>
          </div>
          <div className="flex items-center gap-2">
            {status === 'success' ? (
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {message || 'You\'re subscribed!'}
              </span>
            ) : (
              <form onSubmit={onSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-48 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={status === 'loading'}
                  required
                />
                <Button type="submit" size="sm" disabled={status === 'loading'}>
                  {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
                </Button>
              </form>
            )}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner variant - full-width strip
 */
function BannerNewsletter({
  email,
  setEmail,
  status,
  message,
  onSubmit,
  niche,
}: {
  email: string;
  setEmail: (value: string) => void;
  status: string;
  message: string;
  onSubmit: (e: React.FormEvent) => void;
  niche?: string | null;
}) {
  return (
    <div className="bg-primary text-primary-foreground py-4">
      <div className="container">
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{message}</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Get the best {niche || 'product'} deals weekly</span>
            </div>
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-3 py-2 rounded text-foreground bg-background text-sm w-48"
                disabled={status === 'loading'}
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
