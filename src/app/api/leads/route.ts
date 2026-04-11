import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSiteConfig } from '@/lib/site-config';
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

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
