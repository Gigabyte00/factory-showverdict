/**
 * Offers Grid - Offers Page Template
 *
 * Card grid layout for browsing products and deals.
 * Best for: Default offers page, general browsing
 */

import type { OffersTemplateProps } from '@/lib/templates/config';
import type { Offer, Category } from '@/types';
import JsonLd from '@/components/JsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { Callout } from '@/components/content';
import { OfferLink } from '@/components/offers/offer-link';
import Link from 'next/link';

export default function OffersGrid({
  offers,
  categories,
  site,
  theme,
  copy,
  sortOrder = 'featured',
}: OffersTemplateProps) {
  // Create category lookup map
  type PartialCategory = Pick<Category, 'id' | 'slug' | 'name'>;
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {} as Record<string, PartialCategory>);

  // Sort offers based on sortOrder
  const sortedOffers = [...offers].sort((a, b) => {
    switch (sortOrder) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'featured':
      default:
        // Featured first, then by priority
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (b.priority || 0) - (a.priority || 0);
    }
  });

  // Group offers by featured status
  const featuredOffers = sortedOffers.filter(o => o.is_featured);
  const regularOffers = sortedOffers.filter(o => !o.is_featured);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy?.heroTitle || `${site.name} - Product Recommendations`,
    description: copy?.heroSubtitle || `Curated ${site.niche} products and deals`,
    url: `${site.domain}/offers`,
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: sortedOffers.slice(0, 10).map((offer, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: offer.name,
          description: offer.short_description || '',
          image: offer.featured_image_url || offer.logo_url || '',
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: offer.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: offer.rating,
                bestRating: 5,
              }
            : undefined,
        },
      })),
    },
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">
            {copy?.heroTitle || 'Product Recommendations'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {copy?.heroSubtitle ||
              `Our research-backed ${site.niche || 'product'} recommendations.`}
          </p>
        </div>
      </section>

      {/* Featured Offers */}
      {featuredOffers.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              Featured Products
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  categoryMap={categoryMap}
                  siteId={site.id}
                  featured
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Offers */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            {featuredOffers.length > 0
              ? 'All Offers'
              : copy?.sectionHeading || 'Our Recommendations'}
          </h2>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {copy?.emptyStateMessage || 'No offers available yet.'}
              </p>
              <p className="text-muted-foreground/70 mt-2">
                Check back soon for product recommendations!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  categoryMap={categoryMap}
                  siteId={site.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Disclosure */}
      <p className="text-[11px] text-muted-foreground/50 text-center py-4 max-w-lg mx-auto">
        This page may contain affiliate links. We may earn a small commission at no extra cost to you.
      </p>
    </div>
  );
}

interface OfferCardProps {
  offer: Offer;
  categoryMap: Record<string, Pick<Category, 'id' | 'slug' | 'name'>>;
  siteId: string;
  featured?: boolean;
}

function OfferCard({ offer, categoryMap, siteId, featured }: OfferCardProps) {
  const category = offer.category_id ? categoryMap[offer.category_id] : null;

  return (
    <Card className="border overflow-hidden">
      {offer.featured_image_url && (
        <div className="h-44 overflow-hidden">
          <img
            src={offer.featured_image_url}
            alt={offer.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-6">
        {/* Title */}
        <h3 className="font-semibold text-xl mb-2">{offer.name}</h3>

        {/* Category + Rating row */}
        <div className="flex items-center justify-between mb-3">
          {category && (
            <span className="text-xs text-muted-foreground">{category.name}</span>
          )}
          {offer.rating && (
            <StarRating rating={offer.rating} maxRating={5} size="sm" />
          )}
        </div>

        {/* Price */}
        {(offer as any).price_usd && (
          <div className="text-lg font-bold text-foreground mb-2">
            ${(offer as any).price_usd}
          </div>
        )}

        {/* Description */}
        {offer.short_description && (
          <p className="text-muted-foreground text-sm mb-4">
            {offer.short_description}
          </p>
        )}

        {/* Pros/Cons */}
        {(offer.pros?.length || offer.cons?.length) && (
          <div className="text-sm mb-4 space-y-1 text-muted-foreground">
            {offer.pros?.slice(0, 2).map((pro, i) => (
              <p key={i}>+ {pro}</p>
            ))}
            {offer.cons?.slice(0, 1).map((con, i) => (
              <p key={i}>- {con}</p>
            ))}
          </div>
        )}

        {/* Primary CTA + review link */}
        <div className="flex flex-col gap-2 mt-4">
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
            className="text-xs text-center text-muted-foreground hover:text-foreground hover:underline"
          >
            Read detailed review
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
