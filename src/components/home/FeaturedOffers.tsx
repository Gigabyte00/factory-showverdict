import Image from "next/image";
import Link from "next/link";

/**
 * FeaturedOffers — ShowVerdict
 *
 * Editorial offer grid in a cinema-noir style.
 * Palette (CSS variables, with sensible fallbacks):
 *   --sv-ink        deep ink / near-black background accent
 *   --sv-burgundy   primary editorial accent
 *   --sv-brass      metallic accent (rules, stars, hover)
 *   --sv-cream      page/card background
 *   --sv-muted      secondary text
 *
 * Drop these into your global stylesheet (or :root) to theme:
 *   :root {
 *     --sv-ink: #14110f;
 *     --sv-burgundy: #6b1f2a;
 *     --sv-brass: #b8893b;
 *     --sv-brass-soft: #d6b274;
 *     --sv-cream: #f5efe4;
 *     --sv-card: #fbf7ee;
 *     --sv-muted: #6b6358;
 *     --sv-rule: #e6dcc8;
 *   }
 */

export type Offer = {
  id: string | number;
  slug: string;
  name: string;
  short_description: string;
  logo_url: string;
  featured_image_url: string;
  image_url?: string;
  affiliate_url: string;
  rating: number;
  pros: string[];
  is_featured: boolean;
};

export interface FeaturedOffersProps {
  offers: Offer[];
  siteId: string;
  title?: string;
  subtitle?: string;
}

/* ------------------------------------------------------------------ */
/*  Star rating                                                        */
/* ------------------------------------------------------------------ */

