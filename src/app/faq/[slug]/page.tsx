import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface FaqItem {
  id: string;
  slug: string;
  question: string;
  answer: string;
  category_id: string | null;
  topic_cluster_id: string | null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: faq } = await supabase
    .from('faq_items')
    .select('question, answer')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!faq) return { title: 'FAQ Not Found' };

  return {
    title: `${faq.question} | ${site.name}`,
    description: (faq.answer ?? '').slice(0, 160),
    alternates: baseUrl ? { canonical: `${baseUrl}/faq/${slug}` } : undefined,
  };
}

export default async function FaqItemPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: faqData, error } = await supabase
    .from('faq_items')
    .select('id, slug, question, answer, category_id, topic_cluster_id')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !faqData) notFound();

  const faq = faqData as FaqItem;

  // Fetch related FAQ items from the same topic cluster
  let relatedFaqs: Array<{ id: string; slug: string; question: string }> = [];
  if (faq.topic_cluster_id) {
    const { data } = await supabase
      .from('faq_items')
      .select('id, slug, question')
      .eq('site_id', site.id)
      .eq('topic_cluster_id', faq.topic_cluster_id)
      .eq('status', 'published')
      .neq('id', faq.id)
      .limit(5);
    relatedFaqs = data || [];
  }

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'FAQ', url: `${baseUrl}/faq` },
    { name: faq.question, url: `${baseUrl}/faq/${slug}` },
  ];

  const faqSchemaData = {
    faqs: [{ question: faq.question, answer: faq.answer }],
  };

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      <JsonLd type="faq" data={faqSchemaData} />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap gap-1">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/faq" className="hover:text-foreground transition">FAQ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground line-clamp-1">{faq.question}</span>
        </nav>

        {/* Question */}
        <h1 id="key-answer" className="text-2xl md:text-3xl font-bold mb-6 leading-snug">
          {faq.question}
        </h1>

        {/* Answer — rendered as markdown */}
        <div className="prose prose-lg max-w-none mb-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{faq.answer}</ReactMarkdown>
        </div>

        {/* Related questions */}
        {relatedFaqs.length > 0 && (
          <aside className="border rounded-xl p-6 bg-muted/30">
            <h2 className="font-semibold mb-4">Related Questions</h2>
            <ul className="space-y-2">
              {relatedFaqs.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/faq/${r.slug}`}
                    className="text-sm hover:text-primary transition flex items-center gap-2"
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {r.question}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Back to FAQ index */}
        <div className="mt-8">
          <Link
            href="/faq"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            &larr; All questions
          </Link>
        </div>
      </div>
    </>
  );
}
