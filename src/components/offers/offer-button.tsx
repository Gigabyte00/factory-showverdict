'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface OfferButtonProps {
  offerId: string;
  siteId: string;
  affiliateUrl: string;
  /** Offer slug — used to route through /go/[slug] so the bot filter runs */
  offerSlug?: string;
  source?: string;
}

/**
 * Tracked affiliate link button
 *
 * Renders a REAL <a href> (crawlable, middle-clickable, works without JS)
 * pointing at /go/[slug], which performs bot filtering, server-side click
 * logging (revenue_events), and the affiliate redirect. The onClick
 * analytics call is fire-and-forget (keepalive) and never blocks navigation.
 */
export function OfferButton({ offerId, siteId, affiliateUrl, offerSlug, source = 'offers_page' }: OfferButtonProps) {
  // Route through /go/[slug] when a slug is available so the bot filter runs.
  // Fall back to the raw affiliate URL only when slug is missing.
  const href = offerSlug ? `/go/${offerSlug}` : affiliateUrl;

  const handleClick = () => {
    // Fire-and-forget analytics — keepalive lets it complete during navigation
    try {
      fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          offer_id: offerId,
          site_id: siteId,
          source,
        }),
      }).catch(() => {});
    } catch {
      // Tracking must never block the user
    }
  };

  return (
    <Button asChild className="w-full">
      <a
        href={href}
        target="_blank"
        rel="sponsored nofollow noopener"
        onClick={handleClick}
      >
        View Offer
        <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}
