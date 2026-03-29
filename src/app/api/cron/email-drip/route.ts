import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';
import { sendDripEmail } from '@/lib/email';

// Drip schedule: step 1 = 3 days after subscribe, step 2 = 7 days after subscribe
const DRIP_DELAYS_HOURS: Record<number, number> = {
  1: 72,  // 3 days
  2: 168, // 7 days
};

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[cron/email-drip] CRON_SECRET is not configured');
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const site = getSiteConfig();
  const supabase = createServerClient();
  const now = new Date();
  let sent = 0;
  let errors = 0;

  for (const [stepStr, delayHours] of Object.entries(DRIP_DELAYS_HOURS)) {
    const step = Number(stepStr);
    const prevStep = step - 1;
    const cutoff = new Date(now.getTime() - delayHours * 60 * 60 * 1000);

    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .eq('site_id', site.id)
      .eq('status', 'active')
      .eq('drip_step', prevStep)
      .lt('subscribed_at', cutoff.toISOString())
      .limit(50);

    if (error) {
      console.error(`[drip] Query error for step ${step}:`, error);
      continue;
    }

    for (const sub of subscribers || []) {
      const success = await sendDripEmail(sub.email, step);
      if (success) {
        await supabase
          .from('newsletter_subscribers')
          .update({ drip_step: step, drip_sent_at: now.toISOString() })
          .eq('id', sub.id);
        sent++;
      } else {
        errors++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, errors, site: site.slug });
}
