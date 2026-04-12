import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import { ComparisonBuilderClient } from './ComparisonBuilderClient';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  return {
    title: 'Build Your Own Comparison',
    description: `Pick 2–4 ${site.niche || 'products'} and compare them side-by-side — features, price, rating, and more.`,
    // Builder is interactive; no fixed canonical content, don't index.
    robots: { index: false, follow: true },
  };
}

export default async function ComparisonBuilderPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();

  // Fetch enough offers to populate the picker. Cap at 50 to keep the first
  // paint snappy — niches with more than 50 active offers are rare.
  const { data: offersRaw } = await supabase
    .from('offers')
    .select(
      'id, slug, name, description, featured_image_url, logo_url, rating, price_usd, affiliate_url, award, pros, cons, feature_matrix'
    )
    .eq('site_id', site.id)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(50);

  const offers = (offersRaw || []).map((o: any) => ({
    id: o.id as string,
    slug: o.slug as string,
    name: o.name as string,
    description: (o.description as string | null) ?? null,
    image: (o.featured_image_url || o.logo_url) as string | null,
    rating: o.rating as number | null,
    // offers.price_usd is numeric in the DB; format to a display string here
    // so downstream components (SideBySide) get the expected string type.
    price: o.price_usd != null ? `$${o.price_usd}` : null,
    affiliateUrl: o.affiliate_url as string | null,
    award: o.award as string | null,
    pros: (o.pros as string[] | null) ?? [],
    cons: (o.cons as string[] | null) ?? [],
    featureMatrix: (o.feature_matrix as Record<string, number | string | boolean | null> | null) ?? {},
  }));

  return (
    <div className="container max-w-6xl mx-auto py-10">
      <header className="mb-8">
        <nav className="text-sm text-muted-foreground mb-2">
          <a href="/compare" className="hover:text-foreground transition-colors">
            ← All comparisons
          </a>
        </nav>
        <h1 className="text-3xl font-bold mb-2">Build your own comparison</h1>
        <p className="text-muted-foreground max-w-2xl">
          Pick any 2–4 {site.niche ? `${site.niche} ` : ''}products from the list below to see
          them side-by-side. Your selection is shareable — just copy the URL.
        </p>
      </header>
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            Loading builder…
          </div>
        }
      >
        <ComparisonBuilderClient offers={offers} siteName={site.name} />
      </Suspense>
    </div>
  );
}
