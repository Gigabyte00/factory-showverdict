/**
 * Server-side markdown content transforms applied before rendering article bodies.
 *
 * 1. normalizeArticleHeadings — pages render the post title in a page-header <h1>,
 *    so any `# Heading` inside the markdown body is demoted to `## ` to keep exactly
 *    one h1 per page. If the body's FIRST heading repeats the post title, it is
 *    dropped entirely (LLM-generated drafts frequently re-state the title).
 *
 * 2. rewriteAmazonLinksToGo — article bodies sometimes contain direct
 *    https://www.amazon.com/dp/ASIN links that bypass /go click tracking. When the
 *    ASIN matches one of the site's offers, the link is rewritten to /go/<offer-slug>
 *    (which handles tagging, bot filtering, and click logging). Unmatched links are
 *    left untouched.
 */

/** Offer shape needed for Amazon link rewriting. */
export interface OfferLinkTarget {
  slug: string;
  affiliate_url: string | null;
}

/** Normalize heading/title text for case- and punctuation-insensitive comparison. */
function normalizeHeadingText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Demote body `# h1` headings to `## h2` and drop the first heading when it
 * duplicates the post title. Skips fenced code blocks.
 */
export function normalizeArticleHeadings(content: string, title?: string | null): string {
  if (!content) return content;

  const normalizedTitle = title ? normalizeHeadingText(title) : null;
  const lines = content.split('\n');
  const out: string[] = [];
  let inFence = false;
  let firstHeadingSeen = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }

    if (!inFence) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const hashes = match[1];
        const text = match[2].replace(/\s*#+\s*$/, '').trim();

        if (!firstHeadingSeen) {
          firstHeadingSeen = true;
          // Drop the body's first heading when it just repeats the post title
          if (normalizedTitle && normalizeHeadingText(text) === normalizedTitle) {
            continue;
          }
        }

        // Demote body h1 → h2 (the page header already renders the only h1)
        if (hashes === '#') {
          out.push(`## ${match[2]}`);
          continue;
        }
      }
    }

    out.push(line);
  }

  return out.join('\n');
}

/** Matches amazon.com /dp/ASIN and /gp/product/ASIN URLs (with any query params). */
const AMAZON_DP_RE =
  /https?:\/\/(?:www\.)?amazon\.com\/(?:[^\s()<>"']*\/)?(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[^\s()<>"']*)?/gi;

/** Extract the ASIN from an Amazon product URL, or null if not an Amazon dp link. */
export function extractAsin(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=[/?#]|$)/i);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Rewrite in-content Amazon dp-links to /go/<offer-slug> when the ASIN matches
 * one of the site's offers. Leaves unmatched Amazon links untouched.
 */
export function rewriteAmazonLinksToGo(content: string, offers: OfferLinkTarget[]): string {
  if (!content || !content.includes('amazon.com')) return content;

  const asinToSlug = new Map<string, string>();
  for (const offer of offers) {
    const asin = extractAsin(offer.affiliate_url);
    if (asin && !asinToSlug.has(asin)) asinToSlug.set(asin, offer.slug);
  }
  if (asinToSlug.size === 0) return content;

  return content.replace(AMAZON_DP_RE, (full, asin: string) => {
    const slug = asinToSlug.get(asin.toUpperCase());
    return slug ? `/go/${slug}` : full;
  });
}
