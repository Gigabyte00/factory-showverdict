import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';
import { ChevronDown } from 'lucide-react';
import JsonLd from '@/components/JsonLd';

interface FAQRow {
  id: string;
  question: string;
  answer: string;
  slug: string;
}

/**
 * Homepage FAQ accordion section.
 * Fetches top 5 FAQs from the faq_items table and renders with FAQ JSON-LD for SEO.
 */
export async function HomepageFAQ() {
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: faqs } = await supabase
    .from('faq_items')
    .select('id, question, answer, slug')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('created_at')
    .limit(5);

  if (!faqs || faqs.length === 0) return null;

  const faqItems = faqs as unknown as FAQRow[];

  return (
    <section className="py-16 lg:py-20">
      <JsonLd
        type="faq"
        data={{ faqs: faqItems.map(f => ({ question: f.question, answer: f.answer })) }}
      />
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            FAQ
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Quick answers to common questions about {site.niche || 'our recommendations'}
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-lg border bg-card"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-medium text-foreground">
                {faq.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
