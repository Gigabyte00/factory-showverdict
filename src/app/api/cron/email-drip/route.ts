import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';
import { sendSequenceStepEmail } from '@/lib/email';

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
  const siteId = (site as any).id as string;
  const supabase = createServerClient();
  const now = new Date();
  let sent = 0;
  let errors = 0;

  // Load the site's active newsletter signup sequence
  const { data: sequence } = await supabase
    .from('email_sequences')
    .select('id')
    .eq('site_id', siteId)
    .eq('trigger_event', 'newsletter_signup')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (!sequence) {
    return NextResponse.json({ ok: true, sent: 0, errors: 0, site: (site as any).slug, note: 'no sequence configured' });
  }

  // Load all steps ordered by step_order
  const { data: steps } = await supabase
    .from('email_sequence_steps')
    .select('step_order, delay_hours, subject, body_template')
    .eq('sequence_id', sequence.id)
    .order('step_order', { ascending: true });

  if (!steps || steps.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, errors: 0, site: (site as any).slug, note: 'no steps in sequence' });
  }

  for (const step of steps) {
    // delay_hours is relative to subscribed_at (absolute schedule, not chained)
    const cutoff = new Date(now.getTime() - step.delay_hours * 60 * 60 * 1000);

    const { data: subscribers, error: qErr } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .eq('drip_step', step.step_order - 1)
      .lt('subscribed_at', cutoff.toISOString())
      .limit(50);

    if (qErr) {
      console.error(`[drip] Query error for step ${step.step_order}:`, qErr);
      continue;
    }

    for (const sub of subscribers || []) {
      const success = await sendSequenceStepEmail(sub.email, step.subject, step.body_template);
      if (success) {
        await supabase
          .from('newsletter_subscribers')
          .update({ drip_step: step.step_order, drip_sent_at: now.toISOString() })
          .eq('id', sub.id);
        sent++;
      } else {
        errors++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, errors, site: (site as any).slug });
}
