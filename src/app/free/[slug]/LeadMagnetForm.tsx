'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface LeadMagnetFormProps {
  slug: string;
  siteId: string;
  ctaText: string;
}

export function LeadMagnetForm({ slug, siteId, ctaText }: LeadMagnetFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, site_id: siteId, source: `lead_magnet_${slug}` }),
      });
      if (!res.ok) throw new Error('Subscription failed');
      setStatus('success');
      // Redirect to download page after a short delay
      setTimeout(() => {
        window.location.href = `/free/${slug}/download`;
      }, 1200);
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong — please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="text-center font-semibold">You&apos;re in! Redirecting to your download…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={status === 'loading'}
          required
        />
        <Button type="submit" size="lg" disabled={status === 'loading'} className="shrink-0">
          {status === 'loading' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              {ctaText}
            </>
          )}
        </Button>
      </div>
      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
      <p className="text-xs text-muted-foreground">
        No spam. Unsubscribe anytime.{' '}
        <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
      </p>
    </form>
  );
}
