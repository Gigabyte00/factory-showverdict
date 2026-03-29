/**
 * Review Article - Post Detail Template
 *
 * Product review layout with ratings, pros/cons, and verdict.
 * Best for: Product reviews, comparative reviews
 */

import type { PostDetailTemplateProps } from '@/lib/templates/config';
import JsonLd from '@/components/JsonLd';
import type { FAQData } from '@/components/JsonLd';
import JsonLdTyped from '@/components/JsonLd';
import { Prose, Callout, LastUpdated, ProductCallout } from '@/components/content';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronRight,
  Star,
  CheckCircle2,
  XCircle,
  Award,
  ExternalLink,
} from 'lucide-react';

export default function ReviewArticle({
  post,
  category,
  relatedPosts = [],
  faqs = [],
  site,
  theme,
  copy,
  showTOC = false,
  showRelatedPosts = true,
}: PostDetailTemplateProps) {
  // Extract review data from post metadata
  const reviewData = post.metadata?.review || {
    rating: 0,
    maxRating: 5,
    pros: [],
    cons: [],
    verdict: '',
    productName: post.title,
    price: '',
    affiliateUrl: '',
    specs: {},
  };
  const rating = reviewData.rating || 0;
  const maxRating = reviewData.maxRating || 5;
  const pros = reviewData.pros || [];
  const cons = reviewData.cons || [];
  const verdict = reviewData.verdict || '';
  const productName = reviewData.productName || post.title;
  const productPrice = reviewData.price || '';
  const affiliateUrl = reviewData.affiliateUrl || '';

  // Structured data for Product Review
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: productName,
      image: post.featured_image_url || undefined,
      offers: productPrice
        ? {
            '@type': 'Offer',
            price: productPrice,
            priceCurrency: 'USD',
          }
        : undefined,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating,
      bestRating: maxRating,
    },
    author: {
      '@type': 'Person',
      name: post.author_name || site.name,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.domain,
    },
    datePublished: post.published_at,
    reviewBody: post.excerpt || undefined,
  };

  // Render star rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-6 w-6 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd data={structuredData} />

      <div className="container max-w-4xl mx-auto py-8">
          <article>
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground transition">
                Home
              </Link>
              <ChevronRight className="mx-1 h-4 w-4" />
              <Link href="/blog" className="hover:text-foreground transition">
                Blog
              </Link>
              {category && (
                <>
                  <ChevronRight className="mx-1 h-4 w-4" />
                  <Link
                    href={`/${category.slug}`}
                    className="hover:text-foreground transition"
                  >
                    {category.name}
                  </Link>
                </>
              )}
            </nav>

            {/* Article Card */}
            <Card className="overflow-hidden">
              {/* Featured Image */}
              {post.featured_image_url && (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="h-64 w-full object-cover md:h-96"
                />
              )}

              <CardContent className="p-6 md:p-8">
                {/* Category Badge */}
                {category && (
                  <Link href={`/${category.slug}`}>
                    <Badge
                      variant="outline"
                      className="mb-3 hover:bg-primary hover:text-primary-foreground transition"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                )}

                {/* Title */}
                <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="mb-6 flex flex-wrap items-center gap-4 border-b pb-6 text-sm text-muted-foreground">
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {post.reading_time_minutes && (
                    <span>{post.reading_time_minutes} min read</span>
                  )}
                  {post.author_name && <span>By {post.author_name}</span>}
                </div>

                {/* Last Updated */}
                {post.updated_at && (
                  <LastUpdated
                    date={post.updated_at}
                    publishedDate={post.published_at}
                    showRelative
                    className="mb-6"
                  />
                )}

                {/* Rating Card */}
                <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-1">
                          {renderStars()}
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {rating.toFixed(1)} / {maxRating}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Overall Rating
                        </p>
                      </div>
                      {affiliateUrl && (
                        <Button asChild size="lg">
                          <Link
                            href={affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Check Price
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Callout - Above the fold */}
                {productName && affiliateUrl && (
                  <ProductCallout
                    name={productName}
                    description={post.excerpt || undefined}
                    image={post.featured_image_url || undefined}
                    rating={rating || undefined}
                    price={productPrice || undefined}
                    highlights={pros.slice(0, 3)}
                    href={affiliateUrl}
                    badge={reviewData.badge || "Editor's Pick"}
                    ctaText="Check Price"
                  />
                )}

                {/* Excerpt */}
                {post.excerpt && !affiliateUrl && (
                  <p className="mb-6 text-lg font-medium italic text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}

                {/* Pros and Cons */}
                {(pros.length > 0 || cons.length > 0) && (
                  <div className="mb-8 grid gap-4 md:grid-cols-2">
                    {/* Pros */}
                    {pros.length > 0 && (
                      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
                        <CardContent className="p-6">
                          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-5 w-5" />
                            Pros
                          </h3>
                          <ul className="space-y-2">
                            {pros.map((pro: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" />
                                <span className="text-foreground">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cons */}
                    {cons.length > 0 && (
                      <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
                        <CardContent className="p-6">
                          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-700 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            Cons
                          </h3>
                          <ul className="space-y-2">
                            {cons.map((con: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-500" />
                                <span className="text-foreground">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Content */}
                <Prose>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children, ...props }) => {
                        if (href?.startsWith('/go/')) {
                          const sep = href.includes('?') ? '&' : '?';
                          const utmHref = `${href}${sep}utm_source=blog&utm_medium=affiliate&utm_campaign=${post.slug}`;
                          return (
                            <a href={utmHref} target="_blank" rel="noopener noreferrer sponsored" {...props}>
                              {children}
                            </a>
                          );
                        }
                        return <a href={href} {...props}>{children}</a>;
                      },
                    }}
                  >
                    {post.content || ''}
                  </ReactMarkdown>
                </Prose>

                {/* FAQ Section with Schema */}
                {faqs && faqs.length > 0 && (
                  <>
                    <JsonLdTyped type="faq" data={{ faqs } as FAQData} />
                    <div className="mt-10 border-t pt-8">
                      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                      <dl className="space-y-6">
                        {faqs.map((faq, i) => (
                          <div key={i}>
                            <dt className="text-lg font-semibold mb-2">{faq.question}</dt>
                            <dd className="text-muted-foreground leading-relaxed">{faq.answer}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </>
                )}

                {/* Verdict */}
                {verdict && (
                  <Callout
                    variant="info"
                    title="Our Verdict"
                    className="mt-8"
                  >
                    {verdict}
                  </Callout>
                )}

                {/* FTC Disclosure */}
                <Callout
                  variant="warning"
                  title="Affiliate Disclosure"
                  className="mt-8"
                >
                  This article may contain affiliate links. If you make a
                  purchase through these links, we may earn a commission at no
                  additional cost to you.
                </Callout>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Share */}
                <div className="mt-8 pt-6 border-t">
                  <ShareButtons
                    url={`${site.domain ? `https://${site.domain}` : ''}/blog/${post.slug}`}
                    title={post.title}
                  />
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Newsletter CTA */}
          <Card className="mt-8 border-primary/10 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Stay Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Get the latest {site.niche} reviews and deals delivered to your inbox.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/blog">Browse All Reviews</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {showRelatedPosts && relatedPosts.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-6 text-2xl font-bold">More Reviews</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group"
                    aria-label={relatedPost.title}
                  >
                    <Card className="overflow-hidden h-full transition hover:border-primary/30">
                      {relatedPost.featured_image_url ? (
                        <img
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center bg-muted">
                          <span className="text-3xl text-muted-foreground">📝</span>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="line-clamp-2 font-semibold transition group-hover:text-primary">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.published_at && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {new Date(relatedPost.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}
