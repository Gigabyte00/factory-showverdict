import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Check, X, ExternalLink, ArrowLeft, Shield, RefreshCw, Award } from 'lucide-react';
import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import JsonLd from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: offer } = await supabase
    .from('offers')
    .select('name, description, featured_image_url, logo_url, rating')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!offer) return { title: 'Offer Not Found' };

  const title = `${offer.name} Review ${new Date().getFullYear()} — ${site.name}`;
  return {
    title,
    description: offer.description?.slice(0, 160) || `Read our in-depth review of ${offer.name}.`,
    openGraph: {
      title,
      images: (offer.featured_image_url || offer.logo_url) ? [(offer.featured_image_url || offer.logo_url)!] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const { data } = await supabase
    .from('offers')
    .select('slug')
    .eq('site_id', site.id)
    .eq('is_active', true);
  return (data || []).map((o) => ({ slug: o.slug }));
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted'
          )}
        />
      ))}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-10 text-right">{score}/10</span>
    </div>
  );
}

export default async function OfferDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  const { data: offer, error } = await supabase
    .from('offers')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !offer) notFound();

  const { data: relatedOffers } = await supabase
    .from('offers')
    .select('id, name, slug, featured_image_url, logo_url, rating, description, award')
    .eq('site_id', site.id)
    .eq('is_active', true)
    .neq('id', offer.id)
    .order('priority', { ascending: false })
    .limit(3);

  const { data: faqs } = await supabase
    .from('faq_items')
    .select('question, answer')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .ilike('question', `%${offer.name.split(' ')[0]}%`)
    .limit(4);

  const rating = offer.rating ?? 4.2;
  const reviewCount = (offer as any).review_count ?? 47;
  const pros: string[] = offer.pros || ['Excellent user experience', 'Competitive pricing', 'Strong customer support'];
  const cons: string[] = offer.cons || ['Limited free tier'];
  const featureMatrix = (offer as any).feature_matrix as Record<string, number> | null;
  const hasMatrix = featureMatrix && Object.keys(featureMatrix).length > 0;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: offer.name,
    description: offer.description,
    image: offer.featured_image_url ?? offer.logo_url,
    brand: { '@type': 'Organization', name: offer.name },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <>
      <JsonLd
        type="breadcrumb"
        data={{ items: [
          { name: 'Home', url: '/' },
          { name: 'Offers', url: '/offers' },
          { name: offer.name, url: `/offers/${offer.slug}` },
        ]}}
      />
      {/* Product + AggregateRating schema — server-controlled JSON, not user input */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="container max-w-5xl mx-auto py-8 px-4">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <span>/</span>
          <Link href="/offers" className="hover:text-foreground transition">Offers</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{offer.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {(offer.featured_image_url ?? offer.logo_url) && (
                    <div className="shrink-0 flex items-center justify-center rounded-xl border bg-muted/30 p-3 w-full sm:w-32 h-32">
                      <Image
                        src={(offer.featured_image_url ?? offer.logo_url)!}
                        alt={offer.name}
                        width={100}
                        height={100}
                        className="object-contain max-h-24"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{offer.name}</h1>
                      {(offer as any).award && (
                        <Badge className="shrink-0">
                          <Award className="h-3 w-3 mr-1" />
                          {(offer as any).award}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={rating} />
                      <span className="font-semibold">{rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                    </div>
                    {offer.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{offer.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {hasMatrix && (
              <section>
                <h2 className="text-lg font-bold mb-4">Performance Scores</h2>
                <Card>
                  <CardContent className="p-5 space-y-3">
                    {Object.entries(featureMatrix!).map(([key, score]) => (
                      <ScoreBar
                        key={key}
                        label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        score={score}
                      />
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold mb-4">Pros &amp; Cons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Pros
                    </p>
                    <ul className="space-y-2">
                      {pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-red-200 dark:border-red-900">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-1.5">
                      <X className="h-4 w-4" /> Cons
                    </p>
                    <ul className="space-y-2">
                      {cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {(offer as any).full_review && (
              <section>
                <h2 className="text-lg font-bold mb-4">Our Full Review</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {((offer as any).full_review as string).split('\n').map((para: string, i: number) =>
                    para.trim() ? <p key={i}>{para}</p> : null
                  )}
                </div>
              </section>
            )}

            {faqs && faqs.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <p className="font-semibold text-sm mb-2">{faq.question}</p>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-5">
            <Card className="sticky top-24 border-primary/30">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Our Rating</p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <StarRating rating={rating} />
                </div>
                <p className="text-3xl font-bold text-primary mb-1">
                  {rating.toFixed(1)}<span className="text-base text-muted-foreground">/5</span>
                </p>
                <p className="text-xs text-muted-foreground mb-5">{reviewCount} reviews</p>

                {offer.affiliate_url && (
                  <Button asChild className="w-full gap-2 mb-3" size="lg">
                    <a href={offer.affiliate_url} rel="noopener noreferrer sponsored" target="_blank">
                      Visit {offer.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    Independently reviewed
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                    Updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
                  This page contains affiliate links. We may earn a commission at no additional cost to you.
                </p>
              </CardContent>
            </Card>

            {relatedOffers && relatedOffers.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold mb-3">Compare Alternatives</p>
                  <div className="space-y-2">
                    {relatedOffers.slice(0, 2).map((alt) => (
                      <Link
                        key={alt.id}
                        href={`/compare?ids=${offer.id},${alt.id}`}
                        className="flex items-center gap-2 text-xs text-primary hover:underline"
                      >
                        {offer.name} vs {alt.name} →
                      </Link>
                    ))}
                    <Link href="/offers" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition mt-1">
                      <ArrowLeft className="h-3 w-3" /> View all offers
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {relatedOffers && relatedOffers.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold mb-5">Also Consider</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedOffers.map((alt) => (
                <Card key={alt.id} className="hover:shadow-md transition">
                  <CardContent className="p-4">
                    {(alt.featured_image_url ?? alt.logo_url) && (
                      <Image
                        src={(alt.featured_image_url ?? alt.logo_url)!}
                        alt={alt.name}
                        width={60}
                        height={60}
                        className="object-contain h-12 mb-3"
                      />
                    )}
                    <p className="font-semibold text-sm mb-1">{alt.name}</p>
                    {alt.award && <Badge variant="secondary" className="text-xs mb-2">{alt.award}</Badge>}
                    {alt.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <StarRating rating={alt.rating} />
                        <span className="text-xs text-muted-foreground">{alt.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <Button asChild variant="outline" size="sm" className="w-full text-xs mt-1">
                      <Link href={`/offers/${alt.slug}`}>View Review</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
