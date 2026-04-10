import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import { ArticleCard } from '@/components/home/ArticleCard';
import type { Post, Category } from '@/types';

export const revalidate = 3600; // Revalidate every hour

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', categorySlug)
    .eq('site_id', site.id)
    .single();

  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name}`,
    description: category.description || `Browse ${category.name} articles on ${site.name}`,
  };
}

export async function generateStaticParams() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('site_id', site.id);

  return categories?.map((cat) => ({ category: cat.slug })) || [];
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = parseInt(pageParam || '1', 10);
  const postsPerPage = 12;
  const offset = (currentPage - 1) * postsPerPage;

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

  // Fetch posts in category - include fields needed by ArticleCard
  const { data: posts, count } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, content, featured_image_url, featured_image_alt, published_at, reading_time_minutes, word_count', {
      count: 'exact',
    })
    .eq('category_id', category.id)
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + postsPerPage - 1);

  const totalPages = count ? Math.ceil(count / postsPerPage) : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-xl text-muted-foreground">{category.description}</p>
        )}
      </div>

      {/* Post Grid */}
      {!posts || posts.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/50">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-semibold">No articles yet</h2>
            <p className="text-muted-foreground">Check back soon for new content in {category.name}.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard
                key={post.id}
                post={post as Post}
                category={category as Category}
                href={`/${categorySlug}/${post.slug}`}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/${categorySlug}?page=${currentPage - 1}`}
                  className="rounded-lg border px-4 py-2 hover:bg-muted"
                >
                  Previous
                </Link>
              )}

              <span className="px-4 py-2 text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages && (
                <Link
                  href={`/${categorySlug}?page=${currentPage + 1}`}
                  className="rounded-lg border px-4 py-2 hover:bg-muted"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
