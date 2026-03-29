import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { CalculatorTemplate, QuizTemplate } from '@/types';
import Link from 'next/link';
import type { Metadata } from 'next';

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

  const hasTools = calculatorList.length > 0 || quizList.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          </div>
        ) : (
          <div className="space-y-12">
            {/* Calculators Section */}
            {calculatorList.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span>📊</span> Calculators
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {calculatorList.map((calc) => (
                    <Link
                      key={calc.id}
                      href={`/tools/calculators/${calc.slug}`}
                      className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {calc.name}
                        </h3>
                        <span className="text-2xl">🧮</span>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                        {calc.description}
                      </p>
                      {calc.usage_count > 0 && (
                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          Used {calc.usage_count.toLocaleString()} times
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Quizzes Section */}
            {quizList.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span>📝</span> Quizzes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizList.map((quiz) => (
                    <Link
                      key={quiz.id}
                      href={`/tools/quizzes/${quiz.slug}`}
                      className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {quiz.name}
                        </h3>
                        <span className="text-2xl">
                          {quiz.quiz_type === 'assessment' ? '📋' : quiz.quiz_type === 'personality' ? '🎭' : '🎯'}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                        {quiz.description}
                      </p>
                      {quiz.completion_count > 0 && (
                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          Completed {quiz.completion_count.toLocaleString()} times
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
