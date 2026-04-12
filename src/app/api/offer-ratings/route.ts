import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';
import { getSiteConfig } from '@/lib/site-config';

/**
 * Offer Ratings API — /api/offer-ratings
 *
 * POST body: { offer_id: string, rating: 1-5 }
 *   → inserts (one per IP-hash per offer) and returns aggregate + userRating
 * GET  ?offer_id=xxx
 *   → returns aggregate + userRating (if this IP has already rated)
 *
 * Uses service-role client so we can read/write across RLS. The anon client
 * never touches ratings directly — all reads/writes are mediated by this route
 * which derives the IP hash server-side.
 */

const submitSchema = z.object({
  offer_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});

/**
 * Lazy service-role client. Module-level init makes builds fragile when
 * env vars aren't present at page-data-collection time.
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service credentials are not configured.');
  }
  return createClient(url, key);
}

function hashIp(ip: string): string {
  // Salted hash so the same IP across sites doesn't produce a cross-site key.
  // Salt uses the Supabase URL (available on all sites) so no extra config is needed.
  const salt = process.env.NEXT_PUBLIC_SUPABASE_URL || 'factory';
  return createHash('sha256').update(`${ip}::${salt}`).digest('hex').slice(0, 32);
}

function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

async function aggregate(
  supabase: ReturnType<typeof getServiceClient>,
  offerId: string,
  ipHash: string
) {
  const [ratingsResult, userRatingResult] = await Promise.all([
    supabase
      .from('offer_ratings')
      .select('rating', { count: 'exact' })
      .eq('offer_id', offerId),
    supabase
      .from('offer_ratings')
      .select('rating')
      .eq('offer_id', offerId)
      .eq('ip_hash', ipHash)
      .maybeSingle(),
  ]);

  const rows = (ratingsResult.data || []) as Array<{ rating: number }>;
  const count = ratingsResult.count ?? rows.length;
  const average =
    rows.length > 0
      ? Number((rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(2))
      : 0;
  const userRating = userRatingResult.data?.rating ?? null;

  return { average, count, userRating };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const offerId = url.searchParams.get('offer_id');
    if (!offerId) {
      return NextResponse.json({ error: 'offer_id is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const ipHash = hashIp(getIp(request));
    const result = await aggregate(supabase, offerId, ipHash);
    return NextResponse.json(result);
  } catch (err) {
    console.error('offer-ratings GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch rating' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    // 5 submissions per IP per 10 minutes — covers a realistic session
    // (user rates a few offers) while blocking scripted bulk-voting.
    const { allowed } = rateLimit(`rating:${ip}`, 5, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests — try again in a few minutes' },
        { status: 429, headers: { 'Retry-After': '600' } }
      );
    }

    const body = await request.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { offer_id, rating } = parsed.data;
    const supabase = getServiceClient();
    const site = getSiteConfig();
    const ipHash = hashIp(ip);
    const userAgent = request.headers.get('user-agent')?.slice(0, 300) ?? null;

    // Verify the offer belongs to THIS site — prevents cross-site rating pollution.
    const { data: offer, error: offerErr } = await supabase
      .from('offers')
      .select('id, site_id')
      .eq('id', offer_id)
      .eq('site_id', site.id)
      .maybeSingle();

    if (offerErr || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Upsert: one rating per IP-hash per offer. Submitting again updates.
    const { error: insertErr } = await supabase
      .from('offer_ratings')
      .upsert(
        {
          offer_id,
          site_id: offer.site_id,
          rating,
          ip_hash: ipHash,
          user_agent: userAgent,
        },
        { onConflict: 'offer_id,ip_hash' }
      );

    if (insertErr) {
      console.error('offer-ratings insert error:', insertErr);
      return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
    }

    const result = await aggregate(supabase, offer_id, ipHash);
    return NextResponse.json(result);
  } catch (err) {
    console.error('offer-ratings POST error:', err);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
