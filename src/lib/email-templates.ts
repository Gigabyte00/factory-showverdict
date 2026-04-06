// Generic branded HTML email templates for Factory sites
// Reads site name, domain, niche, and primary color from getSiteConfig()

import { getSiteConfig } from './site-config';
import { createUnsubscribeToken } from './unsubscribe-token';

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
  const id = (site as any).id as string;
  return { name, domain, niche, primaryColor, id };
}

function buildUnsubscribeUrl(domain: string, email: string, siteId: string): string {
  const token = createUnsubscribeToken(email, siteId);
  const params = new URLSearchParams({ email });
  if (token) params.set('token', token);
  return `https://${domain}/api/unsubscribe?${params.toString()}`;
}

function layout(title: string, body: string): string {
  const { name, domain, primaryColor } = getSiteInfo();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<!-- Header -->
<tr><td style="background:#18181b;padding:20px 32px;border-radius:8px 8px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td><h1 style="margin:0;color:${primaryColor};font-size:20px;font-weight:700">${escapeHtml(name)}</h1></td>
<td align="right"><p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Newsletter</p></td>
</tr>
</table>
</td></tr>
<!-- Body -->
<tr><td style="background:#ffffff;padding:32px;border-radius:0 0 8px 8px">
${body}
</td></tr>
<!-- Footer -->
<tr><td style="padding:20px 32px;text-align:center">
<p style="margin:0 0 6px;color:#6b7280;font-size:12px">&copy; ${new Date().getFullYear()} ${escapeHtml(name)}. All rights reserved.</p>
<p style="margin:0;color:#9ca3af;font-size:12px">
<a href="https://${domain}/privacy" style="color:#9ca3af;text-decoration:none">Privacy Policy</a>
&nbsp;&middot;&nbsp;
<a href="https://${domain}/terms" style="color:#9ca3af;text-decoration:none">Terms</a>
&nbsp;&middot;&nbsp;
<a href="https://${domain}/unsubscribe" style="color:#9ca3af;text-decoration:none">Unsubscribe</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Newsletter Welcome (instant on signup) ─────────────────────────────────

export function buildNewsletterWelcomeHtml(email: string, name?: string): string {
  const { name: siteName, domain, niche, primaryColor, id: siteId } = getSiteInfo();
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';

  return layout(`Welcome to ${siteName}!`, `
<h2 style="margin:0 0 4px;color:#18181b;font-size:24px;font-weight:700">You're in. Welcome!</h2>
<p style="margin:0 0 24px;color:#6b7280;font-size:13px">${escapeHtml(siteName)} &mdash; The ${escapeHtml(niche)} insider</p>

<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7">
${greeting} Thanks for joining. ${escapeHtml(siteName)} is where thousands of readers come for honest, research-backed coverage of ${escapeHtml(niche)}. No fluff, no paid rankings &mdash; just the straight facts.
</p>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;border-radius:8px;overflow:hidden">
<tr>
<td width="33%" style="background:#f9fafb;padding:16px;text-align:center;border-right:1px solid #e5e7eb">
<p style="margin:0 0 4px;color:${primaryColor};font-size:22px;font-weight:700">10K+</p>
<p style="margin:0;color:#6b7280;font-size:12px">Readers</p>
</td>
<td width="33%" style="background:#f9fafb;padding:16px;text-align:center;border-right:1px solid #e5e7eb">
<p style="margin:0 0 4px;color:${primaryColor};font-size:22px;font-weight:700">100+</p>
<p style="margin:0;color:#6b7280;font-size:12px">Reviews</p>
</td>
<td width="33%" style="background:#f9fafb;padding:16px;text-align:center">
<p style="margin:0 0 4px;color:${primaryColor};font-size:22px;font-weight:700">Free</p>
<p style="margin:0;color:#6b7280;font-size:12px">Always</p>
</td>
</tr>
</table>

<h3 style="margin:0 0 12px;color:#18181b;font-size:15px;font-weight:600">What to expect from us:</h3>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px">
<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
<table cellpadding="0" cellspacing="0"><tr>
<td style="width:28px;color:${primaryColor};font-size:18px;vertical-align:top">&#9654;</td>
<td style="color:#374151;font-size:14px;line-height:1.6"><strong>Honest ${escapeHtml(niche)} reviews</strong> &mdash; we test everything ourselves and never accept payment for rankings</td>
</tr></table>
</td></tr>
<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
<table cellpadding="0" cellspacing="0"><tr>
<td style="width:28px;color:${primaryColor};font-size:18px;vertical-align:top">&#9654;</td>
<td style="color:#374151;font-size:14px;line-height:1.6"><strong>Best deals &amp; offers</strong> &mdash; curated affiliate deals that we personally vet before recommending</td>
</tr></table>
</td></tr>
<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
<table cellpadding="0" cellspacing="0"><tr>
<td style="width:28px;color:${primaryColor};font-size:18px;vertical-align:top">&#9654;</td>
<td style="color:#374151;font-size:14px;line-height:1.6"><strong>Insider tips</strong> &mdash; the things experts know about ${escapeHtml(niche)} that most guides skip</td>
</tr></table>
</td></tr>
<tr><td style="padding:10px 0">
<table cellpadding="0" cellspacing="0"><tr>
<td style="width:28px;color:${primaryColor};font-size:18px;vertical-align:top">&#9654;</td>
<td style="color:#374151;font-size:14px;line-height:1.6"><strong>Weekly updates</strong> &mdash; what changed, what's new, what to watch in ${escapeHtml(niche)}</td>
</tr></table>
</td></tr>
</table>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
<tr>
<td style="background:${primaryColor};border-radius:6px;padding:13px 26px">
<a href="https://${domain}/blog" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600">Start Reading &rarr;</a>
</td>
<td style="padding-left:16px">
<a href="https://${domain}/offers" style="color:${primaryColor};text-decoration:none;font-size:14px;font-weight:500">View Top Deals</a>
</td>
</tr>
</table>

<div style="padding:14px 16px;background:#f9fafb;border-radius:6px;margin:0 0 20px">
<p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6">
<strong style="color:#374151">Coming tomorrow:</strong> Your first guide from ${escapeHtml(siteName)} lands in your inbox &mdash; keep an eye out.
</p>
</div>

<p style="margin:0 0 4px;color:#374151;font-size:14px">Welcome to the community,</p>
<p style="margin:0 0 20px;color:#374151;font-size:14px;font-weight:600">The ${escapeHtml(siteName)} Team</p>

<p style="margin:0;color:#d1d5db;font-size:12px;border-top:1px solid #f3f4f6;padding-top:16px">
You're receiving this because ${escapeHtml(email)} subscribed at ${escapeHtml(domain)}.
<a href="${buildUnsubscribeUrl(domain, email, siteId)}" style="color:#d1d5db">Unsubscribe</a>.
</p>
`);
}

// ─── Sequence Step (DB-driven drip) ────────────────────────────────────────

/**
 * Wraps a body_template from email_sequence_steps in the branded layout.
 * Substitutes {{site_url}}, {{site_name}}, {{email}}, and {{primary_color}}.
 */
export function buildSequenceStepHtml(
  subject: string,
  bodyTemplate: string,
  vars: { site_url: string; site_name: string; email: string; primary_color: string }
): string {
  const body = bodyTemplate
    .replace(/\{\{site_url\}\}/g, vars.site_url)
    .replace(/\{\{site_name\}\}/g, escapeHtml(vars.site_name))
    .replace(/\{\{email\}\}/g, escapeHtml(vars.email))
    .replace(/\{\{primary_color\}\}/g, vars.primary_color);
  return layout(subject, body);
}

// ─── Legacy Drip Emails (kept for backward compatibility) ───────────────────

export function buildDripEmail2Html(email: string): string {
  const { name: siteName, domain, niche, primaryColor, id: siteId } = getSiteInfo();
  return layout(`Top Picks in ${niche}`, `
<h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Our Top Picks in ${escapeHtml(niche)}</h2>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
We've done the research so you don't have to. Here are our most popular reviews and comparisons that readers keep coming back to.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
<tr>
<td style="background:${primaryColor};border-radius:6px;padding:12px 24px">
<a href="https://${domain}/offers" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600">Check Current Deals</a>
</td>
</tr>
</table>
<p style="margin:0;color:#6b7280;font-size:13px">
You're receiving this because ${escapeHtml(email)} is subscribed to ${escapeHtml(siteName)}. <a href="${buildUnsubscribeUrl(domain, email, siteId)}" style="color:#6b7280">Unsubscribe</a>.
</p>
`);
}

export function buildDripEmail3Html(email: string): string {
  const { name: siteName, domain, niche, primaryColor, id: siteId } = getSiteInfo();
  return layout(`Expert Tips for ${niche}`, `
<h2 style="margin:0 0 16px;color:#18181b;font-size:20px">Expert Tips for Smarter ${escapeHtml(niche)} Decisions</h2>
<p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
After a week with ${escapeHtml(siteName)}, here are three insider tips our readers find most valuable:
</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
<tr>
<td style="background:${primaryColor};border-radius:6px;padding:12px 24px">
<a href="https://${domain}/blog" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600">Browse Expert Guides</a>
</td>
</tr>
</table>
<p style="margin:0;color:#6b7280;font-size:13px">
You're receiving this because ${escapeHtml(email)} is subscribed to ${escapeHtml(siteName)}. <a href="${buildUnsubscribeUrl(domain, email, siteId)}" style="color:#6b7280">Unsubscribe</a>.
</p>
`);
}
