/**
 * Offers Table - Offers Page Template
 *
 * Comparison table view for comparing multiple products side-by-side.
 * Best for: Comparing similar products, feature comparison
 */

import type { OffersTemplateProps } from '@/lib/templates/config';
import type { Offer } from '@/types';
import JsonLd from '@/components/JsonLd';
import { Card } from '@/components/ui/card';
import { Callout } from '@/components/content';
import { OfferLink } from '@/components/offers/offer-link';

export default function OffersTable({
  offers,
  categories,
  site,
  theme,
  copy,
  sortOrder = 'rating',
}: OffersTemplateProps) {
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

  // Get top 5 offers for comparison table
  const topOffers = sortedOffers.slice(0, 5);

  // Extract unique feature keys from all offers
  const allFeatures = new Set<string>();
  topOffers.forEach((offer) => {
    if (offer.pros) offer.pros.forEach((pro) => allFeatures.add(pro));
    if (offer.cons) offer.cons.forEach((con) => allFeatures.add(con));
  });

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy?.heroTitle || `${site.name} - Product Comparison`,
    description:
      copy?.heroSubtitle || `Compare the best ${site.niche} products`,
    url: `${site.domain}/offers`,
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.domain,
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
            {copy?.heroTitle || 'Product Comparison'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {copy?.heroSubtitle ||
              `Compare ${site.niche || 'products'} to find the right fit.`}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
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
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-semibold min-w-[150px]">
                        Product
                      </th>
                      {topOffers.map((offer) => (
                        <th
                          key={offer.id}
                          className="min-w-[200px] p-4 text-center"
                        >
                          <div>
                            {/* Product Name */}
                            <h3 className="font-bold text-foreground mb-2">
                              {offer.name}
                            </h3>

                            {/* Rating (text only) */}
                            {offer.rating && (
                              <p className="text-sm text-muted-foreground">
                                {offer.rating.toFixed(1)}/5
                              </p>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Description Row */}
                    <tr className="border-b hover:bg-muted/20 transition">
                      <td className="p-4 font-medium text-sm text-muted-foreground">
                        Description
                      </td>
                      {topOffers.map((offer) => (
                        <td key={offer.id} className="p-4 text-center">
                          <p className="text-sm text-foreground line-clamp-3">
                            {offer.short_description || '—'}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Key Features Row */}
                    <tr className="border-b">
                      <td className="p-4 font-medium text-sm text-muted-foreground">
                        Key Features
                      </td>
                      {topOffers.map((offer) => (
                        <td key={offer.id} className="p-4">
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            {offer.pros && offer.pros.length > 0 ? (
                              offer.pros.slice(0, 3).map((pro, i) => (
                                <p key={i} className="text-left">• {pro}</p>
                              ))
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Drawbacks Row */}
                    <tr className="border-b">
                      <td className="p-4 font-medium text-sm text-muted-foreground">
                        Considerations
                      </td>
                      {topOffers.map((offer) => (
                        <td key={offer.id} className="p-4">
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            {offer.cons && offer.cons.length > 0 ? (
                              offer.cons.slice(0, 2).map((con, i) => (
                                <p key={i} className="text-left">• {con}</p>
                              ))
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* CTA Row */}
                    <tr>
                      <td className="p-4 font-medium text-sm text-muted-foreground">
                        Product Link
                      </td>
                      {topOffers.map((offer) => (
                        <td key={offer.id} className="p-4 text-center">
                          <OfferLink
                            offerId={offer.id}
                            siteId={site.id}
                            affiliateUrl={offer.affiliate_url}
                            source="offers_table"
                            className="text-sm"
                          >
                            Visit {offer.name}
                          </OfferLink>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Additional Offers */}
          {sortedOffers.length > 5 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">More Options</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedOffers.slice(5).map((offer) => (
                  <Card key={offer.id} className="p-6 border">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">{offer.name}</h3>
                      {offer.rating && (
                        <p className="text-sm text-muted-foreground">
                          Rating: {offer.rating.toFixed(1)}/5
                        </p>
                      )}
                    </div>
                    {offer.short_description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {offer.short_description}
                      </p>
                    )}
                    <OfferLink
                      offerId={offer.id}
                      siteId={site.id}
                      affiliateUrl={offer.affiliate_url}
                      source="offers_table_additional"
                      className="text-sm"
                    >
                      Visit {offer.name}
                    </OfferLink>
                  </Card>
                ))}
              </div>
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
