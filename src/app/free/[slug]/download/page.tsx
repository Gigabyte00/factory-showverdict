import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';
import { getLeadMagnet, getLeadMagnetDownloadUrl } from '@/lib/lead-magnets';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Mail, CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: 'Your download is ready' };

export default async function LeadMagnetDownloadPage({ params }: Props) {
  const { slug } = await params;
  const magnet = getLeadMagnet(slug);
  if (!magnet) notFound();

  const site = getSiteConfig();
  const downloadUrl = getLeadMagnetDownloadUrl(slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500/5 to-background">
      <div className="container max-w-lg py-16 text-center">
        {/* Success icon */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>

        <h1 className="mb-2 text-3xl font-bold">You&apos;re all set!</h1>
        <p className="mb-8 text-muted-foreground">
          Welcome to the {site.name} newsletter. Your free resource is ready below.
        </p>

        <Card className="mb-8 border-primary/20">
          <CardContent className="p-8">
            <div className="mb-4 text-4xl">{magnet.icon}</div>
            <h2 className="mb-2 text-xl font-bold">{magnet.title}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{magnet.downloadLabel}</p>

            {downloadUrl ? (
              <Button asChild size="lg" className="w-full">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-5 w-5" />
                  Download Now
                </a>
              </Button>
            ) : (
              <div className="rounded-lg border border-dashed border-primary/30 p-5">
                <Mail className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="text-sm font-medium">Check your inbox</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ve sent {magnet.downloadLabel} to your email address.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>While you&apos;re here — check out our latest articles:</p>
          <Button asChild variant="outline">
            <Link href="/blog">Browse the Blog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
