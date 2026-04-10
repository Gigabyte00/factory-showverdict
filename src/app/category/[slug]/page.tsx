import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import { getTemplate, getDefaultVariant } from '@/lib/templates/registry';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate every hour

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  // Fetch posts in this category
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('site_id', site.id)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Fetch offers in this category
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('site_id', site.id)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  // Determine template variant
  // Priority: 1. Site settings, 2. Auto-detect based on content type, 3. Default
  let variant = site.settings?.categoryVariant;

  if (!variant) {
    const totalContent = (posts?.length || 0) + (offers?.length || 0);
    const offerCount = offers?.length || 0;
    const postCount = posts?.length || 0;

    // Auto-detect based on content characteristics
    if (offerCount > postCount && offerCount <= 5) {
      // Few premium products → showcase
      variant = 'showcase';
    } else if (offerCount >= 5 && offerCount >= postCount) {
      // Many products needing comparison → list
      variant = 'list';
    } else {
      // Mixed content or many posts → grid
      variant = 'grid';
    }
  }

  // Get template component
  const Template = getTemplate('category', variant);

  // Fallback to default if variant not found
  if (!Template) {
    const defaultVariant = getDefaultVariant('category');
    const DefaultTemplate = getTemplate('category', defaultVariant);

    if (!DefaultTemplate) {
      throw new Error('No category templates available');
    }

    return (
      <DefaultTemplate
        category={category}
        posts={posts || []}
        offers={offers || []}
        site={site}
      />
    );
  }

  return (
    <Template
      category={category}
      posts={posts || []}
      offers={offers || []}
      site={site}
    />
  );
}

// Generate static params for all categories (ISR)
export async function generateStaticParams() {
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('site_id', site.id);

  return (
    categories?.map((category) => ({
      slug: category.slug,
    })) || []
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .single();

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: category.name,
    description: category.description || `Browse ${category.name} content at ${site.name}`,
  };
}
