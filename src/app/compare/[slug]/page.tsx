import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: comparison } = await supabase
    .from('comparisons')
    .select('title, seo_title, seo_description, published_at, updated_at')
    .eq('slug', slug)
    .eq('site_id', site.id)
    .single();

  if (!comparison) return { title: 'Comparison Not Found' };

  const title = comparison.seo_title || comparison.title;
  const description = comparison.seo_description || `Detailed comparison to help you choose the right product.`;

  return {
    title: `${title} | ${site.name}`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: comparison.published_at || undefined,
      modifiedTime: comparison.updated_at || undefined,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('slug')
    .eq('site_id', site.id)
    .eq('status', 'published');

  return comparisons?.map((c) => ({ slug: c.slug })) || [];
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: comparison, error } = await supabase
    .from('comparisons')
    .select('*')
    .eq('slug', slug)
    .eq('site_id', site.id)
    .eq('status', 'published')
    .single();

  if (error || !comparison) {
    notFound();
  }

  // Fetch related offers if IDs exist
  let productA = null;
  let productB = null;

  if (comparison.product_a_offer_id) {
    const { data } = await supabase
      .from('offers')
      .select('name, description, affiliate_url, featured_image_url, rating')
      .eq('id', comparison.product_a_offer_id)
      .single();
    productA = data;
  }

  if (comparison.product_b_offer_id) {
    const { data } = await supabase
      .from('offers')
      .select('name, description, affiliate_url, featured_image_url, rating')
      .eq('id', comparison.product_b_offer_id)
      .single();
    productB = data;
  }

  const publishedDate = comparison.published_at ? new Date(comparison.published_at) : null;

  return (
    <>
      <JsonLd
        type="article"
        data={{
          headline: comparison.title,
          description: comparison.seo_description,
          datePublished: comparison.published_at,
          dateModified: comparison.updated_at,
          author: site.name,
        }}
      />
      <JsonLd type="breadcrumb" data={{ items: [
        { name: 'Home', url: site.domain ? `https://${site.domain}` : '/' },
        { name: 'Compare', url: site.domain ? `https://${site.domain}/compare` : '/compare' },
        { name: comparison.title, url: site.domain ? `https://${site.domain}/compare/${slug}` : `/compare/${slug}` },
      ]}} />

      <article className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Comparisons', href: '/compare' },
            { label: comparison.title, href: `/compare/${slug}` },
          ]}
        />

        {/* Header */}
        <header className="mb-8 mt-6">
          <div className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            Product Comparison
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{comparison.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {publishedDate && (
              <time dateTime={comparison.published_at ?? undefined}>
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

        {/* VS Header */}
        <div className="mb-8 rounded-lg border-2 border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-950/30">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{comparison.product_a_name}</h2>
              {productA?.rating && (
                <div className="mt-1 text-yellow-500">
                  {'★'.repeat(Math.round(productA.rating))}{'☆'.repeat(5 - Math.round(productA.rating))}
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-purple-600">VS</div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{comparison.product_b_name}</h2>
              {productB?.rating && (
                <div className="mt-1 text-yellow-500">
                  {'★'.repeat(Math.round(productB.rating))}{'☆'.repeat(5 - Math.round(productB.rating))}
                </div>
              )}
            </div>
          </div>

          {comparison.winner && (
            <div className="mt-4 text-center">
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Winner: {comparison.winner === 'a' ? comparison.product_a_name : comparison.winner === 'b' ? comparison.product_b_name : 'Tie - Both are great choices'}
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        {comparison.content && (
          <div className="prose prose-lg mx-auto mb-12 max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{comparison.content}</ReactMarkdown>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
          {productA?.affiliate_url && (
            <a
              href={productA.affiliate_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-lg bg-primary px-8 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Check {comparison.product_a_name} Price
            </a>
          )}
          {productB?.affiliate_url && (
            <a
              href={productB.affiliate_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-lg border border-primary px-8 py-3 text-center font-semibold text-primary hover:bg-primary/10"
            >
              Check {comparison.product_b_name} Price
            </a>
          )}
        </div>

        {/* Share Buttons */}
        <div className="mb-12">
          <ShareButtons
            url={`https://${site.domain}/compare/${slug}`}
            title={comparison.title}
          />
        </div>

        {/* Related Comparisons */}
        <RelatedComparisons currentSlug={slug} siteId={site.id} />
      </article>
    </>
  );
}

async function RelatedComparisons({ currentSlug, siteId }: { currentSlug: string; siteId: string }) {
  const supabase = createServerClient();

  const { data: related } = await supabase
    .from('comparisons')
    .select('slug, title, product_a_name, product_b_name')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(3);

  if (!related || related.length === 0) return null;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">More Comparisons</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((comp) => (
          <Link
            key={comp.slug}
            href={`/compare/${comp.slug}`}
            className="rounded-lg border p-4 transition-shadow hover:shadow-lg"
          >
            <h3 className="font-semibold hover:text-primary">{comp.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {comp.product_a_name} vs {comp.product_b_name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
