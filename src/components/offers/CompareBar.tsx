'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { OfferLink } from '@/components/offers/offer-link';
import type { Offer, Category } from '@/types';

const MAX_COMPARE = 4;

type PartialCategory = Pick<Category, 'id' | 'slug' | 'name'>;

interface CompareBarProps {
  featuredOffers: Offer[];
  regularOffers: Offer[];
  categoryMap: Record<string, PartialCategory>;
  siteId: string;
  sectionHeading?: string;
  emptyStateMessage?: string;
}

export function CompareBar({
  featuredOffers,
  regularOffers,
  categoryMap,
  siteId,
  sectionHeading,
  emptyStateMessage,
}: CompareBarProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const allOffers = [...featuredOffers, ...regularOffers];

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_COMPARE
          ? [...prev, id]
          : prev,
    );
  }

  const compareUrl = `/compare/offers?ids=${selected.join(',')}`;

  return (
    <>
      {/* Featured grid */}
      {featuredOffers.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOffers.map((offer) => (
                <CompareCard
                  key={offer.id}
                  offer={offer}
                  categoryMap={categoryMap}
                  siteId={siteId}
                  checked={selected.includes(offer.id)}
                  onToggle={() => toggle(offer.id)}
                  disabled={!selected.includes(offer.id) && selected.length >= MAX_COMPARE}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular grid */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            {featuredOffers.length > 0
              ? 'All Offers'
              : sectionHeading ?? 'Our Recommendations'}
          </h2>

          {regularOffers.length === 0 && featuredOffers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {emptyStateMessage ?? 'No offers available yet.'}
              </p>
              <p className="text-muted-foreground/70 mt-2">
                Check back soon for product recommendations!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularOffers.map((offer) => (
                <CompareCard
                  key={offer.id}
                  offer={offer}
                  categoryMap={categoryMap}
                  siteId={siteId}
                  checked={selected.includes(offer.id)}
                  onToggle={() => toggle(offer.id)}
                  disabled={!selected.includes(offer.id) && selected.length >= MAX_COMPARE}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sticky comparison bar — appears when 1+ selected */}
      {selected.length >= 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              {selected.length === 1
                ? 'Select 1 more to compare'
                : `${selected.length} selected:`}
            </span>

            <div className="flex flex-1 flex-wrap items-center gap-2">
              {selected.map((id) => {
                const offer = allOffers.find((o) => o.id === id);
                return offer ? (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {offer.name}
                    <button
                      onClick={() => toggle(id)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${offer.name} from comparison`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selected.length >= 2 && (
                <Button asChild size="sm">
                  <Link href={compareUrl}>
                    <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                    Compare {selected.length}
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected([])}
                className="text-muted-foreground"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface CompareCardProps {
  offer: Offer;
  categoryMap: Record<string, PartialCategory>;
  siteId: string;
  checked: boolean;
  onToggle: () => void;
  disabled: boolean;
}

function CompareCard({ offer, categoryMap, siteId, checked, onToggle, disabled }: CompareCardProps) {
  const category = offer.category_id ? categoryMap[offer.category_id] : null;

  return (
    <Card
      className={`relative overflow-hidden border transition-shadow ${
        checked ? 'ring-2 ring-primary shadow-md' : ''
      }`}
    >
      {/* Compare toggle */}
      <label className="absolute right-3 top-3 z-10 flex cursor-pointer select-none items-center gap-1.5 rounded-md bg-background/85 px-2 py-1 text-xs backdrop-blur-sm border border-border/60 hover:bg-background transition-colors">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={disabled}
          className="h-3.5 w-3.5 accent-primary cursor-pointer"
          aria-label={`Compare ${offer.name}`}
        />
        <span className={disabled && !checked ? 'text-muted-foreground/50' : 'text-muted-foreground'}>
          Compare
        </span>
      </label>

      {offer.featured_image_url && (
        <div className="h-44 overflow-hidden">
          <img
            src={offer.featured_image_url}
            alt={offer.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      <CardContent className="p-6">
        <h3 className="mb-2 text-xl font-semibold">{offer.name}</h3>

        <div className="mb-3 flex items-center justify-between">
          {category && (
            <span className="text-xs text-muted-foreground">{category.name}</span>
          )}
          {offer.rating && (
            <StarRating rating={offer.rating} maxRating={5} size="sm" />
          )}
        </div>

        {(offer as any).price_usd && (
          <div className="mb-2 text-lg font-bold text-foreground">
            ${(offer as any).price_usd}
          </div>
        )}

        {offer.short_description && (
          <p className="mb-4 text-sm text-muted-foreground">{offer.short_description}</p>
        )}

        {(offer.pros?.length || offer.cons?.length) ? (
          <div className="mb-4 space-y-1 text-sm text-muted-foreground">
            {offer.pros?.slice(0, 2).map((pro, i) => (
              <p key={i}>+ {pro}</p>
            ))}
            {offer.cons?.slice(0, 1).map((con, i) => (
              <p key={i}>- {con}</p>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          <Button asChild size="sm" className="w-full">
            <OfferLink
              offerId={offer.id}
              siteId={siteId}
              affiliateUrl={offer.affiliate_url}
              source="offers_page"
            >
              View Deal
            </OfferLink>
          </Button>
          <Link
            href={`/offers/${offer.slug}`}
            className="text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Read detailed review
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
