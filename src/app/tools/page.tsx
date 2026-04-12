import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { CalculatorTemplate, QuizTemplate } from '@/types';
import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { ToolsBrowser, type ToolItem } from './ToolsBrowser';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();

  return {
    title: `Free Tools & Calculators | ${site.name}`,
    description: `Use our free ${site.niche?.toLowerCase() || ''} calculators and quizzes to make smarter decisions. Interactive tools designed to help you.`,
    openGraph: {
      title: `Free Tools & Calculators | ${site.name}`,
      description: `Interactive tools and calculators for ${site.niche?.toLowerCase() || 'smarter decisions'}`,
      type: 'website',
    },
  };
}

// JSON-LD for tools collection
function ToolsJsonLd({
  calculators,
  quizzes,
  siteName,
  domain
}: {
  calculators: Pick<CalculatorTemplate, 'slug' | 'name' | 'description'>[];
  quizzes: Pick<QuizTemplate, 'slug' | 'name' | 'description'>[];
  siteName: string;
  domain: string;
}) {
  const items = [
    ...calculators.map((calc, i) => ({
      "@type": "SoftwareApplication",
      "position": i + 1,
      "name": calc.name,
      "description": calc.description,
      "url": `https://${domain}/tools/calculators/${calc.slug}`,
      "applicationCategory": "UtilitiesApplication",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    })),
    ...quizzes.map((quiz, i) => ({
      "@type": "Quiz",
      "position": calculators.length + i + 1,
      "name": quiz.name,
      "description": quiz.description,
      "url": `https://${domain}/tools/quizzes/${quiz.slug}`,
    }))
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Free Tools from ${siteName}`,
    "itemListElement": items,
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
    >
      {JSON.stringify(jsonLd)}
    </script>
  );
}

export default async function ToolsPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const domain = site.domain || `${site.slug}.vercel.app`;

  // Fetch active calculators
  const { data: calculators } = await supabase
    .from('calculator_templates')
    .select('id, slug, name, description, calculator_type, usage_count, meta_description')
    .eq('site_id', site.id)
    .eq('is_active', true)
    .order('usage_count', { ascending: false });

  // Fetch active quizzes
  const { data: quizzes } = await supabase
    .from('quiz_templates')
    .select('id, slug, name, description, quiz_type, completion_count, meta_description')
    .eq('site_id', site.id)
    .eq('is_active', true)
    .order('completion_count', { ascending: false });

  const calculatorList = (calculators || []) as Pick<CalculatorTemplate, 'id' | 'slug' | 'name' | 'description' | 'calculator_type' | 'usage_count'>[];
  const quizList = (quizzes || []) as Pick<QuizTemplate, 'id' | 'slug' | 'name' | 'description' | 'quiz_type' | 'completion_count'>[];

  // Pull a sampling of FAQ + glossary entries so they appear in the "Reference"
  // filter. The dedicated pages at /faq and /glossary remain the real entry
  // points — this is a discovery surface.
  const [{ data: faqItems }, { data: glossaryCount }] = await Promise.all([
    supabase
      .from('faq_items')
      .select('id, question', { count: 'exact', head: false })
      .eq('site_id', site.id)
      .eq('status', 'published')
      .limit(0),
    supabase
      .from('glossary_terms')
      .select('id', { count: 'exact', head: true })
      .eq('site_id', site.id)
      .eq('status', 'published'),
  ]);
  const faqCount = faqItems?.length ?? 0;
  const glossaryTotal = (glossaryCount as any)?.count ?? 0;

  // Assemble unified tool list for the client browser.
  const tools: ToolItem[] = [
    ...calculatorList.map((calc) => ({
      id: `calc-${calc.id}`,
      name: calc.name,
      description: calc.description,
      href: `/tools/calculators/${calc.slug}`,
      kind: 'calculator' as const,
      metrics: calc.usage_count > 0 ? { label: 'uses', value: calc.usage_count.toLocaleString() } : null,
    })),
    ...quizList.map((quiz) => ({
      id: `quiz-${quiz.id}`,
      name: quiz.name,
      description: quiz.description,
      href: `/tools/quizzes/${quiz.slug}`,
      kind: 'quiz' as const,
      metrics: quiz.completion_count > 0 ? { label: 'completions', value: quiz.completion_count.toLocaleString() } : null,
    })),
  ];

  // Surface the knowledge-base entry points as "reference tools" so the
  // filter gains a populated third tab when the site has KB content.
  if (faqCount > 0) {
    tools.push({
      id: 'ref-faq',
      name: 'FAQ — Frequently Asked Questions',
      description: `Quick answers to the most common ${site.niche || ''} questions we get.`,
      href: '/faq',
      kind: 'reference',
      metrics: { label: 'answers', value: `${faqCount}+` },
    });
  }
  if (glossaryTotal > 0) {
    tools.push({
      id: 'ref-glossary',
      name: 'Glossary',
      description: `Plain-English definitions of every ${site.niche || ''} term you\u2019ll encounter.`,
      href: '/glossary',
      kind: 'reference',
      metrics: { label: 'terms', value: String(glossaryTotal) },
    });
  }

  const hasTools = tools.length > 0;

  const baseUrl = site.domain ? `https://${site.domain}` : '';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <JsonLd type="breadcrumb" data={{ items: [
        { name: 'Home', url: baseUrl || '/' },
        { name: 'Tools', url: `${baseUrl}/tools` },
      ]}} />
      <ToolsJsonLd
        calculators={calculatorList}
        quizzes={quizList}
        siteName={site.name}
        domain={domain}
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Free Tools & Calculators
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Make smarter decisions with our interactive tools designed for {site.niche?.toLowerCase() || 'you'}.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {!hasTools ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tools Coming Soon
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              We are building helpful calculators and quizzes. Check back soon!
            </p>
            <div className="mt-6">
              <Link
                href="/compare/builder"
                className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Build a product comparison instead →
              </Link>
            </div>
          </div>
        ) : (
          <ToolsBrowser tools={tools} niche={site.niche} />
        )}
      </div>
    </main>
  );
}
