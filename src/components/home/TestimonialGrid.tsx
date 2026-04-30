import Image from "next/image";

export type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  avatar_url?: string;
  verified?: boolean;
};

export type TestimonialGridProps = {
  testimonials: Testimonial[];
  isSample?: boolean;
};

/**
 * Returns the initials of a name: first letter of the first word + first
 * letter of the last word, uppercased. Returns "·" for empty/whitespace input.
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return "·";
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  const initials = (first + last).toUpperCase();
  return initials || "·";
}

/* ------------------------------------------------------------------ */
/*  Internal pieces                                                    */
/* ------------------------------------------------------------------ */

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em]"
      style={{
        color: "var(--sv-brass-ink)",
        backgroundColor: "var(--sv-brass-soft)",
        border: "1px solid var(--sv-brass)",
      }}
      aria-label="Verified reader"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.5 6.2 5 8.5 9.8 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified
    </span>
  );
}

function Avatar({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const { avatar_url, author } = testimonial;
  const initials = getInitials(author);

  if (avatar_url) {
    return (
      <div
        className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full"
        style={{
          boxShadow: "0 0 0 1px var(--sv-brass), 0 0 0 3px var(--sv-paper)",
        }}
      >
        <Image
          src={avatar_url}
          alt={author ? `${author} avatar` : "Reader avatar"}
          fill
          sizes="44px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-base font-semibold"
      style={{
        backgroundColor: "var(--sv-brass-soft)",
        color: "var(--sv-brass-ink)",
        boxShadow: "0 0 0 1px var(--sv-brass), 0 0 0 3px var(--sv-paper)",
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  tone,
}: {
  testimonial: Testimonial;
  tone: "cream" | "blush";
}) {
  const bg =
    tone === "cream" ? "var(--sv-card-cream)" : "var(--sv-card-blush)";

  return (
    <figure
      className="group relative flex break-inside-avoid flex-col gap-5 rounded-[2px] p-7 mb-6"
      style={{
        backgroundColor: bg,
        borderTop: "3px solid var(--sv-brass)",
        boxShadow:
          "0 1px 0 0 rgba(60, 40, 20, 0.04), 0 12px 24px -16px rgba(60, 40, 20, 0.18)",
      }}
    >
      {/* Opening quote glyph */}
      <span
        aria-hidden="true"
        className="font-serif leading-none select-none"
        style={{
          fontSize: "4.5rem",
          color: "var(--sv-brass)",
          marginBottom: "-2.25rem",
          marginTop: "-0.5rem",
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        &ldquo;
      </span>

      <blockquote
        className="font-serif text-[1.0625rem] leading-[1.55]"
        style={{
          color: "var(--sv-ink)",
          display: "-webkit-box",
          WebkitLineClamp: 5,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {testimonial.quote}
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 pt-2">
        <Avatar testimonial={testimonial} />
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span
              className="truncate font-sans text-[14px] font-semibold tracking-[-0.005em]"
              style={{ color: "var(--sv-ink)" }}
            >
              {testimonial.author}
            </span>
            {testimonial.verified ? <VerifiedBadge /> : null}
          </div>
          {testimonial.role ? (
            <span
              className="truncate font-sans text-[12.5px] tracking-[0.01em]"
              style={{ color: "var(--sv-ink-muted)" }}
            >
              {testimonial.role}
            </span>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TestimonialGrid({
  testimonials,
  isSample = false,
}: TestimonialGridProps) {
  return (
    <section
      aria-label="Reader testimonials"
      className="w-full"
      style={
        {
          // Editorial palette — Wirecutter-grade, brass-accented
          ["--sv-paper" as string]: "#FBF7F0",
          ["--sv-ink" as string]: "#1F1A14",
          ["--sv-ink-muted" as string]: "#6B5E4F",
          ["--sv-card-cream" as string]: "#F5EFE3",
          ["--sv-card-blush" as string]: "#F1E2D8",
          ["--sv-brass" as string]: "#B08A3E",
          ["--sv-brass-ink" as string]: "#7A5D1F",
          ["--sv-brass-soft" as string]: "#EFE3C5",
          ["--sv-caveat-bg" as string]: "#FFF4C2",
          ["--sv-caveat-border" as string]: "#E6C44A",
          ["--sv-caveat-ink" as string]: "#5C4A0E",
        } as React.CSSProperties
      }
    >
      {isSample ? (
        <div
          role="note"
          className="mb-8 flex items-start gap-3 rounded-[2px] px-5 py-4 font-sans text-[14px] leading-snug"
          style={{
            backgroundColor: "var(--sv-caveat-bg)",
            borderLeft: "3px solid var(--sv-caveat-border)",
            color: "var(--sv-caveat-ink)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="mt-[1px] shrink-0"
          >
            <path
              d="M10 2.5 1.5 17.5h17L10 2.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M10 8v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="14.5" r="0.9" fill="currentColor" />
          </svg>
          <span>
            <strong className="font-semibold">Sample quotes shown.</strong>{" "}
            Replace with real reader testimonials before launch.
          </span>
        </div>
      ) : null}

      {/* Masonry on desktop via CSS columns; single column on mobile */}
      <div
        className="[column-gap:1.5rem] [column-count:1] md:[column-count:2] lg:[column-count:4]"
      >
        {testimonials.map((t, i) => (
          <TestimonialCard
            key={`${t.author}-${i}`}
            testimonial={t}
            tone={i % 2 === 0 ? "cream" : "blush"}
          />
        ))}
      </div>
    </section>
  );
}


export { TestimonialGrid };
