import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();

  return {
    title: `Product Guides by Use Case | ${site.name}`,
    description: `Find the perfect products for your specific needs. Expert recommendations tailored to your use case.`,
  };
}

export default async function UseCasesIndexPage() {
  const supabase = createServerClient();
  const site = await getSiteConfig();

  const { data: useCases } = await supabase
    .from('use_cases')
    .select('slug, title, use_case_name, recommended_offer_ids, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Products by Use Case</h1>
        <p className="text-xl text-muted-foreground">
          Not sure what you need? Find the best products for your specific situation. We&apos;ve curated recommendations for common use cases.
        </p>
      </div>

      {/* Use Case Grid */}
      {!useCases || useCases.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/50">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-semibold">No guides yet</h2>
            <p className="text-muted-foreground">Check back soon for use-case specific recommendations.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <Link
              key={useCase.slug}
              href={`/for/${useCase.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Use Case Guide
                  </span>
                  {useCase.recommended_offer_ids && useCase.recommended_offer_ids.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {useCase.recommended_offer_ids.length} recommendations
                    </span>
                  )}
                </div>

                <h2 className="mb-2 text-lg font-semibold group-hover:text-primary">
                  {useCase.title}
                </h2>

                <p className="mb-4 text-sm text-muted-foreground">
                  Best products for {useCase.use_case_name.toLowerCase()}
                </p>

                {useCase.published_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(useCase.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
