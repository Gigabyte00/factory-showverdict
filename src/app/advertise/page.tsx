import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import { ChevronRight, Users, BookOpen, TrendingUp, Mail, Star, Megaphone } from 'lucide-react';

export const revalidate = 86400;

export async function generateMetadata() {
  const site = getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    title: `Advertise with ${site.name} | Sponsorship & Partnerships`,
    description: `Reach an engaged ${(site.niche ?? 'niche').toLowerCase()} audience. Explore newsletter sponsorships, sponsored content, and partnership opportunities with ${site.name}.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/advertise` } : undefined,
  };
}

export default async function AdvertisePage() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const [
    { count: postCount },
    { count: subscriberCount },
    { count: offerCount },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true })
      .eq('site_id', site.id).eq('status', 'published'),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true })
      .eq('site_id', site.id).eq('status', 'active'),
    supabase.from('offers').select('*', { count: 'exact', head: true })
      .eq('site_id', site.id).eq('is_active', true),
  ]);

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Advertise', url: `${baseUrl}/advertise` },
  ];

  const niche = site.niche ?? 'products';
  const displaySubscribers = subscriberCount && subscriberCount >= 100
    ? subscriberCount >= 1000
      ? `${(subscriberCount / 1000).toFixed(1)}K+`
      : `${subscriberCount}+`
    : '500+';

  const packages = [
    {
      name: 'Newsletter Sponsorship',
      icon: Mail,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: `Dedicated mention in our ${niche.toLowerCase()} newsletter. Sent to ${displaySubscribers} active subscribers who opted in for expert recommendations.`,
      includes: [
        'Logo + 2-3 sentence intro copy',
        'Direct link to your landing page',
        'Plain-text + HTML versions',
        'Delivered in next available send',
      ],
      cta: 'Inquire About Newsletters',
    },
    {
      name: 'Sponsored Content',
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/5',
      description: `Full editorial article about your product or brand, written by our team in our editorial voice with a clear "Sponsored" disclosure per FTC guidelines.`,
      includes: [
        '800-1,200 word article',
        'Published on blog + promoted in newsletter',
        'Social share across our channels',
        'Permanent placement with do-follow link',
      ],
      badge: 'Most Popular',
      cta: 'Inquire About Sponsored Posts',
    },
    {
      name: 'Product Review Placement',
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description: `Get your product reviewed and listed in our ${niche.toLowerCase()} comparison guides. Reach high-intent readers actively researching purchases.`,
      includes: [
        'Honest editorial review (ratings stay independent)',
        'Listed in relevant comparison pages',
        'Featured in category buyer guide',
        'Tracked affiliate link setup',
      ],
      cta: 'Submit a Product',
    },
  ];

  // JSON.stringify produces valid safely-escaped JSON — no XSS risk
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Advertise with ${site.name}`,
    description: `Sponsorship and advertising opportunities on ${site.name}`,
    url: `${baseUrl}/advertise`,
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      url: baseUrl,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'advertising',
        email: `advertising@${site.domain}`,
      },
    },
  });

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      {/* JSON.stringify output is always valid JSON — safe for dangerouslySetInnerHTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />

      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b">
        <div className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
          <nav className="flex items-center text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-foreground">Advertise</span>
          </nav>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Reach {displaySubscribers} Engaged {niche} Readers
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Partner with {site.name} to get your brand in front of a highly-targeted audience
                actively researching {niche.toLowerCase()} purchases and decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-muted/30 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Users, label: 'Newsletter Subscribers', value: displaySubscribers, sub: 'opt-in, engaged audience' },
              { icon: BookOpen, label: 'Published Articles', value: `${postCount ?? 0}+`, sub: `${niche.toLowerCase()} guides & reviews` },
              { icon: TrendingUp, label: 'Products Reviewed', value: `${offerCount ?? 0}+`, sub: 'with affiliate tracking' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border p-5 text-center">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-2 text-center">Partnership Options</h2>
          <p className="text-muted-foreground text-center mb-10">
            All sponsorships include FTC-compliant disclosures. We never alter editorial ratings for sponsors.
          </p>
          <div className="space-y-6">
            {packages.map((pkg) => (
              <div key={pkg.name} className="relative bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
                {pkg.badge && (
                  <span className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {pkg.badge}
                  </span>
                )}
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${pkg.bg} shrink-0`}>
                    <pkg.icon className={`h-5 w-5 ${pkg.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                    <ul className="space-y-1.5 mb-5">
                      {pkg.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">&#10003;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`mailto:advertising@${site.domain}?subject=${encodeURIComponent(pkg.name + ' Inquiry')}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {pkg.cta}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-muted/20 border-t">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-lg font-bold mb-2">Our Editorial Policy</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Sponsorships never influence our ratings, editorial content, or product recommendations.
            All sponsored content is clearly labeled. We only partner with brands that are relevant and
            valuable to our {niche.toLowerCase()} audience.
          </p>
          <div className="mt-6">
            <a
              href={`mailto:advertising@${site.domain}?subject=${encodeURIComponent('Partnership Inquiry — ' + site.name)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              <Mail className="h-4 w-4" />
              Get in Touch
            </a>
            <p className="text-xs text-muted-foreground mt-3">We typically respond within 2 business days.</p>
          </div>
        </div>
      </section>
    </>
  );
}
