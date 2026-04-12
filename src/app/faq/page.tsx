import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600;

export async function generateMetadata() {
  const site = getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    title: `Frequently Asked Questions | ${site.name}`,
    description: `Answers to common questions about ${site.niche || site.name}.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/faq` } : undefined,
  };
}

interface FaqItem {
  id: string;
  slug: string;
  question: string;
  answer: string;
  category_id: string | null;
}

export default async function FaqIndexPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: faqs } = await supabase
    .from('faq_items')
    .select('id, slug, question, answer, category_id')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  const items = (faqs as FaqItem[]) || [];

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'FAQ', url: `${baseUrl}/faq` },
  ];

  // Build FAQPage schema with all published questions
  const faqSchemaData = {
    faqs: items.map((f) => ({ question: f.question, answer: f.answer })),
  };

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      {items.length > 0 && <JsonLd type="faq" data={faqSchemaData} />}

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground">FAQ</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mb-10 text-lg">
          Common questions about {site.niche || site.name}, answered directly.
        </p>

        {items.length === 0 ? (
          <p className="text-muted-foreground">No FAQ items published yet.</p>
        ) : (
          <div className="divide-y border rounded-xl overflow-hidden">
            {items.map((faq) => (
              <Link
                key={faq.id}
                href={`/faq/${faq.slug}`}
                className="flex items-start gap-4 p-5 hover:bg-muted/50 transition group"
              >
                <span className="mt-0.5 text-primary font-semibold text-sm shrink-0">Q</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium group-hover:text-primary transition leading-snug">
                    {faq.question}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
