/**
 * Template System Entry Point
 *
 * Export all public APIs from the template system.
 */

// Configuration types
export type {
  BaseTemplateConfig,
  ThemeConfig,
  CopyConfig,
  BlogListTemplateConfig,
  PostDetailTemplateConfig,
  OffersTemplateConfig,
  CategoryTemplateConfig,
  HomepageTemplateConfig,
  TemplateConfig,
  BlogListTemplateProps,
  PostDetailTemplateProps,
  OffersTemplateProps,
  CategoryTemplateProps,
  TemplateComponent,
  TemplateSelectionContext,
} from './config';

// Template registry
export {
  TEMPLATES,
  BLOG_LIST_TEMPLATES,
  POST_DETAIL_TEMPLATES,
  OFFERS_TEMPLATES,
  CATEGORY_TEMPLATES,
  getTemplate,
  hasTemplate,
  getAvailableVariants,
  getDefaultVariant,
} from './registry';

// Template selector
export { selectTemplateVariant, generateTemplateConfigWithAI, validateTemplateConfig } from './selector';
