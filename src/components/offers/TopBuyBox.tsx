interface TopBuyBoxOffer {
  slug: string;
  name: string;
  label: string;
}

/**
 * Above-the-fold "Where to buy" box for article pages (AMZ-2 topbuybox, 2026-10-11).
 * Server component: only {slug, name, label} reach the HTML -- never an offer row, never
 * affiliate_url, never a price (Amazon policy). Renders nothing without offers. Threaded through
 * PostDetailTemplateProps.topBuyBox and rendered directly under the <h1> inside each of the four
 * post-detail templates; page.tsx builds it once (offer resolution + label) and passes it down.
 * Links /go/<slug> with utm_source=topbox so clicks per placement can be measured; the /go route
 * records utm_* params, never forwards them to the merchant.
 */
export function TopBuyBox({ offers, postSlug }: { offers: TopBuyBoxOffer[]; postSlug: string }) {
  if (!offers || offers.length === 0) return null;
  const query = `utm_source=topbox&utm_medium=affiliate&utm_campaign=${encodeURIComponent(postSlug)}`;
  return (
    <aside className="mt-6 mb-8 rounded-lg border bg-card p-5" aria-label="Where to buy">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Where to buy
      </p>
      <ul className="space-y-3">
        {offers.map((o) => (
          <li key={o.slug} className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">{o.name}</p>
            <a
              href={`/go/${o.slug}?${query}`}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              {o.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Affiliate links: we may earn a commission, at no extra cost to you.
      </p>
    </aside>
  );
}
