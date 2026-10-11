import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { Post, Category } from '@/types';
import { notFound } from 'next/navigation';
import { getTemplate, getDefaultVariant } from '@/lib/templates/registry';
import { TopBuyBox } from '@/components/offers/TopBuyBox';
import { StickyMobileBuyBar } from '@/components/offers/StickyMobileBuyBar';

// AMZ-2 topbuybox (2026-10-11): merchant-aware price-CTA label. Ported from the AMZ-2 store-label.ts pattern
// (storeName/priceCtaLabel) used elsewhere in the fleet; this repo has no src/lib/store-label.ts of its
// own, so the derivation is inlined. Never invents a merchant name; active-offers-only, so there is no
// "inactive" wording branch here.
function amz2StoreName(offer: { affiliate_url?: string | null; affiliate_program?: string | null }): string | null {
  let host: string | null = null;
  try {
    host = offer.affiliate_url ? new URL(offer.affiliate_url).hostname.toLowerCase() : null;
  } catch {
    host = null;
  }
  const program = offer.affiliate_program?.trim() || null;
  if ((host && /amazon\./.test(host)) || (program && /amazon/i.test(program))) return 'Amazon';
  if ((host && /ebay\./.test(host)) || (program && /ebay/i.test(program))) return 'eBay';
  if (program) {
    const stripped = program.replace(/\s*\([^()]*\)\s*$/, '').trim().split(' | ')[0].trim();
    return stripped || null;
  }
  return null;
}

function amz2PriceCtaLabel(offer: { affiliate_url?: string | null; affiliate_program?: string | null }): string {
  const store = amz2StoreName(offer);
  if (store === 'Amazon') return 'Check price on Amazon';
  if (store) return `Check price at ${store}`;
  return 'Check price';
}

// AMZ-2 topbuybox (2026-10-11): CTA-integrity law -- a product may surface in the box only if the post body
// actually discusses it. Checks for a /go/<slug> link terminated by )?"/# , whitespace, or end, so
// /go/abc never matches /go/abcd. Tried against both slug and pretty_slug (either may be the one
// linked in the body).
function amz2MentionedInBody(content: string, slugs: Array<string | null | undefined>): boolean {
  for (const raw of slugs) {
    if (!raw) continue;
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`/go/${escaped}(?:[)?"/#\s]|$)`).test(content)) return true;
  }
  return false;
}
import RelatedOffersRail from '@/components/offers/RelatedOffersRail';
import JsonLd from '@/components/JsonLd';
import { canonicalUrl } from '@/lib/seo';
import { normalizeArticleHeadings, rewriteAmazonLinksToGo } from '@/lib/article-content';

