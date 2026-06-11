import Image from "next/image";
import Link from "next/link";
import * as React from "react";

/**
 * ShowVerdict — ArticleCard
 * --------------------------------------------------------------
 * Cinema-noir editorial card for TV & film reviews.
 *
 * Three variants:
 *   - default  : image-top vertical card (16:9 image)
 *   - featured : 60/40 split, image right (desktop), top (mobile)
 *   - minimal  : image left (4:3, 120px), text right, no excerpt
 *
 * Server-renderable: no onClick / onError / event handlers.
 *
 * Token contract (define in your global stylesheet):
 *   --sv-burgundy:  #5B1A2B;  
 *   --sv-burgundy-2:#7A2336;  
 *   --sv-cream:     #F4ECDD;  
 *   --sv-cream-2:   #EBE0CC;  
 *   --sv-brass:     #B8893B;  
 *   --sv-brass-2:   #D6A24E;  
 *   --sv-ink:       #14110F;  
 *   --sv-ink-2:     #3A322D;  
 *   --sv-rule:      #D9CDB6;
 */

export interface ArticleCardPost {
  slug: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string; // ISO string
  reading_time_minutes: number;
  tags?: string[];
}

export interface ArticleCardProps {
  post: ArticleCardPost;
  variant?: "default" | "featured" | "minimal";
  href?: string;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/*  Bookmark icon (stub — no handlers)                                        */
/* -------------------------------------------------------------------------- */

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full",
        "bg-[color:var(--sv-cream)]/85 backdrop-blur-md ring-1 ring-[color:var(--sv-ink)]/10",
        "shadow-[0_2px_8px_-2px_rgba(20,17,15,0.25)]",
        "transition-transform duration-300 group-hover:-translate-y-0.5",
        className,
      )}
    >
      <svg
        width="14"
        height="16"
        viewBox="0 0 14 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[color:var(--sv-burgundy)]"
      >
        <path d="M2 1.5h10v13l-5-3.2-5 3.2v-13z" />
      </svg>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tag pill (top-left of image)                                              */
/* -------------------------------------------------------------------------- */

