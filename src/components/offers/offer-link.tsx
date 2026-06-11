'use client';

import { cn } from '@/lib/utils';

interface OfferLinkProps {
  offerId: string;
  siteId: string;
  affiliateUrl: string;
  /** Offer slug — used to route through /go/[slug] so the bot filter runs */
  offerSlug?: string;
  source?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Subtle inline affiliate link with click tracking
 *
 * Renders a REAL <a href> (crawlable, middle-clickable, works without JS)
 * pointing at /go/[slug], which performs bot filtering, server-side click
 * logging, and the affiliate redirect. The onClick analytics call is
 * fire-and-forget (keepalive) and never blocks navigation.
 *
 * Key differences from OfferButton:
 * - No visual emphasis (no colors, badges, or containers)
 * - Inherits parent text color via text-current
 * - Shows underline only on hover
 */
export function OfferLink({
  offerId,
  siteId,
  affiliateUrl,
  offerSlug,
  source = 'inline',
  children,
  className,
}: OfferLinkProps) {
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
    <a
      href={href}
      target="_blank"
      onClick={handleClick}
      className={cn(
        // Inherit parent text color
        'text-current',
        // Subtle hover feedback
        'hover:underline underline-offset-2',
        'hover:opacity-80',
        // Smooth transitions
        'transition-opacity duration-150',
        // Custom classes
        className
      )}
      // FTC compliance & SEO
      rel="sponsored nofollow noopener"
    >
      {children}
    </a>
  );
}
