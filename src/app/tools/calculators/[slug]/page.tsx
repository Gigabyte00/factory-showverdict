import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import { Calculator } from '@/components/tools';
import type { CalculatorTemplate } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: calculator } = await supabase
    .from('calculator_templates')
    .select('name, meta_title, meta_description, description')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!calculator) {
    return { title: 'Calculator Not Found' };
  }

  const title = calculator.meta_title || `${calculator.name} | ${site.name}`;
  const description = calculator.meta_description || calculator.description || `Free ${calculator.name} tool from ${site.name}`;

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

// Generate static params for all calculators
export async function generateStaticParams() {
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: calculators } = await supabase
    .from('calculator_templates')
    .select('slug')
    .eq('site_id', site.id)
    .eq('is_active', true);

  return (calculators || []).map((calc) => ({
    slug: calc.slug,
  }));
}

// JSON-LD for calculator
function CalculatorJsonLd({
  calculator,
  siteName,
  domain
}: {
  calculator: CalculatorTemplate;
  siteName: string;
  domain: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": calculator.name,
    "description": calculator.description,
    "url": `https://${domain}/tools/calculators/${calculator.slug}`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": siteName
    }
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

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const domain = site.domain || `${site.slug}.vercel.app`;

  // Fetch calculator template
  const { data: calculator, error } = await supabase
    .from('calculator_templates')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !calculator) {
    notFound();
  }

  // Cast through unknown since DB Row types use generic Json for JSONB columns
  const typedCalculator = calculator as unknown as CalculatorTemplate;

  const baseUrl = site.domain ? `https://${site.domain}` : '';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <JsonLd type="breadcrumb" data={{ items: [
        { name: 'Home', url: baseUrl || '/' },
        { name: 'Tools', url: `${baseUrl}/tools` },
        { name: typedCalculator.name, url: `${baseUrl}/tools/calculators/${typedCalculator.slug}` },
      ]}} />
      <CalculatorJsonLd
        calculator={typedCalculator}
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
            <span className="text-gray-900 dark:text-white">{typedCalculator.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Calculator template={typedCalculator} siteId={site.id} />

        {/* SEO Content */}
        {typedCalculator.target_keyword && (
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>About This {typedCalculator.name}</h2>
            <p>
              Use our free {typedCalculator.name.toLowerCase()} to make informed decisions.
              This tool is designed to help you understand your options and find the best
              solution for your needs.
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
