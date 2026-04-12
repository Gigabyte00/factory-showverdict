import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Offer Price History API — /api/offer-price-history?offer_id=xxx
 *
 * Reads the offer_price_history time-series for a single offer, deduplicates
 * to one observation per day (latest wins), and returns a series suitable
 * for a sparkline.
 *
 * The /go/[slug] route writes price rows on click; duplicates are fine
 * there because this read-side dedupe collapses them.
 */

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service credentials are not configured.');
  }
  return createClient(url, key);
}

/**
 * Parse a price string like "$1,699" or "1699.99" to a number. Returns null
 * for values we can't confidently parse (e.g. "Check price").
 */
function parsePrice(raw: string): number | null {
  if (!raw) return null;
  const match = raw.replace(/,/g, '').match(/[\d.]+/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const offerId = url.searchParams.get('offer_id');
    if (!offerId) {
      return NextResponse.json({ error: 'offer_id is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    // Pull last 180 days of observations — covers the "30-day delta" UI use
    // case with plenty of padding for weekly/monthly summaries.
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('offer_price_history')
      .select('price, recorded_at')
      .eq('offer_id', offerId)
      .gte('recorded_at', cutoff)
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('offer-price-history read failed:', error.message);
      return NextResponse.json({ error: 'Could not load price history' }, { status: 500 });
    }

    type Row = { price: string; recorded_at: string };
    const rows = (data || []) as Row[];

    // Dedupe to one point per day, keeping the last observation of that day.
    const byDay = new Map<string, { date: string; price: number; raw: string }>();
    for (const row of rows) {
      const dayKey = row.recorded_at.slice(0, 10); // YYYY-MM-DD
      const parsed = parsePrice(row.price);
      if (parsed === null) continue;
      byDay.set(dayKey, { date: dayKey, price: parsed, raw: row.price });
    }
    const series = Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Compute simple stats the UI can use without re-doing math client-side.
    const first = series[0];
    const last = series[series.length - 1];
    const minEntry = series.reduce<{ price: number; date: string } | null>(
      (acc, p) => (acc === null || p.price < acc.price ? p : acc),
      null
    );
    const maxEntry = series.reduce<{ price: number; date: string } | null>(
      (acc, p) => (acc === null || p.price > acc.price ? p : acc),
      null
    );

    let deltaPct: number | null = null;
    if (first && last && first.price > 0 && series.length >= 2) {
      deltaPct = Number((((last.price - first.price) / first.price) * 100).toFixed(1));
    }

    return NextResponse.json({
      series, // [{ date, price, raw }]
      count: series.length,
      current: last?.raw ?? null,
      min: minEntry?.price ?? null,
      max: maxEntry?.price ?? null,
      deltaPct,
    });
  } catch (err) {
    console.error('offer-price-history error:', err);
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
}
