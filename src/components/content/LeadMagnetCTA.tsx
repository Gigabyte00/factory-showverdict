/**
 * LeadMagnetCTA — server component
 *
 * Renders a free-resource CTA box linking to /free/[slug].
 * Reads LEAD_MAGNET_SLUG + LEAD_MAGNET_TITLE from env vars at build/request time.
 * Renders nothing if no lead magnet is configured for this site.
 */

import Link from 'next/link';
import { getLeadMagnet } from '@/lib/lead-magnets';
import { ArrowRight, Download } from 'lucide-react';

interface LeadMagnetCTAProps {
  /** Compact single-line variant for sidebar or inline use */
  variant?: 'card' | 'banner';
}

export function LeadMagnetCTA({ variant = 'card' }: LeadMagnetCTAProps) {
  const slug = process.env.LEAD_MAGNET_SLUG;
  if (!slug) return null;

  const magnet = getLeadMagnet(slug);
  if (!magnet) return null;

  if (variant === 'banner') {
    return (
      <div className="my-6 flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
        <span className="text-2xl shrink-0" aria-hidden="true">{magnet.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            Free: {magnet.title}
          </p>
          <p className="text-xs text-muted-foreground">{magnet.subline}</p>
        </div>
        <Link
          href={`/free/${magnet.slug}`}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Download className="h-3.5 w-3.5" />
          Free
        </Link>
      </div>
    );
  }

  // Default: card variant
  return (
    <div className="my-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-2xl">
          {magnet.icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
            Free Download
          </p>
          <h3 className="text-lg font-bold text-foreground mb-1">{magnet.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {magnet.description}
          </p>
          {magnet.subline && (
            <p className="text-xs text-muted-foreground mb-4 italic">{magnet.subline}</p>
          )}
          <Link
            href={`/free/${magnet.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            <Download className="h-4 w-4" />
            {magnet.ctaText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
