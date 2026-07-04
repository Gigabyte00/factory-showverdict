import { getIndexNowKey } from '@/lib/indexnow';

/**
 * IndexNow key file — proves ownership of the host to api.indexnow.org.
 * Referenced via keyLocation in every ping (see src/lib/indexnow.ts).
 */
export const dynamic = 'force-static';

export async function GET() {
  const key = getIndexNowKey();
  if (!key) return new Response('not configured', { status: 404 });
  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
