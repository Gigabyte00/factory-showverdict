/**
 * Comparison Article - Post Detail Template
 *
 * Side-by-side product comparison with feature matrix.
 * Best for: Comparing multiple products, buying guides
 */

import React from 'react';
import type { PostDetailTemplateProps } from '@/lib/templates/config';
import JsonLd from '@/components/JsonLd';
import type { FAQData } from '@/components/JsonLd';
import JsonLdTyped from '@/components/JsonLd';
import { Prose, Callout, LastUpdated } from '@/components/content';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronRight,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
} from 'lucide-react';

interface ComparisonProduct {
  name: string;
  image?: string;
  rating: number;
  price?: string;
  affiliateUrl?: string;
  features: Record<string, string | boolean>;
  badge?: string; // e.g., "Best Overall", "Budget Pick"
}

export default function ComparisonArticle({
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
  // Extract comparison data from post metadata
  const comparisonData = post.metadata?.comparison || {
    products: [],
    featureCategories: [],
    winner: null,
  };
  const products: ComparisonProduct[] = comparisonData.products || [];
  const featureCategories = comparisonData.featureCategories || [];
  const winner = comparisonData.winner || null;

  // Structured data for Comparison
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.featured_image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Person',
      name: post.author_name || site.name,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          image: product.image || undefined,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            bestRating: 5,
          },
        },
      })),
    },
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      );
    }
    return stars;
  };

  // Render feature value (checkmark, X, or text)
  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="mx-auto h-5 w-5 text-red-600" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd data={structuredData} />

      <div className="container mx-auto py-8">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
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

        {/* Article Header */}
        <article>
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
          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
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

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mb-8 text-xl font-medium text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Winner Callout */}
          {winner && (
            <Callout
              variant="success"
              title="Our Top Pick"
              className="mb-8"
            >
              <strong>{winner.name}</strong> - {winner.reason}
            </Callout>
          )}

          {/* Comparison Table */}
          {products.length > 0 && (
            <Card className="mb-8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-semibold">
                        <span className="sr-only">Product</span>
                      </th>
                      {products.map((product, index) => (
                        <th key={index} className="min-w-[200px] p-4">
                          <div className="flex flex-col items-center gap-3">
                            {/* Badge (Best Overall, etc.) */}
                            {product.badge && (
                              <Badge
                                variant="default"
                                className="bg-primary text-primary-foreground"
                              >
                                {product.badge}
                              </Badge>
                            )}

                            {/* Product Image */}
                            {product.image && (
                              <div className="relative h-24 w-24 rounded overflow-hidden">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </div>
                            )}

                            {/* Product Name */}
                            <div className="text-center">
                              <h3 className="font-bold text-foreground">
                                {product.name}
                              </h3>

                              {/* Rating */}
                              <div className="mt-2 flex items-center justify-center gap-1">
                                {renderStars(product.rating)}
                              </div>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {product.rating.toFixed(1)} / 5
                              </p>

                              {/* Price */}
                              {product.price && (
                                <p className="mt-2 text-lg font-bold text-primary">
                                  {product.price}
                                </p>
                              )}

                              {/* CTA Button */}
                              {product.affiliateUrl && (
                                <Button asChild size="sm" className="mt-3">
                                  <Link
                                    href={product.affiliateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                  >
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    View Deal
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Feature rows grouped by category */}
                    {featureCategories.length > 0 ? (
                      featureCategories.map(
                        (category: any, catIndex: number) => (
                          <React.Fragment key={catIndex}>
                            {/* Category Header */}
                            <tr className="border-b bg-muted/30">
                              <td
                                colSpan={products.length + 1}
                                className="p-3 font-semibold text-sm uppercase tracking-wide text-muted-foreground"
                              >
                                {category.name}
                              </td>
                            </tr>

                            {/* Feature rows */}
                            {category.features.map(
                              (feature: string, featIndex: number) => (
                                <tr
                                  key={`${catIndex}-${featIndex}`}
                                  className="border-b hover:bg-muted/20 transition"
                                >
                                  <td className="p-4 font-medium text-sm text-muted-foreground">
                                    {feature}
                                  </td>
                                  {products.map((product, prodIndex) => (
                                    <td
                                      key={prodIndex}
                                      className="p-4 text-center"
                                    >
                                      {renderFeatureValue(
                                        product.features[feature] || '-'
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </React.Fragment>
                        )
                      )
                    ) : (
                      // Fallback: all features from first product
                      Object.keys(products[0]?.features || {}).map(
                        (feature, index) => (
                          <tr
                            key={index}
                            className="border-b hover:bg-muted/20 transition"
                          >
                            <td className="p-4 font-medium text-sm text-muted-foreground">
                              {feature}
                            </td>
                            {products.map((product, prodIndex) => (
                              <td key={prodIndex} className="p-4 text-center">
                                {renderFeatureValue(
                                  product.features[feature] || '-'
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Article Content */}
          <Prose className="mb-8">
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
              <div className="mt-10 mb-8 border-t pt-8">
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

          {/* FTC Disclosure */}
          <Callout
            variant="warning"
            title="Affiliate Disclosure"
            className="mb-8"
          >
            This article may contain affiliate links. If you make a purchase
            through these links, we may earn a commission at no additional cost
            to you.
          </Callout>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
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
        </article>

        {/* Related Posts */}
        {showRelatedPosts && relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Related Comparisons</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.slice(0, 3).map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <CardContent className="p-4">
                      {relatedPost.featured_image_url && (
                        <div className="relative mb-3 h-32 w-full rounded overflow-hidden">
                          <Image
                            src={relatedPost.featured_image_url}
                            alt={relatedPost.title}
                            fill
                            sizes="(min-width: 1024px) 280px, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <h3 className="line-clamp-2 font-semibold transition group-hover:text-primary">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.published_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(
                            relatedPost.published_at
                          ).toLocaleDateString('en-US', {
                            month: 'long',
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
