'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MagnetShape {
  slug: string;
  title: string;
  description: string;
  subline: string;
  icon: string;
  ctaText: string;
}

interface InlineOptInProps {
  siteId: string;
  niche?: string | null;
  magnet?: MagnetShape | null;
}

/**
 * Compact inline newsletter opt-in for embedding within blog post content.
 * Renders as a subtle card between content sections.
 * If a `magnet` prop is provided, displays magnet-specific copy and redirects
 * to /free/{slug}/download on success.
 */
export function InlineOptIn({ siteId, niche, magnet }: InlineOptInProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, site_id: siteId, magnet_slug: magnet?.slug }),
      });
      if (res.ok) {
        setStatus('success');
        if (magnet) {
          // Brief delay so the user sees confirmation, then redirect to download.
          setTimeout(() => {
            window.location.href = `/free/${magnet.slug}/download`;
          }, 800);
        }
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="not-prose my-8 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">
          {magnet ? 'Success! Redirecting to your download…' : 'You\'re in! Check your inbox for a welcome email.'}
        </span>
      </div>
    );
  }

  if (magnet) {
    return (
      <div className="not-prose my-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="mb-3 flex items-start gap-3">
          <div className="text-2xl" aria-hidden>{magnet.icon}</div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">{magnet.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{magnet.description}</p>
            {magnet.subline && (
              <p className="mt-1 text-xs font-medium text-primary">{magnet.subline}</p>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={status === 'loading'}
            required
          />
          <Button type="submit" disabled={status === 'loading'} className="shrink-0">
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="mr-1.5 h-4 w-4" />
                {magnet.ctaText}
              </>
            )}
          </Button>
        </form>
        {status === 'error' && (
          <p className="mt-2 text-xs text-red-500">Something went wrong — please try again.</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Instant download. No spam. Unsubscribe anytime.</p>
      </div>
    );
  }

  return (
    <div className="not-prose my-8 rounded-xl border border-primary/20 bg-primary/5 px-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Mail className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Free {niche || 'insider'} newsletter
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={status === 'loading'}
            required
          />
          <Button type="submit" size="sm" disabled={status === 'loading'} className="shrink-0">
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>
      </div>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-500">Something went wrong — please try again.</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
