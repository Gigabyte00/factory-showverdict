import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client for both reads (bypasses RLS site scoping) and click logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Link Cloaking Route - /go/[slug]
 *
 * Redirects pretty slugs to affiliate URLs while tracking clicks.
 * Uses 307 (Temporary Redirect) so search engines treat this as a
 * non-permanent redirect and don't pass link equity to the destination.
 *
 * Example: /go/rad-rover-6-plus → https://example.com/affiliate?id=123
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Lookup offer by slug, fall back to pretty_slug for backwards compat
    let { data: offer, error } = await supabase
      .from('offers')
      .select('id, affiliate_url, site_id, name, is_active')
      .eq('slug', slug)
      .single();

    if (error || !offer) {
      const fallback = await supabase
        .from('offers')
        .select('id, affiliate_url, site_id, name, is_active')
        .eq('pretty_slug', slug)
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
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offer Unavailable</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:100px auto;padding:20px;text-align:center}h1{color:#f59e0b}p{color:#6b7280}a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}</style>
</head><body><h1>Offer Unavailable</h1><p>${offer.name} is temporarily inactive.</p><p><a href="/offers">Browse other offers</a></p></body></html>`,
        { status: 410, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Log click to offer_clicks table — fire-and-forget, don't block the redirect
    const referrer = req.headers.get('referer') ?? '';
    const userAgent = req.headers.get('user-agent') ?? '';
    const url = new URL(req.url);
    const ipRaw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';

    const ipHash = ipRaw
      ? createHash('sha256').update(ipRaw).digest('hex').slice(0, 32)
      : null;

    // Bot filtering: skip click tracking for non-browser user agents
    const isBot = !userAgent
      || /^(axios|curl|wget|python|httpie|node-fetch|go-http|java|ruby|perl|php)/i.test(userAgent)
      || /bot|crawl|spider|scrape|headless|phantom|puppeteer|playwright|lighthouse/i.test(userAgent)
      || !/Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(userAgent);

    if (!isBot) {
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
    }

    return NextResponse.redirect(offer.affiliate_url, {
      status: 307,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
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
