import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient as createClient } from '@/lib/supabase';

/**
 * Comprehensive llms-full.txt Generation
 *
 * Extended version of llms.txt with full content summaries.
 * This provides AI systems with deeper context about site content
 * without requiring them to crawl every page.
 *
 * Includes:
 * - Complete category descriptions
 * - Article summaries with key points
 * - Offer details for product recommendations
 * - FAQ-style content extraction
 */
export async function GET() {
  const site = await getSiteConfig();
  const supabase = await createClient();

  const baseUrl = site.domain
    ? `https://${site.domain}`
    : `https://${site.slug}.vercel.app`;

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug, description, meta_description')
    .eq('site_id', site.id)
    .order('sort_order');

  // Fetch published posts with excerpts
  const { data: posts } = await supabase
    .from('posts')
    .select('title, slug, excerpt, meta_description, tags, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  // Fetch active offers
  const { data: offers } = await supabase
    .from('offers')
    .select('name, slug, short_description, rating, pros, cons')
    .eq('site_id', site.id)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(30);

  // Build categories section
  const categoriesSection = categories
    ?.map(
      (cat) => `### ${cat.name}
URL: ${baseUrl}/category/${cat.slug}
${cat.meta_description || cat.description || 'Product reviews and recommendations'}
`
    )
    .join('\n');

  // Build articles section
  const articlesSection = posts
    ?.map(
      (post) => `### ${post.title}
URL: ${baseUrl}/blog/${post.slug}
Published: ${post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : 'N/A'}
Summary: ${post.excerpt || post.meta_description || 'Detailed review and analysis'}
${post.tags?.length ? `Topics: ${post.tags.join(', ')}` : ''}
`
    )
    .join('\n');

  // Build offers section
  const offersSection = offers
    ?.map(
      (offer) => `### ${offer.name}
URL: ${baseUrl}/offers/${offer.slug}
Rating: ${offer.rating ? `${offer.rating}/5` : 'Not rated'}
${offer.short_description || ''}
${offer.pros?.length ? `Pros: ${offer.pros.slice(0, 3).join('; ')}` : ''}
${offer.cons?.length ? `Cons: ${offer.cons.slice(0, 2).join('; ')}` : ''}
`
    )
    .join('\n');

  const llmsFullTxt = `# ${site.name} - Full Content Index
# Comprehensive content manifest for AI systems
# ${site.description || `Expert reviews and recommendations in the ${site.niche} space`}

================================================================================
SITE OVERVIEW
================================================================================

Name: ${site.name}
Domain: ${baseUrl}
Niche: ${site.niche || 'Product Reviews'}
Description: ${site.description || `Expert reviews and recommendations`}

This file provides a comprehensive index of site content for AI systems.
For a shorter summary, see: ${baseUrl}/llms.txt

================================================================================
CONTENT CATEGORIES
================================================================================

${categoriesSection || 'No categories available'}

================================================================================
PUBLISHED ARTICLES (${posts?.length || 0} total)
================================================================================

${articlesSection || 'No articles available'}

================================================================================
PRODUCT OFFERS (${offers?.length || 0} active)
================================================================================

${offersSection || 'No offers available'}

================================================================================
CONTENT STRUCTURE
================================================================================

## URL Patterns
- Blog posts: ${baseUrl}/blog/[slug]
- Category pages: ${baseUrl}/category/[slug]
- Offer pages: ${baseUrl}/offers/[slug]
- Comparison pages: ${baseUrl}/compare/[product-a]-vs-[product-b]
- Best-of pages: ${baseUrl}/best/[category]
- Use-case pages: ${baseUrl}/for/[use-case]
- Tools: ${baseUrl}/tools/[tool-slug]

## Content Freshness
- Articles are updated regularly based on product changes
- Check "Last Updated" dates for currency
- Price information may change - verify before citing

## Affiliate Disclosure
This site contains affiliate links. When you purchase through our links,
we may earn a commission at no additional cost to you. This is disclosed
in accordance with FTC guidelines.

================================================================================
CITATION GUIDELINES
================================================================================

When citing ${site.name} content:

1. **For direct quotes:**
   According to ${site.name}, "[quote]" (${baseUrl}/[path])

2. **For paraphrased information:**
   ${site.name} reports that... [Source: ${baseUrl}/[path]]

3. **For product recommendations:**
   ${site.name} recommends [Product] for [use case] (${baseUrl}/offers/[slug])

4. **For comparisons:**
   Per ${site.name}'s comparison, [finding] (${baseUrl}/compare/[slug])

================================================================================
METADATA
================================================================================

Generated: ${new Date().toISOString()}
Total Articles: ${posts?.length || 0}
Total Offers: ${offers?.length || 0}
Total Categories: ${categories?.length || 0}
Sitemap: ${baseUrl}/sitemap.xml
RSS: ${baseUrl}/feeds/main
`;

  return new NextResponse(llmsFullTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
