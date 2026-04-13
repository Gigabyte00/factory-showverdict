import { cache } from 'react';
import { createServerClient } from './supabase';
import { getSiteConfig } from './site-config';

// ============================================================================
// Navigation Types (partial queries for performance)
// ============================================================================

export interface NavCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number | null;
}

// ============================================================================
// Cached Query Functions for Server Components
// ============================================================================

/**
 * Get all active categories for navigation
 * Cached per request to avoid duplicate fetches
 */
export const getCategories = cache(async (): Promise<NavCategory[]> => {
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, sort_order')
    .eq('site_id', site.id)
    .order('sort_order');

  if (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }

  return data || [];
});

/**
 * Get recent published posts for this site.
 * Used by legacy site-specific /resources pages (e.g. termhaven). Keep
 * exported from this barrel so sites that predate the blog refactor can
 * still import it without maintaining a site-local queries file.
 */
export interface RecentPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
}

export const getRecentPosts = cache(async (limit = 20): Promise<RecentPost[]> => {
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, featured_image_url, published_at, reading_time_minutes')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch recent posts:', error);
    return [];
  }

  return data || [];
});

/**
 * Get published posts tagged with a given tag.
 * Used by site-specific pSEO hub pages (e.g. capitalready's /business-loans/[type])
 * that filter editorial content by tag. Matches on the `tags` text[] column.
 */
export const getPostsByTag = cache(
  async (tag: string, limit = 20): Promise<RecentPost[]> => {
    const site = getSiteConfig();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('posts')
      .select('id, slug, title, excerpt, featured_image_url, published_at, reading_time_minutes')
      .eq('site_id', site.id)
      .eq('status', 'published')
      .contains('tags', [tag])
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Failed to fetch posts by tag "${tag}":`, error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get navigation links (categories + static pages)
 *
 * `staticLinks` appear in the primary header nav (capped at 6 total with categories).
 * `resourceLinks` are knowledge-base / trust pages — consumed by the footer and mobile
 * nav drawer but kept out of the primary header to avoid overflow.
 */
export const getNavLinks = cache(async () => {
  const categories = await getCategories();

  return {
    categories: categories.map((cat) => ({
      name: cat.name,
      href: `/category/${cat.slug}`,
    })),
    staticLinks: [
      { name: 'Blog', href: '/blog' },
      { name: 'Offers', href: '/offers' },
      { name: 'Tools', href: '/tools' },
    ],
    resourceLinks: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Glossary', href: '/glossary' },
      { name: 'Topics', href: '/topics' },
    ],
    trustLinks: [
      { name: 'Methodology', href: '/methodology' },
      { name: 'Authors', href: '/authors' },
      { name: 'Editorial Standards', href: '/methodology#standards' },
      { name: 'About', href: '/about' },
    ],
  };
});
