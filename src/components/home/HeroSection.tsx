import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { SiteContext } from '@/types';

type HeroVariant = 'dark' | 'split' | 'minimal' | 'gradient-brand';

interface HeroSectionProps {
  site: SiteContext;
  categoryCount?: number;
  postCount?: number;
  tagline?: string;
  subtitle?: string;
  accentWord?: string | null;
  variant?: HeroVariant;
  ctaPrimaryText?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;
  /** Foreground product/lifestyle photo (split + minimal variants use it as an inline image). */
  imageUrl?: string;
  imageAlt?: string;
  /** Full-bleed dimmed backdrop (dark + gradient-brand variants use it behind the gradient). */
  backgroundUrl?: string;
}

/**
 * Hero section with 4 visual variants controlled by SITE_HERO_VARIANT env var.
 * All variants share the same content (tagline, subtitle, CTAs) but differ in layout/style.
 */
export function HeroSection({
  site,
  categoryCount = 0,
  postCount = 0,
  tagline,
  subtitle,
  accentWord,
  variant = 'dark',
  ctaPrimaryText,
  ctaPrimaryUrl,
  ctaSecondaryText,
  ctaSecondaryUrl,
  imageUrl,
  imageAlt,
  backgroundUrl,
}: HeroSectionProps) {
  const valueProps = getValuePropositions(site.settings?.site_type || 'affiliate', site.niche);
  const displayTagline = tagline || site.name;
  const displaySubtitle = subtitle ||
    `Expert reviews, honest comparisons, and the best deals on ${site.niche || 'products'} — helping you make smarter buying decisions.`;
  const taglineParts = buildAccentTagline(displayTagline, accentWord);

  const primaryText = ctaPrimaryText || 'Read Reviews';
  const primaryUrl = ctaPrimaryUrl || '/blog';
  const secondaryText = ctaSecondaryText || 'View Best Deals';
  const secondaryUrl = ctaSecondaryUrl || '/offers';

  // Shared content block used by all variants
  const sharedContent = {
    taglineParts,
    displaySubtitle,
    valueProps,
    primaryText,
    primaryUrl,
    secondaryText,
    secondaryUrl,
    categoryCount,
    postCount,
    site,
    imageUrl,
    imageAlt: imageAlt || (site.niche ? `${site.niche} illustration` : 'Hero image'),
    backgroundUrl,
  };

  switch (variant) {
    case 'minimal':
      return <HeroMinimal {...sharedContent} />;
    case 'split':
      return <HeroSplit {...sharedContent} />;
    case 'gradient-brand':
      return <HeroGradientBrand {...sharedContent} />;
    case 'dark':
    default:
      return <HeroDark {...sharedContent} />;
  }
}

// ─── Shared Types ───────────────────────────────────────────────────────────

interface HeroContentProps {
  taglineParts: Array<{ text: string; accent: boolean }>;
  displaySubtitle: string;
  valueProps: string[];
  primaryText: string;
  primaryUrl: string;
  secondaryText: string;
  secondaryUrl: string;
  categoryCount: number;
  postCount: number;
  site: SiteContext;
  imageUrl?: string;
  imageAlt?: string;
  backgroundUrl?: string;
}

// ─── Variant: Dark (default) ────────────────────────────────────────────────

function HeroDark({
  taglineParts, displaySubtitle, valueProps,
  primaryText, primaryUrl, secondaryText, secondaryUrl,
  categoryCount, postCount, site,
  backgroundUrl,
}: HeroContentProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 lg:py-28">
      {/* Optional full-bleed backdrop photo — sits under the dimmed gradient + orbs */}
      {backgroundUrl && (
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
          aria-hidden="true"
        />
      )}
      {/* Decorative blur orbs — hidden on mobile to reduce GPU load */}
      <div className="hidden sm:block absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-5"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <GlassBadge niche={site.niche} />
          <TaglineHeading parts={taglineParts} className="text-white" />
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {displaySubtitle}
          </p>
          <ValueProps items={valueProps} className="text-gray-300" checkClassName="bg-primary/30 text-primary" />
          <CTAButtons
            primaryText={primaryText} primaryUrl={primaryUrl}
            secondaryText={secondaryText} secondaryUrl={secondaryUrl}
            secondaryClassName="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          />
          <HeroStats categoryCount={categoryCount} postCount={postCount} borderClassName="border-white/20" labelClassName="text-gray-400" />
        </div>
      </div>
    </section>
  );
}

// ─── Variant: Minimal (clean white, bold type) ─────────────────────────────

