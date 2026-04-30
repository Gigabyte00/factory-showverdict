import Link from "next/link";
import { Film, Youtube, Twitter } from "lucide-react";

/**
 * ShowVerdict — editorial Footer
 *
 * Brass accent via CSS variables (set on the <footer> element).
 * Tailwind tokens used: bg-muted/30, border, text-foreground, etc.
 * Newsletter form posts to /api/newsletter (no client handlers).
 */
export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="relative border-t bg-muted/30 text-foreground"
      style={
        {
          // Brass palette — warm, editorial, not gold-y
          ["--brass" as any]: "#B08D57",
          ["--brass-ink" as any]: "#7A5E33",
          ["--brass-tint" as any]: "#F5EFE3",
          borderTopColor: "var(--brass)",
          borderTopWidth: "2px",
        } as React.CSSProperties
      }
    >
      {/* ROW 1 — brand + nav columns */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 md:px-10 md:pt-20 md:pb-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-10">
          {/* Col 1 — wordmark + tagline + socials */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-baseline gap-1 font-serif text-2xl tracking-tight"
            >
              <span className="font-semibold">Show</span>
              <span
                className="font-semibold italic"
                style={{ color: "var(--brass-ink)" }}
              >
                Verdict
              </span>
              <span
                aria-hidden
                className="ml-0.5 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full"
                style={{ background: "var(--brass)" }}
              />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Independent television criticism. We watch the pilots, the
              middles, and the finales — so your weekend doesn't go to waste.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <SocialLink
                href="https://letterboxd.com/showverdict"
                label="Letterboxd"
              >
                <Film className="h-4 w-4" strokeWidth={1.75} />
              </SocialLink>
              <SocialLink
                href="https://youtube.com/@showverdict"
                label="YouTube"
              >
                <Youtube className="h-4 w-4" strokeWidth={1.75} />
              </SocialLink>
              <SocialLink href="https://x.com/showverdict" label="X / Twitter">
                <Twitter className="h-4 w-4" strokeWidth={1.75} />
              </SocialLink>
            </div>
          </div>

          {/* Col 2 — Reviews */}
          <FooterColumn title="Reviews">
            <FooterLink href="/blog">Latest reviews</FooterLink>
            <FooterLink href="/tools">Watch tools</FooterLink>
            <FooterLink href="/compare">Compare shows</FooterLink>
            <FooterLink href="/offers">Streaming offers</FooterLink>
          </FooterColumn>

          {/* Col 3 — Resources */}
          <FooterColumn title="Resources">
            <FooterLink href="/methodology">Our methodology</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/glossary">Glossary</FooterLink>
            <FooterLink href="/authors">Authors</FooterLink>
            <FooterLink href="/editorial-standards">
              Editorial standards
            </FooterLink>
          </FooterColumn>

          {/* Col 4 — About */}
          <FooterColumn title="About">
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/affiliate-disclosure">
              Affiliate disclosure
            </FooterLink>
          </FooterColumn>
        </div>
      </div>

      {/* ROW 2 — newsletter band */}
      <div
        className="border-y"
        style={{
          background: "var(--brass-tint)",
          borderColor: "color-mix(in oklab, var(--brass) 22%, transparent)",
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-[1.1fr_1fr] md:gap-16 md:px-10 md:py-14">
          <div>
            <h3
              className="font-serif text-3xl leading-tight tracking-tight md:text-[2.125rem]"
              style={{ color: "#1f1a14" }}
            >
              One show pick.
              <span
                className="italic"
                style={{ color: "var(--brass-ink)" }}
              >
                {" "}
                Every Sunday morning.
              </span>
            </h3>
            <p
              className="mt-3 max-w-lg text-[15px] leading-relaxed"
              style={{ color: "#5a4a32" }}
            >
              Spoiler-free reviews and weekend watch picks from our screening
              room. No fluff, no SPAM.
            </p>
          </div>

          <form
            action="/api/newsletter"
            method="post"
            className="w-full"
            aria-label="Subscribe to the ShowVerdict newsletter"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@inbox.com"
                className="h-12 flex-1 rounded-md border bg-white px-4 text-[15px] outline-none transition placeholder:text-stone-400 focus:border-[var(--brass)] focus:ring-2 focus:ring-[var(--brass)]/30"
                style={{
                  borderColor:
                    "color-mix(in oklab, var(--brass) 28%, transparent)",
                }}
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-md px-6 text-[15px] font-medium tracking-wide text-white transition hover:brightness-95"
                style={{
                  background: "var(--brass-ink)",
                  letterSpacing: "0.01em",
                }}
              >
                Subscribe
              </button>
            </div>
            <p
              className="mt-3 text-xs"
              style={{ color: "#7a6648" }}
            >
              Free. Unsubscribe in one click. Read by 42,000+ TV obsessives.
            </p>
          </form>
        </div>
      </div>

      {/* ROW 3 — legal */}
      <div className="mx-auto max-w-7xl px-6 py-7 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="text-sm">
            <p className="font-medium text-foreground">© 2026 ShowVerdict</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Editorial independence: we never accept payment for positive
              reviews.
            </p>
          </div>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted-foreground"
          >
            <LegalLink href="/privacy">Privacy</LegalLink>
            <LegalSep />
            <LegalLink href="/terms">Terms</LegalLink>
            <LegalSep />
            <LegalLink href="/affiliate-disclosure">Disclosure</LegalLink>
            <LegalSep />
            <LegalLink href="/sitemap">Sitemap</LegalLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ---------- subcomponents ---------- */

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className="font-serif text-[15px] font-semibold tracking-wide"
        style={{ color: "#1f1a14" }}
      >
        {title}
      </h3>
      <span
        aria-hidden
        className="mt-2 block h-px w-8"
        style={{ background: "var(--brass)" }}
      />
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground transition-colors hover:text-[var(--brass-ink)]"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:text-[var(--brass-ink)]"
      style={{
        borderColor: "color-mix(in oklab, var(--brass) 30%, transparent)",
      }}
    >
      {children}
    </Link>
  );
}

function LegalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-1.5 py-0.5 transition-colors hover:text-[var(--brass-ink)]"
    >
      {children}
    </Link>
  );
}

function LegalSep() {
  return (
    <span aria-hidden className="text-muted-foreground/50">
      ·
    </span>
  );
}


export { Footer };
