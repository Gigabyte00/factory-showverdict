import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import { QuizWizard } from '@/components/tools';
import type { QuizTemplate, QuizQuestion, QuizResult } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: quiz } = await supabase
    .from('quiz_templates')
    .select('name, meta_title, meta_description, description')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!quiz) {
    return { title: 'Quiz Not Found' };
  }

  const title = quiz.meta_title || `${quiz.name} | ${site.name}`;
  const description = quiz.meta_description || quiz.description || `Take our free ${quiz.name} and get personalized recommendations from ${site.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

// Generate static params for all quizzes
export async function generateStaticParams() {
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: quizzes } = await supabase
    .from('quiz_templates')
    .select('slug')
    .eq('site_id', site.id)
    .eq('is_active', true);

  return (quizzes || []).map((quiz) => ({
    slug: quiz.slug,
  }));
}

// JSON-LD for quiz
function QuizJsonLd({
  quiz,
  questions,
  siteName,
  domain
}: {
  quiz: QuizTemplate;
  questions: QuizQuestion[];
  siteName: string;
  domain: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": quiz.name,
    "description": quiz.description,
    "url": `https://${domain}/tools/quizzes/${quiz.slug}`,
    "about": {
      "@type": "Thing",
      "name": quiz.name
    },
    "author": {
      "@type": "Organization",
      "name": siteName
    },
    "hasPart": questions.slice(0, 5).map((q, index) => ({
      "@type": "Question",
      "position": index + 1,
      "name": q.question_text,
      "answerCount": q.options?.length || 0
    }))
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

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const domain = site.domain || `${site.slug}.vercel.app`;

  // Fetch quiz template
  const { data: quiz, error: quizError } = await supabase
    .from('quiz_templates')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (quizError || !quiz) {
    notFound();
  }

  // Fetch questions for this quiz
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('template_id', quiz.id)
    .order('order_index', { ascending: true });

  // Fetch results for this quiz
  const { data: results } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('template_id', quiz.id)
    .order('priority', { ascending: false });

  // Cast through unknown since DB Row types use generic Json for JSONB columns
  const typedQuiz = quiz as unknown as QuizTemplate;
  const typedQuestions = (questions || []) as unknown as QuizQuestion[];
  const typedResults = (results || []) as unknown as QuizResult[];

  // Check if quiz has enough content
  if (typedQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/tools" className="hover:text-gray-700 dark:hover:text-gray-200">
                Tools
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white">{typedQuiz.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {typedQuiz.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              This quiz is being set up. Check back soon!
            </p>
            <Link
              href="/tools"
              className="text-primary hover:underline"
            >
              View Other Tools
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <QuizJsonLd
        quiz={typedQuiz}
        questions={typedQuestions}
        siteName={site.name}
        domain={domain}
      />

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-gray-700 dark:hover:text-gray-200">
              Tools
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{typedQuiz.name}</span>
          </nav>
        </div>
      </div>

      {/* Quiz Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {typedQuiz.name}
          </h1>
          {typedQuiz.description && (
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {typedQuiz.description}
            </p>
          )}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{typedQuestions.length} questions</span>
            <span>•</span>
            <span>~{Math.ceil(typedQuestions.length * 0.5)} min</span>
            {typedQuiz.completion_count > 0 && (
              <>
                <span>•</span>
                <span>{typedQuiz.completion_count.toLocaleString()} completed</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <QuizWizard
          template={typedQuiz}
          questions={typedQuestions}
          results={typedResults}
          siteId={site.id}
        />

        {/* SEO Content */}
        {typedQuiz.target_keyword && (
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>About This {typedQuiz.name}</h2>
            <p>
              Take our free {typedQuiz.name.toLowerCase()} to discover personalized recommendations
              based on your unique needs and preferences. This interactive assessment helps you
              find the perfect solution in minutes.
            </p>
          </div>
        )}

        {/* Related Tools */}
        <div className="mt-12 text-center">
          <Link
            href="/tools"
            className="text-primary hover:underline"
          >
            View All Tools
          </Link>
        </div>
      </div>
    </main>
  );
}