function StarRating({ rating }: { rating: number }) {
  // Round to nearest half for visual rendering
  const rounded = Math.round(rating * 2) / 2;
  const stars = [1, 2, 3, 4, 5].map((i) => {
    if (rounded >= i) return "full" as const;
    if (rounded >= i - 0.5) return "half" as const;
    return "empty" as const;
  });

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <div className="flex items-center gap-[2px]">
        {stars.map((kind, idx) => (
          <Star key={idx} kind={kind} />
        ))}
      </div>
      <span
        className="ml-1 font-mono text-[12px] tabular-nums tracking-tight"
        style={{ color: "var(--sv-ink, #14110f)" }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function Star({ kind }: { kind: "full" | "half" | "empty" }) {
  const brass = "var(--sv-brass, #b8893b)";
  const empty = "var(--sv-rule, #e6dcc8)";
  const id = `star-half-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      {kind === "half" && (
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor={brass} />
            <stop offset="50%" stopColor={empty} />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2.5l2.95 6.16 6.8.92-4.95 4.7 1.22 6.72L12 17.85 5.98 21l1.22-6.72L2.25 9.58l6.8-.92L12 2.5z"
        fill={
          kind === "full"
            ? brass
            : kind === "empty"
            ? empty
            : `url(#${id})`
        }
        stroke={brass}
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

function OfferCard({ offer }: { offer: Offer }) {
  const imgSrc = offer.image_url || offer.featured_image_url;
  const prosCount = offer.pros?.length ?? 0;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl ring-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(20,17,15,0.45)]"
      style={{
        background: "var(--sv-card, #fbf7ee)",
        // double ring: soft rule + brass hairline on hover handled via CSS var
        boxShadow:
          "0 1px 0 0 var(--sv-rule, #e6dcc8), 0 8px 24px -18px rgba(20,17,15,0.25)",
      }}
    >
      {/* Featured ribbon */}
      {offer.is_featured && (
        <div
          className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{
            background: "var(--sv-ink, #14110f)",
            color: "var(--sv-brass-soft, #d6b274)",
            border: "1px solid var(--sv-brass, #b8893b)",
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: "var(--sv-brass, #b8893b)" }}
          />
          Editor&rsquo;s Pick
        </div>
      )}

      {/* Image — 4:3 */}
      <Link
        href={`/offers/${offer.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-t-xl"
        style={{ background: "var(--sv-ink, #14110f)" }}
        aria-label={`${offer.name} — view details`}
      >
        <Image
          src={imgSrc}
          alt={offer.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* noir vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,17,15,0) 55%, rgba(20,17,15,0.55) 100%)",
          }}
        />
        {/* logo chip */}
        {offer.logo_url && (
          <div
            className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center overflow-hidden rounded-md ring-1"
            style={{
              background: "var(--sv-cream, #f5efe4)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
            }}
          >
            <Image
              src={offer.logo_url}
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-contain p-1"
            />
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Brand name */}
        <h3
          className="font-serif text-[18px] font-semibold leading-tight tracking-tight"
          style={{ color: "var(--sv-ink, #14110f)" }}
        >
          <Link
            href={`/offers/${offer.slug}`}
            className="bg-[length:0_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 hover:bg-[length:100%_1px]"
            style={{
              backgroundImage:
                "linear-gradient(var(--sv-burgundy, #6b1f2a), var(--sv-burgundy, #6b1f2a))",
            }}
          >
            {offer.name}
          </Link>
        </h3>

        {/* Short description — single line */}
        <p
          className="truncate text-[14px] leading-snug"
          style={{ color: "var(--sv-muted, #6b6358)" }}
          title={offer.short_description}
        >
          {offer.short_description}
        </p>

        {/* Rating + pros badge */}
        <div className="flex items-center justify-between gap-3">
          <StarRating rating={offer.rating} />
          {prosCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{
                background: "rgba(107, 31, 42, 0.08)",
                color: "var(--sv-burgundy, #6b1f2a)",
                border: "1px solid rgba(107, 31, 42, 0.18)",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {prosCount} {prosCount === 1 ? "Pro" : "Pros"}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Brass hairline rule */}
        <div
          aria-hidden="true"
          className="mt-1 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--sv-brass, #b8893b) 30%, var(--sv-brass, #b8893b) 70%, transparent 100%)",
            opacity: 0.55,
          }}
        />

        {/* CTA pill */}
        <Link
          href={`/offers/${offer.slug}`}
          className="group/cta inline-flex items-center justify-between rounded-full px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200"
          style={{
            background: "var(--sv-ink, #14110f)",
            color: "var(--sv-brass-soft, #d6b274)",
            border: "1px solid var(--sv-brass, #b8893b)",
          }}
        >
          <span>View Details</span>
          <span
            aria-hidden="true"
            className="ml-2 transition-transform duration-200 group-hover/cta:translate-x-1"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

function FeaturedOffers({
  offers,
  siteId,
  title = "Featured Offers",
  subtitle = "Hand-picked by our editors. Streaming services, box sets, and bundles worth your queue.",
}: FeaturedOffersProps) {
  if (!offers || offers.length === 0) return null;

  return (
    <section
      data-site-id={siteId}
      aria-labelledby={`featured-offers-${siteId}`}
      className="relative w-full"
      style={{
        background: "var(--sv-cream, #f5efe4)",
        color: "var(--sv-ink, #14110f)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 lg:mb-14">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-10"
              style={{ background: "var(--sv-brass, #b8893b)" }}
            />
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--sv-burgundy, #6b1f2a)" }}
            >
              The ShowVerdict Shortlist
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <h2
              id={`featured-offers-${siteId}`}
              className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: "var(--sv-ink, #14110f)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="max-w-xl text-base leading-relaxed sm:text-lg"
                style={{ color: "var(--sv-muted, #6b6358)" }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Brass rule */}
          <div
            aria-hidden="true"
            className="mt-2 h-[2px] w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--sv-brass, #b8893b) 0%, var(--sv-brass, #b8893b) 60%, transparent 100%)",
            }}
          />
        </header>

        {/* Grid: 1 col mobile, 2 tablet, 3 desktop */}
        <ul
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {offers.map((offer) => (
            <li key={offer.id} className="flex">
              <div className="flex w-full">
                <OfferCard offer={offer} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FeaturedOffers;
export { FeaturedOffers };
