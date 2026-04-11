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
 * Logs clicks server-side and returns an HTML relay page that:
 * 1. Sets __fattr attribution cookie via Set-Cookie header (server-set = ITP-immune, 365-day)
 * 2. Writes localStorage backup before navigating (survives cookie deletion)
 * 3. JS-redirects immediately to affiliate URL (<50ms perceived delay)
 *
 * Server-set cookies bypass Safari ITP's 7-day cap on JS-written cookies.
 * The relay page also prevents referrer leakage to the affiliate destination.
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

    // Log click to offer_clicks table — fire-and-forget, don't block the relay response
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

    // Validate URL before embedding in HTML
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

    // Safe JS string: JSON.stringify escapes quotes, newlines, and special chars
    const safeDestUrl = JSON.stringify(affiliateUrl);
    const safeAttrPayload = JSON.stringify(attrPayload);

    // HTML relay page: sets cookie server-side, writes localStorage, JS-redirects instantly
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex,nofollow">
<meta http-equiv="refresh" content="0;url=${affiliateUrl.replace(/"/g, '&quot;')}">
<title>Redirecting...</title>
</head>
<body>
<script>
(function(){
  try { localStorage.setItem('__fattr', ${safeAttrPayload}); } catch(e) {}
  window.location.replace(${safeDestUrl});
})();
</script>
<p style="font-family:system-ui;text-align:center;margin-top:20vh;color:#6b7280">
  Redirecting... <a href="${affiliateUrl.replace(/"/g, '&quot;')}">Click here if not redirected</a>
</p>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
        // Server-set cookie: bypasses Safari ITP's JS-cookie 7-day restriction
        'Set-Cookie': `__fattr=${attrCookieValue}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`,
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
