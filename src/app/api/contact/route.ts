import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createServerClient } from '@/lib/supabase';
import { getSiteConfig } from '@/lib/site-config';

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0].trim() || 'unknown';
    const { allowed } = rateLimit(ip, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, website } = body || {};

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length < 5) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ success: false, error: 'Message must be at least 10 characters' }, { status: 400 });
    }

    const site = getSiteConfig();
    const supabase = createServerClient();

    const { error } = await supabase.from('contact_submissions').insert({
      site_id: site.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: null,
      message: `[${subject || 'general'}] ${message.trim()}`,
    });

    if (error) {
      console.error('Contact submission error:', error);
      return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact route error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
