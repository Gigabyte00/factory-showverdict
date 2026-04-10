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
  params: Promise<{ 'use-case': string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'use-case': slug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: useCase } = await supabase
    .from('use_cases')
    .select('title, seo_title, seo_description, use_case_name, published_at, updated_at')
    .eq('slug', slug)
    .eq('site_id', site.id)
    .single();

  if (!useCase) return { title: 'Guide Not Found' };

  const title = useCase.seo_title || useCase.title;
  const description = useCase.seo_description || `Best products for ${useCase.use_case_name}. Expert recommendations and buying guide.`;

  return {
    title: `${title}`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: useCase.published_at || undefined,
      modifiedTime: useCase.updated_at || undefined,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: useCases } = await supabase
    .from('use_cases')
    .select('slug')
    .eq('site_id', site.id)
    .eq('status', 'published');

  return useCases?.map((uc) => ({ 'use-case': uc.slug })) || [];
}

export default async function UseCasePage({ params }: Props) {
  const { 'use-case': slug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: useCase, error } = await supabase
    .from('use_cases')
    .select('*')
    .eq('slug', slug)
    .eq('site_id', site.id)
    .eq('status', 'published')
    .single();

  if (error || !useCase) {
    notFound();
  }

  // Fetch recommended offers if IDs exist
  let recommendedOffers: any[] = [];
  if (useCase.recommended_offer_ids && useCase.recommended_offer_ids.length > 0) {
    const { data } = await supabase
      .from('offers')
      .select('id, name, description, affiliate_url, featured_image_url, rating')
      .in('id', useCase.recommended_offer_ids);
    recommendedOffers = data || [];
  }

  // Fetch category name if exists
  let categoryName = null;
  if (useCase.category_id) {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('id', useCase.category_id)
      .single();
    categoryName = data?.name;
  }

  const publishedDate = useCase.published_at ? new Date(useCase.published_at) : null;

  return (
    <>
      <JsonLd
        type="article"
        data={{
          headline: useCase.title,
          description: useCase.seo_description,
          datePublished: useCase.published_at,
          dateModified: useCase.updated_at,
          author: site.name,
        }}
      />

      <article className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'For', href: '/for' },
            { label: useCase.use_case_name, href: `/for/${slug}` },
          ]}
        />

        {/* Header */}
        <header className="mb-8 mt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Use Case Guide
            </span>
            {categoryName && (
              <span className="inline-block rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                {categoryName}
              </span>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{useCase.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {publishedDate && (
              <time dateTime={useCase.published_at ?? undefined}>
                Updated {publishedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
          </div>
        </header>

        {/* Affiliate Disclosure */}
        <div className="mb-8">
          <AffiliateDisclosure />
        </div>

        {/* Criteria Section */}
        {useCase.criteria && useCase.criteria.length > 0 && (
          <div className="mb-8 rounded-lg border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/30">
            <h2 className="mb-4 text-xl font-bold">What We Look For</h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {useCase.criteria.map((criterion: { name: string; weight?: number } | string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>{typeof criterion === 'string' ? criterion : criterion.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Products */}
        {recommendedOffers.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Our Top Picks</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedOffers.map((offer, index) => (
                <div key={offer.id} className="relative overflow-hidden rounded-lg border bg-card">
                  {index === 0 && (
                    <div className="absolute left-0 top-0 rounded-br-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Top Pick
                    </div>
                  )}
                  {offer.featured_image_url && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={offer.featured_image_url}
                        alt={offer.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold">{offer.name}</h3>
                    {offer.rating && (
                      <div className="mb-2 flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm">{offer.rating}/5</span>
                      </div>
                    )}
                    {offer.affiliate_url && (
                      <a
                        href={offer.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="block w-full rounded-lg bg-primary py-2 text-center font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        Check Price
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {useCase.content && (
          <div className="prose prose-lg mx-auto mb-12 max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{useCase.content}</ReactMarkdown>
          </div>
        )}

        {/* Share Buttons */}
        <div className="mb-12">
          <ShareButtons
            url={`https://${site.domain}/for/${slug}`}
            title={useCase.title}
          />
        </div>

        {/* Related Use Cases */}
        <RelatedUseCases currentSlug={slug} siteId={site.id} />
      </article>
    </>
  );
}

async function RelatedUseCases({ currentSlug, siteId }: { currentSlug: string; siteId: string }) {
  const supabase = createServerClient();

  const { data: related } = await supabase
    .from('use_cases')
    .select('slug, title, use_case_name')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(3);

  if (!related || related.length === 0) return null;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">More Use Case Guides</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((uc) => (
          <Link
            key={uc.slug}
            href={`/for/${uc.slug}`}
            className="rounded-lg border p-4 transition-shadow hover:shadow-lg"
          >
            <h3 className="font-semibold hover:text-primary">{uc.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              For {uc.use_case_name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
