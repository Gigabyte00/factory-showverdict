import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/site-config';

// Service role client for both reads (bypasses RLS site scoping) and click logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Derive this site's Amazon Associates tag from any active Amazon offer.
 * Used to salvage clicks on inactive offers (brand programs not yet joined):
 * instead of a dead-end 410, we redirect to a *tagged* Amazon search so the
 * click still monetizes via the one channel that's actually wired up.
 * Returns null for sites with no Amazon presence (service niches) — they
 * self-gate out of the fallback and keep the original behavior.
 */
async function getSiteAmazonTag(siteId: string): Promise<string | null> {
  const { data } = await supabase
    .from('offers')
    .select('affiliate_url')
    .eq('site_id', siteId)
    .eq('is_active', true)
    .ilike('affiliate_url', '%amazon.%tag=%')
    .limit(1);
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
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const site = getSiteConfig();

  try {
    // Lookup offer by slug scoped to this site (prevents multi-row error when slug exists on multiple sites)
    let { data: offer, error } = await supabase
      .from('offers')
      .select('id, affiliate_url, site_id, name, is_active, price_usd')
      .eq('slug', slug)
      .eq('site_id', site.id)
      .single();

    if (error || !offer) {
      const fallback = await supabase
        .from('offers')
        .select('id, affiliate_url, site_id, name, is_active, price_usd')
        .eq('pretty_slug', slug)
        .eq('site_id', site.id)
        .single();

      if (!fallback.error && fallback.data) {
        offer = fallback.data;
        error = null;
      }
    }

    if (error || !offer) {
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
    const response = NextResponse.redirect(affiliateUrl, 302);
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
