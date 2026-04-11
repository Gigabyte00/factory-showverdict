import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import type { Post, Category } from '@/types';

interface ArticleCardProps {
  post: Post;
  category?: Category | null;
  variant?: 'default' | 'featured' | 'compact';
  /** Override the default /blog/{slug} URL */
  href?: string;
}

/**
 * Article card with thumbnail, category badge, and metadata
 *
 * Features:
 * - Gradient placeholder when no featured image
 * - Category badge with link
 * - Reading time and date
 * - Three variants: default, featured (large), compact
 */
export function ArticleCard({ post, category, variant = 'default', href }: ArticleCardProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const readingTime = post.reading_time_minutes || estimateReadingTime(post.word_count);
  const postUrl = href || `/blog/${post.slug}`;

  if (variant === 'featured') {
    return <FeaturedArticleCard post={post} category={category} publishedDate={publishedDate} readingTime={readingTime} href={postUrl} />;
  }

  if (variant === 'compact') {
    return <CompactArticleCard post={post} category={category} publishedDate={publishedDate} href={postUrl} />;
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      {/* Thumbnail or placeholder */}
      <Link href={postUrl} className="block relative aspect-video overflow-hidden">
        {post.featured_image_url ? (
          <>
            <div className="relative w-full h-full bg-muted animate-pulse">
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt || post.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </>
        ) : (
          <PlaceholderImage title={post.title} />
        )}
        {/* Category badge overlay — slides in on hover */}
        {category && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground transition-transform duration-300 -translate-x-1 group-hover:translate-x-0">
            {category.name}
          </Badge>
        )}
      </Link>

      <CardContent className="p-5">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={postUrl}>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Meta info + read more arrow */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min read
              </span>
            )}
            {publishedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {publishedDate}
              </span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Featured variant - larger card with horizontal layout on desktop
 */
function FeaturedArticleCard({
  post,
  category,
  publishedDate,
  readingTime,
  href,
}: {
  post: Post;
  category?: Category | null;
  publishedDate: string | null;
  readingTime: number;
  href: string;
}) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="md:flex">
        {/* Image section - larger */}
        <Link href={href} className="block relative md:w-1/2 aspect-video md:aspect-auto overflow-hidden">
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 md:min-h-[280px]"
            />
          ) : (
            <PlaceholderImage title={post.title} className="md:min-h-[280px]" />
          )}
        </Link>

        {/* Content section */}
        <CardContent className="p-6 md:w-1/2 flex flex-col justify-center">
          {category && (
            <Badge variant="secondary" className="w-fit mb-3">
              {category.name}
            </Badge>
          )}

          <h3 className="font-bold text-2xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={href}>
              {post.title}
            </Link>
          </h3>

          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3 mb-4">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readingTime} min read
              </span>
            )}
            {publishedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {publishedDate}
              </span>
            )}
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Read Article
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardContent>
      </div>
    </Card>
  );
}

/**
 * Compact variant - for sidebar or list views
 */
function CompactArticleCard({
  post,
  category,
  publishedDate,
  href,
}: {
  post: Post;
  category?: Category | null;
  publishedDate: string | null;
  href: string;
}) {
  return (
    <Link href={href} className="group flex gap-4 py-3">
      {/* Small thumbnail */}
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <PlaceholderImage title={post.title} className="rounded-lg" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {category && (
          <span className="text-xs text-primary font-medium">{category.name}</span>
        )}
        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h4>
        {publishedDate && (
          <span className="text-xs text-muted-foreground">{publishedDate}</span>
        )}
      </div>
    </Link>
  );
}

/**
 * Themed placeholder for articles without featured images.
 * Uses the site's primary color gradient with a subtle pattern overlay.
 */
function PlaceholderImage({ title, className = '' }: { title: string; className?: string }) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40 relative ${className}`}
      aria-hidden="true"
    >
      {/* Subtle diagonal line pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 11px
          )`,
        }}
      />
      {/* Large initial letter */}
      <span className="text-5xl font-bold text-white/40 relative z-10">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// Estimate reading time from word count
function estimateReadingTime(wordCount: number | null): number {
  if (!wordCount) return 0;
  return Math.ceil(wordCount / 200); // ~200 words per minute
}
