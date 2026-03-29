/**
 * Category Grid - Category Page Template
 *
 * Product grid with filters for browsing category content.
 * Best for: Default category view, general browsing
 */

'use client';

import { useState } from 'react';
import type { CategoryTemplateProps } from '@/lib/templates/config';
import type { Post, Offer } from '@/types';
import JsonLd from '@/components/JsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Tag } from 'lucide-react';
import { OfferButton } from '@/components/offers/offer-button';
import Link from 'next/link';

type ContentFilter = 'all' | 'posts' | 'offers';

export default function CategoryGrid({
  category,
  posts,
  offers,
  site,
  theme,
  copy,
  sortOrder = 'recent',
  showFilters = true,
}: CategoryTemplateProps) {
  const [filter, setFilter] = useState<ContentFilter>('all');

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortOrder) {
      case 'recent':
      default:
        const dateB = new Date(b.published_at || b.created_at || Date.now()).getTime();
        const dateA = new Date(a.published_at || a.created_at || Date.now()).getTime();
        return dateB - dateA;
    }
  });

  // Sort offers
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (b.priority || 0) - (a.priority || 0);
  });

  // Filtered content
  const filteredPosts = filter === 'all' || filter === 'posts' ? sortedPosts : [];
  const filteredOffers = filter === 'all' || filter === 'offers' ? sortedOffers : [];

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} - ${site.name}`,
    description: category.description || `Browse ${category.name} content`,
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
            {copy?.heroTitle || category.name}
          </h1>
          {category.description && (
            <p className="text-muted-foreground text-lg max-w-3xl">
              {category.description}
            </p>
          )}
          <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
            <span>{posts.length} articles</span>
            <span>{offers.length} products</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      {showFilters && (
        <section className="bg-background border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                All ({posts.length + offers.length})
              </Button>
              <Button
                variant={filter === 'posts' ? 'default' : 'outline'}
                onClick={() => setFilter('posts')}
                size="sm"
              >
                Articles ({posts.length})
              </Button>
              <Button
                variant={filter === 'offers' ? 'default' : 'outline'}
                onClick={() => setFilter('offers')}
                size="sm"
              >
                Products ({offers.length})
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Content Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {filteredPosts.length === 0 && filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No content available in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Posts */}
              {filteredPosts.map((post) => (
                <PostCard key={`post-${post.id}`} post={post} site={site} />
              ))}

              {/* Offers */}
              {filteredOffers.map((offer) => (
                <OfferCard key={`offer-${offer.id}`} offer={offer} siteId={site.id} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  site: { domain: string | null };
}

function PostCard({ post, site }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
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
          <h3 className="font-semibold text-xl mb-2 line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

interface OfferCardProps {
  offer: Offer;
  siteId: string;
}

function OfferCard({ offer, siteId }: OfferCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition h-full">
      {offer.featured_image_url ? (
        <img
          src={offer.featured_image_url}
          alt={offer.name}
          className="w-full h-48 object-cover"
        />
      ) : offer.logo_url ? (
        <div className="w-full h-48 bg-muted flex items-center justify-center p-8">
          <img
            src={offer.logo_url}
            alt={offer.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <span className="text-primary/40 text-4xl">🛒</span>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          {offer.is_featured && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
          {offer.rating && (
            <div className="flex items-center text-yellow-500 text-sm">
              <Star className="h-4 w-4 fill-yellow-500 mr-1" />
              <span className="text-muted-foreground">
                {offer.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <h3 className="font-semibold text-xl mb-2">{offer.name}</h3>
        {offer.short_description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {offer.short_description}
          </p>
        )}
        <OfferButton
          offerId={offer.id}
          siteId={siteId}
          affiliateUrl={offer.affiliate_url}
          source="category_page"
        />
      </CardContent>
    </Card>
  );
}