function TagPill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cx(
        "absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "bg-[color:var(--sv-ink)]/55 backdrop-blur-md ring-1 ring-white/10",
        "text-[10.5px] font-medium uppercase tracking-[0.14em] text-[color:var(--sv-cream)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-[color:var(--sv-brass-2)]"
      />
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Meta line                                                                 */
/* -------------------------------------------------------------------------- */

function MetaLine({
  publishedAt,
  readingTime,
  firstTag,
  className,
}: {
  publishedAt: string;
  readingTime: number;
  firstTag?: string;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[12px] uppercase tracking-[0.16em]",
        "text-[color:var(--sv-ink-2)]",
        className,
      )}
    >
      <time dateTime={publishedAt} className="whitespace-nowrap">
        {formatDate(publishedAt)}
      </time>
      <span aria-hidden="true" className="text-[color:var(--sv-rule)]">
        ·
      </span>
      <span className="whitespace-nowrap">{readingTime} min read</span>
      {firstTag ? (
        <>
          <span aria-hidden="true" className="text-[color:var(--sv-rule)]">
            ·
          </span>
          <span className="whitespace-nowrap text-[color:var(--sv-burgundy)]">
            {firstTag}
          </span>
        </>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared classes                                                            */
/* -------------------------------------------------------------------------- */

const SERIF = "font-['Cormorant_Garamond',_Georgia,_serif]";
const SANS =
  "font-['Inter',_'Helvetica_Neue',_system-ui,_-apple-system,_sans-serif]";

const ROOT_BASE = cx(
  "group relative isolate block overflow-hidden",
  "bg-[color:var(--sv-cream)] text-[color:var(--sv-ink)]",
  "ring-1 ring-[color:var(--sv-rule)]",
  "transition-all duration-300 ease-out",
  "hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(20,17,15,0.45)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sv-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sv-cream)]",
  SANS,
);

const IMG_WRAP = cx(
  "relative overflow-hidden rounded-xl",
  "bg-[color:var(--sv-ink)]/10",
);

const IMG_INNER = cx(
  "object-cover transition-transform duration-[600ms] ease-out",
  "group-hover:scale-[1.02]",
);

const TITLE_CLAMP_2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const EXCERPT_CLAMP_2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const EXCERPT_CLAMP_3: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function ArticleCard({
  post,
  variant = "default",
  href,
  className,
}: ArticleCardProps) {
  const url = href ?? `/blog/${post.slug}`;
  const firstTag = post.tags?.[0];

  /* ----------------------------------- featured ---------------------------- */
  if (variant === "featured") {
    return (
      <Link
        href={url}
        className={cx(
          ROOT_BASE,
          "rounded-2xl",
          "grid grid-cols-1 md:grid-cols-5",
          className,
        )}
        aria-label={post.title}
      >
        {/* Text column — first in DOM for a11y, visually left on desktop */}
        <div className="order-2 flex flex-col justify-between gap-6 p-6 md:order-1 md:col-span-3 md:p-8 lg:p-10">
          <div className="flex flex-col gap-4">
            {firstTag ? (
              <span
                className={cx(
                  "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1",
                  "bg-[color:var(--sv-burgundy)] text-[color:var(--sv-cream)]",
                  "text-[10.5px] font-medium uppercase tracking-[0.18em]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[color:var(--sv-brass-2)]"
                />
                {firstTag}
              </span>
            ) : null}

            <h3
              className={cx(
                SERIF,
                "text-[28px] leading-[1.08] tracking-[-0.01em] md:text-[32px]",
                "text-[color:var(--sv-ink)]",
                "transition-colors duration-300 group-hover:text-[color:var(--sv-burgundy)]",
              )}
              style={TITLE_CLAMP_2}
            >
              {post.title}
            </h3>

            <p
              className="text-[15px] leading-[1.65] text-[color:var(--sv-ink-2)]"
              style={EXCERPT_CLAMP_3}
            >
              {post.excerpt}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <MetaLine
              publishedAt={post.published_at}
              readingTime={post.reading_time_minutes}
              firstTag={post.tags?.[0]}
            />

            <span
              className={cx(
                "inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5",
                "bg-[color:var(--sv-burgundy)] text-[color:var(--sv-cream)]",
                "text-[12px] font-semibold uppercase tracking-[0.18em]",
                "ring-1 ring-[color:var(--sv-burgundy)]/0",
                "transition-all duration-300",
                "group-hover:bg-[color:var(--sv-burgundy-2)] group-hover:ring-[color:var(--sv-brass)]/40",
              )}
            >
              Read review
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </span>
          </div>
        </div>

        {/* Image column */}
        <div className="relative order-1 md:order-2 md:col-span-2">
          <div className={cx(IMG_WRAP, "m-4 aspect-[4/3] md:m-5 md:aspect-auto md:h-[calc(100%-2.5rem)]")}>
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className={IMG_INNER}
            />
            {/* film-grain / vignette */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--sv-ink)]/35 via-transparent to-transparent"
            />
            {firstTag ? <TagPill label={firstTag} /> : null}
            <BookmarkIcon />
          </div>
        </div>
      </Link>
    );
  }

  /* ----------------------------------- minimal ----------------------------- */
  if (variant === "minimal") {
    return (
      <Link
        href={url}
        className={cx(
          ROOT_BASE,
          "rounded-xl",
          "flex items-stretch gap-4 p-3 sm:gap-5 sm:p-4",
          className,
        )}
        aria-label={post.title}
      >
        <div
          className={cx(
            IMG_WRAP,
            "relative w-[120px] shrink-0 self-stretch aspect-[4/3]",
          )}
        >
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            sizes="120px"
            className={IMG_INNER}
          />
          {firstTag ? (
            <span
              className={cx(
                "absolute left-1.5 top-1.5 z-10 inline-flex items-center rounded-full px-1.5 py-0.5",
                "bg-[color:var(--sv-ink)]/60 backdrop-blur-md ring-1 ring-white/10",
                "text-[9px] font-medium uppercase tracking-[0.12em] text-[color:var(--sv-cream)]",
              )}
            >
              {firstTag}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-1 pr-10">
          <h3
            className={cx(
              SERIF,
              "text-[20px] leading-[1.15] tracking-[-0.01em]",
              "text-[color:var(--sv-ink)]",
              "transition-colors duration-300 group-hover:text-[color:var(--sv-burgundy)]",
            )}
            style={TITLE_CLAMP_2}
          >
            {post.title}
          </h3>

          <MetaLine
            publishedAt={post.published_at}
            readingTime={post.reading_time_minutes}
            firstTag={post.tags?.[0]}
            className="text-[11px]"
          />
        </div>

        {/* compact bookmark, vertically centered on right */}
        <span
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full",
            "bg-[color:var(--sv-cream-2)] ring-1 ring-[color:var(--sv-ink)]/10",
            "transition-transform duration-300 group-hover:-translate-y-[calc(50%+2px)]",
          )}
        >
          <svg
            width="12"
            height="14"
            viewBox="0 0 14 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[color:var(--sv-burgundy)]"
          >
            <path d="M2 1.5h10v13l-5-3.2-5 3.2v-13z" />
          </svg>
        </span>
      </Link>
    );
  }

  /* ----------------------------------- default ----------------------------- */
  return (
    <Link
      href={url}
      className={cx(ROOT_BASE, "rounded-2xl flex flex-col", className)}
      aria-label={post.title}
    >
      <div className="p-4 pb-0">
        <div className={cx(IMG_WRAP, "relative aspect-[16/9]")}>
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={IMG_INNER}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--sv-ink)]/30 via-transparent to-transparent"
          />
          {firstTag ? <TagPill label={firstTag} /> : null}
          <BookmarkIcon />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3
          className={cx(
            SERIF,
            "text-[22px] leading-[1.15] tracking-[-0.01em]",
            "text-[color:var(--sv-ink)]",
            "transition-colors duration-300 group-hover:text-[color:var(--sv-burgundy)]",
          )}
          style={TITLE_CLAMP_2}
        >
          {post.title}
        </h3>

        <p
          className="text-[14.5px] leading-[1.6] text-[color:var(--sv-ink-2)]"
          style={EXCERPT_CLAMP_2}
        >
          {post.excerpt}
        </p>

        <div className="mt-auto pt-3 border-t border-dashed border-[color:var(--sv-rule)]">
          <MetaLine
            publishedAt={post.published_at}
            readingTime={post.reading_time_minutes}
            firstTag={post.tags?.[0]}
          />
        </div>
      </div>
    </Link>
  );
}
export { ArticleCard };
