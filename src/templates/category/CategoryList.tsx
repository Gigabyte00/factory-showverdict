/**
 * Category List - Category Page Template
 *
 * Detailed vertical list with specs and comparisons.
 * Best for: Technical products requiring detailed comparison, spec-heavy categories
 */

import type { CategoryTemplateProps } from '@/lib/templates/config';
import type { Post, Offer } from '@/types';
import JsonLd from '@/components/JsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Tag, Check, X, Award } from 'lucide-react';
import { OfferButton } from '@/components/offers/offer-button';
import Link from 'next/link';

export default function CategoryList({
  category,
  posts,
  offers,
  site,
  theme,
  copy,
  sortOrder = 'recent',
}: CategoryTemplateProps) {
  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    const dateB = new Date(b.published_at || b.created_at || Date.now()).getTime();
    const dateA = new Date(a.published_at || a.created_at || Date.now()).getTime();
    return dateB - dateA;
  });

  // Sort offers - featured first, then by rating
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - ${site.name}`,
    description: category.description || `Detailed ${category.name} comparison`,
    url: `${site.domain}/category/${category.slug}`,
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
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-6 w-6 text-primary" />
            <Badge variant="outline">{category.name}</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {copy?.heroTitle || `${category.name} Comparison`}
          </h1>
          {category.description && (
            <p className="text-muted-foreground text-lg max-w-3xl">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Products List */}
      {sortedOffers.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Products</h2>
            <div className="space-y-6">
              {sortedOffers.map((offer, index) => (
                <Card
                  key={offer.id}
                  className={`overflow-hidden hover:shadow-lg transition ${
                    offer.is_featured ? 'ring-2 ring-primary/30' : ''
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
                      {/* Left: Image & CTA */}
                      <div className="flex flex-col">
                        {/* Rank Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            #{index + 1}
                          </Badge>
                          {offer.is_featured && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                        </div>

                        {/* Product Image */}
                        {offer.featured_image_url ? (
                          <img
                            src={offer.featured_image_url}
                            alt={offer.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        ) : offer.logo_url ? (
                          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center p-6 mb-4">
                            <img
                              src={offer.logo_url}
                              alt={offer.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-primary/40 text-5xl">🛒</span>
                          </div>
                        )}

                        {/* Rating */}
                        {offer.rating !== null && (
                          <div className="flex flex-col items-center mb-4">
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.round(offer.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-muted text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-2xl font-bold">
                              {offer.rating.toFixed(1)} / 5
                            </span>
                          </div>
                        )}

                        {/* CTA */}
                        <OfferButton
                          offerId={offer.id}
                          siteId={site.id}
                          affiliateUrl={offer.affiliate_url}
                          source="category_list"
                        />
                      </div>

                      {/* Right: Details */}
                      <div>
                        <h3 className="text-2xl font-bold mb-3">{offer.name}</h3>

                        {offer.short_description && (
                          <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                            {offer.short_description}
                          </p>
                        )}

                        {/* Commission Info */}
                        {offer.commission_type && offer.commission_value && (
                          <div className="mb-6">
                            <Badge variant="secondary" className="text-sm">
                              {offer.commission_type === 'percentage'
                                ? `${offer.commission_value}% commission`
                                : `$${offer.commission_value} commission`}
                            </Badge>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Pros */}
                          {offer.pros && offer.pros.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-600" />
                                Pros
                              </h4>
                              <ul className="space-y-2">
                                {offer.pros.map((pro, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400"
                                  >
                                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Cons */}
                          {offer.cons && offer.cons.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <X className="h-5 w-5 text-red-500" />
                                Cons
                              </h4>
                              <ul className="space-y-2">
                                {offer.cons.map((con, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-red-500 dark:text-red-400"
                                  >
                                    <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles List */}
      {sortedPosts.length > 0 && (
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-[200px_1fr] gap-6">
                        {/* Image */}
                        {post.featured_image_url && (
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}

                        {/* Content */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.published_at || post.created_at || ''}>
                              {new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString()}
                            </time>
                          </div>
                          <h3 className="font-semibold text-xl mb-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {sortedOffers.length === 0 && sortedPosts.length === 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-lg">
              No content available in this category yet.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
