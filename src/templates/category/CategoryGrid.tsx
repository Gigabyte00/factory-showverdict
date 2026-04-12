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
import { Star, Calendar, Tag, RefreshCw } from 'lucide-react';
import { OfferButton } from '@/components/offers/offer-button';
import { BookmarkButton } from '@/components/ui/bookmark-button';
import Link from 'next/link';
import Image from 'next/image';

/** Returns true when updated_at is more than 14 days newer than published_at — worth a "Recently updated" badge. */
function isRecentlyUpdated(publishedAt: string | null | undefined, updatedAt: string | null | undefined): boolean {
  if (!updatedAt || !publishedAt) return false;
  const gap = new Date(updatedAt).getTime() - new Date(publishedAt).getTime();
  return gap > 14 * 24 * 60 * 60 * 1000;
}

/** Short relative time for card badges — "2d ago", "3w ago", etc. */
function shortRelative(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

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
  const recentlyUpdated = isRecentlyUpdated(post.published_at, post.updated_at);
  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <BookmarkButton
          bookmark={{
            id: `post-${post.slug}`,
            type: 'post',
            title: post.title,
            url: `/blog/${post.slug}`,
            image: post.featured_image_url ?? undefined,
            excerpt: post.excerpt ?? undefined,
          }}
        />
      </div>
      <Link href={`/blog/${post.slug}`}>
        <Card className="overflow-hidden hover:shadow-lg transition h-full">
          {post.featured_image_url && (
            <div className="relative w-full h-48">
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground flex-wrap">
              {recentlyUpdated && post.updated_at ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Updated {shortRelative(post.updated_at)}
                </span>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.published_at || post.created_at || ''}>
                    {new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString()}
                  </time>
                </>
              )}
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
    </div>
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
        <div className="relative w-full h-48">
          <Image
            src={offer.featured_image_url}
            alt={offer.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : offer.logo_url ? (
        <div className="relative w-full h-48 bg-muted flex items-center justify-center p-8">
          <Image
            src={offer.logo_url}
            alt={offer.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-6"
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