/** Extract FAQ Q&A pairs from markdown content (detects ## FAQ / ## Frequently Asked Questions sections). */
function extractFaqs(content: string): Array<{ question: string; answer: string }> {
  // Find the start of an FAQ section
  // Match any H2 that IS an FAQ heading, not just the four canonical spellings: sites ship
  // "Quick FAQ", "Viewer FAQ", "Pre-roll FAQ, desk edition", numbered/anchored headings.
  // 21 published posts emitted no FAQPage purely because their heading was worded differently.
  const faqMatch = content.match(/^##\s+(?:<a[^>]*><\/a>\s*)?(?:\d+[.)]\s*)?[^\n]*\b(faqs?|frequently\s+asked\s+questions|common\s+questions)\b[^\n]*$/im);
  if (!faqMatch || faqMatch.index === undefined) return [];
  const faqSection = content.slice(faqMatch.index);

  // Parse H3 questions + the text between them as answers
  const blocks = faqSection.split(/^###\s+/m).slice(1); // split on H3, drop pre-FAQ content
  const faqs: Array<{ question: string; answer: string }> = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    const question = lines[0].trim().replace(/\?$/, '').trim() + '?';
    const answer = lines.slice(1).join('\n').trim()
      .replace(/\*\*/g, '')   // strip bold markers
      .replace(/\n{2,}/g, ' ') // collapse paragraph breaks
      .slice(0, 600);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: post } = await supabase
    .from('posts')
    .select('title, meta_title, meta_description, excerpt, featured_image_url')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const url = canonicalUrl(`/blog/${slug}`);
  // Always provide a social image: featured image, else the site's OG image route
  const ogImage = post.featured_image_url || canonicalUrl('/opengraph-image');

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || `Read ${post.title} on ${site.name}`,
    alternates: { canonical: url },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      type: 'article',
      url,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  // Fetch post with all details
  const { data: postData, error } = await supabase
    .from('posts')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !postData) {
    notFound();
  }

  // Cast to our extended Post type with metadata support
  const post = postData as Post;

  // Normalize body headings (single h1 per page) and route in-content Amazon
  // dp-links through /go/<slug> for click tracking when they match an offer.
  if (post.content) {
    let content = normalizeArticleHeadings(post.content, post.title);
    if (content.includes('amazon.com')) {
      const { data: offerLinks } = await supabase
        .from('offers')
        .select('slug, affiliate_url')
        .eq('site_id', site.id)
        .eq('is_active', true);
      content = rewriteAmazonLinksToGo(content, offerLinks || []);
    }
    post.content = content;
  }

  // Fetch category if exists
  let category: Category | null = null;
  if (post.category_id) {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('id', post.category_id)
      .single();
    category = data;
  }

  // Fetch related posts — same category first, fall back to recency
  const { data: sameCategoryPosts } = post.category_id
    ? await supabase
        .from('posts')
        .select('id, slug, title, excerpt, featured_image_url, published_at, reading_time_minutes')
        .eq('site_id', site.id)
        .eq('status', 'published')
        .eq('category_id', post.category_id)
        .neq('id', post.id)
        .order('published_at', { ascending: false })
        .limit(4)
    : { data: [] };

  let relatedPosts = sameCategoryPosts ?? [];

  if (relatedPosts.length < 4) {
    const excludeIds = [post.id, ...relatedPosts.map((p) => p.id)];
    const { data: backfill } = await supabase
      .from('posts')
      .select('id, slug, title, excerpt, featured_image_url, published_at, reading_time_minutes')
      .eq('site_id', site.id)
      .eq('status', 'published')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('published_at', { ascending: false })
      .limit(4 - relatedPosts.length);
    relatedPosts = [...relatedPosts, ...(backfill ?? [])];
  }

  // Determine template variant.
  // Priority: 1. Explicit metadata.variant, 2. content_type column, 3. metadata flags,
  // 4. word-count fallback. content_type is authoritative for inserter-driven posts.
  let variant = post.metadata?.variant;

  if (!variant) {
    if ((post as any).content_type === 'review') {
      variant = 'review';
    } else if ((post as any).content_type === 'comparison') {
      variant = 'comparison';
    } else if (post.metadata?.isComparison || post.metadata?.comparison) {
      variant = 'comparison';
    } else if (post.metadata?.isReview || post.metadata?.review) {
      variant = 'review';
    } else {
      const wordCount = post.content?.split(/\s+/).length || 0;
      variant = wordCount > 3000 ? 'longform' : 'standard';
    }
  }

  // Hydrate review metadata from the linked offer when missing. The inserter writes
  // featured_offer_id but not metadata.review, which leaves rich CTAs dormant.
  if (variant === 'review' && (post as any).featured_offer_id && !(post.metadata as any)?.review?.affiliateUrl) {
    const { data: offer } = await supabase
      .from('offers')
      .select('slug, name, rating, current_price, price_usd, pros, cons, featured_image_url')
      .eq('id', (post as any).featured_offer_id)
      .single();

    if (offer) {
      // Live prices dropped (one-time API snapshot, no refresh) — omit from review schema/UI.
      const priceStr = '';
      (post as any).metadata = {
        ...((post.metadata as any) || {}),
        isReview: true,
        review: {
          ...(((post.metadata as any) || {}).review || {}),
          productName: (offer as any).name || post.title,
          affiliateUrl: `/go/${(offer as any).slug}`,
          price: priceStr,
          rating: (offer as any).rating ?? undefined,
          maxRating: 5,
          pros: Array.isArray((offer as any).pros) ? (offer as any).pros.slice(0, 6) : [],
          cons: Array.isArray((offer as any).cons) ? (offer as any).cons.slice(0, 6) : [],
          badge: "Editor's Pick",
          offer_id: (post as any).featured_offer_id,
        },
      };
    }
  }

  // Get template component
  const Template = getTemplate('post-detail', variant);

  // AMZ-2 topbuybox (2026-10-11): resolve up to 3 ACTIVE offers (featured_offer_id first, then
  // related_offer_ids), same site, with the supabase client this page already uses, KEEPING ONLY
  // offers the post body actually links via /go/<slug or pretty_slug> (CTA-integrity law -- a rail
  // offer the body never mentions must not show as a "where to buy" pick). Only {slug, name, label}
  // ever reach TopBuyBox -- never the row, never affiliate_url -- and the sticky bar gets a
  // precomputed /go path, never a raw URL. Nothing renders on protected EPN-pilot posts (in-body
  // /go/ebay-used-* or /go/used-*-on-ebay links) or when no candidate survives the mention filter.
  const topBuyBoxIds = Array.from(
    new Set(
      [
        (post as any).featured_offer_id as string | null,
        ...(Array.isArray((post as any).related_offer_ids) ? ((post as any).related_offer_ids as string[]) : []),
      ].filter((id): id is string => !!id)
    )
  );
  const topBuyBoxProtected =
    !!post.content &&
    (post.content.includes('/go/ebay-used-') || /\/go\/used-[a-z0-9-]*-on-ebay/.test(post.content));
  let topBuyBoxOffers: { slug: string; name: string; label: string }[] = [];
  let stickyBarOffer: { name: string; goPath: string; label: string } | null = null;
  if (!topBuyBoxProtected && topBuyBoxIds.length > 0) {
    const { data: topBuyBoxRows } = await supabase
      .from('offers')
      .select('id, slug, pretty_slug, name, affiliate_url, affiliate_program')
      .in('id', topBuyBoxIds)
      .eq('site_id', site.id)
      .eq('is_active', true);
    const topBuyBoxOrder = new Map(topBuyBoxIds.map((id, i) => [id, i]));
    const topBuyBoxSorted = (topBuyBoxRows ?? [])
      .sort((a, b) => (topBuyBoxOrder.get(a.id) ?? 99) - (topBuyBoxOrder.get(b.id) ?? 99))
      .filter((o) => amz2MentionedInBody(post.content ?? '', [o.slug, o.pretty_slug]))
      .slice(0, 3);
    topBuyBoxOffers = topBuyBoxSorted.map((o) => ({ slug: o.slug, name: o.name, label: amz2PriceCtaLabel(o) }));
    if (topBuyBoxSorted.length > 0) {
      const topBuyBoxFirst = topBuyBoxSorted[0];
      stickyBarOffer = {
        name: topBuyBoxFirst.name,
        goPath: `/go/${topBuyBoxFirst.slug}?utm_source=sticky&utm_medium=affiliate&utm_campaign=${encodeURIComponent(post.slug)}`,
        label: amz2PriceCtaLabel(topBuyBoxFirst),
      };
    }
  }
  const topBuyBoxNode = topBuyBoxOffers.length > 0 ? <TopBuyBox offers={topBuyBoxOffers} postSlug={post.slug} /> : null;

  const baseUrl = site.domain ? `https://${site.domain}` : '';
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Blog', url: `${baseUrl}/blog` },
    { name: post.title, url: `${baseUrl}/blog/${slug}` },
  ];

  const faqs = post.content ? extractFaqs(post.content) : [];

  // Fallback to default if variant not found
  if (!Template) {
    const defaultVariant = getDefaultVariant('post-detail');
    const DefaultTemplate = getTemplate('post-detail', defaultVariant);

    if (!DefaultTemplate) {
      throw new Error('No post detail templates available');
    }

    return (
      <>
        <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
        {faqs.length >= 3 && <JsonLd type="faq" data={{ faqs }} />}
        <DefaultTemplate
          post={post}
          category={category}
          relatedPosts={relatedPosts || []}
          site={site}
          topBuyBox={topBuyBoxNode}
        />
        {defaultVariant !== 'review' && stickyBarOffer ? (
          <StickyMobileBuyBar
            productName={stickyBarOffer.name}
            affiliateUrl={stickyBarOffer.goPath}
            ctaLabel={stickyBarOffer.label}
          />
        ) : null}
        <RelatedOffersRail relatedOfferIds={(post as any).related_offer_ids} siteId={site.id} />
      </>
    );
  }

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      {faqs.length >= 3 && <JsonLd type="faq" data={{ faqs }} />}
      <Template
        post={post}
        category={category}
        relatedPosts={relatedPosts || []}
        site={site}
        topBuyBox={topBuyBoxNode}
      />
      {variant !== 'review' && stickyBarOffer ? (
        <StickyMobileBuyBar
          productName={stickyBarOffer.name}
          affiliateUrl={stickyBarOffer.goPath}
          ctaLabel={stickyBarOffer.label}
        />
      ) : null}
      <RelatedOffersRail relatedOfferIds={(post as any).related_offer_ids} siteId={site.id} />
    </>
  );
}
