import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import { selectTemplateVariant } from '@/lib/templates/selector';
import { getTemplate, getDefaultVariant } from '@/lib/templates/registry';
import type { Post, Category } from '@/types';
import type { BlogListTemplateConfig } from '@/lib/templates/config';

export const revalidate = 3600; // Revalidate every hour

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const postsPerPage = 12;

  // Fetch posts and categories
  const [postsCountResult, postsResult, categoriesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('site_id', site.id)
      .eq('status', 'published'),
    supabase
      .from('posts')
      .select('*')
      .eq('site_id', site.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((currentPage - 1) * postsPerPage, currentPage * postsPerPage - 1),
    supabase
      .from('categories')
      .select('*')
      .eq('site_id', site.id)
      .order('name'),
  ]);

  const posts = (postsResult.data || []) as Post[];
  const categories = (categoriesResult.data || []) as Category[];
  const totalPosts = postsCountResult.count || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // AI selects best template variant based on site context
  const templateConfig = (await selectTemplateVariant('blog-list', {
    site,
    pageType: 'blog-list',
    postCount: totalPosts,
  })) as BlogListTemplateConfig;

  // Get the template component
  const Template = getTemplate('blog-list', templateConfig.variant);

  // Fallback to grid variant if selected variant doesn't exist
  if (!Template) {
    const defaultVariant = getDefaultVariant('blog-list');
    const FallbackTemplate = getTemplate('blog-list', defaultVariant);

    if (!FallbackTemplate) {
      // Ultimate fallback: show error message
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-destructive">
              Template Error
            </h1>
            <p className="text-muted-foreground">
              No blog list templates are available. Please check your template
              configuration.
            </p>
          </div>
        </div>
      );
    }

    return (
      <FallbackTemplate
        posts={posts}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        site={site}
        {...templateConfig}
      />
    );
  }

  return (
    <Template
      posts={posts}
      categories={categories}
      currentPage={currentPage}
      totalPages={totalPages}
      site={site}
      {...templateConfig}
    />
  );
}
