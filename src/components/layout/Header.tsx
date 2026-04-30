import Link from "next/link";
import { Search, Menu } from "lucide-react";

/**
 * ShowVerdict — Header
 *
 * Sticky editorial header. Brass accent, serif wordmark, backdrop blur.
 * No event handlers, no state. Mobile menu is a CSS-only <details> element.
 *
 * Border-on-scroll trick (CSS-only): we use the :has() selector on <html>
 * combined with a scroll-driven container query fallback. The simplest
 * cross-browser CSS-only approach is to draw a hairline border that animates
 * in via a sentinel — but to keep this dependency-free and JS-free we just
 * apply a subtle border that reads well on both states.
 */
export default function Header() {
  const navItems: { label: string; href: string }[] = [
    { label: "Reviews", href: "/blog" },
    { label: "Tools", href: "/tools" },
    { label: "Compare", href: "/compare" },
    { label: "Best Picks", href: "/best" },
    { label: "About", href: "/about" },
  ];

  return (
    <header
      className="
        sticky top-0 z-50
        h-14 md:h-16
        bg-background/85 backdrop-blur
        supports-[backdrop-filter]:bg-background/70
        border-b border-transparent
        [@supports(animation-timeline:scroll())]:animate-[sv-border_linear_both]
        [animation-timeline:scroll()]
        [animation-range:0_120px]
      "
    >
      <style>{`
        @keyframes sv-border {
          to { border-bottom-color: rgb(0 0 0 / 0.08); }
        }
      `}</style>

      <div className="mx-auto h-full max-w-7xl px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left — Wordmark */}
        <Link
          href="/"
          aria-label="ShowVerdict — home"
          className="flex items-center gap-1.5 shrink-0 group"
        >
          <span
            className="
              font-serif font-semibold tracking-tight
              text-[1.1rem] md:text-[1.25rem]
              text-foreground
            "
            style={{ fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif' }}
          >
            ShowVerdict
          </span>
          <span
            aria-hidden="true"
            className="
              inline-block w-1.5 h-1.5 rounded-full
              bg-[var(--sv-brass,#B8893B)]
              translate-y-[3px]
              transition-transform duration-200
              group-hover:scale-125
            "
          />
        </Link>

        {/* Center — Primary nav (desktop only) */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                relative text-[0.9375rem] font-medium
                text-foreground/75 hover:text-foreground
                transition-colors
                after:absolute after:left-0 after:right-0 after:-bottom-1
                after:h-px after:bg-[var(--sv-brass,#B8893B)]
                after:scale-x-0 hover:after:scale-x-100
                after:origin-left after:transition-transform after:duration-200
              "
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right — Search + CTA (desktop) / Hamburger (mobile) */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Search — visible on all sizes */}
          <Link
            href="/search"
            aria-label="Search reviews"
            className="
              hidden md:inline-flex items-center justify-center
              w-9 h-9 rounded-full
              text-foreground/70 hover:text-foreground
              hover:bg-foreground/5
              transition-colors
            "
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </Link>

          {/* CTA — desktop */}
          <Link
            href="/blog"
            className="
              hidden md:inline-flex items-center
              h-9 px-4 rounded-full
              text-[0.875rem] font-medium tracking-tight
              text-white
              bg-[var(--sv-brass,#B8893B)]
              hover:bg-[var(--sv-brass-dark,#9E7530)]
              shadow-[0_1px_0_rgb(0_0_0/0.04),0_1px_2px_rgb(0_0_0/0.06)]
              transition-colors
            "
          >
            Browse Reviews
          </Link>

          {/* Mobile — search icon */}
          <Link
            href="/search"
            aria-label="Search reviews"
            className="
              md:hidden inline-flex items-center justify-center
              w-10 h-10 rounded-full
              text-foreground/75
              hover:bg-foreground/5
            "
          >
            <Search className="w-[20px] h-[20px]" strokeWidth={1.75} />
          </Link>

          {/* Mobile — hamburger as CSS-only <details> */}
          <details className="md:hidden relative group">
            <summary
              aria-label="Open menu"
              className="
                list-none cursor-pointer
                inline-flex items-center justify-center
                w-10 h-10 rounded-full
                text-foreground/80
                hover:bg-foreground/5
                [&::-webkit-details-marker]:hidden
              "
            >
              <Menu className="w-[20px] h-[20px]" strokeWidth={1.75} />
            </summary>

            {/* Panel */}
            <div
              className="
                absolute right-0 top-[calc(100%+8px)]
                w-[min(78vw,280px)]
                rounded-xl border border-black/5
                bg-background/95 backdrop-blur
                shadow-[0_10px_30px_-8px_rgb(0_0_0/0.18),0_2px_8px_rgb(0_0_0/0.06)]
                overflow-hidden
                origin-top-right
              "
            >
              <nav aria-label="Mobile" className="flex flex-col py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="
                      px-4 py-2.5
                      text-[0.95rem] font-medium
                      text-foreground/85 hover:text-foreground
                      hover:bg-foreground/5
                    "
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="h-px mx-4 my-2 bg-black/5" />
                <Link
                  href="/blog"
                  className="
                    mx-3 my-1 inline-flex items-center justify-center
                    h-10 rounded-full
                    text-[0.9rem] font-medium
                    text-white
                    bg-[var(--sv-brass,#B8893B)]
                    hover:bg-[var(--sv-brass-dark,#9E7530)]
                  "
                >
                  Browse Reviews
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}


export { Header };
