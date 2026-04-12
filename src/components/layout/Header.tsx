import Link from 'next/link';
import Image from 'next/image';
import { getSiteConfig } from '@/lib/site-config';
import { getNavLinks } from '@/lib/queries';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Search } from 'lucide-react';

/**
 * Site header with navigation
 *
 * Features:
 * - Sticky positioning with backdrop blur
 * - Logo support (image or text fallback)
 * - Desktop nav links with active states
 * - Theme toggle (dark mode)
 * - Mobile hamburger menu via Sheet
 */
export async function Header() {
  const site = getSiteConfig();
  const navData = await getNavLinks();
  // Support both `staticLinks` (template) and `mainLinks` (some older site queries.ts)
  const staticLinks: Array<{ name: string; href: string }> =
    (navData as any).staticLinks ?? (navData as any).mainLinks ?? [];
  const categories: Array<{ name: string; href: string }> =
    ((navData as any).categories ?? []).map((c: any) => ({ name: c.name, href: c.href ?? `/category/${c.slug}` }));
  const resourceLinks: Array<{ name: string; href: string }> = (navData as any).resourceLinks ?? [];
  const trustLinks: Array<{ name: string; href: string }> = (navData as any).trustLinks ?? [];

  const allLinks = [...staticLinks, ...categories.slice(0, 4)].slice(0, 6); // Cap at 6 total to prevent overflow

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo / Site Name */}
        <Link href="/" className="flex items-center space-x-2">
          {site.theme_config?.logoUrl ? (
            <Image
              src={site.theme_config.logoUrl}
              alt={site.name}
              width={160}
              height={32}
              priority
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-xl font-bold text-foreground">{site.name}</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav links={allLinks} />

        {/* CTA Button + Search + Theme Toggle + Mobile Navigation */}
        <div className="flex items-center gap-2">
          {process.env.SITE_HEADER_CTA_TEXT && process.env.SITE_HEADER_CTA_URL && (
            <>
              {/* Desktop CTA — full-width pill */}
              <Link
                href={process.env.SITE_HEADER_CTA_URL}
                className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {process.env.SITE_HEADER_CTA_TEXT}
              </Link>
              {/* Mobile CTA — compact pill so the primary action is visible above-the-fold on phones */}
              <Link
                href={process.env.SITE_HEADER_CTA_URL}
                className="inline-flex md:hidden items-center px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap max-w-[120px] truncate"
                aria-label={process.env.SITE_HEADER_CTA_TEXT}
              >
                {process.env.SITE_HEADER_CTA_TEXT}
              </Link>
            </>
          )}
          <Link
            href="/search"
            aria-label="Search"
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <MobileNav
            siteName={site.name}
            links={allLinks}
            categories={categories}
            resourceLinks={resourceLinks}
            trustLinks={trustLinks}
          />
        </div>
      </div>
    </header>
  );
}
