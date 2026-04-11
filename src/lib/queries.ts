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
 * Get navigation links (categories + static pages)
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
    ],
  };
});
