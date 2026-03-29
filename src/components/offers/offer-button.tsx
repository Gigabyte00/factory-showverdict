'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface OfferButtonProps {
  offerId: string;
  siteId: string;
  affiliateUrl: string;
  source?: string;
}

/**
 * Tracked affiliate link button
 *
 * Logs click to revenue_events table via /api/track-click
 * then redirects to affiliate URL
 */
export function OfferButton({ offerId, siteId, affiliateUrl, source = 'offers_page' }: OfferButtonProps) {
  const [isTracking, setIsTracking] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Prevent double-clicks
    if (isTracking) return;
    setIsTracking(true);

    try {
      // Track the click (API redirects to affiliate URL)
      const response = await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          site_id: siteId,
          source,
        }),
      });

      if (response.redirected) {
        // API returned a redirect - open in new tab
        window.open(response.url, '_blank', 'noopener,noreferrer');
      } else if (response.ok) {
        // Fallback if no redirect
        window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Tracking failed - still redirect user
        console.error('Click tracking failed:', await response.text());
        window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      // Network error - still redirect user
      console.error('Click tracking error:', error);
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
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
