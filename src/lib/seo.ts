/**
 * SEO helpers — canonical URL construction.
 *
 * Builds absolute URLs from the site's configured domain (falling back to the
 * <slug>.vercel.app preview domain, matching sitemap.ts behavior) so every page
 * can declare `alternates: { canonical }` without repeating the base-URL logic.
 */

import { getSiteConfig } from './site-config';

/** Absolute base URL for the current site, no trailing slash. */
export function siteBaseUrl(): string {
  const site = getSiteConfig();
  return site.domain
    ? `https://${site.domain}`
    : `https://${site.slug}.vercel.app`;
}

/** Absolute canonical URL for a path, e.g. canonicalUrl('/blog/my-post'). */
export function canonicalUrl(path = '/'): string {
  const base = siteBaseUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
