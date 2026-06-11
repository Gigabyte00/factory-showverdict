import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSiteConfig } from '@/lib/site-config';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const leadsSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  source_url: z.string().optional(),
  site_id: z.string().optional(), // accepted but server derives the authoritative value
  website: z.string().optional(), // honeypot
});

export async function POST(request: Request) {
  try {
    // Same rate limit as /api/newsletter: 3 requests per 15 minutes per IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() || 'unknown';
    const { allowed } = rateLimit(ip, 3, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await request.json();
    const data = leadsSchema.parse(body);

    // Honeypot: bots fill this field, humans don't
    if (data.website) {
      return NextResponse.json({ success: true });
    }

    const site = getSiteConfig();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('leads').insert({
      site_id: site.id,
      email: data.email,
      name: data.name || null,
      metadata: data.metadata || null,
      source_url: data.source_url || null,
      status: 'new',
    });

    if (error) {
      // Table may not exist on all sites — degrade gracefully
      console.error('[leads] insert error:', error.message);
      if (error.code === '42P01') {
        // Table doesn't exist — not a hard failure
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: 'Failed to save lead' }, { status: 500 });
    }

    // Leads should nurture too: mirror /api/newsletter by upserting into
    // newsletter_subscribers (source 'lead_form') so the drip processor can
    // find them, then enrolling new subscribers in the active sequence.
    try {
      const { data: subRows } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          {
            site_id: site.id,
            email: data.email,
            name: data.name || null,
            source: 'lead_form',
            metadata: {},
          },
          { onConflict: 'site_id,email', ignoreDuplicates: true }
        )
        .select('id');

      if (subRows && subRows.length > 0) {
        const subscriberId = subRows[0].id;
        // Fire-and-forget — never block the response
        void (async () => {
          try {
            const { data: seq } = await supabase
              .from('email_sequences')
              .select('id')
              .eq('site_id', site.id)
              .eq('status', 'active')
              .eq('trigger_event', 'newsletter_signup')
              .limit(1)
              .single();
            if (seq) {
              await supabase
                .from('subscriber_sequence_state')
                .insert({ subscriber_id: subscriberId, sequence_id: seq.id, current_step: 0, status: 'active' });
            }
          } catch (err) {
            console.error('[leads] sequence enrollment error:', err);
          }
        })();
      }
    } catch (err) {
      // Nurture wiring must never fail the lead capture
      console.error('[leads] sequence enrollment error:', err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
