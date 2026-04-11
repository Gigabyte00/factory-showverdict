import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import JsonLd from '@/components/JsonLd';
import { TrustBadges } from '@/components/content/TrustBadges';
import { Prose } from '@/components/content';
import Link from 'next/link';
import { ChevronRight, FlaskConical, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 86400;

export async function generateMetadata() {
  const site = getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    title: `Our Review Methodology | ${site.name}`,
    description: `How ${site.name} researches, tests, and evaluates ${(site.niche ?? 'products').toLowerCase()}. Our transparent review process and scoring criteria.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/methodology` } : undefined,
  };
}

const FALLBACK_METHODOLOGY = (siteName: string, niche: string) => `
## How We Research & Test

At ${siteName}, every review is the result of hands-on research, real-world testing, and careful analysis. We never accept payment to alter our ratings or recommendations.

## Our Evaluation Criteria

We score each product or service across five weighted dimensions:

| Criteria | Weight | What We Measure |
|----------|--------|-----------------|
| **Performance** | 30% | Real-world results, accuracy, reliability |
| **Value** | 25% | Price vs. features, hidden costs, ROI |
| **Ease of Use** | 20% | Onboarding, interface, learning curve |
| **Support & Trust** | 15% | Customer service, documentation, reputation |
| **Features** | 10% | Core capabilities vs. alternatives |

## Our Review Process

1. **Initial research** — We study each ${niche.toLowerCase()} product's official documentation, user reviews, and expert analyses.
2. **Hands-on testing** — Our editors personally test each product with real use cases.
3. **Comparative analysis** — We benchmark against 3-5 direct alternatives.
4. **Expert review** — A credentialed specialist in the field reviews our findings.
5. **Final scoring** — We calculate a weighted score and assign our rating.

## Editorial Independence

${siteName} earns revenue through affiliate commissions when readers purchase through our links. This never influences our ratings or which products we recommend. Products we do not recommend are reviewed just as thoroughly as those we do.

## How Often We Update

We review and update our ratings quarterly or whenever a significant product change occurs. The "Last Updated" date on each review reflects when we last verified the information.

## Contact Our Editorial Team

If you believe a review contains an error or outdated information, please [contact us](/contact).
`;

export default async function MethodologyPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: methodology } = await supabase
    .from('site_pages')
    .select('title, meta_description, content, last_updated_at')
    .eq('site_id', site.id)
    .eq('slug', 'methodology')
    .eq('status', 'published')
    .single();

  const { count: reviewCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', site.id)
    .eq('status', 'published');

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Methodology', url: `${baseUrl}/methodology` },
  ];

  const pageTitle = methodology?.title ?? `How We Review ${site.niche ?? 'Products'}`;
  const pageSummary =
    methodology?.meta_description ??
    `Our transparent process for researching and evaluating ${(site.niche ?? 'products').toLowerCase()}.`;
  const pageContent =
    methodology?.content ?? FALLBACK_METHODOLOGY(site.name, site.niche ?? 'products');
  const lastUpdated = methodology?.last_updated_at ?? new Date().toISOString();

  // JSON.stringify produces valid, safely-escaped JSON — no XSS risk
  const webPageSchemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: pageSummary,
    url: `${baseUrl}/methodology`,
    dateModified: lastUpdated,
    isPartOf: { '@type': 'WebSite', name: site.name, url: baseUrl },
    about: { '@type': 'Thing', name: `${site.niche ?? 'Product'} Review Methodology` },
  });

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      {/* JSON.stringify output is always valid JSON — safe for dangerouslySetInnerHTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webPageSchemaJson }} />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground">Methodology</span>
        </nav>

        <div className="flex items-start gap-4 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{pageTitle}</h1>
            <p className="text-muted-foreground text-lg">{pageSummary}</p>
          </div>
        </div>

        <TrustBadges reviewCount={reviewCount} lastUpdated={lastUpdated} className="mb-8" />

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { title: 'No Pay-to-Play', desc: 'We never accept payment to change ratings.' },
            { title: 'Real Testing', desc: 'Every product is personally evaluated by our team.' },
            { title: 'Always Updated', desc: 'We refresh reviews when products change.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-2.5 p-4 border rounded-xl bg-muted/20">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Prose>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{pageContent}</ReactMarkdown>
        </Prose>

        <p className="text-xs text-muted-foreground mt-8 border-t pt-4">
          Last updated{' '}
          {new Date(lastUpdated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </>
  );
}
