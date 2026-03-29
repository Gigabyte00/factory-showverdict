'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OfferLinkProps {
  offerId: string;
  siteId: string;
  affiliateUrl: string;
  source?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Subtle inline affiliate link with click tracking
 *
 * Designed to blend with surrounding text like Wikipedia citations.
 * Logs clicks to revenue_events table via /api/track-click then opens affiliate URL.
 *
 * Key differences from OfferButton:
 * - No visual emphasis (no colors, badges, or containers)
 * - Inherits parent text color via text-current
 * - Shows underline only on hover
 * - Preserves all tracking functionality
 *
 * @example
 * <p>
 *   Check out <OfferLink offerId="..." siteId="..." affiliateUrl="...">TurboTax</OfferLink> for
 *   easy online filing.
 * </p>
 */
export function OfferLink({
  offerId,
  siteId,
  affiliateUrl,
  source = 'inline',
  children,
  className,
}: OfferLinkProps) {
  const [isTracking, setIsTracking] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Prevent double-clicks
    if (isTracking) return;
    setIsTracking(true);

    try {
      // Track the click (fire-and-forget, don't block user)
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          site_id: siteId,
          source,
        }),
      });

      // Open affiliate URL in new tab
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      // Tracking failed - still redirect user
      console.error('Click tracking error:', error);
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <a
      onClick={handleClick}
      className={cn(
        // Inherit parent text color
        'text-current',
        // Subtle hover feedback
        'hover:underline underline-offset-2',
        'hover:opacity-80',
        // Cursor
        'cursor-pointer',
        // Smooth transitions
        'transition-opacity duration-150',
        // Custom classes
        className
      )}
      // FTC compliance & SEO
      rel="nofollow sponsored"
      // Accessibility
      role="link"
      aria-label={`Affiliate link: ${children}`}
    >
      {children}
    </a>
  );
}
