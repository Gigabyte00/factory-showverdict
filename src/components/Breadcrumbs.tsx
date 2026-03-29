import Link from 'next/link';
import Script from 'next/script';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * SEO-friendly breadcrumb navigation with structured data
 * Uses Next.js Script component for safe JSON-LD injection
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate structured data for search engines
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      {/* Structured data using Next.js Script component */}
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(structuredData)}
      </Script>

      {/* Visual breadcrumb trail */}
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && <span className="mx-1 text-muted-foreground/50">/</span>}
              {isLast ? (
                <span className="font-medium text-foreground">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
