import type { Metadata } from 'next';
import {
  Inter,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Libre_Baskerville,
  Playfair_Display,
  Lexend,
  Oswald,
  Manrope,
} from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { getSiteConfig, getSiteThemeVars } from '@/lib/site-config';
import { Header, Footer } from '@/components/layout';
import { ThemeProvider } from '@/components/providers';

// Next.js requires each font loader to be a separate const at module scope
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading', weight: ['600', '700', '800'], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading', weight: ['600', '700'], display: 'swap' });
const libreBaskerville = Libre_Baskerville({ subsets: ['latin'], variable: '--font-heading', weight: ['700'], display: 'swap' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-heading', weight: ['600', '700', '800'], display: 'swap' });
const lexend = Lexend({ subsets: ['latin'], variable: '--font-heading', weight: ['600', '700'], display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-heading', weight: ['600', '700'], display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-heading', weight: ['600', '700', '800'], display: 'swap' });

const headingFonts: Record<string, typeof inter> = {
  'plus-jakarta-sans': plusJakartaSans,
  'space-grotesk': spaceGrotesk,
  'libre-baskerville': libreBaskerville,
  'playfair-display': playfairDisplay,
  'lexend': lexend,
  'oswald': oswald,
  'manrope': manrope,
};

function getHeadingFont() {
  const fontKey = process.env.SITE_HEADING_FONT?.toLowerCase().replace(/\s+/g, '-');
  if (fontKey && headingFonts[fontKey]) {
    return headingFonts[fontKey];
  }
  return null;
}

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  const customTitle = process.env.SITE_TITLE || null;
  const defaultTitle = customTitle
    || (site.niche ? `${site.name} — ${site.niche} Reviews, Guides & Comparisons` : site.name);
  const description = process.env.SITE_META_DESCRIPTION
    || (site.niche
      ? `${site.name} — Expert reviews, honest comparisons, and the best deals on ${site.niche.toLowerCase()}. Helping you make smarter decisions.`
      : site.name);
  const siteUrl = site.domain ? `https://${site.domain}` : undefined;

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${site.name}`,
    },
    description,
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    openGraph: {
      title: site.name,
      description,
      type: 'website',
      url: siteUrl,
      siteName: site.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = getSiteConfig();
  const themeVars = getSiteThemeVars(site);
  const ga4Id = process.env.NEXT_PUBLIC_GA_ID;
  const headingFont = getHeadingFont();
  const fontClasses = [inter.variable, headingFont?.variable].filter(Boolean).join(' ');

  return (
    <html lang="en" className={fontClasses} suppressHydrationWarning>
      <body style={{ ...themeVars as React.CSSProperties }}>
        {/* Site-wide JSON-LD: WebSite + Organization structured data */}
        {/* Site-wide JSON-LD: WebSite + Organization structured data — server-rendered for instant crawling */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': site.domain ? `https://${site.domain}/#website` : undefined,
                name: site.name,
                url: site.domain ? `https://${site.domain}` : undefined,
                description: site.niche
                  ? `Expert reviews, guides, and comparisons for ${site.niche.toLowerCase()}`
                  : undefined,
                potentialAction: site.domain ? {
                  '@type': 'SearchAction',
                  target: `https://${site.domain}/blog?q={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                } : undefined,
              },
              {
                '@type': 'Organization',
                '@id': site.domain ? `https://${site.domain}/#organization` : undefined,
                name: site.name,
                url: site.domain ? `https://${site.domain}` : undefined,
                logo: site.theme_config?.logoUrl || undefined,
              },
            ].filter(item => item.name),
        }) }} />
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
            </Script>
          </>
        )}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:rounded focus:shadow-lg">
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
