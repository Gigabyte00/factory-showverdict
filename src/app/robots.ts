import { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/site-config';

/**
 * Dynamic robots.txt — optimized for traditional SEO + AI search citation (GEO).
 *
 * Policy (2026-07, evidence-based — see factory-seo-loop/data/geo-research-2026-07-04.md):
 * - ALLOW every search-index + live-fetch AI agent: these power citations in
 *   ChatGPT search, Claude, Perplexity, Copilot, Gemini. Blocking them removes us
 *   from AI answers; blocking training bots does NOT (BuzzStream 2026) — and fleet
 *   law forwards all traffic anyway, so everything stays allowed.
 * - UA tokens current as of 2026-07: OAI-SearchBot/ChatGPT-User (OpenAI),
 *   ClaudeBot/Claude-SearchBot/Claude-User (Anthropic — legacy "Claude-Web" retired),
 *   PerplexityBot/Perplexity-User, Google-Extended (Gemini grounding token),
 *   DuckAssistBot, MistralAI-User, Amzn-SearchBot, meta-externalfetcher.
 * - /go/ stays disallowed for index crawlers (redirect endpoints, no content);
 *   user-triggered fetchers ignore robots for user actions by design — that's fine.
 */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfig();

  const baseUrl = site.domain
    ? `https://${site.domain}`
    : `https://${site.slug}.vercel.app`;

  const disallowedPaths = [
    '/api/',   // API routes
    '/search', // Search results pages
    '/_next/', // Next.js internals
    '/go/',    // Affiliate redirect endpoints
  ];

  const contentAllow = ['/', '/blog/', '/offers/', '/compare/', '/tools/', '/best/', '/faq/', '/glossary/'];

  // Citation-critical: search-index + live-fetch agents (answer engines).
  const aiSearchAgents = [
    'OAI-SearchBot',       // OpenAI — ChatGPT search index (critical)
    'ChatGPT-User',        // OpenAI — live user-triggered fetch
    'ClaudeBot',           // Anthropic — crawler (replaces legacy Claude-Web)
    'Claude-SearchBot',    // Anthropic — search index
    'Claude-User',         // Anthropic — live user-triggered fetch
    'PerplexityBot',       // Perplexity — search index
    'Perplexity-User',     // Perplexity — live user-triggered fetch
    'Google-Extended',     // Google — Gemini grounding + training token
    'DuckAssistBot',       // DuckDuckGo AI
    'MistralAI-User',      // Mistral live fetch
    'Amzn-SearchBot',      // Amazon search/assistant
    'meta-externalfetcher',// Meta live fetch
    'Applebot',            // Apple — Siri/Spotlight index
  ];

  // Training/dataset crawlers — allowed (fleet keep-bots policy; no citation impact either way).
  const aiTrainingAgents = [
    'GPTBot',
    'CCBot',
    'Amazonbot',
    'Applebot-Extended',
    'Meta-ExternalAgent',
    'cohere-ai',
  ];

  return {
    rules: [
      ...aiSearchAgents.map((userAgent) => ({
        userAgent,
        allow: contentAllow,
        disallow: disallowedPaths,
      })),
      ...aiTrainingAgents.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: disallowedPaths,
      })),
      // Traditional search engines (feed Copilot + AI Overviews — never restrict)
      { userAgent: 'Googlebot', allow: '/', disallow: disallowedPaths },
      { userAgent: 'Bingbot', allow: '/', disallow: disallowedPaths },
      // Default
      { userAgent: '*', allow: '/', disallow: disallowedPaths },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
