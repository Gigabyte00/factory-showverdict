/**
 * Category Showcase - Category Page Template
 *
 * Large featured items with prominent visual display.
 * Best for: Premium products, visual categories, curated selections
 */

import type { CategoryTemplateProps } from '@/lib/templates/config';
import type { Post, Offer } from '@/types';
import JsonLd from '@/components/JsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Tag, Award, Check, X } from 'lucide-react';
import { OfferButton } from '@/components/offers/offer-button';
import Link from 'next/link';

export default function CategoryShowcase({
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

  // Sort offers - featured first
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (b.priority || 0) - (a.priority || 0);
  });

  // Get featured content for hero showcase
  const featuredOffer = sortedOffers.find(o => o.is_featured) || sortedOffers[0];
  const featuredPost = sortedPosts[0];
  const remainingOffers = sortedOffers.filter(o => o.id !== featuredOffer?.id);
  const remainingPosts = sortedPosts.slice(1);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - ${site.name}`,
    description: category.description || `Explore ${category.name} content`,
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
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-7 w-7 text-primary" />
            <Badge variant="default" className="text-base px-4 py-1">
              {category.name}
            </Badge>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            {copy?.heroTitle || `Explore ${category.name}`}
          </h1>
          {category.description && (
            <p className="text-muted-foreground text-xl max-w-3xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Featured Showcase */}
      {featuredOffer && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              Featured Product
            </h2>
            <Card className="overflow-hidden ring-2 ring-primary/20">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Left: Image */}
                <div className="flex items-center justify-center">
                  {featuredOffer.featured_image_url ? (
                    <img
                      src={featuredOffer.featured_image_url}
                      alt={featuredOffer.name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  ) : featuredOffer.logo_url ? (
                    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-12">
                      <img
                        src={featuredOffer.logo_url}
                        alt={featuredOffer.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary/40 text-8xl">🛒</span>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="flex flex-col justify-center">
                  {/* Rating */}
                  {featuredOffer.rating !== null && (
                    <div className="flex items-center gap-2 mb-4">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${
                            i < Math.round(featuredOffer.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-2xl font-semibold">
                        {featuredOffer.rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-4xl font-bold mb-4">
                    {featuredOffer.name}
                  </h3>

                  {/* Description */}
                  {featuredOffer.short_description && (
                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                      {featuredOffer.short_description}
                    </p>
                  )}

                  {/* Pros */}
                  {featuredOffer.pros && featuredOffer.pros.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {featuredOffer.pros.slice(0, 4).map((pro, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-green-600 dark:text-green-400"
                        >
                          <Check className="h-5 w-5 flex-shrink-0" />
                          <span className="text-lg">{pro}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cons */}
                  {featuredOffer.cons && featuredOffer.cons.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {featuredOffer.cons.slice(0, 2).map((con, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-red-500 dark:text-red-400"
                        >
                          <X className="h-5 w-5 flex-shrink-0" />
                          <span className="text-lg">{con}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <OfferButton
                    offerId={featuredOffer.id}
                    siteId={site.id}
                    affiliateUrl={featuredOffer.affiliate_url}
                    source="category_showcase_featured"
                  />
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* More Products */}
      {remainingOffers.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">More Products</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {remainingOffers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden hover:shadow-xl transition">
                  <div className="grid md:grid-cols-2 gap-6 p-6">
                    {/* Image */}
                    <div className="flex items-center justify-center">
                      {offer.logo_url ? (
                        <div className="h-40 w-full bg-muted rounded-lg flex items-center justify-center p-6">
                          <img
                            src={offer.logo_url}
                            alt={offer.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary/40 text-5xl">🛒</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-center">
                      {offer.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{offer.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <h3 className="font-bold text-xl mb-3">{offer.name}</h3>
                      {offer.short_description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {offer.short_description}
                        </p>
                      )}
                      <OfferButton
                        offerId={offer.id}
                        siteId={site.id}
                        affiliateUrl={offer.affiliate_url}
                        source="category_showcase_grid"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {remainingPosts.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {remainingPosts.slice(0, 6).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition h-full">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={post.published_at || post.created_at || ''}>
                          {new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString()}
                        </time>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
