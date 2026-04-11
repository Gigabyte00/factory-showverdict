import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';
import { SearchInput } from '@/components/ui/search-input';
import { ArticleCard } from '@/components/home/ArticleCard';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const site = getSiteConfig();
  return {
    title: q ? `Search results for "${q}"` : 'Search',
    description: `Search ${site.name} for articles, guides, and product reviews.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const site = getSiteConfig();
  const siteId = (site as any).id as string;

  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    featured_image_alt: string | null;
    published_at: string | null;
    reading_time_minutes: number | null;
    word_count: number | null;
    author_name: string | null;
  }> = [];

  if (q && q.trim().length >= 2) {
    const supabase = createServerClient();
    const pattern = `%${q.trim()}%`;
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, featured_image_url, featured_image_alt, published_at, reading_time_minutes, word_count, author_name')
      .eq('site_id', siteId)
      .eq('status', 'published')
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
      .order('published_at', { ascending: false })
      .limit(20);

    posts = data || [];
  }

  const hasQuery = Boolean(q && q.trim().length >= 2);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Search heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground">
            Find articles, reviews, and guides on {site.niche || 'our topics'}.
          </p>
        </div>

        {/* Search input */}
        <div className="mb-8">
          <SearchInput
            defaultQuery={q || ''}
            searchPath="/search"
            size="lg"
            placeholder={`Search ${site.name}…`}
            className="max-w-2xl"
          />
        </div>

        {/* Results */}
        {hasQuery && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {posts.length > 0
                ? `${posts.length} result${posts.length === 1 ? '' : 's'} for "${q}"`
                : `No results found for "${q}"`}
            </p>

            {posts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <ArticleCard key={post.id} post={post as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-2">
                  No articles match your search.
                </p>
                <p className="text-muted-foreground/70 text-sm">
                  Try different keywords or browse our{' '}
                  <a href="/blog" className="text-primary hover:underline">
                    latest articles
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
