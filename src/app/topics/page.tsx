import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronRight, Network } from 'lucide-react';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600;

export async function generateMetadata() {
  const site = getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    title: `Topic Guides`,
    description: `In-depth guides covering every aspect of ${site.niche || site.name}.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/topics` } : undefined,
  };
}

interface TopicCluster {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  related_post_ids: string[];
  related_faq_ids: string[];
  related_term_ids: string[];
}

export default async function TopicsIndexPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: topics } = await supabase
    .from('topic_clusters')
    .select('id, slug, name, description, related_post_ids, related_faq_ids, related_term_ids')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('name', { ascending: true });

  const items = (topics as TopicCluster[]) || [];

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Topics', url: `${baseUrl}/topics` },
  ];

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground">Topics</span>
        </nav>

        <div className="flex items-center gap-3 mb-4">
          <Network className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Topic Guides</h1>
        </div>
        <p className="text-muted-foreground mb-10 text-lg">
          Comprehensive guides covering every area of {site.niche || site.name}.
        </p>

        {items.length === 0 ? (
          <p className="text-muted-foreground">No topic guides published yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((topic) => {
              const totalItems =
                (topic.related_post_ids?.length ?? 0) +
                (topic.related_faq_ids?.length ?? 0) +
                (topic.related_term_ids?.length ?? 0);
              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="border rounded-xl p-5 hover:bg-muted/50 hover:border-primary/40 transition group"
                >
                  <h2 className="font-semibold text-lg group-hover:text-primary transition mb-1">
                    {topic.name}
                  </h2>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {topic.description}
                    </p>
                  )}
                  {totalItems > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {totalItems} resource{totalItems !== 1 ? 's' : ''}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
