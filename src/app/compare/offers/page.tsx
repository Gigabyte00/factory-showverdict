import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { Offer } from '@/types';
import { SideBySide, type OfferCompareItem } from '@/components/offers/SideBySide';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';

// IDs come from ?ids= query string — cannot statically generate
export const dynamic = 'force-dynamic';

const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

function parseIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const str = Array.isArray(raw) ? raw[0] : raw;
  return str
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE);
}

/**
 * Build a feature comparison map from an offer's pros/cons arrays.
 * Pros render as ✓ (true) and cons as ✗ (false) in the SideBySide table.
 */
function buildFeatures(offer: Offer): Record<string, boolean> {
  const features: Record<string, boolean> = {};
  for (const pro of offer.pros ?? []) {
    features[pro] = true;
  }
  for (const con of offer.cons ?? []) {
    if (!(con in features)) {
      features[con] = false;
    }
  }
  return features;
}

function offerToCompareItem(offer: Offer): OfferCompareItem {
  return {
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    image: offer.featured_image_url ?? offer.logo_url ?? null,
    price: null,
    rating: offer.rating ?? null,
    reviewCount: null,
    affiliateUrl: offer.affiliate_url,
    award: null,
    features: buildFeatures(offer),
  };
}

// ── Metadata ─────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ ids?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { ids: rawIds } = await searchParams;
  const ids = parseIds(rawIds);
  if (ids.length < MIN_COMPARE) return { title: 'Compare Offers' };

  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data } = await supabase
    .from('offers')
    .select('name')
    .eq('site_id', site.id)
    .in('id', ids);

  if (!data?.length) return { title: 'Compare Offers' };

  const names = data.map((o) => o.name);
  const vsTitle =
    names.length === 2
      ? `${names[0]} vs ${names[1]}`
      : `${names.slice(0, -1).join(', ')} vs ${names[names.length - 1]}`;

  return {
    // Don't append site.name — root layout title template adds it automatically
    title: vsTitle,
    description: `Side-by-side comparison of ${names.join(', ')}. See features, ratings, and which is right for you.`,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CompareOffersPage({ searchParams }: PageProps) {
  const { ids: rawIds } = await searchParams;
  const ids = parseIds(rawIds);

  if (ids.length < MIN_COMPARE) notFound();

  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: offers, error } = await supabase
    .from('offers')
    .select('*')
    .eq('site_id', site.id)
    .eq('is_active', true)
    .in('id', ids);

  if (error || !offers || offers.length < MIN_COMPARE) notFound();

  // Preserve the column order from the query string
  const ordered = ids
    .map((id) => offers.find((o) => o.id === id))
    .filter((o): o is Offer => o != null);

  const compareItems = ordered.map(offerToCompareItem);

  // Build a stable, ordered feature key list: all pros first (alpha), then all cons (alpha)
  const allPros = new Set<string>();
  const allCons = new Set<string>();
  for (const o of ordered) {
    for (const p of o.pros ?? []) allPros.add(p);
    for (const c of o.cons ?? []) {
      if (!allPros.has(c)) allCons.add(c);
    }
  }
  const featureKeys =
    allPros.size + allCons.size > 0
      ? [...Array.from(allPros).sort(), ...Array.from(allCons).sort()]
      : undefined;

  const vsTitle =
    compareItems.length === 2
      ? `${compareItems[0].name} vs ${compareItems[1].name}`
      : `${compareItems.map((o) => o.name).join(' vs ')}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link
        href="/offers"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to all offers
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">{vsTitle}</h1>
        <p className="mt-2 text-muted-foreground">
          Feature-by-feature comparison to help you choose the right option.
        </p>
      </div>

      <div className="mb-6">
        <AffiliateDisclosure />
      </div>

      <SideBySide
        offers={compareItems}
        featureKeys={featureKeys}
        ctaText="View Deal"
      />

      {ordered.some((o) => o.short_description) && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ordered.map((offer) =>
            offer.short_description ? (
              <div key={offer.id} className="rounded-xl border bg-card p-6">
                <h2 className="mb-2 text-lg font-semibold">{offer.name}</h2>
                <p className="text-sm text-muted-foreground">{offer.short_description}</p>
                <a
                  href={offer.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored nofollow"
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Visit {offer.name} &rarr;
                </a>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
