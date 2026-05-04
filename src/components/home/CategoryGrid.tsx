import Image from "next/image";
import Link from "next/link";

/**
 * ShowVerdict — CategoryGrid
 *
 * Editorial 3×2 (desktop) / 2×3 (mobile) grid of full-bleed 4:5 portrait
 * tiles. Each tile is a Link to /category/{slug} with a background image,
 * a bottom black gradient, and a centered serif white overlay showing the
 * category name and post count.
 *
 * Visual language: Wirecutter-grade editorial restraint with brass accents.
 * Brass tokens are exposed as CSS variables on the section so they can be
 * overridden by a parent theme without touching the component.
 *
 * No event handlers — pure server-renderable composition.
 */

export type Category = {
  slug: string;
  name: string;
  description?: string;
  image_url?: string;
  /** Some upstream feeds use `featured_image_url` instead of `image_url`. */
  featured_image_url?: string;
  post_count?: number;
};

type CategoryGridProps = {
  categories: Category[];
  heading?: string;
  subhead?: string;
};

const formatCount = (n: number): string => {
  if (n >= 1000) {
    const k = n / 1000;
    // 1.2K, 12K — drop trailing .0
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(n);
};

const pickImage = (c: Category): string | undefined =>
  c.image_url || c.featured_image_url;

function CategoryGrid({
  categories,
  heading = "Browse by category",
  subhead = "Independent verdicts on the things worth your attention.",
}: CategoryGridProps) {
  return (
    <section
      aria-labelledby="category-grid-heading"
      className="category-grid relative w-full bg-[var(--sv-bg)] py-16 md:py-24"
      style={
        {
          // Brass + editorial neutrals. Override at a higher level if needed.
          "--sv-bg": "#FBF8F3",
          "--sv-ink": "#1A1714",
          "--sv-muted": "#6B6258",
          "--sv-rule": "#E6DFD2",
          "--sv-brass": "#B08A3E",
          "--sv-brass-deep": "#8C6A26",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        {/* Eyebrow + heading */}
        <header className="mb-10 md:mb-14">
          <div className="mb-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="block h-px w-8 bg-[var(--sv-brass)]"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sv-brass-deep)]">
              The Index
            </span>
          </div>

          <h2
            id="category-grid-heading"
            className="font-serif text-[34px] leading-[1.05] tracking-[-0.01em] text-[var(--sv-ink)] md:text-[52px]"
            style={{ fontFamily: '"Tiempos Headline", "GT Sectra", Georgia, "Times New Roman", serif' }}
          >
            {heading}
          </h2>

          {subhead ? (
            <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.6] text-[var(--sv-muted)] md:text-[17px]">
              {subhead}
            </p>
          ) : null}
        </header>

        {/* Grid: 2 cols mobile (→ 2×3) / 3 cols desktop (→ 3×2) */}
        <ul
          role="list"
          className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-6 md:gap-y-10"
        >
          {categories.map((category, index) => {
            const src = pickImage(category);
            const count =
              typeof category.post_count === "number"
                ? `${formatCount(category.post_count)} ${
                    category.post_count === 1 ? "verdict" : "verdicts"
                  }`
                : null;

            return (
              <li key={category.slug} className="group relative">
                <Link
                  href={`/category/${category.slug}`}
                  prefetch={false}
                  aria-label={`${category.name}${
                    count ? ` — ${count}` : ""
                  }`}
                  className="
                    relative block overflow-hidden
                    bg-[var(--sv-ink)]
                    outline-none
                    ring-0 ring-offset-0
                    transition-shadow duration-300
                    focus-visible:ring-2 focus-visible:ring-[var(--sv-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sv-bg)]
                  "
                  style={{ aspectRatio: "4 / 5" }}
                >
                  {/* Background image */}
                  {src ? (
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      priority={index < 3}
                      className="
                        object-cover
                        transition-transform duration-[700ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]
                        group-hover:scale-[1.04]
                        motion-reduce:transition-none motion-reduce:group-hover:scale-100
                      "
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(120% 80% at 50% 30%, #2A241D 0%, #15110D 70%)",
                      }}
                    />
                  )}

                  {/* Constant low-key wash — keeps type legible against any photo */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-black/10"
                  />

                  {/* Bottom 30% black gradient */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%)",
                    }}
                  />

                  {/* Brass hairline frame, revealed on hover/focus */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-[10px]
                      border border-[var(--sv-brass)]/0
                      transition-[border-color,inset] duration-500
                      group-hover:border-[var(--sv-brass)]/70
                      group-focus-within:border-[var(--sv-brass)]/70
                    "
                  />

                  {/* Centered serif overlay */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-6 md:pb-8">
                    {/* Tiny brass rule above title */}
                    <span
                      aria-hidden="true"
                      className="
                        mb-3 block h-px w-6
                        bg-[var(--sv-brass)]
                        opacity-80
                        transition-[width,opacity] duration-500
                        group-hover:w-10 group-hover:opacity-100
                      "
                    />

                    <h3
                      className="
                        text-center font-serif text-white
                        text-[22px] leading-[1.1] tracking-[-0.005em]
                        md:text-[28px]
                        [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]
                      "
                      style={{
                        fontFamily:
                          '"Tiempos Headline", "GT Sectra", Georgia, "Times New Roman", serif',
                      }}
                    >
                      {category.name}
                    </h3>

                    {count ? (
                      <p
                        className="
                          mt-2 text-center
                          text-[10px] md:text-[11px]
                          font-semibold uppercase
                          tracking-[0.24em]
                          text-white/85
                        "
                      >
                        {count}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default CategoryGrid;
export { CategoryGrid };
