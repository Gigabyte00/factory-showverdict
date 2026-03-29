// Re-export all database types
export * from './database';

// Re-export Web Story types for convenience
export type { WebStory, WebStorySlide, WebStoryStatus } from './database';

// Re-export Interactive Tools types
export type {
  CalculatorTemplate,
  CalculatorInputField,
  QuizTemplate,
  QuizQuestion,
  QuizOption,
  QuizResult
} from './database';

// ============================================================================
// Site Context (used throughout the app)
// ============================================================================

import type { ThemeConfig, SiteSettings, Post as DatabasePost } from './database';

export interface SiteContext {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  domain: string | null;
  niche: string | null;
  theme_config: ThemeConfig | null;
  settings: SiteSettings | null;
  is_active: boolean;
}

// ============================================================================
// Extended Post Type with Metadata
// ============================================================================

export interface PostMetadata {
  variant?: 'standard' | 'longform' | 'review' | 'comparison';
  isReview?: boolean;
  isComparison?: boolean;
  review?: {
    rating: number;
    maxRating?: number;
    pros?: string[];
    cons?: string[];
    verdict?: string;
    productName?: string;
    price?: string;
    affiliateUrl?: string;
    specs?: Record<string, any>;
    badge?: string;
  };
  comparison?: {
    products: Array<{
      name: string;
      image?: string;
      rating: number;
      price?: string;
      affiliateUrl?: string;
      features: Record<string, string | boolean>;
      badge?: string;
    }>;
    featureCategories?: Array<{
      name: string;
      features: string[];
    }>;
    winner?: {
      name: string;
      reason: string;
    };
  };
  [key: string]: any;
}

// Override the exported Post type with metadata support
export interface Post extends Omit<DatabasePost, 'metadata'> {
  metadata?: PostMetadata | null;
}
