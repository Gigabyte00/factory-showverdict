import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { Post, Category } from '@/types';
import { notFound } from 'next/navigation';
import { getTemplate, getDefaultVariant } from '@/lib/templates/registry';
import JsonLd from '@/components/JsonLd';

/** Extract FAQ Q&A pairs from markdown content (detects ## FAQ / ## Frequently Asked Questions sections). */
function extractFaqs(content: string): Array<{ question: string; answer: string }> {
  // Find the start of an FAQ section
  const faqMatch = content.match(/^##\s+(frequently\s+asked\s+questions|faq|common\s+questions|faqs)/im);
  if (!faqMatch || faqMatch.index === undefined) return [];
  const faqSection = content.slice(faqMatch.index);

  // Parse H3 questions + the text between them as answers
  const blocks = faqSection.split(/^###\s+/m).slice(1); // split on H3, drop pre-FAQ content
  const faqs: Array<{ question: string; answer: string }> = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    const question = lines[0].trim().replace(/\?$/, '').trim() + '?';
    const answer = lines.slice(1).join('\n').trim()
      .replace(/\*\*/g, '')   // strip bold markers
      .replace(/\n{2,}/g, ' ') // collapse paragraph breaks
      .slice(0, 600);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

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
    title: post.title,
    description: post.excerpt || `Read ${post.title} on ${site.name}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
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

  const faqs = post.content ? extractFaqs(post.content) : [];

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
        {faqs.length >= 3 && <JsonLd type="faq" data={{ faqs }} />}
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
      {faqs.length >= 3 && <JsonLd type="faq" data={{ faqs }} />}
      <Template
        post={post}
        category={category}
        relatedPosts={relatedPosts || []}
        site={site}
      />
    </>
  );
}
