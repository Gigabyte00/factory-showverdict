'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineOptInProps {
  siteId: string;
  niche?: string | null;
}

/**
 * Compact inline newsletter opt-in for embedding within blog post content.
 * Renders as a subtle card between content sections.
 */
export function InlineOptIn({ siteId, niche }: InlineOptInProps) {
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
        body: JSON.stringify({ email, site_id: siteId }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="not-prose my-8 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">You&apos;re in! Check your inbox for a welcome email.</span>
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
