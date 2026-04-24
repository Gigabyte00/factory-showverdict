// Generic branded HTML email templates for Factory sites
// Reads site name, domain, niche, and primary color from getSiteConfig()

import { getSiteConfig } from './site-config';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSiteInfo() {
  const site = getSiteConfig();
  const name = site.name;
  const domain = site.domain || `${site.slug}.vercel.app`;
  const niche = site.niche || 'products';
  const primaryColor = site.theme_config?.primaryColor || '#3B82F6';
  const logoUrl = process.env.SITE_EMAIL_LOGO_URL?.trim() || undefined;
  return { name, domain, niche, primaryColor, logoUrl };
}

type EmailKind = 'welcome' | 'drip' | 'receipt' | 'transactional';

/**
 * Per-email-kind header treatment. Keeps a consistent shell but lets transactional
 * mail (receipts, auth) render as brand-neutral and drip content read as editorial.
 */
function headerBlock(kind: EmailKind): string {
  const { name, primaryColor, logoUrl } = getSiteInfo();
  const bg =
    kind === 'welcome' ? primaryColor :
    kind === 'receipt' ? '#ffffff' :
    kind === 'transactional' ? '#ffffff' :
    '#18181b';  // drip (and unspecified) — editorial dark
  const textColor =
    kind === 'welcome' ? '#ffffff' :
    kind === 'receipt' ? '#18181b' :
    kind === 'transactional' ? '#18181b' :
    primaryColor;
  const border = (kind === 'receipt' || kind === 'transactional')
    ? `border-bottom:1px solid #e5e7eb;`
    : '';
  const logoImg = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)}" height="28" style="display:block;height:28px;width:auto;border:0;outline:none;text-decoration:none" />`
    : `<h1 style="margin:0;color:${textColor};font-size:22px;font-weight:700">${escapeHtml(name)}</h1>`;
  return `<tr><td style="background:${bg};padding:24px 32px;border-radius:8px 8px 0 0;${border}">${logoImg}</td></tr>`;
}

function layout(title: string, body: string, kind: EmailKind = 'drip'): string {
  const { name, domain } = getSiteInfo();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
${headerBlock(kind)}
<!-- Body -->
<tr><td style="background:#ffffff;padding:32px;border-radius:0 0 8px 8px">
${body}
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 32px;text-align:center">
<p style="margin:0 0 8px;color:#6b7280;font-size:13px">&copy; ${new Date().getFullYear()} ${escapeHtml(name)}. All rights reserved.</p>
<p style="margin:0;color:#6b7280;font-size:13px">
<a href="https://${domain}/privacy" style="color:#6b7280;text-decoration:underline">Privacy</a> &middot;
<a href="https://${domain}/terms" style="color:#6b7280;text-decoration:underline">Terms</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Newsletter Welcome ─────────────────────────────────────

export function buildNewsletterWelcomeHtml(email: string, name?: string): string {
  const { name: siteName, domain, niche, primaryColor } = getSiteInfo();
  const greeting = name ? `Hey ${escapeHtml(name)},` : 'Welcome,';
  return layout(`Welcome to ${siteName}`, `
<h2 style="margin:0 0 16px;color:#18181b;font-size:20px">${greeting}</h2>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
You're in. Welcome to ${escapeHtml(siteName)} — your source for expert ${escapeHtml(niche)} reviews, comparisons, and the best deals.
</p>

<h3 style="margin:0 0 12px;color:#18181b;font-size:16px">What You'll Get</h3>
<ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:15px;line-height:1.8">
<li>In-depth reviews and buying guides</li>
<li>Expert comparisons and recommendations</li>
<li>Exclusive deals and offers from top brands</li>
</ul>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
<tr>
<td style="background:${primaryColor};border-radius:6px;padding:12px 24px">
<a href="https://${domain}/blog" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600">Browse the Blog</a>
</td>
<td style="padding-left:12px">
<a href="https://${domain}/offers" style="color:${primaryColor};text-decoration:underline;font-size:15px">See Deals</a>
</td>
</tr>
</table>

<p style="margin:0;color:#6b7280;font-size:13px">
You're receiving this because ${escapeHtml(email)} was subscribed to our newsletter. You can unsubscribe at any time.
</p>
`, 'welcome');
}

// ─── Sequence Step (DB-driven drip) ────────────────────────

/**
 * Wraps a body_template from email_sequence_steps in the branded layout.
 * Substitutes {{site_url}}, {{site_name}}, and {{email}} placeholders.
 */
export function buildSequenceStepHtml(
  subject: string,
  bodyTemplate: string,
  vars: { site_url: string; site_name: string; email: string }
): string {
  const body = bodyTemplate
    .replace(/\{\{site_url\}\}/g, vars.site_url)
    .replace(/\{\{site_name\}\}/g, escapeHtml(vars.site_name))
    .replace(/\{\{email\}\}/g, escapeHtml(vars.email));
  return layout(subject, body, 'drip');
}

// ─── Drip Email #2 (Day 3) ──────────────────────────────────

export function buildDripEmail2Html(email: string): string {
  const { name: siteName, domain, niche, primaryColor } = getSiteInfo();
  return layout(`Top Picks in ${niche}`, `
<h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Our Top Picks in ${escapeHtml(niche)}</h2>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
We've done the research so you don't have to. Here are our most popular reviews and comparisons that readers keep coming back to.
</p>

<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
Whether you're just getting started or looking to upgrade, our expert guides break down exactly what matters — features, value, and real-world performance.
</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
<tr>
<td style="background:${primaryColor};border-radius:6px;padding:12px 24px">
<a href="https://${domain}/offers" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600">Check Current Deals</a>
</td>
</tr>
</table>

<p style="margin:0;color:#6b7280;font-size:13px">
You're receiving this because ${escapeHtml(email)} is subscribed to ${escapeHtml(siteName)}. Unsubscribe at any time.
</p>
`, 'drip');
}

// ─── Drip Email #3 (Day 7) ──────────────────────────────────

export function buildDripEmail3Html(email: string): string {
  const { name: siteName, domain, niche, primaryColor } = getSiteInfo();
  return layout(`Expert Tips for ${niche}`, `
<h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Expert Tips for Smarter ${escapeHtml(niche)} Decisions</h2>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
After a week with ${escapeHtml(siteName)}, here are three insider tips our readers find most valuable:
</p>

<h3 style="margin:0 0 8px;color:#18181b;font-size:16px">1. Compare Before You Buy</h3>
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
Our side-by-side comparisons highlight the real differences between products — not just specs, but real-world performance and value.
</p>

<h3 style="margin:0 0 8px;color:#18181b;font-size:16px">2. Watch for Seasonal Deals</h3>
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
The best ${escapeHtml(niche)} deals come around during key sales events. We track prices so you know when you're getting a real discount.
</p>

<h3 style="margin:0 0 8px;color:#18181b;font-size:16px">3. Read the Fine Print</h3>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
Warranties, return policies, and hidden costs matter. Our reviews always cover what others skip.
</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
<tr>
<td style="background:${primaryColor};border-radius:6px;padding:12px 24px">
<a href="https://${domain}/blog" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600">Browse Expert Guides</a>
</td>
</tr>
</table>

<p style="margin:0;color:#6b7280;font-size:13px">
You're receiving this because ${escapeHtml(email)} is subscribed to ${escapeHtml(siteName)}. Unsubscribe at any time.
</p>
`, 'drip');
}