function HeroMinimal({
  taglineParts, displaySubtitle, valueProps,
  primaryText, primaryUrl, secondaryText, secondaryUrl,
  categoryCount, postCount, site,
}: HeroContentProps) {
  return (
    <section className="relative py-20 lg:py-28 bg-background">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Your trusted {site.niche || 'product'} resource</span>
          </div>
          <TaglineHeading parts={taglineParts} className="text-foreground" />
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {displaySubtitle}
          </p>
          <ValueProps items={valueProps} className="text-muted-foreground" checkClassName="bg-primary/10 text-primary" />
          <CTAButtons
            primaryText={primaryText} primaryUrl={primaryUrl}
            secondaryText={secondaryText} secondaryUrl={secondaryUrl}
            secondaryClassName="border-border text-foreground hover:bg-muted"
          />
          <HeroStats categoryCount={categoryCount} postCount={postCount} borderClassName="border-border" labelClassName="text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}

// ─── Variant: Split (text left, visual right) ──────────────────────────────

function HeroSplit({
  taglineParts, displaySubtitle, valueProps,
  primaryText, primaryUrl, secondaryText, secondaryUrl,
  site,
  imageUrl, imageAlt,
}: HeroContentProps) {
  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>Your trusted {site.niche || 'product'} resource</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
              {taglineParts.map((part, i) =>
                part.accent ? (
                  <span key={i} className="text-primary">{part.text}</span>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              {displaySubtitle}
            </p>
            <ValueProps items={valueProps} className="text-muted-foreground" checkClassName="bg-primary/10 text-primary" justify="justify-start" />
            <CTAButtons
              primaryText={primaryText} primaryUrl={primaryUrl}
              secondaryText={secondaryText} secondaryUrl={secondaryUrl}
              secondaryClassName="border-border text-foreground hover:bg-muted"
              justify="justify-start"
            />
          </div>

          {/* Right: real photo (if SITE_HERO_IMAGE set) or decorative card stack fallback */}
          {imageUrl ? (
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                <div
                  className="absolute -top-4 -right-4 w-full h-full rounded-2xl border-2 border-primary/10 bg-primary/5"
                  aria-hidden="true"
                />
                {/* Using <img> instead of next/image to avoid domain allowlist friction across 17 sites */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={imageAlt ?? ''}
                  loading="eager"
                  className="relative rounded-2xl border border-border object-cover w-full aspect-[4/3] shadow-xl"
                />
                <div
                  className="absolute -bottom-4 -left-4 w-full h-full rounded-2xl border border-primary/20 -z-10"
                  aria-hidden="true"
                />
              </div>
            </div>
          ) : (
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Background decorative card */}
              <div className="absolute -top-4 -right-4 w-full h-full rounded-2xl border-2 border-primary/10 bg-primary/5" />
              {/* Main card */}
              <div className="relative rounded-2xl border border-border bg-card p-8 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{site.name}</div>
                      <div className="text-sm text-muted-foreground">Expert {site.niche || 'Product'} Reviews</div>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  {valueProps.map((prop, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs">&#10003;</span>
                      </div>
                      <span className="text-muted-foreground">{prop}</span>
                    </div>
                  ))}
                  <div className="h-px bg-border" />
                  <div className="text-xs text-muted-foreground text-center">
                    Trusted by readers since {new Date().getFullYear()}
                  </div>
                </div>
              </div>
              {/* Bottom offset decorative card */}
              <div className="absolute -bottom-4 -left-4 w-full h-full rounded-2xl border border-primary/20 -z-10" />
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Variant: Gradient Brand (full primary color hero) ──────────────────────

function HeroGradientBrand({
  taglineParts, displaySubtitle, valueProps,
  primaryText, primaryUrl, secondaryText, secondaryUrl,
  categoryCount, postCount, site,
  backgroundUrl,
}: HeroContentProps) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 text-white" style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.6))` }}>
      {/* Optional full-bleed backdrop — sits under the brand gradient at 25% opacity */}
      {backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
          aria-hidden="true"
        />
      )}
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-black/10 blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white/90">
            <Sparkles className="w-4 h-4" />
            <span>Your trusted {site.niche || 'product'} resource</span>
          </div>
          <TaglineHeading parts={taglineParts} className="text-white" accentClassName="text-white underline decoration-white/40 decoration-4 underline-offset-4" />
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            {displaySubtitle}
          </p>
          <ValueProps items={valueProps} className="text-white/80" checkClassName="bg-white/20 text-white" />
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button asChild size="lg" className="text-lg px-8 bg-white text-foreground hover:bg-white/90 shadow-lg">
              <Link href={primaryUrl}>
                {primaryText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white">
              <Link href={secondaryUrl}>
                {secondaryText}
              </Link>
            </Button>
          </div>
          <HeroStats categoryCount={categoryCount} postCount={postCount} borderClassName="border-white/20" labelClassName="text-white/60" valueClassName="text-white" />
        </div>
      </div>
    </section>
  );
}

// ─── Shared Sub-Components ──────────────────────────────────────────────────

function GlassBadge({ niche }: { niche?: string | null }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90">
      <Sparkles className="w-4 h-4 text-primary" />
      <span>Your trusted {niche || 'product'} resource</span>
    </div>
  );
}

function TaglineHeading({ parts, className, accentClassName }: { parts: Array<{ text: string; accent: boolean }>; className: string; accentClassName?: string }) {
  return (
    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${className}`}>
      {parts.map((part, i) =>
        part.accent ? (
          <span key={i} className={accentClassName || 'text-primary'}>{part.text}</span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </h1>
  );
}

function ValueProps({ items, className, checkClassName, justify = 'justify-center' }: { items: string[]; className: string; checkClassName: string; justify?: string }) {
  return (
    <div className={`flex flex-wrap ${justify} gap-4 md:gap-6 mb-10`}>
      {items.map((prop, index) => (
        <div key={index} className={`flex items-center gap-2 text-sm ${className}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checkClassName}`}>
            <span className="text-xs">&#10003;</span>
          </div>
          <span>{prop}</span>
        </div>
      ))}
    </div>
  );
}

function CTAButtons({
  primaryText, primaryUrl, secondaryText, secondaryUrl, secondaryClassName, justify = 'justify-center',
}: {
  primaryText: string; primaryUrl: string; secondaryText: string; secondaryUrl: string;
  secondaryClassName: string; justify?: string;
}) {
  return (
    <div className={`flex flex-wrap ${justify} gap-4 mb-12`}>
      <Button asChild size="lg" className="text-lg px-8">
        <Link href={primaryUrl}>
          {primaryText}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg" className={`text-lg px-8 ${secondaryClassName}`}>
        <Link href={secondaryUrl}>
          {secondaryText}
        </Link>
      </Button>
    </div>
  );
}

function HeroStats({
  categoryCount, postCount, borderClassName, labelClassName, valueClassName,
}: {
  categoryCount: number; postCount: number; borderClassName: string; labelClassName: string; valueClassName?: string;
}) {
  if (categoryCount <= 0 && postCount <= 0) return null;
  return (
    <div className={`flex justify-center gap-8 pt-8 border-t ${borderClassName}`}>
      {categoryCount > 0 && (
        <div className="text-center">
          <div className={`text-3xl font-bold ${valueClassName || 'text-primary'}`}>{categoryCount}</div>
          <div className={`text-sm ${labelClassName}`}>Categories</div>
        </div>
      )}
      {postCount > 0 && (
        <div className="text-center">
          <div className={`text-3xl font-bold ${valueClassName || 'text-primary'}`}>{postCount}+</div>
          <div className={`text-sm ${labelClassName}`}>Expert Articles</div>
        </div>
      )}
      <div className="text-center">
        <div className={`text-3xl font-bold ${valueClassName || 'text-primary'}`}>Free</div>
        <div className={`text-sm ${labelClassName}`}>Unbiased Reviews</div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildAccentTagline(tagline: string, accentWord?: string | null): Array<{ text: string; accent: boolean }> {
  if (accentWord) {
    const idx = tagline.toLowerCase().lastIndexOf(accentWord.toLowerCase());
    if (idx !== -1) {
      return [
        { text: tagline.slice(0, idx), accent: false },
        { text: tagline.slice(idx, idx + accentWord.length), accent: true },
        { text: tagline.slice(idx + accentWord.length), accent: false },
      ].filter(p => p.text.length > 0);
    }
  }
  const lastSpace = tagline.lastIndexOf(' ');
  if (lastSpace === -1) return [{ text: tagline, accent: false }];
  return [
    { text: tagline.slice(0, lastSpace + 1), accent: false },
    { text: tagline.slice(lastSpace + 1), accent: true },
  ];
}

function getValuePropositions(siteType: string, niche: string | null): string[] {
  const nicheDisplay = niche || 'products';
  const propositionsByType: Record<string, string[]> = {
    affiliate: ['In-depth product reviews', 'Side-by-side comparisons', `Best ${nicheDisplay} deals`],
    blog: ['Expert-written content', 'Latest industry news', 'Helpful guides & tips'],
    ecommerce: ['Verified product ratings', 'Best price guarantees', 'Fast shipping options'],
    reviews: ['Hands-on testing', 'Unbiased ratings', 'Real user feedback'],
  };
  return propositionsByType[siteType] || propositionsByType.affiliate;
}
