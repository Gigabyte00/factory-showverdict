import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';
import ShareButtons from '@/components/ShareButtons';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600;

interface Props {
  params: Promise<{ category: string; budget: string }>;
}

// Parse budget from URL like "under-500" to get max price in cents
function parseBudget(budget: string): number | null {
  const match = budget.match(/^under-(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 100; // Convert to cents
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, budget } = await params;
  const maxPrice = parseBudget(budget);
  if (!maxPrice) return { title: 'Budget Guide Not Found' };

  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', categorySlug)
    .eq('site_id', site.id)
    .single();

  if (!category) return { title: 'Category Not Found' };

  const { data: priceTier } = await supabase
    .from('price_tiers')
    .select('title, seo_title, seo_description, price_label, published_at, updated_at')
    .eq('category_id', category.id)
    .eq('site_id', site.id)
    .eq('max_price', maxPrice)
    .single();

  if (!priceTier) return { title: 'Budget Guide Not Found' };

  const title = priceTier.seo_title || priceTier.title;
  const description = priceTier.seo_description || `Best ${category.name.toLowerCase()} under ${priceTier.price_label}. Top picks reviewed and compared.`;

  return {
    title: `${title} | ${site.name}`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: priceTier.published_at || undefined,
      modifiedTime: priceTier.updated_at || undefined,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: priceTiers } = await supabase
    .from('price_tiers')
    .select('max_price, category_id')
    .eq('site_id', site.id)
    .eq('status', 'published');

  if (!priceTiers || priceTiers.length === 0) return [];

  const categoryIds = [...new Set(priceTiers.map((pt) => pt.category_id).filter(Boolean))];
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug')
    .in('id', categoryIds as string[]);

  const categoryMap = new Map(categories?.map((c) => [c.id, c.slug]) || []);

  return priceTiers
    .filter((pt): pt is typeof pt & { category_id: string } =>
      pt.category_id !== null && categoryMap.has(pt.category_id))
    .map((pt) => ({
      category: categoryMap.get(pt.category_id)!,
      budget: `under-${pt.max_price / 100}`,
    }));
}

export default async function PriceTierPage({ params }: Props) {
  const { category: categorySlug, budget } = await params;
  const maxPrice = parseBudget(budget);

  if (!maxPrice) {
    notFound();
  }

  const supabase = createServerClient();
  const site = await getSiteConfig();

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', categorySlug)
    .eq('site_id', site.id)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  // Fetch price tier
  const { data: priceTier, error: tierError } = await supabase
    .from('price_tiers')
    .select('*')
    .eq('category_id', category.id)
    .eq('site_id', site.id)
    .eq('max_price', maxPrice)
    .eq('status', 'published')
    .single();

  if (tierError || !priceTier) {
    notFound();
  }

  // Fetch recommended offers if IDs exist
  let offers: any[] = [];
  if (priceTier.offer_ids && priceTier.offer_ids.length > 0) {
    const { data } = await supabase
      .from('offers')
      .select('id, name, description, affiliate_url, featured_image_url, rating, current_price, original_price, pros, cons')
      .in('id', priceTier.offer_ids);
    offers = data || [];
    // Sort by the order in offer_ids array (if offer_ids exists)
    if (priceTier.offer_ids) {
      offers.sort((a, b) => priceTier.offer_ids!.indexOf(a.id) - priceTier.offer_ids!.indexOf(b.id));
    }
  }

  // Fetch other price tiers in same category for navigation
  const { data: otherTiers } = await supabase
    .from('price_tiers')
    .select('max_price, price_label')
    .eq('category_id', category.id)
    .eq('site_id', site.id)
    .eq('status', 'published')
    .neq('max_price', maxPrice)
    .order('max_price', { ascending: true });

  const publishedDate = priceTier.published_at ? new Date(priceTier.published_at) : null;

  return (
    <>
      <JsonLd
        type="article"
        data={{
          headline: priceTier.title,
          description: priceTier.seo_description,
          datePublished: priceTier.published_at,
          dateModified: priceTier.updated_at,
          author: site.name,
        }}
      />

      <article className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Best Picks', href: '/best' },
            { label: category.name, href: `/best/${categorySlug}` },
            { label: priceTier.price_label, href: `/best/${categorySlug}/${budget}` },
          ]}
        />

        {/* Header */}
        <header className="mb-8 mt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Budget Guide
            </span>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-bold text-primary">
              {priceTier.price_label}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{priceTier.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {publishedDate && (
              <time dateTime={priceTier.published_at ?? undefined}>
                Updated {publishedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {offers.length > 0 && (
              <span>{offers.length} products reviewed</span>
            )}
          </div>
        </header>

        {/* Affiliate Disclosure */}
        <div className="mb-8">
          <AffiliateDisclosure />
        </div>

        {/* Quick Jump to Other Budgets */}
        {otherTiers && otherTiers.length > 0 && (
          <div className="mb-8 rounded-lg border bg-muted/50 p-4">
            <span className="mr-4 text-sm font-medium">Other budgets:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {otherTiers.map((tier) => (
                <Link
                  key={tier.max_price}
                  href={`/best/${categorySlug}/under-${tier.max_price / 100}`}
                  className="rounded-full border bg-background px-4 py-1 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {tier.price_label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Product List */}
        {offers.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Our Top Picks</h2>
            <div className="space-y-6">
              {offers.map((offer, index) => (
                <div
                  key={offer.id}
                  className="overflow-hidden rounded-lg border bg-card"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Rank Badge */}
                    <div className="flex items-center justify-center bg-primary/10 p-4 md:w-20">
                      <span className="text-3xl font-bold text-primary">#{index + 1}</span>
                    </div>

                    {/* Image */}
                    {offer.featured_image_url && (
                      <div className="relative h-48 w-full md:h-auto md:w-48">
                        <Image
                          src={offer.featured_image_url}
                          alt={offer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-xl font-bold">{offer.name}</h3>
                        {offer.rating && (
                          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 dark:bg-yellow-900/30">
                            <span className="text-yellow-600">★</span>
                            <span className="text-sm font-medium">{offer.rating}/5</span>
                          </div>
                        )}
                      </div>

                      {offer.description && (
                        <p className="mb-4 text-muted-foreground">{offer.description}</p>
                      )}

                      {/* Pros/Cons */}
                      <div className="mb-4 grid gap-4 md:grid-cols-2">
                        {offer.pros && offer.pros.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-green-600">Pros</h4>
                            <ul className="space-y-1 text-sm">
                              {offer.pros.slice(0, 3).map((pro: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-green-600">+</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {offer.cons && offer.cons.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-red-600">Cons</h4>
                            <ul className="space-y-1 text-sm">
                              {offer.cons.slice(0, 3).map((con: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-red-600">-</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between">
                        <div>
                          {offer.current_price && (
                            <span className="text-2xl font-bold text-primary">
                              ${(offer.current_price / 100).toFixed(0)}
                            </span>
                          )}
                          {offer.original_price && offer.original_price > offer.current_price && (
                            <span className="ml-2 text-muted-foreground line-through">
                              ${(offer.original_price / 100).toFixed(0)}
                            </span>
                          )}
                        </div>
                        {offer.affiliate_url && (
                          <a
                            href={offer.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
                          >
                            Check Price
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {priceTier.content && (
          <div className="prose prose-lg mx-auto mb-12 max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{priceTier.content}</ReactMarkdown>
          </div>
        )}

        {/* Share Buttons */}
        <div className="mb-12">
          <ShareButtons
            url={`https://${site.domain}/best/${categorySlug}/${budget}`}
            title={priceTier.title}
          />
        </div>
      </article>
    </>
  );
}
