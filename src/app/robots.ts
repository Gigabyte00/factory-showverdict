import { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/site-config';

/**
 * Dynamic Robots.txt Generation
 *
 * Optimized for both traditional SEO and AI Search (Answer Engine Optimization):
 * - Allow all crawlers to access content
 * - Explicitly welcome AI crawlers for citation opportunities
 * - Block only non-indexable routes
 * - Reference sitemap and llms.txt for AI discovery
 */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfig();

  // Base URL from site config or fallback
  const baseUrl = site.domain
    ? `https://${site.domain}`
    : `https://${site.slug}.vercel.app`;

  // Routes that should not be indexed
  const disallowedPaths = [
    '/api/',        // API routes
    '/search',      // Search results pages
    '/_next/',      // Next.js internal routes
    '/go/',         // Affiliate redirect pages
  ];

  return {
    rules: [
      // ================================================================
      // AI Crawlers - Explicitly ALLOW for Answer Engine Optimization
      // These bots power AI assistants and search features
      // ================================================================
      {
        userAgent: 'GPTBot',           // OpenAI ChatGPT
        allow: [
          '/',
          '/blog/',
          '/offers/',
          '/compare/',
          '/tools/',
          '/llms.txt',
        ],
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Claude-Web',       // Anthropic Claude
        allow: [
          '/',
          '/blog/',
          '/offers/',
          '/compare/',
          '/tools/',
          '/llms.txt',
        ],
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Google-Extended',  // Google AI (Gemini/Bard)
        allow: [
          '/',
          '/blog/',
          '/offers/',
          '/compare/',
          '/tools/',
          '/llms.txt',
        ],
        disallow: disallowedPaths,
      },
      {
        userAgent: 'PerplexityBot',    // Perplexity AI
        allow: [
          '/',
          '/blog/',
          '/offers/',
          '/compare/',
          '/tools/',
          '/llms.txt',
        ],
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Amazonbot',        // Amazon Alexa
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Applebot-Extended', // Apple AI features
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'cohere-ai',        // Cohere AI
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Meta-ExternalAgent', // Meta AI
        allow: '/',
        disallow: disallowedPaths,
      },
      // ================================================================
      // Traditional Search Engines
      // ================================================================
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: disallowedPaths,
      },
      // ================================================================
      // Default rule for all other crawlers
      // ================================================================
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // Host directive helps AI crawlers identify canonical domain
    host: baseUrl,
  };
}
