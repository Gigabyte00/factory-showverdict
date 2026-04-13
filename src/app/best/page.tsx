import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();

  return {
    title: `Best Picks by Budget`,
    description: `Find quality products at every price point. Budget-friendly recommendations without sacrificing quality.`,
  };
}

export default async function BestPicksIndexPage() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  // Fetch all price tiers
  const { data: priceTiers } = await supabase
    .from('price_tiers')
    .select('slug, title, max_price, price_label, category_id, offer_ids')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('max_price', { ascending: true });

  // Get unique categories
  const categoryIds = [...new Set(priceTiers?.map((pt) => pt.category_id).filter(Boolean))];
  let categories: { id: string; name: string; slug: string }[] = [];

  if (categoryIds.length > 0) {
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds as string[]);
    categories = categoriesData || [];
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Group price tiers by category
  const grouped = priceTiers?.reduce((acc, pt) => {
    if (!pt.category_id) return acc;
    const category = categoryMap.get(pt.category_id);
    if (!category) return acc;

    const categoryName = category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = {
        slug: category.slug,
        tiers: [],
      };
    }
    acc[categoryName].tiers.push(pt);
    return acc;
  }, {} as Record<string, { slug: string; tiers: typeof priceTiers }>) || {};

  const hasContent = Object.keys(grouped).length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Best Picks by Budget</h1>
        <p className="text-xl text-muted-foreground">
          Quality products at every price point. Find the perfect balance of features and affordability.
        </p>
      </div>

      {/* Content */}
      {!hasContent ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/50">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-semibold">No budget guides yet</h2>
            <p className="text-muted-foreground">Check back soon for budget-friendly picks.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([categoryName, { slug, tiers }]) => (
            <div key={categoryName}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{categoryName}</h2>
                <Link
                  href={`/best/${slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tiers?.map((tier) => (
                  <Link
                    key={tier.slug}
                    href={`/best/${slug}/under-${tier.max_price / 100}`}
                    className="group rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Budget Guide
                    </div>

                    <div className="mb-3 text-3xl font-bold text-primary group-hover:scale-105 transition-transform">
                      {tier.price_label}
                    </div>

                    <h3 className="mb-2 font-semibold group-hover:text-primary">
                      {tier.title}
                    </h3>

                    {tier.offer_ids && tier.offer_ids.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {tier.offer_ids.length} products
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
