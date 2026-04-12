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

export const revalidate = 1800; // Revalidate every 30 minutes

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: post } = await supabase
    .from('posts')
    .select('title, meta_title, meta_description, excerpt, featured_image_url, published_at, updated_at')
    .eq('slug', slug)
    .eq('site_id', site.id)
    .single();

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || 'Read more on our blog',
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

export async function generateStaticParams() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  // Fetch all published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, category_id')
    .eq('site_id', site.id)
    .eq('status', 'published');

  if (!posts || posts.length === 0) return [];

  // Get unique category IDs
  const categoryIds = [...new Set(posts.map((p) => p.category_id).filter(Boolean))];

  // Fetch category slugs
  let categoryMap = new Map<string, string>();
  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug')
      .in('id', categoryIds as string[]);
    categoryMap = new Map(categories?.map((c) => [c.id, c.slug]) || []);
  }

  return posts.map((post) => ({
    category: post.category_id ? categoryMap.get(post.category_id) || 'blog' : 'blog',
    slug: post.slug,
  }));
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function PostPage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  // Fetch post
  const { data: post, error } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, content, featured_image_url, published_at, updated_at, reading_time_minutes, related_offer_ids, category_id')
    .eq('slug', slug)
    .eq('site_id', site.id)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    notFound();
  }

  // Fetch category separately
  let category: { id: string; slug: string; name: string } | null = null;
  if (post.category_id) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, slug, name')
      .eq('id', post.category_id)
      .single();
    category = categoryData;
  }

  // Fetch related offers using the related_offer_ids array
  let offers: any[] = [];
  if (post.related_offer_ids && post.related_offer_ids.length > 0) {
    const { data: offersData } = await supabase
      .from('offers')
      .select('id, name, description, affiliate_url, featured_image_url, rating')
      .in('id', post.related_offer_ids)
      .eq('is_active', true);

    offers = offersData || [];
  }

  const readingTime = post.reading_time_minutes || calculateReadingTime(post.content || '');
  const publishedDate = post.published_at ? new Date(post.published_at) : null;

  // Fetch related posts from same category
  let relatedPosts: any[] = [];
  if (category?.id) {
    const { data: relatedData } = await supabase
      .from('posts')
      .select('id, slug, title, featured_image_url, excerpt, category_id')
      .eq('category_id', category.id)
      .eq('site_id', site.id)
      .eq('status', 'published')
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3);
    relatedPosts = relatedData || [];
  }

  return (
    <>
      <JsonLd
        type="article"
        data={{
          headline: post.title,
          description: post.excerpt,
          image: post.featured_image_url,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: site.name,
        }}
      />

      <article className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: category?.name || 'Blog', href: `/${categorySlug}` },
            { label: post.title, href: `/${categorySlug}/${slug}` },
          ]}
        />

        {/* Post Header */}
        <header className="mb-8 mt-6">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{post.title}</h1>

          {post.excerpt && <p className="mb-4 text-xl text-muted-foreground">{post.excerpt}</p>}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {publishedDate && (
              <time dateTime={post.published_at ?? undefined}>
                {publishedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="relative mb-8 overflow-hidden rounded-lg aspect-[16/9]">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Affiliate Disclosure */}
        {offers.length > 0 && (
          <div className="mb-8">
            <AffiliateDisclosure />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg mx-auto mb-12 max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ''}</ReactMarkdown>
        </div>

        {/* Affiliate Offers */}
        {offers.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Featured Products</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer: any) => (
                <div
                  key={offer.id}
                  className="flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                >
                  {offer.featured_image_url && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={offer.featured_image_url}
                        alt={offer.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 text-lg font-semibold">{offer.name}</h3>
                    {offer.description && (
                      <p className="mb-4 flex-1 text-sm text-muted-foreground">
                        {offer.description}
                      </p>
                    )}
                    {offer.rating && (
                      <div className="mb-4 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < offer.rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    <a
                      href={offer.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-block rounded-lg bg-primary px-6 py-2 text-center font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      View Deal
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Buttons */}
        <div className="mb-12">
          <ShareButtons
            url={`https://${site.domain}/${categorySlug}/${slug}`}
            title={post.title}
          />
        </div>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relPost: any) => (
                <Link
                  key={relPost.id}
                  href={`/${categorySlug}/${relPost.slug}`}
                  className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                >
                  {relPost.featured_image_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={relPost.featured_image_url}
                        alt={relPost.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold group-hover:text-primary">{relPost.title}</h3>
                    {relPost.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{relPost.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
