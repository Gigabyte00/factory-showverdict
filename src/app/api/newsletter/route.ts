import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';
import { sendNewsletterWelcome } from '@/lib/email';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  site_id: z.string().optional(), // accepted but ignored — server derives it
  website: z.string().optional(), // honeypot — bots fill this, humans don't
});

export async function POST(request: Request) {
  try {
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
    const data = subscribeSchema.parse(body);

    // Honeypot triggered — silent success
    if (data.website) {
      return NextResponse.json({ success: true });
    }

    const site = getSiteConfig();
    const supabase = createServerClient();

    const { data: rows, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          site_id: site.id,
          email: data.email,
          name: data.name || null,
          source: data.source || null,
          metadata: data.metadata || {},
        },
        { onConflict: 'site_id,email', ignoreDuplicates: true }
      )
      .select('id');

    if (error) {
      console.error('Newsletter subscribe error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Only send welcome email for genuinely new subscribers
    if (rows && rows.length > 0) {
      sendNewsletterWelcome(data.email, data.name || undefined);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
