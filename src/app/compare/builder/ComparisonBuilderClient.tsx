'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Plus, Search, Trash2, Copy, CopyCheck, ExternalLink, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SideBySide, type OfferCompareItem } from '@/components/offers/SideBySide';
import { cn } from '@/lib/utils';

/** Upper bound on SideBySide — more than this and the table overflows on mobile. */
const MAX_SELECTION = 4;
const MIN_SELECTION = 2;

interface OfferOption {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  rating: number | null;
  price: string | null;
  affiliateUrl: string | null;
  award: string | null;
  pros: string[];
  cons: string[];
  featureMatrix: Record<string, number | string | boolean | null>;
}

interface ComparisonBuilderClientProps {
  offers: OfferOption[];
  siteName: string;
}

/** Turn the offer's misc fields into a single feature bag for SideBySide. */
function buildFeatures(offer: OfferOption): Record<string, string | boolean | null> {
  const f: Record<string, string | boolean | null> = {};

  // Editorial pros count — a reasonable proxy for "comprehensive"
  if (offer.pros.length > 0) f['pros_count'] = `${offer.pros.length} pros`;
  if (offer.cons.length > 0) f['cons_count'] = `${offer.cons.length} cons`;

  // Feature matrix (score-based or boolean): pass through as strings for display
  for (const [key, value] of Object.entries(offer.featureMatrix)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'boolean') f[key] = value;
    else if (typeof value === 'number') f[key] = value >= 4 ? true : value <= 2 ? false : `${value}/5`;
    else if (typeof value === 'string') f[key] = value;
  }

  // Award highlight
  if (offer.award) f['award'] = offer.award;

  return f;
}

export function ComparisonBuilderClient({ offers, siteName }: ComparisonBuilderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Hydrate selection from URL on mount / URL change
  useEffect(() => {
    const param = searchParams.get('offers');
    if (!param) {
      setSelectedIds([]);
      return;
    }
    const slugs = param.split(',').map((s) => s.trim()).filter(Boolean);
    const ids = slugs
      .map((slug) => offers.find((o) => o.slug === slug)?.id)
      .filter((id): id is string => Boolean(id))
      .slice(0, MAX_SELECTION);
    setSelectedIds(ids);
  }, [searchParams, offers]);

  // Write selection back to the URL (preserves sharable state + back-nav)
  const updateUrl = useCallback(
    (ids: string[]) => {
      const slugs = ids
        .map((id) => offers.find((o) => o.id === id)?.slug)
        .filter(Boolean)
        .join(',');
      const url = slugs ? `/compare/builder?offers=${encodeURIComponent(slugs)}` : '/compare/builder';
      router.replace(url, { scroll: false });
    },
    [offers, router]
  );

  const toggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        const capped = next.slice(0, MAX_SELECTION);
        updateUrl(capped);
        return capped;
      });
    },
    [updateUrl]
  );

  const clear = useCallback(() => {
    setSelectedIds([]);
    updateUrl([]);
  }, [updateUrl]);

  const copyShareLink = useCallback(async () => {
    if (!selectedIds.length) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — user can still copy from address bar.
    }
  }, [selectedIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false) ||
        (o.award?.toLowerCase().includes(q) ?? false)
    );
  }, [offers, query]);

  const selectedOffers = selectedIds
    .map((id) => offers.find((o) => o.id === id))
    .filter((o): o is OfferOption => Boolean(o));

  const comparisonItems: OfferCompareItem[] = selectedOffers.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    image: o.image,
    price: o.price,
    rating: o.rating,
    affiliateUrl: o.affiliateUrl,
    award: o.award,
    features: buildFeatures(o),
  }));

  const canAddMore = selectedIds.length < MAX_SELECTION;
  const canCompare = selectedIds.length >= MIN_SELECTION;

  return (
    <div className="space-y-8">
      {/* Selection status bar */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[160px]">
            <p className="text-sm font-medium">
              {selectedIds.length === 0
                ? 'Select 2 to 4 products to compare'
                : `${selectedIds.length} / ${MAX_SELECTION} selected`}
            </p>
            {!canCompare && selectedIds.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Pick at least one more to compare</p>
            )}
          </div>
          {selectedIds.length > 0 && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={clear}>
                <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                Clear
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={copyShareLink} disabled={!canCompare}>
                {copied ? (
                  <>
                    <CopyCheck className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
                    Copy link
                  </>
                )}
              </Button>
            </>
          )}
        </div>
        {selectedOffers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedOffers.map((o) => (
              <Badge key={o.id} variant="secondary" className="gap-1.5 py-1 pl-3 pr-1">
                {o.name}
                <button
                  type="button"
                  aria-label={`Remove ${o.name}`}
                  onClick={() => toggle(o.id)}
                  className="rounded-full w-5 h-5 inline-flex items-center justify-center hover:bg-muted-foreground/20"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Comparison result */}
      {canCompare ? (
        <section aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-xl font-bold mb-4">
            Your comparison
          </h2>
          <SideBySide offers={comparisonItems} ctaText="View Deal" />
          <p className="text-xs text-muted-foreground mt-3">
            Comparisons are based on editorial data from {siteName}. Pricing and availability change —
            confirm on the retailer&apos;s page.
          </p>
        </section>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {selectedIds.length === 0
            ? 'Pick products from the list below to start comparing.'
            : 'Pick at least one more product to see the comparison.'}
        </div>
      )}

      {/* Picker */}
      <section aria-labelledby="picker-heading">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 id="picker-heading" className="text-xl font-bold">
            Pick from {offers.length} products
          </h2>
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search products</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by name or feature"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </label>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center rounded-md border border-dashed">
            No products match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-none">
            {filtered.map((offer) => {
              const selected = selectedIds.includes(offer.id);
              const disabled = !selected && !canAddMore;
              return (
                <li key={offer.id}>
                  <Card
                    className={cn(
                      'transition h-full',
                      selected && 'border-primary ring-2 ring-primary/30',
                      disabled && 'opacity-50'
                    )}
                  >
                    <CardContent className="p-4 flex gap-3 items-start">
                      {offer.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={offer.image}
                          alt=""
                          className="h-16 w-16 object-contain flex-shrink-0 rounded border bg-background"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/offers/${offer.slug}`}
                          className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors"
                        >
                          {offer.name}
                        </Link>
                        {offer.rating != null && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                            {offer.rating.toFixed(1)}
                            {offer.price && <span className="ml-2">· {offer.price}</span>}
                          </div>
                        )}
                        {offer.award && (
                          <Badge variant="secondary" className="mt-1.5 text-[10px] h-5">
                            {offer.award}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={selected ? 'default' : 'outline'}
                        className="flex-shrink-0"
                        disabled={disabled}
                        onClick={() => toggle(offer.id)}
                        aria-pressed={selected}
                        aria-label={selected ? `Remove ${offer.name} from comparison` : `Add ${offer.name} to comparison`}
                      >
                        {selected ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Remove</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Add</span>
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Deep-link entry to individual reviews */}
      <aside className="text-sm text-muted-foreground text-center">
        Want a deeper read? Browse our{' '}
        <Link href="/offers" className="text-primary hover:underline">
          full product catalogue
        </Link>
        {' or the '}
        <Link href="/compare" className="text-primary hover:underline">
          editorial head-to-head comparisons
          <ExternalLink className="h-3 w-3 inline-block ml-0.5" aria-hidden="true" />
        </Link>
        .
      </aside>
    </div>
  );
}
