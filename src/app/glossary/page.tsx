import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import Script from 'next/script';

export const revalidate = 3600;

export async function generateMetadata() {
  const site = getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    title: `${site.niche || site.name} Glossary | ${site.name}`,
    description: `Key terms and definitions for ${site.niche || site.name}. An authoritative reference for understanding the most important concepts.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/glossary` } : undefined,
  };
}

interface GlossaryTerm {
  id: string;
  slug: string;
  term: string;
  definition: string;
  category: string | null;
}

export default async function GlossaryIndexPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: terms } = await supabase
    .from('glossary_terms')
    .select('id, slug, term, definition, category')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('term', { ascending: true });

  const items = (terms as GlossaryTerm[]) || [];

  // Group alphabetically
  const grouped: Record<string, GlossaryTerm[]> = {};
  for (const term of items) {
    const letter = term.term.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : '#';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(term);
  }
  const activeLetters = Object.keys(grouped).sort();

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Glossary', url: `${baseUrl}/glossary` },
  ];

  // DefinedTermSet schema
  const definedTermSetSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: `${site.name} Glossary`,
    description: `Key terms and definitions for ${site.niche || site.name}`,
    url: `${baseUrl}/glossary`,
    hasDefinedTerm: items.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.definition,
      url: `${baseUrl}/glossary/${t.slug}`,
      inDefinedTermSet: `${baseUrl}/glossary`,
    })),
  };

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      {items.length > 0 && (
        <Script id="jsonld-definedtermset" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(definedTermSetSchema)}
        </Script>
      )}

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground">Glossary</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">
            {site.niche || site.name} Glossary
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          {items.length} terms defined. An authoritative reference for{' '}
          {site.niche || site.name}.
        </p>

        {/* Alphabet navigation */}
        {activeLetters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
              const isActive = grouped[letter] !== undefined;
              return isActive ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="px-3 py-1 rounded-lg text-sm font-medium border hover:bg-primary/10 hover:text-primary transition"
                >
                  {letter}
                </a>
              ) : (
                <span
                  key={letter}
                  className="px-3 py-1 rounded-lg text-sm font-medium border text-muted-foreground/40 cursor-default"
                >
                  {letter}
                </span>
              );
            })}
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-muted-foreground">No terms published yet.</p>
        ) : (
          activeLetters.map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-20 mb-8">
              <h2 className="text-2xl font-bold mb-4">{letter}</h2>
              <div className="border rounded-xl overflow-hidden">
                {grouped[letter].map((t) => (
                  <Link
                    key={t.id}
                    href={`/glossary/${t.slug}`}
                    className="flex items-start gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition">
                        {t.term}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {t.definition}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition" />
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
