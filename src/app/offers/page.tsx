import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { Category } from '@/types';
import { getTemplate, getDefaultVariant } from '@/lib/templates/registry';
import { OfferFilters } from '@/components/offers/OfferFilters';

export const revalidate = 0; // Dynamic — filters change per request

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  return {
    title: `Best ${site.niche || 'Deals'} Offers`,
    description: `Compare the top ${(site.niche || 'product').toLowerCase()} offers, deals, and recommendations — curated by ${site.name}.`,
  };
}

export default async function OffersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const site = getSiteConfig();
  const supabase = createServerClient();

  // Parse filter params
  const minRating = params.minRating ? Number(params.minRating) : null;
  const award = params.award as string | undefined;
  const sort = (params.sort as string) || 'recommended';

  // Build offers query with filters
  let offersQuery = supabase
    .from('offers')
    .select('*')
    .eq('site_id', site.id)
    .eq('is_active', true);

  if (minRating) {
    offersQuery = offersQuery.gte('rating', minRating);
  }
  if (award) {
    offersQuery = offersQuery.eq('award', award);
  }

  // Apply sort
  if (sort === 'rating') {
    offersQuery = offersQuery.order('rating', { ascending: false });
  } else if (sort === 'price_asc') {
    offersQuery = offersQuery.order('price_usd', { ascending: true, nullsFirst: false });
  } else if (sort === 'price_desc') {
    offersQuery = offersQuery.order('price_usd', { ascending: false, nullsFirst: false });
  } else if (sort === 'most_clicked') {
    offersQuery = offersQuery.order('priority', { ascending: false });
  } else {
    offersQuery = offersQuery.order('priority', { ascending: false }).order('name');
  }

  const [offersResult, categoriesResult, awardsResult] = await Promise.all([
    offersQuery,
    supabase.from('categories').select('*').eq('site_id', site.id).order('name'),
    // Get distinct awards for filter UI
    supabase
      .from('offers')
      .select('award')
      .eq('site_id', site.id)
      .eq('is_active', true)
      .not('award', 'is', null),
  ]);

  const offers = offersResult.data || [];
  const categories = categoriesResult.data || [];

  // Collect distinct awards for filter UI
  const availableAwards = [
    ...new Set(
      (awardsResult.data || [])
        .map((o: { award: string | null }) => o.award)
        .filter((a): a is string => Boolean(a))
    ),
  ];

  // Determine template variant
  // Priority: 1. Site settings, 2. Auto-detect based on offer count, 3. Default
  let variant = site.settings?.offersVariant;

  if (!variant) {
    if (offers.length <= 5) {
      variant = 'carousel';
    } else if (offers.length <= 10) {
      variant = 'table';
    } else {
      variant = 'grid';
    }
  }

  const Template = getTemplate('offers', variant);

  const templateEl = (() => {
    if (Template) {
      return <Template offers={offers} categories={categories} site={site} />;
    }
    const defaultVariant = getDefaultVariant('offers');
    const DefaultTemplate = getTemplate('offers', defaultVariant);
    if (!DefaultTemplate) throw new Error('No offers templates available');
    return <DefaultTemplate offers={offers} categories={categories} site={site} />;
  })();

  const hasActiveFilters = Boolean(minRating || award || (sort && sort !== 'recommended'));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filter panel */}
        <aside className="w-full lg:w-56 shrink-0">
          <OfferFilters availableAwards={availableAwards} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {hasActiveFilters && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing {offers.length} offer{offers.length !== 1 ? 's' : ''}
            </p>
          )}
          {templateEl}
        </div>
      </div>
    </div>
  );
}
