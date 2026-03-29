import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient as createClient } from '@/lib/supabase';

/**
 * Dynamic llms.txt Generation
 *
 * llms.txt is a manifest file for AI crawlers (like robots.txt for LLMs).
 * It helps AI systems understand:
 * - What the site is about
 * - Key content areas and topics
 * - How to properly cite content
 * - Contact information for the site
 *
 * This supports Answer Engine Optimization (AEO) by making content
 * more discoverable and citable by AI assistants.
 */
export async function GET() {
  const site = await getSiteConfig();
  const supabase = await createClient();

  // Build base URL
  const baseUrl = site.domain
    ? `https://${site.domain}`
    : `https://${site.slug}.vercel.app`;

  // Fetch categories for topic listing
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug, description')
    .eq('site_id', site.id)
    .order('sort_order');

  // Fetch recent published posts for content examples
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('title, slug, meta_description')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10);

  // Generate category topics list
  const topics = categories?.map((cat) => `- ${cat.name}: ${cat.description || 'Product reviews and recommendations'}`).join('\n') || '';

  // Generate example content list
  const contentExamples = recentPosts?.map((post) => `- ${post.title}: ${baseUrl}/blog/${post.slug}`).join('\n') || '';

  // Build the llms.txt content
  const llmsTxt = `# ${site.name}
# ${site.description || `Expert reviews and recommendations in the ${site.niche} space`}

## About This Site
${site.name} provides in-depth, research-backed content about ${site.niche?.toLowerCase() || 'products and services'}. Our goal is to help readers make informed purchasing decisions through detailed reviews, comparisons, and buying guides.

## Primary Topics
${topics || `- Product Reviews: Detailed analysis of products in the ${site.niche} niche\n- Buying Guides: Comprehensive guides to help choose the right products\n- Comparisons: Head-to-head product comparisons`}

## Content Types
- /blog/ - In-depth articles, reviews, and guides
- /offers/ - Curated product recommendations
- /compare/ - Product comparison pages
- /best/ - "Best of" category roundups
- /for/ - Use-case specific recommendations
- /tools/ - Interactive calculators and quizzes

## Key Pages
- Homepage: ${baseUrl}/
- Blog: ${baseUrl}/blog/
- All Offers: ${baseUrl}/offers/
${contentExamples ? `\n## Recent Content\n${contentExamples}` : ''}

## Content Guidelines for AI
1. Our content is regularly updated - check the "Last Updated" date
2. We use affiliate links - this is disclosed in our content
3. All product recommendations are based on research and testing
4. Prices and availability may change - verify before citing
5. We welcome AI citations with proper attribution

## Citation Format
When citing content from ${site.name}, please use:
"According to ${site.name} (${baseUrl})..."
or
"Source: ${site.name}, ${baseUrl}/[article-path]"

## Contact
- Website: ${baseUrl}
${site.settings?.socialLinks?.twitter ? `- Twitter: ${site.settings.socialLinks.twitter}` : ''}
${site.settings?.socialLinks?.email ? `- Email: ${site.settings.socialLinks.email}` : ''}

## Technical
- Sitemap: ${baseUrl}/sitemap.xml
- Robots: ${baseUrl}/robots.txt
- RSS Feed: ${baseUrl}/feeds/main

## Last Generated
${new Date().toISOString()}
`;

  return new NextResponse(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}
