// Resend email client — fire-and-forget pattern
// Email failures never block API responses or cause user-facing errors

import { Resend } from 'resend';
import { getSiteConfig } from './site-config';
import { buildNewsletterWelcomeHtml, buildDripEmail2Html, buildDripEmail3Html } from './email-templates';

function getFromEmail(): string {
  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderEmail) return 'onboarding@resend.dev';
  // If already formatted as "Name <email>", use as-is
  if (senderEmail.includes('<')) return senderEmail;
  // Otherwise wrap with site name so subscribers see a branded sender
  const site = getSiteConfig();
  return `${site.name} Newsletter <${senderEmail}>`;
}

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log('[email] RESEND_API_KEY not configured — emails disabled');
    return null;
  }
  resend = new Resend(key);
  return resend;
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const client = getResend();
  if (!client) return;

  try {
    const { error } = await client.emails.send({
      from: getFromEmail(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error('[email] Send failed:', error);
    }
  } catch (err) {
    console.error('[email] Unexpected error:', err);
  }
}

export function sendNewsletterWelcome(email: string, name?: string): void {
  const site = getSiteConfig();
  sendEmail({
    to: email,
    subject: `Welcome to ${site.name}`,
    html: buildNewsletterWelcomeHtml(email, name),
  });
}

const DRIP_SUBJECTS: Record<number, (siteName: string, niche: string) => string> = {
  1: (name, niche) => `Top picks in ${niche} — ${name}`,
  2: (name, niche) => `Expert ${niche} tips — ${name}`,
};

export async function sendDripEmail(email: string, step: number): Promise<boolean> {
  const dripHtml: Record<number, (email: string) => string> = {
    1: buildDripEmail2Html,
    2: buildDripEmail3Html,
  };

  const htmlFn = dripHtml[step];
  if (!htmlFn) return false;

  const client = getResend();
  if (!client) return false;

  const site = getSiteConfig();
  const niche = site.niche || 'products';
  const subjectFn = DRIP_SUBJECTS[step];
  const subject = subjectFn ? subjectFn(site.name, niche) : `Update from ${site.name}`;

  try {
    const { error } = await client.emails.send({
      from: getFromEmail(),
      to: email,
      subject,
      html: htmlFn(email),
    });
    if (error) {
      console.error(`[email] Drip step ${step} failed:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] Drip step ${step} error:`, err);
    return false;
  }
}
