/**
 * Template Registry
 *
 * Maps variant strings to actual React component implementations.
 * As new template variants are created, they're registered here.
 */

import type {
  TemplateComponent,
  BlogListTemplateProps,
  PostDetailTemplateProps,
  OffersTemplateProps,
  CategoryTemplateProps,
} from './config';

// Template component imports
import GridVariant from '@/templates/blog-list/GridVariant';
import MasonryVariant from '@/templates/blog-list/MasonryVariant';
import MagazineVariant from '@/templates/blog-list/MagazineVariant';
import ListVariant from '@/templates/blog-list/ListVariant';

// Post Detail Template Imports
import StandardArticle from '@/templates/post-detail/StandardArticle';
import LongformArticle from '@/templates/post-detail/LongformArticle';
import ReviewArticle from '@/templates/post-detail/ReviewArticle';
import ComparisonArticle from '@/templates/post-detail/ComparisonArticle';

// Offers Page Template Imports
import OffersGrid from '@/templates/offers/OffersGrid';
import OffersTable from '@/templates/offers/OffersTable';
import OffersCarousel from '@/templates/offers/OffersCarousel';

// Category Page Template Imports
import CategoryGrid from '@/templates/category/CategoryGrid';
import CategoryShowcase from '@/templates/category/CategoryShowcase';
import CategoryList from '@/templates/category/CategoryList';

/**
 * Blog List Templates
 */
export const BLOG_LIST_TEMPLATES: Record<string, TemplateComponent<BlogListTemplateProps>> = {
  grid: GridVariant,
  masonry: MasonryVariant,
  magazine: MagazineVariant,
  list: ListVariant,
};

/**
 * Post Detail Templates
 */
export const POST_DETAIL_TEMPLATES: Record<string, TemplateComponent<PostDetailTemplateProps>> = {
  standard: StandardArticle,
  longform: LongformArticle,
  review: ReviewArticle,
  comparison: ComparisonArticle,
};

/**
 * Offers Page Templates
 */
export const OFFERS_TEMPLATES: Record<string, TemplateComponent<OffersTemplateProps>> = {
  grid: OffersGrid,
  table: OffersTable,
  carousel: OffersCarousel,
};

/**
 * Category Page Templates
 */
export const CATEGORY_TEMPLATES: Record<string, TemplateComponent<CategoryTemplateProps>> = {
  grid: CategoryGrid,
  showcase: CategoryShowcase,
  list: CategoryList,
};

/**
 * Master template registry
 */
export const TEMPLATES = {
  'blog-list': BLOG_LIST_TEMPLATES,
  'post-detail': POST_DETAIL_TEMPLATES,
  offers: OFFERS_TEMPLATES,
  category: CATEGORY_TEMPLATES,
} as const;

/**
 * Get template component by page type and variant
 *
 * @param pageType - Type of page (blog-list, post-detail, etc.)
 * @param variant - Template variant (grid, masonry, etc.)
 * @returns Template component or undefined if not found
 */
export function getTemplate(
  pageType: keyof typeof TEMPLATES,
  variant: string
): TemplateComponent | undefined {
  const templateSet = TEMPLATES[pageType];
  return templateSet?.[variant];
}

/**
 * Check if a template variant exists
 *
 * @param pageType - Type of page
 * @param variant - Template variant
 * @returns True if template exists
 */
export function hasTemplate(pageType: keyof typeof TEMPLATES, variant: string): boolean {
  return !!getTemplate(pageType, variant);
}

/**
 * Get all available variants for a page type
 *
 * @param pageType - Type of page
 * @returns Array of variant names
 */
export function getAvailableVariants(pageType: keyof typeof TEMPLATES): string[] {
  const templateSet = TEMPLATES[pageType];
  return Object.keys(templateSet || {});
}

/**
 * Get default variant for a page type
 *
 * @param pageType - Type of page
 * @returns Default variant name
 */
export function getDefaultVariant(pageType: keyof typeof TEMPLATES): string {
  const defaults: Record<keyof typeof TEMPLATES, string> = {
    'blog-list': 'grid',
    'post-detail': 'standard',
    offers: 'grid',
    category: 'grid',
  };
  return defaults[pageType];
}
