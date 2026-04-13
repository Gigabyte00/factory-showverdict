import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 3600;

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', categorySlug)
    .eq('site_id', site.id)
    .single();

  if (!category) return { title: 'Category Not Found' };

  return {
    title: `Best ${category.name} by Budget`,
    description: `Find the best ${category.name.toLowerCase()} at every price point. Budget-friendly options without compromising on quality.`,
  };
}

export async function generateStaticParams() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  // Get categories that have price tiers
  const { data: priceTiers } = await supabase
    .from('price_tiers')
    .select('category_id')
    .eq('site_id', site.id)
    .eq('status', 'published');

  const categoryIds = [...new Set(priceTiers?.map((pt) => pt.category_id).filter(Boolean))];

  if (categoryIds.length === 0) return [];

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .in('id', categoryIds as string[]);

  return categories?.map((c) => ({ category: c.slug })) || [];
}

export default async function CategoryBudgetPage({ params }: Props) {
  const { category: categorySlug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, slug, name, description')
    .eq('slug', categorySlug)
    .eq('site_id', site.id)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  // Fetch price tiers for this category
  const { data: priceTiers } = await supabase
    .from('price_tiers')
    .select('slug, title, max_price, price_label, offer_ids, published_at')
    .eq('category_id', category.id)
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('max_price', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/best" className="hover:text-foreground">Best Picks</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Best {category.name} by Budget</h1>
        <p className="text-xl text-muted-foreground">
          Quality {category.name.toLowerCase()} at every price point. Find your perfect match.
        </p>
      </div>

      {/* Price Tier Grid */}
      {!priceTiers || priceTiers.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/50">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-semibold">No budget guides yet</h2>
            <p className="text-muted-foreground">
              Check back soon for {category.name.toLowerCase()} at every price point.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Visual Price Ladder */}
          <div className="mb-12">
            <div className="flex flex-wrap items-end justify-center gap-4">
              {priceTiers.map((tier) => {
                // Calculate height based on price (for visual effect)
                const maxTierPrice = Math.max(...priceTiers.map((t) => t.max_price));
                const heightPercent = 40 + (tier.max_price / maxTierPrice) * 60;

                return (
                  <Link
                    key={tier.slug}
                    href={`/best/${categorySlug}/under-${tier.max_price / 100}`}
                    className="group flex flex-col items-center"
                  >
                    <div
                      className="mb-2 w-24 rounded-t-lg bg-gradient-to-t from-primary/50 to-primary transition-transform group-hover:scale-105"
                      style={{ height: `${heightPercent}px` }}
                    />
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{tier.price_label}</div>
                      <div className="text-xs text-muted-foreground">
                        {tier.offer_ids?.length || 0} picks
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Detailed Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {priceTiers.map((tier, index) => (
              <Link
                key={tier.slug}
                href={`/best/${categorySlug}/under-${tier.max_price / 100}`}
                className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Budget Tier {index + 1}
                    </span>
                    <span className="text-3xl font-bold text-primary">{tier.price_label}</span>
                  </div>

                  <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">
                    {tier.title}
                  </h2>

                  <p className="mb-4 text-sm text-muted-foreground">
                    {tier.offer_ids && tier.offer_ids.length > 0
                      ? `${tier.offer_ids.length} top picks reviewed and compared`
                      : 'Coming soon'}
                  </p>

                  {tier.published_at && (
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(tier.published_at).toLocaleDateString('en-US', {
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
        </>
      )}
    </div>
  );
}
