import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/site-config';
import goMapJson from '@/generated/go-map.json';

// Service role client for both reads (bypasses RLS site scoping) and click logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---- outage hardening (2026-09-16) --------------------------------------------------------------
// An ~80-minute Supabase saturation hung every /go redirect on the fleet: this route awaited the
// offer lookup with no timeout, so database latency became a hung redirect and every click was
// lost. Now the lookup has a hard budget, and when the database is slow or down the route answers
// from the build-time snapshot (scripts/build_go_map.mjs → src/generated/go-map.json).
const LOOKUP_BUDGET_MS = 2500;

interface GoMapEntry { u: string; a: boolean; n: string }
interface GoMap { meta: { amazon_tag: string | null; empty: boolean }; offers: Record<string, GoMapEntry> }
const GO_MAP = goMapJson as unknown as GoMap;

class DbUnavailable extends Error {}

/** Await a query within the remaining budget; DB error or timeout → DbUnavailable (never a hang). */
async function withBudget(
  q: PromiseLike<{ data: unknown; error: { message: string } | null }>,
  deadline: number
): Promise<unknown> {
  const ms = deadline - Date.now();
  if (ms <= 0) throw new DbUnavailable('budget exhausted');
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, rej) => {
    timer = setTimeout(() => rej(new DbUnavailable('db-timeout')), ms);
  });
  try {
    const res = await Promise.race([Promise.resolve(q), timeout]);
    if (res.error) throw new DbUnavailable(res.error.message);
    return res.data;
  } catch (e) {
    throw e instanceof DbUnavailable ? e : new DbUnavailable(e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * TODO(owner): the ONE policy choice in this route. When the database is unavailable:
 *   redirect    — the snapshot has this slug and it was active at the last build → 302 to the merchant
 *   salvage     — unknown/inactive slug on an Amazon-tagged site → tagged Amazon search (as today)
 *   unavailable — nothing to send the visitor to → fast 503 that retries itself; never a hang
 * A stale snapshot can redirect to an offer deactivated since the last build (dead merchant page,
 * but the click still reaches the network). Change the first test to `snap?.u` for always-redirect,
 * or delete that branch for never-redirect.
 */
function fallbackPolicy(
  slug: string
): { kind: 'redirect'; url: string; name: string } | { kind: 'salvage'; tag: string; term: string } | { kind: 'unavailable' } {
  const snap = GO_MAP.offers[slug];
  if (snap?.a && snap.u) return { kind: 'redirect', url: snap.u, name: snap.n };
  const tag = GO_MAP.meta.amazon_tag;
  if (tag) {
    const base = snap?.n ?? slug.replace(/-[a-z0-9]{6}$/i, '').replace(/-/g, ' ');
    const term = base.split(/\s*[:\-/(,]/)[0].trim().split(/\s+/).slice(0, 6).join(' ');
    return { kind: 'salvage', tag, term: term || slug };
  }
  return { kind: 'unavailable' };
}

function unavailableResponse(): Response {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="5"><title>One moment…</title>
<style>body{font-family:system-ui,sans-serif;color:#222;max-width:560px;margin:96px auto;padding:24px;text-align:center}h1{font-size:1.4rem}</style>
</head><body><h1>One moment — reconnecting this link</h1><p>This page retries automatically in a few seconds.</p><p><a href="/offers">See our current picks</a></p></body></html>`,
    { status: 503, headers: { 'Content-Type': 'text/html', 'Retry-After': '5', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } }
  );
}

interface GoOffer { id: string; affiliate_url: string | null; site_id: string; name: string; is_active: boolean; price_usd: number | null }
const OFFER_COLS = 'id, affiliate_url, site_id, name, is_active, price_usd';

/** Site-scoped lookup by one column, inside the shared budget. 0 rows → null (not an error). */
async function lookupOffer(col: 'slug' | 'pretty_slug', value: string, siteId: string, signal: AbortSignal, deadline: number): Promise<GoOffer | null> {
  return ((await withBudget(
    supabase.from('offers').select(OFFER_COLS).eq(col, value).eq('site_id', siteId).abortSignal(signal).maybeSingle(),
    deadline
  )) as GoOffer | null) ?? null;
}

function amazonSearchRedirect(term: string, tag: string): NextResponse {
  const fb = NextResponse.redirect(`https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${tag}`, 302);
  fb.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  fb.headers.set('X-Robots-Tag', 'noindex, nofollow');
  fb.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  return fb;
}

/**
 * Derive this site's Amazon Associates tag from any active Amazon offer.
 * Used to salvage clicks on inactive offers (brand programs not yet joined):
 * instead of a dead-end 410, we redirect to a *tagged* Amazon search so the
 * click still monetizes via the one channel that's actually wired up.
 * Returns null for sites with no Amazon presence (service niches) — they
 * self-gate out of the fallback and keep the original behavior.
 */
async function getSiteAmazonTag(siteId: string): Promise<string | null> {
  // Snapshot first: no round-trip, and the salvage path can never hang on an outage.
  if (GO_MAP.meta.amazon_tag) return GO_MAP.meta.amazon_tag;
  let data: { affiliate_url: string }[] | null = null;
  try {
    data = (await withBudget(
      supabase
        .from('offers')
        .select('affiliate_url')
        .eq('site_id', siteId)
        .eq('is_active', true)
        .ilike('affiliate_url', '%amazon.%tag=%')
        .limit(1)
        .abortSignal(AbortSignal.timeout(LOOKUP_BUDGET_MS)),
      Date.now() + LOOKUP_BUDGET_MS
    )) as { affiliate_url: string }[] | null;
  } catch {
    return null;
  }
  const url = data?.[0]?.affiliate_url as string | undefined;
  if (!url) return null;
  const m = /[?&]tag=([^&]+)/.exec(url);
  return m?.[1] ?? null;
}

/**
 * Affiliate Redirect Route - /go/[slug]
 *
 * Logs clicks server-side and issues a proper HTTP 302 redirect to the affiliate URL.
 * Sets __fattr attribution cookie via Set-Cookie header (server-set = ITP-immune, 365-day).
 *
 * Uses HTTP 302 (not 200+JS redirect) so Amazon Associates and other affiliate programs
 * can properly track the referral and set attribution cookies.
 */
// click→conversion attribution — stamp the click token (offer_clicks.id) as the network sub-id.
// Mirror of factory-tools/factory-attribution/inject_click_id.mjs — keep in sync.
function injectClickId(u: string, id: string): string {
  try {
    const url = new URL(u); const h = url.hostname.toLowerCase();
    const p =
      (/(^|\.)(anrdoezrs|tkqlhce|dpbolvw|jdoqocy|kqzyfj|emjcd|ftjcfx|awltovhc|lduhtrp|qksrv)\.(net|com)$/.test(h) || h.endsWith('.cj.com')) ? 'sid'
      : h.endsWith('awin1.com') ? 'clickref'
      : /(^|\.)(pxf\.io|sjv\.io|ojrq\.net|impact\.com)$/.test(h) ? 'subId1'
      : (h.includes('amazon.') || h.includes('amzn.')) ? 'ascsubtag'
      : /(^|\.)(flexlinkspro\.com|flexoffers\.com)$/.test(h) ? 'fobs'
      : 'subid';
    url.searchParams.set(p, id);
    return url.toString();
  } catch { return u; }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // prefetch-guard v1 (2026-09-07): Next.js <Link> viewport prefetch and browser speculative loads hit this
  // route with no user intent. Log nothing, hit no merchant, answer 204 so a real click re-fetches normally.
  // Keyed ONLY on prefetch signals — never on the RSC header / _rsc param, which real navigations also carry.
  {
    const __h = req.headers;
    if (__h.get('next-router-prefetch') === '1' || /prefetch/i.test(__h.get('purpose') ?? '') || /prefetch/i.test(__h.get('sec-purpose') ?? '')) {
      return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  const { slug } = await params;
  const __clickId = globalThis.crypto.randomUUID(); // click token = offer_clicks.id, stamped as the network sub-id
  const site = getSiteConfig();

  try {
    // Lookup offer by slug scoped to this site (prevents multi-row error when slug exists on multiple sites)
    let offer: GoOffer | null = null;
    try {
      // One budget covers both lookups; the shared signal cancels whichever is in flight.
      const deadline = Date.now() + LOOKUP_BUDGET_MS;
      const signal = AbortSignal.timeout(LOOKUP_BUDGET_MS);
      offer = await lookupOffer('slug', slug, site.id, signal, deadline);
      if (!offer) offer = await lookupOffer('pretty_slug', slug, site.id, signal, deadline);
    } catch (e) {
      if (!(e instanceof DbUnavailable)) throw e;
      // Database slow or down. Answer from the snapshot; nothing in this branch awaits the DB.
      const fb = fallbackPolicy(slug);
      console.warn(`[go] db-fallback slug=${slug} kind=${fb.kind} reason=${e.message}`);
      if (fb.kind === 'redirect') {
        const attr = Buffer.from(
          JSON.stringify({ offer_slug: slug, offer_name: fb.name, clicked_at: new Date().toISOString(), fallback: true })
        ).toString('base64url');
        const res = NextResponse.redirect(fb.url, 302);
        res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
        res.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
        res.headers.set('Set-Cookie', `__fattr=${attr}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`);
        return res;
      }
      if (fb.kind === 'salvage') return amazonSearchRedirect(fb.term, fb.tag);
      return unavailableResponse();
    }

    if (!offer) {
      // Salvage dead-slug clicks (404s) the same way we salvage inactive offers:
      // redirect to a TAGGED Amazon search so the click still monetizes via the one
      // channel that's wired up. No offer row exists here, so there is nothing to
      // attribute — we omit the offer_clicks insert and use the SITE's Amazon tag.
      // Self-gates to the original 404 when the site has no Amazon presence.
      const amazonTag = await getSiteAmazonTag(site.id);
      if (amazonTag) {
        const searchTerm = slug
          .replace(/-[a-z0-9]{6}$/i, '')
          .replace(/-/g, ' ')
          .split(/\s+/)
          .slice(0, 6)
          .join(' ')
          .trim();
        if (searchTerm) {
          const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=${amazonTag}`;
          const fb = NextResponse.redirect(searchUrl, 302);
          fb.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
          fb.headers.set('X-Robots-Tag', 'noindex, nofollow');
          fb.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
          return fb;
        }
      }
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link Not Found</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:100px auto;padding:20px;text-align:center}h1{color:#ef4444}p{color:#6b7280}a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}</style>
</head><body><h1>Link Not Found</h1><p>The link <code>/go/${slug}</code> doesn't exist or has been removed.</p><p><a href="/">Return to homepage</a></p></body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!offer.is_active) {
      // Salvage the click instead of wasting it on a 410. Many inactive offers are
      // brand programs that were never joined (placeholder URLs). For Amazon-niche
      // sites we redirect to a TAGGED Amazon search for the offer, monetizing the
      // purchase intent via the channel that IS wired up. Service-niche sites have
      // no Amazon tag → getSiteAmazonTag returns null → original 410 is preserved.
      const amazonTag = await getSiteAmazonTag(offer.site_id);
      if (amazonTag) {
        // Use the leading brand/product identifier: cut at the first separator
        // (": - / ( ,") then cap at 6 words, so long product titles don't produce
        // junk Amazon searches. Brand offers (e.g. "Heybike") pass through clean.
        const searchTerm =
          offer.name.split(/\s*[:\-/(,]/)[0].trim().split(/\s+/).slice(0, 6).join(' ') ||
          offer.name;
        const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=${amazonTag}`;
        supabase
          .from('offer_clicks')
          .insert({
            offer_id: offer.id,
            site_id: offer.site_id,
            referrer: (req.headers.get('referer') ?? '').slice(0, 500),
            user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300),
            ip_hash: null,
            utm_source: 'inactive-fallback',
            utm_medium: 'amazon-search',
            utm_campaign: offer.name?.slice(0, 100) ?? null,
          })
          .then(({ error: insErr }) => {
            if (insErr) console.error('inactive-fallback insert failed:', insErr.message);
          });
        const fb = NextResponse.redirect(searchUrl, 302);
        fb.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        fb.headers.set('X-Robots-Tag', 'noindex, nofollow');
        fb.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
        return fb;
      }
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offer Unavailable</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:100px auto;padding:20px;text-align:center}h1{color:#f59e0b}p{color:#6b7280}a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}</style>
</head><body><h1>Offer Unavailable</h1><p>${offer.name} is temporarily inactive.</p><p><a href="/offers">Browse other offers</a></p></body></html>`,
        { status: 410, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Click metadata
    const referrer = req.headers.get('referer') ?? '';
    const userAgent = req.headers.get('user-agent') ?? '';
    const url = new URL(req.url);
    const ipRaw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';

    const ipHash = ipRaw
      ? createHash('sha256').update(ipRaw).digest('hex').slice(0, 32)
      : null;

    // Sec-Fetch-* metadata: real browsers send these automatically on navigations.
    // Their absence is the strongest signal that a "Mozilla/Chrome" UA is spoofed.
    const secFetchSite = req.headers.get('sec-fetch-site');
    const utmSourceParam = url.searchParams.get('utm_source');
    const isSyntheticMonitor = utmSourceParam === 'synthetic-monitor';

    // -------- BOT BLOCK (short-circuits the affiliate redirect) --------
    // Goal: stop scrapers from poisoning Amazon's quality filter by hitting /go/
    // directly. Blocked requests get 302 to "/" so any false-positive humans land
    // on the homepage instead of an error. We also log the block to offer_clicks
    // with utm_source='blocked-bot', utm_medium=<reason> for measurement.
    //
    // Layers:
    //   1. UA denylist — obvious scraper UAs (low false-positive risk).
    //   2. Missing Sec-Fetch-Site on a modern-Chromium UA — these browsers ALWAYS
    //      send sec-fetch headers on link navigations (since ~2020). Absence on a
    //      Chrome/Edge UA = spoofed UA from a basic HTTP client. We don't enforce
    //      this on Firefox/Safari UAs to avoid edge-case false positives.
    const uaDenylistRe = /(\bbot\b|crawl|spider|scrape|headless|phantom|puppeteer|playwright|lighthouse|axios|^curl|^wget|python-?requests|python\/|httpie|node-fetch|go-http|java\/|ruby\/|perl\/|php\/|libwww|okhttp|undici|aiohttp|urllib|facebookexternalhit|slackbot|twitterbot|linkedinbot|whatsapp|telegram|discordbot|semrush|ahrefs|mj12|dotbot|petalbot|amazonbot|gptbot|claudebot|ccbot|perplexity|chatgpt-user|youbot|anthropic|cohere|meta-ai|google-extended)/i;
    const chromeMatch = /Chrome\/(\d+)/.exec(userAgent || '');
    const chromeMajor = chromeMatch ? Number.parseInt(chromeMatch[1], 10) : 0;
    const claimsModernChromium = chromeMajor >= 80;

    let blockReason: string | null = null;
    if (!isSyntheticMonitor) {
      if (!userAgent) blockReason = 'no-ua';
      else if (uaDenylistRe.test(userAgent)) blockReason = 'ua-denylist';
      else if (claimsModernChromium && secFetchSite === null) blockReason = 'no-sec-fetch';
    }

    if (blockReason) {
      supabase
        .from('offer_clicks')
        .insert({
          offer_id: offer.id,
          site_id: offer.site_id,
          referrer: referrer.slice(0, 500),
          user_agent: (userAgent || '').slice(0, 300),
          ip_hash: ipHash,
          utm_source: 'blocked-bot',
          utm_medium: blockReason,
          utm_campaign: null,
        })
        .then(({ error: insertError }) => {
          if (insertError) console.error('blocked-bot insert failed:', insertError.message);
        });
      // owner decision 2026-05-28: log the bot/suspicious click but FORWARD it anyway
      // (no bounce to home). New sites match the keep-bots fleet stance. Accepted
      // Amazon invalid-traffic risk — see docs/ADVISOR-REVIEW-2026-05-28-v2.md.
    }

    // Legacy DB-logging filter retained (skips logging for obvious bots that
    // somehow made it past the block — should be ~zero in practice).
    const isBot = !userAgent
      || uaDenylistRe.test(userAgent)
      || !/Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(userAgent);

    if (!isBot && !blockReason) {
      supabase
        .from('offer_clicks')
        .insert({
        id: __clickId,
          offer_id: offer.id,
          site_id: offer.site_id,
          referrer: referrer.slice(0, 500),
          user_agent: userAgent.slice(0, 300),
          ip_hash: ipHash,
          utm_source: url.searchParams.get('utm_source') ?? null,
          utm_medium: url.searchParams.get('utm_medium') ?? null,
          utm_campaign: url.searchParams.get('utm_campaign') ?? null,
        })
        .then(({ error: insertError }) => {
          if (insertError) console.error('offer_clicks insert failed:', insertError.message);
        });

      // Record a price observation in the offer_price_history time-series.
      // Fire-and-forget; duplicates are acceptable since the reader API
      // deduplicates to one row per day per offer at query time.
      // The offers table stores price as numeric `price_usd`; we serialize
      // to a short string for the history table (which is text-typed).
      const priceUsd = (offer as any).price_usd as number | null | undefined;
      if (priceUsd != null && Number.isFinite(priceUsd)) {
        (supabase as any)
          .from('offer_price_history')
          .insert({
            offer_id: offer.id,
            site_id: offer.site_id,
            price: `$${priceUsd}`,
            source: 'click',
          })
          .then(({ error: phErr }: { error: { message: string } | null }) => {
            if (phErr) console.error('offer_price_history insert failed:', phErr.message);
          });
      }
    }

    // Validate URL before redirecting
    const affiliateUrl = offer.affiliate_url?.trim();
    if (!affiliateUrl || affiliateUrl === '#' || !affiliateUrl.startsWith('http')) {
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Coming Soon</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:100px auto;padding:20px;text-align:center}h1{color:#8b5cf6}p{color:#6b7280}a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}</style>
</head><body><h1>Coming Soon</h1><p>The link for <strong>${offer.name}</strong> is being set up. Please check back shortly.</p><p><a href="/offers">Browse all offers</a></p></body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Build attribution cookie: JSON encoded as base64url
    // Server-set first-party cookies are NOT subject to Safari ITP's 7-day JS-cookie cap.
    const attrPayload = JSON.stringify({
      offer_id: offer.id,
      offer_slug: slug,
      offer_name: offer.name,
      clicked_at: new Date().toISOString(),
    });
    const attrCookieValue = Buffer.from(attrPayload).toString('base64url');

    // HTTP 302 redirect — proper server-side redirect that Amazon Associates can track.
    // Browsers follow 302s with the Location header, preserving referrer context
    // and allowing Amazon to set its affiliate attribution cookie.
    const response = NextResponse.redirect(injectClickId(affiliateUrl, __clickId), 302);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
    response.headers.set('Set-Cookie', `__fattr=${attrCookieValue}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`);
    return response;
  } catch (err) {
    console.error('Link cloaking error:', err);
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Server Error</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:100px auto;padding:20px;text-align:center}h1{color:#dc2626}p{color:#6b7280}a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}</style>
</head><body><h1>Server Error</h1><p>Something went wrong. Please try again.</p><p><a href="/">Return to homepage</a></p></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
