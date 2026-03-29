/**
 * Template Selector
 *
 * AI-powered template selection and configuration generation.
 * Analyzes site context to choose the best template variant and generate theme config.
 */

import type {
  TemplateConfig,
  TemplateSelectionContext,
  BlogListTemplateConfig,
  PostDetailTemplateConfig,
  ThemeConfig,
  CopyConfig,
} from './config';
import { getDefaultVariant } from './registry';

/**
 * Select the best template variant and generate configuration
 *
 * This is where AI integration would happen. For now, uses smart defaults
 * based on content analysis.
 *
 * @param pageType - Type of page being generated
 * @param context - Site and content context
 * @returns Template configuration with variant, theme, and copy
 */
export async function selectTemplateVariant(
  pageType: string,
  context: TemplateSelectionContext
): Promise<TemplateConfig> {
  switch (pageType) {
    case 'blog-list':
      return selectBlogListVariant(context);
    case 'post-detail':
      return selectPostDetailVariant(context);
    default:
      throw new Error(`Unknown page type: ${pageType}`);
  }
}

/**
 * Select blog list template variant based on content volume and niche
 */
async function selectBlogListVariant(context: TemplateSelectionContext): Promise<BlogListTemplateConfig> {
  const { site, postCount = 0 } = context;

  // Variant selection logic
  let variant: BlogListTemplateConfig['variant'] = 'grid'; // default

  if (postCount > 50) {
    variant = 'masonry'; // Visual density for high volume
  } else if (postCount > 30) {
    variant = 'magazine'; // Editorial feel for moderate volume
  } else if (postCount < 10) {
    variant = 'list'; // Detailed view for low volume
  }

  // Generate theme configuration
  const theme = generateThemeConfig(site);

  // Generate copy
  const copy = generateCopyConfig(site, 'blog-list');

  return {
    pageType: 'blog-list',
    variant,
    theme,
    copy,
    showExcerpts: true,
    featuredCardStyle: variant === 'magazine' ? 'horizontal' : 'vertical',
  };
}

/**
 * Select post detail template variant based on content characteristics
 */
async function selectPostDetailVariant(context: TemplateSelectionContext): Promise<PostDetailTemplateConfig> {
  const { site, wordCount = 0, metadata } = context;

  // Variant selection logic
  let variant: PostDetailTemplateConfig['variant'] = 'standard'; // default

  if (metadata?.isReview) {
    variant = 'review';
  } else if (metadata?.isComparison) {
    variant = 'comparison';
  } else if (wordCount > 3000) {
    variant = 'longform';
  }

  // Generate theme configuration
  const theme = generateThemeConfig(site);

  // Generate copy
  const copy = generateCopyConfig(site, 'post-detail');

  return {
    pageType: 'post-detail',
    variant,
    theme,
    copy,
    showTOC: variant === 'longform' || wordCount > 2000,
    showRelatedPosts: true,
  };
}

/**
 * Generate theme configuration based on site niche
 */
function generateThemeConfig(site: any): ThemeConfig {
  // Niche-specific theme mappings
  const nicheThemes: Record<string, Partial<ThemeConfig>> = {
    'electric bikes': {
      cardStyle: 'elevated',
      density: 'comfortable',
      corners: 'rounded',
    },
    'coffee makers': {
      cardStyle: 'flat',
      density: 'spacious',
      corners: 'sharp',
    },
    'smart home': {
      cardStyle: 'outlined',
      density: 'comfortable',
      corners: 'subtle',
    },
    'personal finance': {
      cardStyle: 'flat',
      density: 'compact',
      corners: 'sharp',
    },
  };

  // Get niche-specific theme or defaults
  const niche = site.niche?.toLowerCase() || '';
  const baseTheme = nicheThemes[niche] || {
    cardStyle: 'elevated' as const,
    density: 'comfortable' as const,
    corners: 'rounded' as const,
  };

  return baseTheme;
}

/**
 * Generate copy configuration based on site and page type
 */
function generateCopyConfig(site: any, pageType: string): CopyConfig {
  const siteName = site.name || 'Our Site';
  const niche = site.niche || 'products';

  // Page-specific copy generation
  const copyTemplates: Record<string, CopyConfig> = {
    'blog-list': {
      heroTitle: `Expert ${niche} Reviews`,
      heroSubtitle: `Unbiased testing. Real-world results. Find the perfect ${niche.toLowerCase()} for your needs.`,
      sectionHeading: 'Latest Reviews',
      ctaText: 'Read Full Review',
      emptyStateMessage: 'No articles yet. Check back soon!',
    },
    'post-detail': {
      ctaText: 'View Product',
      emptyStateMessage: 'Article not found.',
    },
  };

  return copyTemplates[pageType] || {};
}

/**
 * Generate AI-powered template configuration (future implementation)
 *
 * This function will call Claude API to analyze site context and generate
 * optimal template configuration with unique copy and theme.
 *
 * @param pageType - Type of page
 * @param context - Site and content context
 * @returns AI-generated template configuration
 */
export async function generateTemplateConfigWithAI(
  pageType: string,
  context: TemplateSelectionContext
): Promise<TemplateConfig> {
  // TODO: Implement Claude API integration
  // For now, fall back to smart defaults
  return selectTemplateVariant(pageType, context);
}

/**
 * Validate template configuration
 *
 * @param config - Template configuration to validate
 * @returns True if valid, throws error otherwise
 */
export function validateTemplateConfig(config: TemplateConfig): boolean {
  if (!config.variant) {
    throw new Error('Template config missing variant');
  }

  if (!config.theme) {
    throw new Error('Template config missing theme');
  }

  return true;
}
