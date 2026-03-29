import { getSiteConfig, getHeroConfig, getTestimonials, getCTAConfig, getHomepageSections } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { Post, Category, Offer } from '@/types';

// Homepage components
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ArticleCard } from '@/components/home/ArticleCard';
import { FeaturedOffers } from '@/components/home/FeaturedOffers';
import { StatsBar } from '@/components/home/StatsBar';
import { TestimonialGrid } from '@/components/home/TestimonialGrid';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { HomepageFAQ } from '@/components/home/HomepageFAQ';
import { FinalCTA } from '@/components/home/FinalCTA';

// UI components
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Homepage with configurable section order via SITE_HOMEPAGE_SECTIONS env var.
 * Each site can show a different set of sections in a different order.
 */
export default async function HomePage() {
  const site = getSiteConfig();
  const hero = getHeroConfig(site);
  const testimonials = getTestimonials();
  const cta = getCTAConfig();
  const sections = getHomepageSections();
  const supabase = createServerClient();

  // Fetch all homepage data in parallel
  const [categoriesResult, postsResult, offersResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, slug, name, description')
      .eq('site_id', site.id)
      .order('sort_order'),

    supabase
      .from('posts')
      .select('id, slug, title, excerpt, featured_image_url, featured_image_alt, published_at, category_id, reading_time_minutes, word_count')
      .eq('site_id', site.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6),

    supabase
      .from('offers')
      .select('id, slug, name, short_description, logo_url, featured_image_url, affiliate_url, rating, pros, is_featured, is_active')
      .eq('site_id', site.id)
      .eq('is_active', true)
      .order('priority', { ascending: true, nullsFirst: false })
      .limit(10),
  ]);

  const categories = (categoriesResult.data || []) as Category[];
  const posts = (postsResult.data || []) as Post[];
  const offers = (offersResult.data || []) as Offer[];

  const categoriesWithCounts = await getCategoryCounts(supabase, site.id, categories);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', site.id)
    .eq('status', 'published');

  // Section map — each key maps to a rendered section (or null if data is empty)
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        key="hero"
        site={site}
        categoryCount={categories.length}
        postCount={totalPosts || posts.length}
        tagline={hero.tagline}
        subtitle={hero.subtitle}
        accentWord={hero.accentWord}
        variant={hero.variant}
        ctaPrimaryText={cta.primaryText}
        ctaPrimaryUrl={cta.primaryUrl}
        ctaSecondaryText={cta.secondaryText}
        ctaSecondaryUrl={cta.secondaryUrl}
      />
    ),

    'how-it-works': (
      <div key="how-it-works" className="animate-on-scroll">
        <HowItWorks />
      </div>
    ),

    'stats': (
      <div key="stats" className="animate-on-scroll">
        <StatsBar articles={totalPosts || 0} products={offers.length} />
      </div>
    ),

    'offers': offers.some(o => o.is_featured) ? (
      <div key="offers" className="animate-on-scroll">
        <FeaturedOffers
          offers={offers}
          siteId={site.id}
          title={`Top ${site.niche || 'Product'} Picks`}
          subtitle={`Our most recommended ${site.niche?.toLowerCase() || 'products'}, carefully tested and reviewed by our team`}
        />
      </div>
    ) : null,

    'testimonials': testimonials.length > 0 ? (
      <div key="testimonials" className="animate-on-scroll">
        <TestimonialGrid testimonials={testimonials} />
      </div>
    ) : null,

    'categories': categories.length > 0 ? (
      <div key="categories" className="animate-on-scroll">
        <CategoryGrid
          categories={categoriesWithCounts}
          title={cta.categoriesTitle}
          subtitle={`Find in-depth guides and reviews across all ${site.niche?.toLowerCase() || 'product'} categories`}
        />
      </div>
    ) : null,

    'articles': posts.length > 0 ? (
      <section key="articles" className="py-16 lg:py-20 bg-muted/30 animate-on-scroll">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
                {cta.articlesLabel}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {cta.articlesTitle}
              </h2>
              <p className="text-lg text-muted-foreground">
                Fresh reviews, guides, and insights from our experts
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/blog" className="flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-8">
            {posts[0] && (
              <ArticleCard
                post={posts[0]}
                category={posts[0].category_id ? categoryMap.get(posts[0].category_id) ?? null : null}
                variant="featured"
              />
            )}
            {posts.length > 1 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {posts.slice(1).map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    category={post.category_id ? categoryMap.get(post.category_id) ?? null : null}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    ) : null,

    'newsletter': (
      <div key="newsletter" className="animate-on-scroll">
        <NewsletterSignup siteId={site.id} niche={site.niche ?? undefined} />
      </div>
    ),

    'faq': (
      <div key="faq" className="animate-on-scroll">
        <HomepageFAQ />
      </div>
    ),

    'cta': (
      <div key="cta" className="animate-on-scroll">
        <FinalCTA
          niche={site.niche}
          siteName={site.name}
          heading={cta.finalCtaHeading}
          subtext={cta.finalCtaSubtext}
          ctaPrimaryText={cta.primaryText}
          ctaPrimaryUrl={cta.primaryUrl}
          ctaSecondaryText={cta.secondaryText}
          ctaSecondaryUrl={cta.secondaryUrl}
        />
      </div>
    ),
  };

  return (
    <>
      {sections.map(id => sectionMap[id] ?? null)}

      {/* Fallback offers section when no featured offers but offers exist */}
      {offers.length > 0 && !offers.some(o => o.is_featured) && sections.includes('offers') && (
        <section className="py-16 lg:py-20">
          <div className="container">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
                Our Recommendations
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Products We Recommend
              </h2>
              <p className="text-lg text-muted-foreground">
                Products we&apos;ve reviewed and recommend
              </p>
            </div>
            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/offers">
                  View All {offers.length} Offers
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/**
 * Get post counts for each category
 */
async function getCategoryCounts(
  supabase: ReturnType<typeof createServerClient>,
  siteId: string,
  categories: Category[]
): Promise<Array<Category & { postCount: number }>> {
  const { data: counts } = await supabase
    .from('posts')
    .select('category_id')
    .eq('site_id', siteId)
    .eq('status', 'published');

  const countMap = new Map<string, number>();
  if (counts) {
    for (const post of counts) {
      if (post.category_id) {
        countMap.set(post.category_id, (countMap.get(post.category_id) || 0) + 1);
      }
    }
  }

  return categories.map(category => ({
    ...category,
    postCount: countMap.get(category.id) || 0,
  }));
}
