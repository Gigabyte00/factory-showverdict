import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/site-config';
import { getLeadMagnet } from '@/lib/lead-magnets';
import { LeadMagnetForm } from './LeadMagnetForm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const magnet = getLeadMagnet(slug);
  if (!magnet) return {};
  return {
    title: `Free Download: ${magnet.title}`,
    description: magnet.description,
  };
}

export default async function LeadMagnetPage({ params }: Props) {
  const { slug } = await params;
  const magnet = getLeadMagnet(slug);
  if (!magnet) notFound();

  const site = getSiteConfig();
  const siteId = site.id;

  const bullets = magnet.description
    .split('. ')
    .filter((s) => s.trim().length > 0)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-2xl py-16">
        {/* Icon + badge */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
            {magnet.icon}
          </div>
          <Badge variant="secondary" className="mb-4">
            Free Download
          </Badge>
          <h1 className="text-3xl font-bold md:text-4xl">{magnet.title}</h1>
          {magnet.subline && (
            <p className="mt-2 text-muted-foreground">{magnet.subline}</p>
          )}
        </div>

        {/* Value proposition bullets */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="mb-4 text-muted-foreground">{magnet.description.split('.')[0]}.</p>
            <ul className="space-y-2">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{bullet.replace(/^\.\s*/, '').trim()}{bullet.endsWith('.') ? '' : '.'}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Email capture */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="mb-1 text-xl font-bold">Get instant access</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you the {magnet.downloadLabel} right away.
            </p>
            <LeadMagnetForm slug={slug} siteId={siteId} ctaText={magnet.ctaText} />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This free resource is brought to you by {site.name}. We may earn affiliate commissions on
          products mentioned.
        </p>
      </div>
    </div>
  );
}
