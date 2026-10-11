interface TopBuyBoxOffer {
  slug: string;
  name: string;
  label: string;
}

/**
 * Display-only short name (AMZ-2 tbb-shortname 2026-10-11): Amazon listing titles run 100-200 chars of keywords, which wrapped the
 * box to several lines and pushed the button below the first phone screen. Keep the head of the title (brand +
 * model) up to the first marketing clause; the link still goes to the same offer. Tune the cut rules here only.
 */
function shortName(name: string): string {
  const n = name.replace(/\s+/g, ' ').trim();
  if (n.length <= 48) return n;
  // first clause boundary far enough in to keep brand + model: ' | ' or a spaced dash from 10 chars, ' for/with/by ' or a comma from 18
  const re = /\s(?:for|with|by|-|\u2013|\u2014|\|)\s|,/gi;
  let head = n;
  let m: RegExpExecArray | null;
  while ((m = re.exec(n))) {
    if (m.index >= (/[|\-\u2013\u2014]/.test(m[0]) ? 10 : 18)) { head = n.slice(0, m.index); break; }
  }
  let clipped = false;
  if (head.length > 64) {
    const sp = head.lastIndexOf(' ', 60);
    head = head.slice(0, sp > 20 ? sp : 60);
    clipped = true;
  }
  const open = head.lastIndexOf('(');
  if (open > 18 && head.indexOf(')', open) === -1) { head = head.slice(0, open); clipped = false; }
  head = head.replace(/[\s,:;|+&\-\u2013\u2014]+$/, '');
  return clipped ? head + '\u2026' : head;
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
            <p className="text-sm font-semibold line-clamp-2">{shortName(o.name)}</p>
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
