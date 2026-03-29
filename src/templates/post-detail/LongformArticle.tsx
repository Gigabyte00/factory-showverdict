/**
 * Longform Article - Post Detail Template
 *
 * Optimized layout for long-form content with sticky TOC sidebar.
 * Best for: Articles >3000 words, in-depth guides, tutorials
 */

import type { PostDetailTemplateProps } from '@/lib/templates/config';
import JsonLd from '@/components/JsonLd';
import type { FAQData } from '@/components/JsonLd';
import JsonLdTyped from '@/components/JsonLd';
import { Prose, Callout, LastUpdated, ProductCallout, LeadMagnetCTA } from '@/components/content';
import { InlineOptIn } from '@/components/content/InlineOptIn';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronRight, BookOpen } from 'lucide-react';

function splitMarkdown(content: string, index: number): [string, string] {
  const chunks = content.split(/\n\n+/);
  if (chunks.length <= index) return [content, ''];
  return [chunks.slice(0, index).join('\n\n'), chunks.slice(index).join('\n\n')];
}

function affiliateLinkComponents(slug: string) {
  return {
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
      if (href?.startsWith('/go/')) {
        const sep = href.includes('?') ? '&' : '?';
        return (
          <a href={`${href}${sep}utm_source=blog&utm_medium=affiliate&utm_campaign=${slug}`} target="_blank" rel="noopener noreferrer sponsored" {...props}>
            {children}
          </a>
        );
      }
      return <a href={href} {...props}>{children}</a>;
    },
  };
}

export default function LongformArticle({
  post,
  category,
  relatedPosts = [],
  faqs = [],
  site,
  theme,
  copy,
  showTOC = true,
  showRelatedPosts = true,
}: PostDetailTemplateProps) {
  const siteId = (site as any).id as string;
  // For long-form, insert opt-ins at paragraph 4 and paragraph 8
  const [part1, rest] = splitMarkdown(post.content || '', 4);
  const [part2, part3] = splitMarkdown(rest, 4);
  // Extract headings for TOC (simplified - would need client component for real implementation)
  const headings = post.content
    ?.match(/^#{1,3}\s+(.+)$/gm)
    ?.map((heading) => {
      const level = heading.match(/^#+/)?.[0].length || 2;
      const text = heading.replace(/^#+\s+/, '');
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      return { level, text, id };
    }) || [];

  // Structured data for SEO
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
    wordCount: post.content?.split(/\s+/).length || 0,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${site.domain}/blog/${post.slug}`,
    },
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
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {post.reading_time_minutes} min read
                    </span>
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

                {/* Featured Product Callout */}
                {post.metadata?.featuredProduct && (
                  <ProductCallout
                    name={post.metadata.featuredProduct.name}
                    description={post.metadata.featuredProduct.description}
                    image={post.metadata.featuredProduct.image}
                    rating={post.metadata.featuredProduct.rating}
                    price={post.metadata.featuredProduct.price}
                    highlights={post.metadata.featuredProduct.highlights}
                    href={post.metadata.featuredProduct.href}
                    badge={post.metadata.featuredProduct.badge}
                    ctaText={post.metadata.featuredProduct.ctaText || 'View Deal'}
                  />
                )}

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="mb-8 text-xl font-medium text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                {/* Content — split with inline opt-ins at paragraphs 4 and 8 */}
                <Prose className="prose-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={affiliateLinkComponents(post.slug)}>
                    {part1}
                  </ReactMarkdown>
                </Prose>
                {part2 && (
                  <>
                    <InlineOptIn siteId={siteId} niche={site.niche} />
                    <Prose className="prose-lg">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={affiliateLinkComponents(post.slug)}>
                        {part2}
                      </ReactMarkdown>
                    </Prose>
                  </>
                )}
                {part3 && (
                  <>
                    <InlineOptIn siteId={siteId} niche={site.niche} />
                    <Prose className="prose-lg">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={affiliateLinkComponents(post.slug)}>
                        {part3}
                      </ReactMarkdown>
                    </Prose>
                  </>
                )}

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

            {/* Lead magnet CTA — shown if LEAD_MAGNET_SLUG env var is set */}
            <LeadMagnetCTA variant="card" />

            {/* Sticky bottom bar */}
            <NewsletterSignup siteId={siteId} niche={site.niche} variant="sticky" />

            {/* Related Posts */}
            {showRelatedPosts && relatedPosts.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-2xl font-bold">Continue Reading</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedPosts.slice(0, 4).map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group"
                      aria-label={relatedPost.title}
                    >
                      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                        <CardContent className="p-4">
                          {relatedPost.featured_image_url && (
                            <img
                              src={relatedPost.featured_image_url}
                              alt={relatedPost.title}
                              className="mb-3 h-32 w-full rounded object-cover"
                            />
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
          </article>
      </div>
    </div>
  );
}
