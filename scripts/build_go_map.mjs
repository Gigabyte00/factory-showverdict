#!/usr/bin/env node
/**
 * scripts/build_go_map.mjs — build-time snapshot of this site's offers for /go/[slug].
 *
 * WHY: on 2026-09-16 an ~80-minute Supabase saturation hung every /go redirect on the fleet —
 * the route awaited an untimed offer lookup, so database latency became a hung redirect and
 * every affiliate click was lost. With this snapshot the route can still 302 to the merchant
 * when the database is slow or down. See src/app/go/[slug]/route.ts (fallbackPolicy).
 *
 * Runs as the npm `prebuild` hook (Vercel runs `npm run build`). Writes src/generated/go-map.json.
 *  - identity/creds missing (local dev without secrets) → writes an EMPTY map, exit 0
 *  - creds present but the fetch fails after retries      → exit 1 → the build fails → the
 *    previous deploy stays live. Never ship a build with a silently stale or partial map.
 * PostgREST caps responses at 1000 rows regardless of `limit` → page by offset.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'src/generated/go-map.json');
const SITE_ID = process.env.SITE_ID?.trim();
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const write = (map) => { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, JSON.stringify(map)); };
const meta = (extra) => ({ built_at: new Date().toISOString(), site_id: SITE_ID ?? null, count: 0, amazon_tag: null, empty: true, ...extra });

if (!SITE_ID || !BASE || !KEY) {
  write({ meta: meta({}), offers: {} });
  console.warn('[go-map] identity/creds missing — wrote an EMPTY snapshot (route answers 503 when the DB is unavailable)');
  process.exit(0);
}

async function page(offset) {
  const q = `${BASE}/rest/v1/offers?select=slug,pretty_slug,name,affiliate_url,is_active&site_id=eq.${SITE_ID}&limit=1000&offset=${offset}`;
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(q, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error(`PostgREST ${r.status}: ${(await r.text()).slice(0, 160)}`);
      return await r.json();
    } catch (e) {
      last = e;
      await new Promise((res) => setTimeout(res, 1500 * attempt));
    }
  }
  throw last;
}

try {
  const rows = [];
  for (let off = 0; ; off += 1000) {
    const r = await page(off);
    rows.push(...r);
    if (r.length < 1000) break;
  }
  const offers = {};
  let amazonTag = null;
  for (const o of rows) {
    const u = (o.affiliate_url ?? '').trim();
    if (!/^https?:\/\//.test(u)) continue;
    const rec = { u, a: !!o.is_active, n: o.name ?? '' };
    if (o.slug) offers[o.slug] = rec;                              // slug wins over a colliding pretty_slug,
    if (o.pretty_slug && !offers[o.pretty_slug]) offers[o.pretty_slug] = rec; // matching the route's lookup order
    if (!amazonTag && o.is_active && /amazon\./.test(u)) {
      const m = /[?&]tag=([^&]+)/.exec(u);
      if (m) amazonTag = m[1];
    }
  }
  const count = Object.keys(offers).length;
  write({ meta: meta({ count, amazon_tag: amazonTag, empty: count === 0 }), offers });
  console.log(`[go-map] ${count} slugs from ${rows.length} offers; amazon_tag=${amazonTag ?? 'none'}`);
} catch (e) {
  console.error('[go-map] FAILED — refusing to build with a stale or partial snapshot:', e?.message ?? e);
  process.exit(1);
}
