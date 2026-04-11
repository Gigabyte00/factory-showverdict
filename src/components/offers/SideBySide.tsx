'use client';

/**
 * SideBySide — Phase 2C
 *
 * Dynamic side-by-side comparison for 2-4 offers.
 * Used on /compare page and within comparison posts.
 *
 * Features:
 * - Sticky product header row
 * - Check/X/dash icons for boolean features
 * - "Best" column auto-highlight per row
 * - Mobile: horizontal scroll
 */

import Image from 'next/image';
import Link from 'next/link';
import { Check, X, Minus, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface OfferCompareItem {
  id: string;
  name: string;
  slug?: string;
  image?: string | null;
  price?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  affiliateUrl?: string | null;
  award?: string | null;
  /** Feature values — boolean (check/x), string (text), null (dash) */
  features: Record<string, string | boolean | null | undefined>;
}

interface SideBySideProps {
  offers: OfferCompareItem[];
  /** Ordered list of feature keys to display */
  featureKeys?: string[];
  /** Human-readable labels for feature keys */
  featureLabels?: Record<string, string>;
  ctaText?: string;
  className?: string;
}

function FeatureValue({ value }: { value: string | boolean | null | undefined }) {
  if (value === true)
    return <Check className="h-5 w-5 text-emerald-600 mx-auto" aria-label="Yes" />;
  if (value === false)
    return <X className="h-5 w-5 text-red-500 mx-auto" aria-label="No" />;
  if (value === null || value === undefined || value === '')
    return <Minus className="h-4 w-4 text-muted-foreground mx-auto" aria-label="N/A" />;
  return <span className="text-xs text-center block leading-snug">{String(value)}</span>;
}

/** Returns the index of the "best" column for a feature row */
function bestColumnIndex(
  offers: OfferCompareItem[],
  featureKey: string
): number | null {
  const values = offers.map((o) => o.features[featureKey]);
  // Prefer: true > non-null string > false > null
  let bestIdx: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === true) {
      if (bestIdx === null) bestIdx = i;
    } else if (typeof v === 'string' && v) {
      if (bestIdx === null || values[bestIdx] !== true) bestIdx = i;
    }
  }
  // Only highlight if there's a clear winner (not all the same)
  const allSame = values.every((v) => v === values[0]);
  return allSame ? null : bestIdx;
}

export function SideBySide({
  offers,
  featureKeys,
  featureLabels = {},
  ctaText = 'View Deal',
  className,
}: SideBySideProps) {
  if (!offers.length) return null;

  // Derive feature keys from the union of all offer features if not provided
  const keys = featureKeys || [
    ...new Set(offers.flatMap((o) => Object.keys(o.features))),
  ];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0', className)}>
      <table className="w-full min-w-[480px] border-collapse rounded-xl border overflow-hidden">
        {/* Product header row */}
        <thead>
          <tr className="bg-muted/40 border-b">
            <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">
              Feature
            </th>
            {offers.map((offer) => (
              <th key={offer.id} className="p-3 text-center relative min-w-[130px]">
                {offer.award && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap font-semibold">
                    {offer.award}
                  </span>
                )}
                {offer.image && (
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    width={48}
                    height={48}
                    className="mx-auto mb-1.5 object-contain h-10"
                  />
                )}
                <p className="font-semibold text-sm leading-tight">{offer.name}</p>
                {offer.rating != null && (
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-muted-foreground">
                      {offer.rating.toFixed(1)}
                      {offer.reviewCount ? ` (${offer.reviewCount})` : ''}
                    </span>
                  </div>
                )}
                {offer.award && <Badge className="text-[10px] mt-1 h-4 px-1">{offer.award}</Badge>}
              </th>
            ))}
          </tr>

          {/* Price row */}
          <tr className="border-b">
            <td className="p-3 text-xs font-medium text-muted-foreground">Price</td>
            {offers.map((offer) => (
              <td key={offer.id} className="p-3 text-center">
                <span className="font-bold">{offer.price || '—'}</span>
              </td>
            ))}
          </tr>
        </thead>

        {/* Feature rows */}
        <tbody>
          {keys.map((key, idx) => {
            const best = bestColumnIndex(offers, key);
            return (
              <tr
                key={key}
                className={cn('border-b', idx % 2 === 0 ? 'bg-background' : 'bg-muted/20')}
              >
                <td className="p-3 text-xs font-medium text-muted-foreground">
                  {featureLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </td>
                {offers.map((offer, oi) => (
                  <td
                    key={offer.id}
                    className={cn(
                      'p-3 text-center transition',
                      best === oi && 'bg-emerald-50 dark:bg-emerald-950/30'
                    )}
                  >
                    <FeatureValue value={offer.features[key]} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>

        {/* CTA row */}
        <tfoot>
          <tr className="bg-muted/30">
            <td className="p-3" />
            {offers.map((offer) => (
              <td key={offer.id} className="p-3 text-center">
                {offer.affiliateUrl ? (
                  <Button asChild size="sm" className="w-full max-w-[120px] text-xs h-8 gap-1">
                    <a href={offer.affiliateUrl} rel="noopener noreferrer sponsored" target="_blank">
                      {ctaText}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                ) : offer.slug ? (
                  <Button asChild variant="outline" size="sm" className="w-full max-w-[120px] text-xs h-8">
                    <Link href={`/offers/${offer.slug}`}>View Review</Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="w-full max-w-[120px] text-xs h-8">
                    Coming Soon
                  </Button>
                )}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      <p className="text-xs text-muted-foreground mt-2 text-right">
        Green = best in category
      </p>
    </div>
  );
}

export default SideBySide;
