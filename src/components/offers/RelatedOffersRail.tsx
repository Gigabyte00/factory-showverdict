import { createServerClient } from '@/lib/supabase';
import AffiliateDisclosure from '@/components/AffiliateDisclosure';

interface RelatedOffersRailProps {
  relatedOfferIds: string[] | null | undefined;
  siteId: string;
  heading?: string;
}

interface RailOffer {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  featured_image_url: string | null;
  rating: number | null;
}

/**
 * Related-offers grid rendered under the article body when posts.related_offer_ids
 * is populated. Renders nothing without data. Plain <img> by design: offer images
 * may live on hosts outside next/image remotePatterns and must never 500 the page.
 */
export default async function RelatedOffersRail({
  relatedOfferIds,
  siteId,
  heading = 'Featured Products',
}: RelatedOffersRailProps) {
  if (!relatedOfferIds || relatedOfferIds.length === 0) return null;
  const supabase = createServerClient();
  const { data } = await supabase
    .from('offers')
    .select('id, slug, name, description, featured_image_url, rating')
    .in('id', relatedOfferIds)
    .eq('site_id', siteId)
    .eq('is_active', true);
  const offers = (data ?? []) as RailOffer[];
  if (offers.length === 0) return null;
  const order = new Map(relatedOfferIds.map((id, i) => [id, i]));
  offers.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));

  return (
    <section className="container mx-auto max-w-4xl px-4 py-10">
      <h2 className="text-2xl font-bold mb-2">{heading}</h2>
      <AffiliateDisclosure variant="inline" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border bg-card overflow-hidden flex flex-col">
            {offer.featured_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.featured_image_url}
                alt={offer.name}
                loading="lazy"
                className="h-44 w-full object-cover bg-muted"
              />
            )}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold leading-snug">{offer.name}</h3>
              {typeof offer.rating === 'number' && offer.rating > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {'\u2605'.repeat(Math.max(1, Math.min(5, Math.round(offer.rating))))} {offer.rating.toFixed(1)}
                </p>
              )}
              {offer.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{offer.description}</p>
              )}
              <a
                href={"/go/" + offer.slug}
                target="_blank"
                rel="nofollow sponsored noopener"
                data-placement="related-rail"
                className="mt-auto pt-4"
              >
                <span className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                  View Deal
                </span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
