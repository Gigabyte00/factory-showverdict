import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { Post, Category } from '@/types';
import { notFound } from 'next/navigation';
import { getTemplate, getDefaultVariant } from '@/lib/templates/registry';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, featured_image_url')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | ${site.name}`,
    description: post.excerpt || `Read ${post.title} on ${site.name}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
    alternates: {
      canonical: site.domain ? `https://${site.domain}/blog/${slug}` : `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  // Fetch post with all details
  const { data: postData, error } = await supabase
    .from('posts')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !postData) {
    notFound();
  }

  // Cast to our extended Post type with metadata support
  const post = postData as Post;

  // Fetch category if exists
  let category: Category | null = null;
  if (post.category_id) {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('id', post.category_id)
      .single();
    category = data;
  }

  // Fetch related posts
  const { data: relatedPosts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, featured_image_url, published_at, reading_time_minutes')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(4);

  // Determine template variant
  // Priority: 1. Explicit variant in metadata, 2. Auto-detect from content type, 3. Default
  let variant = post.metadata?.variant;

  if (!variant) {
    // Auto-detect based on metadata flags
    if (post.metadata?.isComparison || post.metadata?.comparison) {
      variant = 'comparison';
    } else if (post.metadata?.isReview || post.metadata?.review) {
      variant = 'review';
    } else {
      // Auto-detect based on word count
      const wordCount = post.content?.split(/\s+/).length || 0;
      variant = wordCount > 3000 ? 'longform' : 'standard';
    }
  }

  // Get template component
  const Template = getTemplate('post-detail', variant);

  const baseUrl = site.domain ? `https://${site.domain}` : '';
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Blog', url: `${baseUrl}/blog` },
    { name: post.title, url: `${baseUrl}/blog/${slug}` },
  ];

  // Fallback to default if variant not found
  if (!Template) {
    const defaultVariant = getDefaultVariant('post-detail');
    const DefaultTemplate = getTemplate('post-detail', defaultVariant);

    if (!DefaultTemplate) {
      throw new Error('No post detail templates available');
    }

    return (
      <>
        <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
        <DefaultTemplate
          post={post}
          category={category}
          relatedPosts={relatedPosts || []}
          site={site}
        />
      </>
    );
  }

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      <Template
        post={post}
        category={category}
        relatedPosts={relatedPosts || []}
        site={site}
      />
    </>
  );
}
