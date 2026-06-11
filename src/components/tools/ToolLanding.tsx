/**
 * ToolLanding — server component wrapper for bespoke per-site tool pages.
 *
 * Renders SEO-friendly header copy (the page's single h1 + intro), the
 * interactive tool in the children slot, and an optional FAQ section with
 * FAQPage JSON-LD.
 *
 * @example
 * <ToolLanding
 *   title="eBike Range Calculator"
 *   intro="Estimate real-world range from battery size, terrain, and rider weight."
 *   faq={[{ q: 'How accurate is this?', a: 'Within ~10% for typical conditions.' }]}
 * >
 *   <Calculator template={template} siteId={site.id} />
 * </ToolLanding>
 */

import JsonLd from '@/components/JsonLd';

interface ToolLandingFaqItem {
  q: string;
  a: string;
}

interface ToolLandingProps {
  title: string;
  intro: string;
  faq?: ToolLandingFaqItem[];
  children: React.ReactNode;
}

export function ToolLanding({ title, intro, faq = [], children }: ToolLandingProps) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-10 lg:py-14">
      {/* SEO header — the page's single h1 */}
      <header className="mb-8 lg:mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {intro}
        </p>
      </header>

      {/* Interactive tool slot */}
      <div className="mb-12">{children}</div>

      {/* FAQ with FAQPage structured data */}
      {faq.length > 0 && (
        <section aria-labelledby="tool-faq-heading" className="border-t pt-8">
          <JsonLd
            type="faq"
            data={{ faqs: faq.map((item) => ({ question: item.q, answer: item.a })) }}
          />
          <h2 id="tool-faq-heading" className="text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {faq.map((item, i) => (
              <div key={i}>
                <dt className="text-lg font-semibold mb-2">{item.q}</dt>
                <dd className="text-muted-foreground leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
