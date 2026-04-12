import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';
import { rateLimit } from '@/lib/rate-limit';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token';

export async function GET(request: Request) {
  // Rate limit: 5 requests per 15 minutes per IP
  const forwarded = (request as any).headers?.get?.('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() || 'unknown';
  const { allowed } = rateLimit(`unsub:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const site = getSiteConfig();
  const siteId = (site as any).id as string;

  // If a token is provided, validate it. If no token, allow (old emails) — rate limiting
  // above protects against mass unsubscribe abuse without breaking existing email links.
  if (token && process.env.UNSUBSCRIBE_SECRET) {
    if (!verifyUnsubscribeToken(email, siteId, token)) {
      return new Response(unsubscribePage(false, 'Invalid unsubscribe token.'), {
        status: 403,
        headers: { 'Content-Type': 'text/html' },
      });
    }
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('site_id', siteId)
    .eq('email', email);

  if (error) {
    console.error('[unsubscribe] Error:', error);
    return new Response(unsubscribePage(false), { headers: { 'Content-Type': 'text/html' } });
  }

  return new Response(unsubscribePage(true), { headers: { 'Content-Type': 'text/html' } });
}

function unsubscribePage(success: boolean, detail?: string): string {
  const site = getSiteConfig();
  const domain = (site as any).domain || `${(site as any).slug}.vercel.app`;
  const primaryColor = (site as any).theme_config?.primaryColor || '#3B82F6';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${success ? 'Unsubscribed' : 'Error'} — ${site.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f5f7; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .card { background: #fff; border-radius: 12px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  .icon { font-size: 48px; margin-bottom: 20px; }
  h1 { color: #18181b; font-size: 22px; margin-bottom: 12px; }
  p { color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
  a { display: inline-block; background: ${primaryColor}; color: #fff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">${success ? '✓' : '✗'}</div>
  <h1>${success ? 'You\'ve been unsubscribed' : 'Something went wrong'}</h1>
  <p>${success
    ? `You've been removed from the ${site.name} newsletter. You won't receive any more emails from us.`
    : (detail ?? `We couldn't process your unsubscribe request. Please try again or contact us.`)
  }</p>
  <a href="https://${domain}">Back to ${site.name}</a>
</div>
</body>
</html>`;
}
