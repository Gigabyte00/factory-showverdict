/**
 * Offers Grid - Offers Page Template
 *
 * Card grid layout for browsing products and deals.
 * Best for: Default offers page, general browsing
 */

import type { OffersTemplateProps } from '@/lib/templates/config';
import type { Category } from '@/types';
import JsonLd from '@/components/JsonLd';
import { CompareBar } from '@/components/offers/CompareBar';

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
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (b.priority || 0) - (a.priority || 0);
    }
  });

  const featuredOffers = sortedOffers.filter((o) => o.is_featured);
  const regularOffers = sortedOffers.filter((o) => !o.is_featured);

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

      {/* Offer grids with compare functionality */}
      <CompareBar
        featuredOffers={featuredOffers}
        regularOffers={regularOffers}
        categoryMap={categoryMap}
        siteId={site.id}
        sectionHeading={copy?.sectionHeading}
        emptyStateMessage={copy?.emptyStateMessage}
      />

      {/* Disclosure */}
      <p className="text-[11px] text-muted-foreground/50 text-center py-4 max-w-lg mx-auto">
        This page may contain affiliate links. We may earn a small commission at no extra cost to you.
      </p>
    </div>
  );
}
