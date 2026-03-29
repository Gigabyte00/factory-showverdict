import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';
import { getNavLinks } from '@/lib/queries';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
  const { categories, staticLinks } = await getNavLinks();

  const allLinks = [...staticLinks, ...categories.slice(0, 4)]; // Limit nav to 4 categories + static

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo / Site Name */}
        <Link href="/" className="flex items-center space-x-2">
          {site.theme_config?.logoUrl ? (
            <img
              src={site.theme_config.logoUrl}
              alt={site.name}
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-xl font-bold text-foreground">{site.name}</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Button + Theme Toggle + Mobile Navigation */}
        <div className="flex items-center gap-2">
          {process.env.SITE_HEADER_CTA_TEXT && process.env.SITE_HEADER_CTA_URL && (
            <Link
              href={process.env.SITE_HEADER_CTA_URL}
              className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {process.env.SITE_HEADER_CTA_TEXT}
            </Link>
          )}
          <ThemeToggle />
          <MobileNav
            siteName={site.name}
            links={allLinks}
            categories={categories}
          />
        </div>
      </div>
    </header>
  );
}
