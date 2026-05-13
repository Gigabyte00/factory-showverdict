'use client';

import { useState } from 'react';
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
 * Logs click to revenue_events table via /api/track-click
 * then redirects to affiliate URL
 */
export function OfferButton({ offerId, siteId, affiliateUrl, offerSlug, source = 'offers_page' }: OfferButtonProps) {
  const [isTracking, setIsTracking] = useState(false);

  // Route through /go/[slug] when a slug is available so the bot filter runs.
  // Fall back to the raw affiliate URL only when slug is missing.
  const target = offerSlug ? `/go/${offerSlug}` : affiliateUrl;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Prevent double-clicks
    if (isTracking) return;
    setIsTracking(true);

    try {
      // Track the click (fire-and-forget on revenue_events)
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          site_id: siteId,
          source,
        }),
      });

      // Open /go/[slug] in new tab — bot filter + server-side click logging runs there
      window.open(target, '_blank', 'noopener,noreferrer');
    } catch (error) {
      // Network error - still redirect user
      console.error('Click tracking error:', error);
      window.open(target, '_blank', 'noopener,noreferrer');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <Button
      className="w-full"
      onClick={handleClick}
      disabled={isTracking}
    >
      {isTracking ? 'Loading...' : 'View Offer'}
      <ExternalLink className="ml-2 h-4 w-4" />
    </Button>
  );
}
