import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Track affiliate link clicks and redirect to offer URL
 *
 * POST /api/track-click
 * Body: { offer_id: string, site_id: string, source?: string }
 *
 * Used by OfferButton and OfferLink components for inline click tracking.
 * Records click in offer_clicks table and increments click_count on offer.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { allowed } = rateLimit(ip, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { offer_id, site_id, source = 'unknown' } = body;

    if (!offer_id || !site_id) {
      return NextResponse.json(
        { error: 'Missing required fields: offer_id, site_id' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get offer details
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('id, affiliate_url, name, click_count, site_id')
      .eq('id', offer_id)
      .eq('site_id', site_id)
      .eq('is_active', true)
      .single();

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found or inactive' },
        { status: 404 }
      );
    }

    // Gather request metadata
    const referrer = req.headers.get('referer') ?? '';
    const userAgent = req.headers.get('user-agent') ?? '';
    const ipHash = ip !== 'unknown'
      ? createHash('sha256').update(ip).digest('hex').slice(0, 32)
      : null;

    // Bot detection — skip click recording for known bots/crawlers
    const isBot = !userAgent
      || /^(axios|curl|wget|python|httpie|node-fetch|go-http|java|ruby|perl|php)/i.test(userAgent)
      || /bot|crawl|spider|scrape|headless|phantom|puppeteer|playwright|lighthouse/i.test(userAgent)
      || !/Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(userAgent);

    if (!isBot) {
      // Record click in offer_clicks table (fire-and-forget)
      supabase
        .from('offer_clicks')
        .insert({
          offer_id: offer.id,
          site_id: offer.site_id,
          referrer: referrer.slice(0, 500),
          user_agent: userAgent.slice(0, 300),
          ip_hash: ipHash,
        })
        .then(({ error: insertError }) => {
          if (insertError) console.error('offer_clicks insert failed:', insertError.message);
        });

      // Increment click count on offer (fire-and-forget, approximate counter)
      const currentCount = offer.click_count ?? 0;
      supabase
        .from('offers')
        .update({ click_count: currentCount + 1 })
        .eq('id', offer.id)
        .then(({ error: updateError }) => {
          if (updateError) console.error('Failed to increment click count:', updateError);
        });
    }

    // Validate URL before redirecting
    const affiliateUrl = offer.affiliate_url?.trim();
    if (!affiliateUrl || affiliateUrl === '#' || !affiliateUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Offer URL not configured' },
        { status: 404 }
      );
    }

    // Redirect to affiliate URL
    return NextResponse.redirect(affiliateUrl, { status: 302 });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
