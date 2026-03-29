import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Star, Check } from 'lucide-react';
import type { Offer } from '@/types';

interface FeaturedOffersProps {
  offers: Offer[];
  siteId?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Featured offers section for homepage
 *
 * Conversion-optimized design:
 * - Visual star ratings for trust
 * - Prominent CTA buttons (not text links)
 * - Editor's Pick badge on top offer
 * - All links route through /go/ for tracking
 */
export function FeaturedOffers({
  offers,
  siteId,
  title = "Recommended Products",
  subtitle = 'Products we recommend based on our research',
}: FeaturedOffersProps) {
  // Only show first 3 featured offers
  const featuredOffers = offers.filter(o => o.is_featured && o.is_active).slice(0, 3);

  if (featuredOffers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        {/* Section header */}
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Our Recommendations
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Offers grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredOffers.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              rank={index + 1}
            />
          ))}
        </div>

        {/* View all link */}
        <div className="mt-10">
          <Link href="/offers" className="text-sm font-medium text-primary hover:underline">
            View all recommendations &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

interface OfferCardProps {
  offer: Offer;
  rank: number;
}

function OfferCard({ offer, rank }: OfferCardProps) {
  return (
    <Card className="border relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Editor's Pick badge on first offer */}
        {rank === 1 && (
          <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
            Editor&apos;s Pick
          </span>
        )}

        {/* Title */}
        <h3 className="font-bold text-xl text-foreground mb-2">
          {offer.name}
        </h3>

        {/* Rating with stars */}
        {offer.rating && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold">{offer.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/5</span>
          </div>
        )}

        {/* Short description */}
        {offer.short_description && (
          <p className="text-muted-foreground text-sm mb-4">
            {offer.short_description}
          </p>
        )}

        {/* Pros list with checkmarks */}
        {offer.pros && offer.pros.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {offer.pros.slice(0, 3).map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA Button — routes through /go/ for server-side tracking */}
        <Button asChild className="w-full mb-3">
          <a href={`/go/${offer.slug}`} rel="noopener noreferrer sponsored">
            View {offer.name}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>

        {/* Read review link */}
        <Link
          href={`/offers/${offer.slug}`}
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          Read full review
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Compact offer card for sidebar or secondary placement
 */
export function CompactOfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="p-4 rounded-lg border hover:shadow-sm transition-shadow">
      <div className="mb-3">
        <h4 className="font-semibold text-sm">{offer.name}</h4>
        {offer.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">{offer.rating.toFixed(1)}/5</span>
          </div>
        )}
      </div>

      <Button asChild variant="outline" size="sm" className="w-full">
        <a href={`/go/${offer.slug}`} rel="noopener noreferrer sponsored">
          View Details
          <ExternalLink className="ml-1.5 h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}
