import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Script from 'next/script';
import JsonLd from '@/components/JsonLd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ term: string }>;
}

interface GlossaryTerm {
  id: string;
  slug: string;
  term: string;
  definition: string;
  category: string | null;
  related_terms: string[];
}

export async function generateMetadata({ params }: PageProps) {
  const { term: termSlug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data } = await supabase
    .from('glossary_terms')
    .select('term, definition')
    .eq('site_id', site.id)
    .eq('slug', termSlug)
    .eq('status', 'published')
    .single();

  if (!data) return { title: 'Term Not Found' };

  return {
    title: `${data.term}: Definition & Explanation`,
    description: (data.definition ?? '').slice(0, 160),
    alternates: baseUrl ? { canonical: `${baseUrl}/glossary/${termSlug}` } : undefined,
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { term: termSlug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: termData, error } = await supabase
    .from('glossary_terms')
    .select('id, slug, term, definition, category, related_terms')
    .eq('site_id', site.id)
    .eq('slug', termSlug)
    .eq('status', 'published')
    .single();

  if (error || !termData) notFound();

  const glossaryTerm = termData as GlossaryTerm;

  // Resolve related term slugs → full term objects
  let relatedTerms: Array<{ id: string; slug: string; term: string; definition: string }> = [];
  if (glossaryTerm.related_terms && glossaryTerm.related_terms.length > 0) {
    const { data } = await supabase
      .from('glossary_terms')
      .select('id, slug, term, definition')
      .eq('site_id', site.id)
      .eq('status', 'published')
      .in('slug', glossaryTerm.related_terms);
    relatedTerms = data || [];
  }

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Glossary', url: `${baseUrl}/glossary` },
    { name: glossaryTerm.term, url: `${baseUrl}/glossary/${termSlug}` },
  ];

  // DefinedTerm schema
  const definedTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: glossaryTerm.term,
    description: glossaryTerm.definition,
    url: `${baseUrl}/glossary/${termSlug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: `${site.name} Glossary`,
      url: `${baseUrl}/glossary`,
    },
  };

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      <Script id="jsonld-definedterm" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(definedTermSchema)}
      </Script>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap gap-1">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/glossary" className="hover:text-foreground transition">Glossary</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{glossaryTerm.term}</span>
        </nav>

        {glossaryTerm.category && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {glossaryTerm.category}
          </p>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-6">{glossaryTerm.term}</h1>

        {/* Definition */}
        <div className="prose prose-lg max-w-none mb-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{glossaryTerm.definition}</ReactMarkdown>
        </div>

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <aside className="border rounded-xl p-6 bg-muted/30">
            <h2 className="font-semibold mb-4">Related Terms</h2>
            <div className="divide-y">
              {relatedTerms.map((r) => (
                <Link
                  key={r.id}
                  href={`/glossary/${r.slug}`}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary transition group"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition" />
                  <div>
                    <p className="font-medium text-sm">{r.term}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {r.definition}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Back to glossary */}
        <div className="mt-8">
          <Link
            href="/glossary"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            &larr; Full glossary
          </Link>
        </div>
      </div>
    </>
  );
}
