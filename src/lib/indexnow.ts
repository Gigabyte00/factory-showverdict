import { getSiteConfig } from '@/lib/site-config';

/**
 * IndexNow — instant URL submission to Bing/Yandex/Naver (and via them, Copilot +
 * the index behind most ChatGPT-search citations; 87% of ChatGPT citations match
 * Bing top results — Seer 2025, see factory-seo-loop/data/geo-research-2026-07-04.md).
 *
 * Key: derived from SITE_ID (uuid hex, dashes stripped → valid 32-char IndexNow key),
 * so no extra env var per site. Served at /indexnow-key.txt and passed via keyLocation.
 */

export function getIndexNowKey(): string | null {
  const siteId = process.env.SITE_ID;
  if (!siteId) return null;
  const key = siteId.replace(/-/g, '');
  return /^[a-f0-9]{32}$/i.test(key) ? key : null;
}

/**
 * Submit URLs to IndexNow. Fire-and-forget safe: never throws, returns status.
 * Batches up to 10,000 URLs per the spec (we cap far below that in practice).
 */
export async function pingIndexNow(urls: string[]): Promise<{ ok: boolean; status?: number }> {
  try {
    const key = getIndexNowKey();
    const site = getSiteConfig();
    if (!key || !site.domain || urls.length === 0) return { ok: false };

    const host = site.domain;
    const base = `https://${host}`;
    const urlList = urls
      .map((u) => (u.startsWith('http') ? u : `${base}${u.startsWith('/') ? u : `/${u}`}`))
      .filter((u) => u.startsWith(base))
      .slice(0, 10000);
    if (urlList.length === 0) return { ok: false };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${base}/indexnow-key.txt`,
        urlList,
      }),
      // Don't let a slow IndexNow endpoint block the caller. (any-cast: older
      // repos' TS lib types predate AbortSignal.timeout; runtime is Node 18+.)
      signal: (AbortSignal as unknown as { timeout(ms: number): AbortSignal }).timeout(5000),
    });
    // 200 = submitted, 202 = accepted (key validation pending) — both fine.
    return { ok: res.status === 200 || res.status === 202, status: res.status };
  } catch {
    return { ok: false };
  }
}
