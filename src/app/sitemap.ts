import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';

/**
 * Dynamic XML Sitemap Generation
 *
 * Generates a sitemap including:
 * - Static pages (home, blog, offers, pSEO indexes)
 * - All published blog posts
 * - All active categories
 * - All active offers
 * - pSEO: Comparison pages (/compare/[slug])
 * - pSEO: Use-case pages (/for/[use-case])
 * - pSEO: Price tier pages (/best/[category]/under-[price])
 *
 * Automatically updates via ISR when content changes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteConfig();
  const supabase = createServerClient();

  // Base URL from site config or fallback
  const baseUrl = site.domain
    ? `https://${site.domain}`
    : `https://${site.slug}.vercel.app`;

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // pSEO index pages
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/best`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // AI Crawler Manifests (Answer Engine Optimization)
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/llms-full.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ];

  // Fetch all published blog posts with category info
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, category_id, published_at, updated_at')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Get category slugs for posts
  const postCategoryIds = [...new Set(posts?.map((p) => p.category_id).filter(Boolean) || [])];
  let postCategoryMap = new Map<string, string>();

  if (postCategoryIds.length > 0) {
    const { data: postCats } = await supabase
      .from('categories')
      .select('id, slug')
      .in('id', postCategoryIds as string[]);
    postCategoryMap = new Map(postCats?.map((c) => [c.id, c.slug]) || []);
  }

  const postUrls: MetadataRoute.Sitemap =
    posts?.map((post) => {
      const categorySlug = post.category_id
        ? postCategoryMap.get(post.category_id) || 'blog'
        : 'blog';
      return {
        url: `${baseUrl}/${categorySlug}/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    }) || [];

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('site_id', site.id);

  const categoryUrls: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: `${baseUrl}/${category.slug}`,
      lastModified: new Date(category.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || [];

  // Fetch all active offers
  const { data: offers } = await supabase
    .from('offers')
    .select('slug, updated_at')
    .eq('site_id', site.id)
    .eq('is_active', true);

  const offerUrls: MetadataRoute.Sitemap =
    offers?.map((offer) => ({
      url: `${baseUrl}/offers/${offer.slug}`,
      lastModified: new Date(offer.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || [];

  // ============================================================
  // pSEO: Comparison pages
  // ============================================================
  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('slug, updated_at, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published');

  const comparisonUrls: MetadataRoute.Sitemap =
    comparisons?.map((comparison) => ({
      url: `${baseUrl}/compare/${comparison.slug}`,
      lastModified: new Date(comparison.updated_at || comparison.published_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })) || [];

  // ============================================================
  // pSEO: Use-case pages
  // ============================================================
  const { data: useCases } = await supabase
    .from('use_cases')
    .select('slug, updated_at, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published');

  const useCaseUrls: MetadataRoute.Sitemap =
    useCases?.map((useCase) => ({
      url: `${baseUrl}/for/${useCase.slug}`,
      lastModified: new Date(useCase.updated_at || useCase.published_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })) || [];

  // ============================================================
  // pSEO: Price tier pages
  // ============================================================
  const { data: priceTiers } = await supabase
    .from('price_tiers')
    .select('slug, max_price, category_id, updated_at, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published');

  let priceTierUrls: MetadataRoute.Sitemap = [];
  const addedBestCategoryPages = new Set<string>();

  if (priceTiers && priceTiers.length > 0) {
    const tierCategoryIds = [...new Set(priceTiers.map((pt) => pt.category_id).filter(Boolean))];
    const { data: tierCats } = await supabase
      .from('categories')
      .select('id, slug')
      .in('id', tierCategoryIds as string[]);
    const tierCategoryMap = new Map(tierCats?.map((c) => [c.id, c.slug]) || []);

    for (const tier of priceTiers) {
      const categorySlug = tier.category_id ? tierCategoryMap.get(tier.category_id) : null;
      if (categorySlug) {
        // Add the specific budget page
        priceTierUrls.push({
          url: `${baseUrl}/best/${categorySlug}/under-${tier.max_price / 100}`,
          lastModified: new Date(tier.updated_at || tier.published_at || new Date()),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        });

        // Add the category-level best picks page (once per category)
        if (!addedBestCategoryPages.has(categorySlug)) {
          addedBestCategoryPages.add(categorySlug);
          priceTierUrls.push({
            url: `${baseUrl}/best/${categorySlug}`,
            lastModified: new Date(tier.updated_at || new Date()),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
          });
        }
      }
    }
  }

  // ============================================================
  // Interactive Tools: Calculators
  // ============================================================
  const { data: calculators } = await supabase
    .from('calculator_templates')
    .select('slug, updated_at')
    .eq('site_id', site.id)
    .eq('is_active', true);

  const calculatorUrls: MetadataRoute.Sitemap =
    calculators?.map((calc) => ({
      url: `${baseUrl}/tools/calculators/${calc.slug}`,
      lastModified: new Date(calc.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })) || [];

  // ============================================================
  // Interactive Tools: Quizzes
  // ============================================================
  const { data: quizzes } = await supabase
    .from('quiz_templates')
    .select('slug, updated_at')
    .eq('site_id', site.id)
    .eq('is_active', true);

  const quizUrls: MetadataRoute.Sitemap =
    quizzes?.map((quiz) => ({
      url: `${baseUrl}/tools/quizzes/${quiz.slug}`,
      lastModified: new Date(quiz.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })) || [];

  // ============================================================
  // E-E-A-T / Trust pages
  // ============================================================
  const trustStaticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/authors`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Author profile pages
  const { data: authors } = await supabase
    .from('authors')
    .select('slug, updated_at')
    .eq('site_id', site.id);

  const authorUrls: MetadataRoute.Sitemap =
    authors?.map((author) => ({
      url: `${baseUrl}/authors/${author.slug}`,
      lastModified: new Date(author.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })) || [];

  // FAQ detail pages
  const { data: faqs } = await supabase
    .from('faq_items')
    .select('slug, updated_at')
    .eq('site_id', site.id)
    .eq('status', 'published');

  const faqUrls: MetadataRoute.Sitemap =
    faqs?.map((faq) => ({
      url: `${baseUrl}/faq/${faq.slug}`,
      lastModified: new Date(faq.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })) || [];

  // Glossary term pages
  const { data: terms } = await supabase
    .from('glossary_terms')
    .select('slug, updated_at')
    .eq('site_id', site.id)
    .eq('status', 'published');

  const glossaryUrls: MetadataRoute.Sitemap =
    terms?.map((term) => ({
      url: `${baseUrl}/glossary/${term.slug}`,
      lastModified: new Date(term.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })) || [];

  // Topic cluster pages
  const { data: topicClusters } = await supabase
    .from('topic_clusters')
    .select('slug, updated_at')
    .eq('site_id', site.id)
    .eq('status', 'published');

  const topicUrls: MetadataRoute.Sitemap =
    topicClusters?.map((topic) => ({
      url: `${baseUrl}/topics/${topic.slug}`,
      lastModified: new Date(topic.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })) || [];

  return [
    ...staticPages,
    ...trustStaticPages,
    ...postUrls,
    ...categoryUrls,
    ...offerUrls,
    ...comparisonUrls,
    ...useCaseUrls,
    ...priceTierUrls,
    ...calculatorUrls,
    ...quizUrls,
    ...authorUrls,
    ...faqUrls,
    ...glossaryUrls,
    ...topicUrls,
  ];
}
