/**
 * Template System Configuration Types
 *
 * Defines the configuration interface for the hybrid template + AI customization system.
 * Templates provide professional structure while AI generates unique customization.
 */

import type { Post, Category, Offer, SiteContext } from '@/types';

/**
 * Base template configuration shared across all page types
 */
export interface BaseTemplateConfig {
  /**
   * Template variant to use (e.g., 'grid', 'masonry', 'magazine')
   */
  variant: string;

  /**
   * Theme customization specific to this page instance
   */
  theme: ThemeConfig;

  /**
   * AI-generated copy/messaging
   */
  copy: CopyConfig;
}

/**
 * Theme customization options
 */
export interface ThemeConfig {
  /**
   * Visual style for cards/components
   * - elevated: Shadows and depth
   * - flat: Minimal shadows, clean lines
   * - outlined: Borders instead of shadows
   */
  cardStyle?: 'elevated' | 'flat' | 'outlined';

  /**
   * Spacing density
   * - compact: Minimal whitespace, more content visible
   * - comfortable: Balanced spacing (default)
   * - spacious: Generous whitespace, premium feel
   */
  density?: 'compact' | 'comfortable' | 'spacious';

  /**
   * Optional accent color override (HSL format)
   * Overrides site's primary color for this page
   */
  accentColor?: string;

  /**
   * Border radius preference
   * - sharp: No rounding (0px)
   * - subtle: Minimal rounding (4px)
   * - rounded: Standard rounding (8px)
   * - pill: Maximum rounding (16px+)
   */
  corners?: 'sharp' | 'subtle' | 'rounded' | 'pill';
}

/**
 * Copy/messaging configuration
 */
export interface CopyConfig {
  /**
   * Main page heading
   */
  heroTitle?: string;

  /**
   * Supporting subheading/tagline
   */
  heroSubtitle?: string;

  /**
   * Section heading (e.g., "Latest Reviews")
   */
  sectionHeading?: string;

  /**
   * Call-to-action button text
   */
  ctaText?: string;

  /**
   * Empty state message when no content
   */
  emptyStateMessage?: string;
}

/**
 * Blog list page template configuration
 */
export interface BlogListTemplateConfig extends BaseTemplateConfig {
  pageType: 'blog-list';

  /**
   * Layout variant
   * - grid: 3-column grid (clean, organized)
   * - masonry: Pinterest-style (visual, dynamic)
   * - magazine: Mixed layout (featured + grid)
   * - list: Vertical list with large images
   */
  variant: 'grid' | 'masonry' | 'magazine' | 'list';

  /**
   * Whether to show post excerpts
   */
  showExcerpts?: boolean;

  /**
   * Featured card style (for magazine layout)
   * - horizontal: Image left, content right
   * - vertical: Image top, content bottom
   * - overlay: Text overlaid on image
   */
  featuredCardStyle?: 'horizontal' | 'vertical' | 'overlay';
}

/**
 * Post detail page template configuration
 */
export interface PostDetailTemplateConfig extends BaseTemplateConfig {
  pageType: 'post-detail';

  /**
   * Article layout variant
   * - standard: Default blog post layout
   * - longform: Optimized for >3000 words (TOC, chapters)
   * - review: Product review with ratings, pros/cons
   * - comparison: Side-by-side product comparison
   */
  variant: 'standard' | 'longform' | 'review' | 'comparison';

  /**
   * Whether to show table of contents
   */
  showTOC?: boolean;

  /**
   * Whether to show related posts
   */
  showRelatedPosts?: boolean;
}

/**
 * Offers page template configuration
 */
export interface OffersTemplateConfig extends BaseTemplateConfig {
  pageType: 'offers';

  /**
   * Offers layout variant
   * - grid: Card grid (browsing mode)
   * - table: Table view (comparison mode)
   * - carousel: Auto-rotating showcase
   */
  variant: 'grid' | 'table' | 'carousel';

  /**
   * Sort order
   * - featured: Editor's picks first
   * - price-low: Lowest price first
   * - price-high: Highest price first
   * - rating: Highest rated first
   */
  sortOrder?: 'featured' | 'price-low' | 'price-high' | 'rating';
}

/**
 * Category page template configuration
 */
export interface CategoryTemplateConfig extends BaseTemplateConfig {
  pageType: 'category';

  /**
   * Category layout variant
   * - grid: Product grid with filters
   * - showcase: Large featured items
   * - list: Detailed list view with specs
   */
  variant: 'grid' | 'showcase' | 'list';

  /**
   * Sort order for content
   * - recent: Most recent first
   * - rating: Highest rated first
   * - featured: Featured items first
   */
  sortOrder?: 'recent' | 'rating' | 'featured';

  /**
   * Whether to show filters
   */
  showFilters?: boolean;
}

/**
 * Homepage template configuration
 */
export interface HomepageTemplateConfig extends BaseTemplateConfig {
  pageType: 'homepage';

  /**
   * Homepage layout variant
   * - feature-first: Hero → Featured content → Grid
   * - content-first: Latest posts prominently
   * - product-first: Offers/products prominently
   */
  variant: 'feature-first' | 'content-first' | 'product-first';

  /**
   * Sections to include
   */
  sections?: {
    hero?: boolean;
    featuredPosts?: boolean;
    latestPosts?: boolean;
    topOffers?: boolean;
    categories?: boolean;
    newsletter?: boolean;
    trustSignals?: boolean;
  };
}

/**
 * Union type of all template configs
 */
export type TemplateConfig =
  | BlogListTemplateConfig
  | PostDetailTemplateConfig
  | OffersTemplateConfig
  | CategoryTemplateConfig
  | HomepageTemplateConfig;

/**
 * Template component props (what gets passed to the React component)
 */
export interface BlogListTemplateProps extends BlogListTemplateConfig {
  posts: Post[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  site: SiteContext;
}

export interface PostDetailTemplateProps extends PostDetailTemplateConfig {
  post: Post;
  category: Category | null;
  relatedPosts?: Post[];
  site: SiteContext;
  faqs?: Array<{ question: string; answer: string }>;
}

export interface OffersTemplateProps extends OffersTemplateConfig {
  offers: Offer[];
  categories: Category[];
  site: SiteContext;
}

export interface CategoryTemplateProps extends CategoryTemplateConfig {
  category: Category;
  posts: Post[];
  offers: Offer[];
  site: SiteContext;
}

/**
 * Template component type (React component that accepts template props)
 */
export type TemplateComponent<TProps = any> = React.FC<TProps>;

/**
 * Context passed to AI for template selection
 */
export interface TemplateSelectionContext {
  site: SiteContext;
  pageType: string;
  postCount?: number;
  wordCount?: number;
  hasImages?: boolean;
  businessModel?: 'affiliate' | 'blog' | 'ecommerce' | 'review';
  metadata?: Record<string, any>;
}
