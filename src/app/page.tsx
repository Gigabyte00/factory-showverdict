import type { Metadata } from 'next';
import { getSiteConfig, getTestimonials, getCTAConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import { canonicalUrl } from '@/lib/seo';
import type { Post, Category, Offer } from '@/types';

// Homepage components
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ArticleCard } from '@/components/home/ArticleCard';
import { FeaturedOffers } from '@/components/home/FeaturedOffers';
import { TestimonialGrid } from '@/components/home/TestimonialGrid';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { FinalCTA } from '@/components/home/FinalCTA';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function generateMetadata(): Metadata {
  return {
    alternates: { canonical: canonicalUrl('/') },
  };
}

const sections = ['hero', 'offers', 'categories', 'articles', 'testimonials', 'newsletter', 'cta'];

export default async function HomePage() {
  const site = getSiteConfig();
  const testimonials = getTestimonials();
  const cta = getCTAConfig();
  const supabase = createServerClient();

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

  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', site.id)
    .eq('status', 'published');

  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection key="hero" />
    ),

    'offers': offers.some(o => o.is_featured) ? (
      <div key="offers" className="animate-on-scroll">
        <FeaturedOffers
          offers={offers}
          siteId={site.id}
          title={`Top ${site.niche || 'Show'} Picks`}
          subtitle={`Our most recommended ${site.niche?.toLowerCase() || 'shows'}, spoiler-free and reviewed by our team`}
        />
      </div>
    ) : null,

    'testimonials': testimonials.length > 0 ? (
      <div key="testimonials" className="animate-on-scroll">
        {/* Component does not take a title prop — heading is baked into the redesigned grid */}
        <TestimonialGrid testimonials={testimonials} />
      </div>
    ) : null,

    'categories': (
      <div key="categories" className="animate-on-scroll">
        <CategoryGrid
          categories={categories}
          heading={cta.categoriesTitle || "Browse by Genre"}
        />
      </div>
    ),

    'articles': posts.length > 0 ? (
      <section key="articles" className="py-16 lg:py-20 bg-muted/30 animate-on-scroll">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
                Latest Reviews
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Fresh from the Screening Room
              </h2>
              <p className="text-lg text-muted-foreground">
                Spoiler-free reviews, guides, and watchlists from our critics
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
                variant="featured"
              />
            )}
            {posts.length > 1 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {posts.slice(1).map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
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
        <NewsletterSignup siteId={site.id} niche={site.niche ?? null} />
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
    </>
  );
}
