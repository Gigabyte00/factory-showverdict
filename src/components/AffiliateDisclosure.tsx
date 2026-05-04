import * as React from "react";
import Link from "next/link";
import { Info } from "lucide-react";

/**
 * AffiliateDisclosure
 * -------------------
 * FTC-compliant affiliate / commerce disclosure for ShowVerdict.
 *
 * Two presentations:
 *  - `inline`  → compact one-liner placed at the top of an article.
 *  - `panel`   → bordered card for footers, About page, /methodology, etc.
 *
 * Voice: warm, plainspoken, editorial. No corporate-legalese.
 */

type AffiliateDisclosureProps = {
  variant?: "inline" | "panel";
  className?: string;
};

export default function AffiliateDisclosure({
  variant = "inline",
  className = "",
}: AffiliateDisclosureProps) {
  if (variant === "panel") {
    return (
      <aside
        role="note"
        aria-label="Affiliate disclosure"
        className={[
          // brass-tinted muted surface w/ warm accent border
          "rounded-lg border border-l-4",
          "border-[hsl(var(--border))] border-l-[hsl(var(--brass,38_45%_55%))]",
          "bg-[hsl(var(--muted)/0.4)]",
          "px-6 py-5 sm:px-7 sm:py-6",
          "text-[hsl(var(--foreground))]",
          className,
        ].join(" ")}
      >
        <header className="mb-3 flex items-baseline gap-2.5">
          <Info
            aria-hidden="true"
            className="size-[18px] shrink-0 translate-y-[3px] text-[hsl(var(--brass,38_45%_45%))]"
          />
          <h2 className="font-serif text-[19px] sm:text-[20px] font-medium tracking-tight leading-snug text-[hsl(var(--foreground))]">
            A note on how we make money
          </h2>
        </header>

        <div className="space-y-3 text-[14.5px] leading-relaxed text-[hsl(var(--foreground)/0.85)]">
          <p>
            ShowVerdict participates in a handful of affiliate programs we
            think actually fit our niche &mdash; streaming services, the
            occasional Blu-ray box set, a few hardware partners for the home
            theater coverage. When you click through one of those links and
            buy something, we may earn a small commission. It helps keep the
            site independent and the reviews free to read.
          </p>
          <p>
            What it doesn&rsquo;t do is decide what we cover or how we score
            it. We don&rsquo;t accept payment in exchange for positive
            reviews, we don&rsquo;t let partners see verdicts before they
            publish, and an affiliate relationship has never moved a rating
            up or down. If a show we&rsquo;re paid to link to is mediocre,
            we&rsquo;ll tell you it&rsquo;s mediocre.
          </p>
        </div>

        <div
          className={[
            "mt-5 rounded-md",
            "border border-[hsl(var(--border))]",
            "bg-[hsl(var(--muted)/0.6)]",
            "px-4 py-3",
            "text-[13px] text-[hsl(var(--muted-foreground))]",
          ].join(" ")}
        >
          <Link
            href="/editorial-standards"
            className="font-medium text-[hsl(var(--foreground))] underline-offset-4 decoration-[hsl(var(--brass,38_45%_55%))] decoration-2 hover:underline"
          >
            See our full Editorial Standards{" "}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </aside>
    );
  }

  // ── inline ──────────────────────────────────────────────────────────────
  return (
    <p
      role="note"
      aria-label="Affiliate disclosure"
      className={[
        "flex items-start gap-1.5",
        "text-[13px] leading-snug",
        "italic text-[hsl(var(--muted-foreground))]",
        "border-l-2 border-[hsl(var(--brass,38_45%_60%))]",
        "bg-[hsl(var(--muted)/0.4)]",
        "rounded-r-sm",
        "px-3 py-2",
        className,
      ].join(" ")}
    >
      <Info
        aria-hidden="true"
        className="size-[13px] shrink-0 translate-y-[3px] not-italic text-[hsl(var(--brass,38_45%_45%))]"
      />
      <span>
        ShowVerdict may earn commission from links on this page. We never
        accept payment in exchange for positive reviews.{" "}
        <Link
          href="/methodology"
          className="not-italic font-medium text-[hsl(var(--foreground))] underline-offset-2 hover:underline"
        >
          How we test <span aria-hidden="true">&rarr;</span>
        </Link>
      </span>
    </p>
  );
}

export type { AffiliateDisclosureProps };
export { AffiliateDisclosure };
