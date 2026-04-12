import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();

  return {
    title: `Product Comparisons | ${site.name}`,
    description: `Side-by-side product comparisons to help you make informed buying decisions. Detailed analysis of features, pros, cons, and recommendations.`,
  };
}

export default async function ComparisonsIndexPage() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('slug, title, product_a_name, product_b_name, winner, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const baseUrl = site.domain ? `https://${site.domain}` : '';

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd type="breadcrumb" data={{ items: [
        { name: 'Home', url: baseUrl || '/' },
        { name: 'Compare', url: `${baseUrl}/compare` },
      ]}} />
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Product Comparisons</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Head-to-head comparisons to help you choose the right product. We analyze features, performance, and value.
        </p>
        <div className="rounded-lg border bg-muted/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Don&apos;t see what you&apos;re looking for?</p>
            <p className="text-sm text-muted-foreground">
              Build your own side-by-side comparison from any 2–4 products in our catalogue.
            </p>
          </div>
          <Link
            href="/compare/builder"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Build a comparison →
          </Link>
        </div>
      </div>

      {/* Comparison Grid */}
      {!comparisons || comparisons.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/50">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-semibold">No comparisons yet</h2>
            <p className="text-muted-foreground">Check back soon for detailed product comparisons.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((comparison) => (
            <Link
              key={comparison.slug}
              href={`/compare/${comparison.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    Comparison
                  </span>
                  {comparison.winner && (
                    <span className="text-xs text-muted-foreground">
                      Winner: {comparison.winner === 'a' ? comparison.product_a_name : comparison.winner === 'b' ? comparison.product_b_name : 'Tie'}
                    </span>
                  )}
                </div>

                <h2 className="mb-3 text-lg font-semibold group-hover:text-primary">
                  {comparison.title}
                </h2>

                <div className="flex items-center justify-center gap-4 rounded-lg bg-muted/50 p-4">
                  <span className="font-medium">{comparison.product_a_name}</span>
                  <span className="text-2xl font-bold text-primary">VS</span>
                  <span className="font-medium">{comparison.product_b_name}</span>
                </div>

                {comparison.published_at && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {new Date(comparison.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
