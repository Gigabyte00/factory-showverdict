'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyMobileBuyBarProps {
  productName: string;
  price?: string;
  rating?: number;
  maxRating?: number;
  affiliateUrl: string;
  ctaLabel?: string;
}

/**
 * Mobile-only sticky bottom bar for review posts — surfaces the primary CTA after the user scrolls past the hero.
 * Appears after scrolling past 40% of the viewport height; hidden on desktop (md breakpoint and up).
 * Carries sponsored/noopener attributes so it matches FTC/SEO guidance for affiliate links.
 */
export function StickyMobileBuyBar({
  productName,
  price,
  rating,
  maxRating = 5,
  affiliateUrl,
  ctaLabel = 'Check Price',
}: StickyMobileBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const threshold = window.innerHeight * 0.4;
      setVisible(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!affiliateUrl) return null;

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur transition-transform duration-200 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{productName}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {price && <span className="font-medium text-foreground">{price}</span>}
            {typeof rating === 'number' && rating > 0 && (
              <span aria-label={`Rating ${rating} of ${maxRating}`}>
                {'★'.repeat(Math.round(rating))}
                <span className="text-muted-foreground/40">
                  {'★'.repeat(Math.max(0, maxRating - Math.round(rating)))}
                </span>
              </span>
            )}
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <a href={affiliateUrl} target="_blank" rel="noopener noreferrer sponsored">
            {ctaLabel}
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
