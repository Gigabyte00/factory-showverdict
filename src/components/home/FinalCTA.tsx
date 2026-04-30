import Link from "next/link";

/**
 * FinalCTA — ShowVerdict
 *
 * Full-bleed editorial closing section for the homepage and blog list pages.
 * Serif H2, supporting subhead, and two CTAs centered on a warm paper field
 * with a subtle brass-toned texture (radial highlights + hairline rule).
 *
 * Tailwind + CSS variables (scoped to the section, no globals required).
 * No event handlers — purely presentational, navigates via next/link.
 */

export interface FinalCTAProps {
  niche?: string | null;
  siteName?: string;
  heading?: string;
  subtext?: string;
  ctaPrimaryText?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;
}

const DEFAULT_HEADING = "Find your next favorite TV & film review.";
const DEFAULT_SUBTEXT =
  "Spoiler-free reviews and weekend watchlists, every week.";

export default function FinalCTA({
  niche = null,
  siteName = "ShowVerdict",
  heading,
  subtext,
  ctaPrimaryText = "Subscribe to the newsletter",
  ctaPrimaryUrl = "/subscribe",
  ctaSecondaryText = "Browse latest reviews",
  ctaSecondaryUrl = "/reviews",
}: FinalCTAProps) {
  // Niche-aware heading fallback when caller doesn't override.
  const resolvedHeading =
    heading ??
    (niche
      ? `Find your next favorite ${niche} review.`
      : DEFAULT_HEADING);

  const resolvedSubtext = subtext ?? DEFAULT_SUBTEXT;

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="final-cta relative isolate overflow-hidden"
      style={
        {
          // Brass / paper palette — scoped to this section.
          "--sv-paper": "#F6F1E7",
          "--sv-paper-deep": "#EFE6D2",
          "--sv-ink": "#1B1714",
          "--sv-ink-soft": "#4A3F33",
          "--sv-rule": "rgba(27, 23, 20, 0.14)",
          "--sv-brass": "#B8893B",
          "--sv-brass-deep": "#8A6321",
          "--sv-brass-light": "#D9B26A",
          "--sv-serif":
            '"GT Sectra", "Canela", "Tiempos Headline", "Source Serif Pro", Georgia, "Times New Roman", serif',
          "--sv-sans":
            '"Söhne", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        } as React.CSSProperties
      }
    >
      {/* Layered background: warm paper base + brass radial glows + grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 80% at 18% 20%, rgba(217, 178, 106, 0.22) 0%, rgba(217, 178, 106, 0) 60%)," +
            "radial-gradient(55% 75% at 82% 85%, rgba(184, 137, 59, 0.18) 0%, rgba(184, 137, 59, 0) 65%)," +
            "linear-gradient(180deg, var(--sv-paper) 0%, var(--sv-paper-deep) 100%)",
        }}
      />
      {/* Subtle grain — SVG noise, brass-tinted, very low alpha */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.72  0 0 0 0 0.54  0 0 0 0 0.23  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "220px 220px",
        }}
      />
      {/* Top hairline rule */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--sv-rule)" }}
      />

      <div className="mx-auto flex max-w-[1180px] flex-col items-center px-6 py-24 text-center sm:py-28 md:px-10 md:py-32 lg:py-36">
        {/* Eyebrow */}
        <div
          className="mb-7 flex items-center gap-3 text-[11px] uppercase"
          style={{
            fontFamily: "var(--sv-sans)",
            letterSpacing: "0.22em",
            color: "var(--sv-brass-deep)",
            fontWeight: 600,
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block h-px w-8"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--sv-brass) 50%, transparent)",
            }}
          />
          <span>The {siteName} Dispatch</span>
          <span
            aria-hidden="true"
            className="inline-block h-px w-8"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--sv-brass) 50%, transparent)",
            }}
          />
        </div>

        {/* Headline */}
        <h2
          id="final-cta-heading"
          className="max-w-[20ch] text-[34px] leading-[1.05] tracking-[-0.01em] sm:text-[40px] md:text-[44px] lg:text-[48px]"
          style={{
            fontFamily: "var(--sv-serif)",
            fontWeight: 500,
            color: "var(--sv-ink)",
            textWrap: "balance" as React.CSSProperties["textWrap"],
          }}
        >
          {resolvedHeading}
        </h2>

        {/* Brass underline ornament */}
        <div
          aria-hidden="true"
          className="mt-7 flex items-center gap-2"
        >
          <span
            className="block h-px w-10"
            style={{ background: "var(--sv-brass)" }}
          />
          <span
            className="block h-[5px] w-[5px] rotate-45"
            style={{ background: "var(--sv-brass)" }}
          />
          <span
            className="block h-px w-10"
            style={{ background: "var(--sv-brass)" }}
          />
        </div>

        {/* Subhead */}
        <p
          className="mt-6 max-w-[58ch] text-[17px] leading-[1.55] sm:text-[18px] md:text-[19px]"
          style={{
            fontFamily: "var(--sv-sans)",
            color: "var(--sv-ink-soft)",
            textWrap: "pretty" as React.CSSProperties["textWrap"],
          }}
        >
          {resolvedSubtext}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:mt-11 sm:flex-row sm:gap-4">
          <Link
            href={ctaPrimaryUrl}
            className="group relative inline-flex items-center justify-center gap-2 rounded-[2px] px-7 py-[14px] text-[14px] tracking-[0.04em] transition-[transform,box-shadow,background] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_10px_28px_-12px_rgba(138,99,33,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              fontFamily: "var(--sv-sans)",
              fontWeight: 600,
              color: "var(--sv-paper)",
              background:
                "linear-gradient(180deg, var(--sv-brass) 0%, var(--sv-brass-deep) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 235, 190, 0.45), 0 1px 0 rgba(27, 23, 20, 0.08), 0 6px 18px -10px rgba(138, 99, 33, 0.5)",
            }}
          >
            <span>{ctaPrimaryText}</span>
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform duration-200 ease-out group-hover:translate-x-[2px]"
            >
              <path
                d="M2.5 7h9m0 0L7.5 3m4 4L7.5 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <Link
            href={ctaSecondaryUrl}
            className="inline-flex items-center justify-center rounded-[2px] px-7 py-[13px] text-[14px] tracking-[0.04em] transition-[background,border-color,color] duration-200 ease-out hover:bg-[rgba(184,137,59,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              fontFamily: "var(--sv-sans)",
              fontWeight: 600,
              color: "var(--sv-ink)",
              border: "1px solid rgba(27, 23, 20, 0.22)",
              background: "transparent",
            }}
          >
            {ctaSecondaryText}
          </Link>
        </div>

        {/* Reassurance line */}
        <p
          className="mt-6 text-[12px] uppercase"
          style={{
            fontFamily: "var(--sv-sans)",
            color: "var(--sv-ink-soft)",
            letterSpacing: "0.16em",
            opacity: 0.75,
          }}
        >
          Free · One email a week · Unsubscribe anytime
        </p>
      </div>

      {/* Bottom hairline rule */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "var(--sv-rule)" }}
      />
    </section>
  );
}


export { FinalCTA };
