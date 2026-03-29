import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  niche?: string | null;
  siteName?: string;
  heading?: string;
  subtext?: string;
  ctaPrimaryText?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;
}

/**
 * Gradient CTA section at the bottom of the homepage.
 * Copy is customizable via env vars for niche-specific messaging.
 */
export function FinalCTA({
  niche,
  siteName,
  heading,
  subtext,
  ctaPrimaryText,
  ctaPrimaryUrl,
  ctaSecondaryText,
  ctaSecondaryUrl,
}: FinalCTAProps) {
  const displayHeading = heading || `Ready to Find Your Perfect ${niche || 'Product'}?`;
  const displaySubtext = subtext || 'Browse our expert reviews, compare your options, and make confident decisions — all completely free.';
  const primaryText = ctaPrimaryText || 'Read Our Reviews';
  const primaryUrl = ctaPrimaryUrl || '/blog';
  const secondaryText = ctaSecondaryText || 'View Top Picks';
  const secondaryUrl = ctaSecondaryUrl || '/offers';

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background via-primary/5 to-primary/10">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Get Started
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {displayHeading}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {displaySubtext}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href={primaryUrl}>
                {primaryText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href={secondaryUrl}>
                {secondaryText}
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Free guides, unbiased reviews, no spam
          </p>
        </div>
      </div>
    </section>
  );
}
