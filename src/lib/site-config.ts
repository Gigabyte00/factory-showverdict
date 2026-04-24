import { cache } from 'react';
import type { SiteContext, ThemeConfig, SiteSettings } from '../types';

/**
 * Convert hex color to HSL triplet string for CSS variables.
 * e.g. "#16a34a" → "142 76% 36%"
 */
function hexToHSL(hex: string): string {
  // Remove # prefix
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return `0 0% ${Math.round(l * 100)}%`;
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let hue = 0;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;

  return `${Math.round(hue * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Get the site configuration from environment variables
 *
 * This is the single-site version - all config comes from env vars,
 * not from database lookup. This makes each deployment independent.
 */
export const getSiteConfig = cache((): SiteContext => {
  // Required env vars (trimmed to guard against trailing-newline issues in env var values)
  const id = process.env.SITE_ID?.trim();
  const slug = process.env.SITE_SLUG?.trim();
  const name = process.env.SITE_NAME?.trim();

  if (!id || !slug || !name) {
    throw new Error(
      'Missing required environment variables: SITE_ID, SITE_SLUG, SITE_NAME'
    );
  }

  // Parse theme config from JSON env var or use defaults
  let theme_config: ThemeConfig | null = null;
  if (process.env.SITE_THEME_CONFIG) {
    try {
      theme_config = JSON.parse(process.env.SITE_THEME_CONFIG);
    } catch {
      console.warn('Failed to parse SITE_THEME_CONFIG, using defaults');
    }
  }

  // Fallback theme if not provided
  if (!theme_config) {
    theme_config = {
      primaryColor: process.env.SITE_PRIMARY_COLOR || '#3B82F6',
      accentColor: process.env.SITE_ACCENT_COLOR || '#2563EB',
      fontFamily: process.env.SITE_FONT_FAMILY || 'Inter',
      logoUrl: process.env.SITE_LOGO_URL || null,
    };
  }

  // Parse settings from JSON env var or build from individual vars
  let settings: SiteSettings | null = null;
  if (process.env.SITE_SETTINGS) {
    try {
      settings = JSON.parse(process.env.SITE_SETTINGS);
    } catch {
      console.warn('Failed to parse SITE_SETTINGS, using defaults');
    }
  }

  if (!settings) {
    settings = {
      footerText: process.env.SITE_FOOTER_TEXT || null,
      socialLinks: buildSocialLinks(),
      plausibleDomain: process.env.SITE_PLAUSIBLE_DOMAIN || null,
      site_type: (process.env.SITE_TYPE as SiteSettings['site_type']) || 'affiliate',
      features: {
        blog: process.env.SITE_FEATURE_BLOG !== 'false',
        offers: process.env.SITE_FEATURE_OFFERS !== 'false',
        newsletter: process.env.SITE_FEATURE_NEWSLETTER === 'true',
      },
    };
  }

  return {
    id,
    slug,
    name,
    description: process.env.SITE_DESCRIPTION?.trim() || null,
    domain: process.env.SITE_DOMAIN?.trim() || null,
    niche: process.env.SITE_NICHE?.trim() || null,
    theme_config,
    settings,
    is_active: true, // If deployed, it's active
  };
});

/**
 * Build social links from individual env vars
 */
function buildSocialLinks(): Record<string, string> {
  const links: Record<string, string> = {};
  if (process.env.SITE_SOCIAL_TWITTER) links.twitter = process.env.SITE_SOCIAL_TWITTER;
  if (process.env.SITE_SOCIAL_INSTAGRAM) links.instagram = process.env.SITE_SOCIAL_INSTAGRAM;
  if (process.env.SITE_SOCIAL_YOUTUBE) links.youtube = process.env.SITE_SOCIAL_YOUTUBE;
  return links;
}

/**
 * Get hero section configuration from env vars
 */
export function getHeroConfig(site: SiteContext) {
  const trim = (v: string | undefined) => v?.trim() || undefined;
  return {
    tagline: process.env.SITE_HERO_TAGLINE || site.name,
    subtitle: process.env.SITE_HERO_SUBTITLE ||
      `Expert reviews, honest comparisons, and the best deals on ${site.niche || 'products'} — helping you make smarter buying decisions.`,
    accentWord: process.env.SITE_HERO_ACCENT_WORD || null,
    variant: (process.env.SITE_HERO_VARIANT || 'dark') as 'dark' | 'split' | 'minimal' | 'gradient-brand',
    // Optional per-site hero imagery. imageUrl renders as a photo; backgroundUrl renders as a dimmed full-bleed backdrop.
    // Both are intentionally separate so a niche can use either a product shot (split/minimal variants) or an atmospheric backdrop (dark/gradient-brand variants).
    imageUrl: trim(process.env.SITE_HERO_IMAGE),
    imageAlt: trim(process.env.SITE_HERO_IMAGE_ALT),
    backgroundUrl: trim(process.env.SITE_HERO_BACKGROUND),
  };
}

/**
 * Get CTA configuration from env vars
 */
export function getCTAConfig() {
  const trim = (v: string | undefined) => v?.trim() || undefined;
  return {
    primaryText: trim(process.env.SITE_CTA_PRIMARY_TEXT),
    primaryUrl: trim(process.env.SITE_CTA_PRIMARY_URL),
    secondaryText: trim(process.env.SITE_CTA_SECONDARY_TEXT),
    secondaryUrl: trim(process.env.SITE_CTA_SECONDARY_URL),
    categoriesTitle: trim(process.env.SITE_CATEGORIES_TITLE) || 'Explore by Topic',
    articlesTitle: trim(process.env.SITE_ARTICLES_TITLE) || 'Latest Articles',
    articlesLabel: trim(process.env.SITE_ARTICLES_LABEL) || 'Latest Insights',
    finalCtaHeading: trim(process.env.SITE_FINAL_CTA_HEADING),
    finalCtaSubtext: trim(process.env.SITE_FINAL_CTA_SUBTEXT),
  };
}

/**
 * Get homepage section order from env var.
 * Default: hero,how-it-works,stats,offers,testimonials,categories,articles,newsletter,faq,cta
 */
export function getHomepageSections(): string[] {
  const raw = process.env.SITE_HOMEPAGE_SECTIONS;
  if (!raw) return ['hero', 'how-it-works', 'stats', 'offers', 'testimonials', 'categories', 'articles', 'newsletter', 'faq', 'cta'];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Get HowItWorks step customization from env var (JSON array of 3 steps).
 * Each step: { title: string, description: string }
 */
export function getHowItWorksSteps(): Array<{ title: string; description: string }> | null {
  const raw = process.env.SITE_HOW_IT_WORKS_STEPS;
  if (!raw) return null;
  try {
    const steps = JSON.parse(raw);
    if (Array.isArray(steps) && steps.length === 3) return steps;
  } catch { /* fall through */ }
  return null;
}

/**
 * Get testimonials from env var (JSON array) or return empty array
 */
export function getTestimonials(): Array<{ name: string; context: string; quote: string; rating: number; isSample?: boolean }> {
  const raw = process.env.SITE_TESTIMONIALS;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Get CSS variables for the site's theme.
 * Outputs both legacy --color-primary (hex) and --primary (HSL triplet)
 * so Tailwind's hsl(var(--primary)) system works with per-site colors.
 * Also outputs --secondary if SITE_SECONDARY_COLOR is set.
 */
export function getSiteThemeVars(site: SiteContext): Record<string, string> {
  const theme = site.theme_config;
  const primaryHex = theme?.primaryColor || '#3B82F6';
  const accentHex = theme?.accentColor || '#2563EB';
  const secondaryHex = process.env.SITE_SECONDARY_COLOR;

  const vars: Record<string, string> = {
    // HSL triplets for shadcn/Tailwind system
    '--primary': hexToHSL(primaryHex),
    '--ring': hexToHSL(primaryHex),
    // Legacy hex values for backward compat
    '--color-primary': primaryHex,
    '--color-accent': accentHex,
    '--font-family': theme?.fontFamily || 'Inter',
  };

  if (secondaryHex) {
    vars['--site-secondary'] = hexToHSL(secondaryHex);
    vars['--color-secondary'] = secondaryHex;
  }

  return vars;
}
