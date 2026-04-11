import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, HelpCircle, BookOpen } from 'lucide-react';
import Script from 'next/script';
import JsonLd from '@/components/JsonLd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface TopicCluster {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  content: string | null;
  related_post_ids: string[];
  related_faq_ids: string[];
  related_term_ids: string[];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data } = await supabase
    .from('topic_clusters')
    .select('name, description')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Topic Not Found' };

  return {
    title: `${data.name} | ${site.name}`,
    description: data.description || `Everything about ${data.name} on ${site.name}.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/topics/${slug}` } : undefined,
  };
}

export default async function TopicHubPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: topicData, error } = await supabase
    .from('topic_clusters')
    .select('id, slug, name, description, content, related_post_ids, related_faq_ids, related_term_ids')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !topicData) notFound();

  const topic = topicData as TopicCluster;

  // Fetch related posts, FAQs, and glossary terms in parallel
  const [postsResult, faqsResult, termsResult] = await Promise.all([
    topic.related_post_ids?.length > 0
      ? supabase
          .from('posts')
          .select('id, slug, title, excerpt, published_at')
          .eq('site_id', site.id)
          .eq('status', 'published')
          .in('id', topic.related_post_ids)
          .order('published_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    topic.related_faq_ids?.length > 0
      ? supabase
          .from('faq_items')
          .select('id, slug, question, answer')
          .eq('site_id', site.id)
          .eq('status', 'published')
          .in('id', topic.related_faq_ids)
      : Promise.resolve({ data: [] }),

    topic.related_term_ids?.length > 0
      ? supabase
          .from('glossary_terms')
          .select('id, slug, term, definition')
          .eq('site_id', site.id)
          .eq('status', 'published')
          .in('id', topic.related_term_ids)
      : Promise.resolve({ data: [] }),
  ]);

  const posts = postsResult.data || [];
  const faqs = faqsResult.data || [];
  const terms = termsResult.data || [];

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Topics', url: `${baseUrl}/topics` },
    { name: topic.name, url: `${baseUrl}/topics/${slug}` },
  ];

  // Article schema with hasPart links to all spoke content
  const topicSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.name,
    description: topic.description || undefined,
    url: `${baseUrl}/topics/${slug}`,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${baseUrl}/topics/${slug}` },
    hasPart: [
      ...posts.map((p) => ({
        '@type': 'Article',
        headline: p.title,
        url: `${baseUrl}/blog/${p.slug}`,
      })),
      ...faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        url: `${baseUrl}/faq/${f.slug}`,
      })),
      ...terms.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.term,
        url: `${baseUrl}/glossary/${t.slug}`,
      })),
    ],
  };

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      <Script id="jsonld-topic-hub" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(topicSchema)}
      </Script>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground">{topic.name}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{topic.name}</h1>

        {topic.description && (
          <p className="text-lg text-muted-foreground mb-8">{topic.description}</p>
        )}

        {/* Hub content */}
        {topic.content && (
          <div className="prose prose-lg max-w-none mb-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.content}</ReactMarkdown>
          </div>
        )}

        {/* Related Articles */}
        {posts.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-bold mb-5">
              <FileText className="h-5 w-5 text-primary" />
              Articles
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="border rounded-xl p-4 hover:bg-muted/50 transition group"
                >
                  <h3 className="font-medium group-hover:text-primary transition line-clamp-2">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related FAQs */}
        {faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-bold mb-5">
              <HelpCircle className="h-5 w-5 text-primary" />
              Common Questions
            </h2>
            <div className="divide-y border rounded-xl overflow-hidden">
              {faqs.map((f) => (
                <Link
                  key={f.id}
                  href={`/faq/${f.slug}`}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition group"
                >
                  <span className="text-primary font-semibold text-sm shrink-0 mt-0.5">Q</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium group-hover:text-primary transition text-sm">
                      {f.question}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{f.answer}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Glossary Terms */}
        {terms.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-bold mb-5">
              <BookOpen className="h-5 w-5 text-primary" />
              Key Terms
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {terms.map((t) => (
                <Link
                  key={t.id}
                  href={`/glossary/${t.slug}`}
                  className="border rounded-xl p-4 hover:bg-muted/50 transition group"
                >
                  <p className="font-semibold group-hover:text-primary transition">{t.term}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.definition}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
