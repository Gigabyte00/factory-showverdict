import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Award, Star, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCalloutProps {
  /** Product/offer name */
  name: string;
  /** Short description */
  description?: string;
  /** Product image URL */
  image?: string;
  /** Rating out of 5 */
  rating?: number;
  /** Price display string */
  price?: string;
  /** Key selling points (max 3 recommended) */
  highlights?: string[];
  /** Link to /go/ route */
  href: string;
  /** CTA button text */
  ctaText?: string;
  /** Badge text (e.g., "Editor's Pick", "Best Value", "Top Rated") */
  badge?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ProductCallout - Prominent product recommendation box
 *
 * Designed for top-of-article placement to highlight a recommended product.
 * Drives high conversions by appearing above the fold with a clear CTA.
 *
 * @example
 * <ProductCallout
 *   name="Rad Power RadRover 6 Plus"
 *   description="Best all-around electric bike for commuters"
 *   rating={4.8}
 *   price="$1,999"
 *   highlights={["750W motor", "45+ mile range", "5 pedal assist levels"]}
 *   href="/go/rad-rover-6-plus"
 *   badge="Editor's Pick"
 * />
 */
export function ProductCallout({
  name,
  description,
  image,
  rating,
  price,
  highlights,
  href,
  ctaText = 'View Deal',
  badge = "Editor's Pick",
  className,
}: ProductCalloutProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-primary/20 bg-primary/5 p-5 md:p-6 my-6',
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <Award className="h-3.5 w-3.5" />
            {badge}
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-2">
        {/* Image */}
        {image && (
          <div className="flex-shrink-0">
            <div className="relative w-full md:w-32 h-32 rounded-md bg-white">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(min-width: 768px) 128px, 100vw"
                className="object-contain p-2"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>

          {/* Rating + Price row */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/5</span>
              </div>
            )}
            {price ? (
              <span className="text-sm font-bold text-foreground">{price}</span>
            ) : (
              <span className="text-sm text-muted-foreground italic">Check current price</span>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
          )}

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <ul className="space-y-1 mb-4">
              {highlights.slice(0, 3).map((highlight, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  {highlight}
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <Button asChild size="sm">
            <a href={href} rel="noopener noreferrer sponsored">
              {ctaText}
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Disclosure */}
      <p className="text-[10px] text-muted-foreground/50 mt-3">
        We may earn a commission if you make a purchase through our links.
      </p>
    </div>
  );
}
