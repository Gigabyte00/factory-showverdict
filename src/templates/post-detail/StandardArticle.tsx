/**
 * Standard Article - Post Detail Template
 *
 * Default blog post layout with sidebar and related posts.
 * Best for: General articles, standard blog posts
 */

import type { PostDetailTemplateProps } from '@/lib/templates/config';
import { createServerClient } from '@/lib/supabase';
import JsonLd from '@/components/JsonLd';
import type { FAQData } from '@/components/JsonLd';
import {
  Prose,
  Callout,
  LastUpdated,
  ProductCallout,
  LeadMagnetCTA,
  AuthorCard,
  AuthorBio,
} from '@/components/content';
import { InlineOptIn } from '@/components/content/InlineOptIn';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronRight } from 'lucide-react';
import JsonLdTyped from '@/components/JsonLd';
import { ReadingProgress } from '@/components/content/ReadingProgress';

/** Split markdown content at the Nth paragraph break. Returns [before, after]. */
function splitMarkdown(content: string, paragraphIndex: number): [string, string] {
  const chunks = content.split(/\n\n+/);
  if (chunks.length <= paragraphIndex) return [content, ''];
  return [chunks.slice(0, paragraphIndex).join('\n\n'), chunks.slice(paragraphIndex).join('\n\n')];
}

/** Auto-appends UTM params to /go/ affiliate links. */
function affiliateLinkComponents(slug: string) {
  return {
    a: ({
      href,
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
      if (href?.startsWith('/go/')) {
        const sep = href.includes('?') ? '&' : '?';
        return (
          <a
            href={`${href}${sep}utm_source=blog&utm_medium=affiliate&utm_campaign=${slug}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            {...props}
          >
            {children}
          </a>
        );
      }
      return <a href={href} {...props}>{children}</a>;
    },
  };
}

export default async function StandardArticle({
  post,
  category,
  relatedPosts = [],
  faqs = [],
  site,
  showTOC = false,
  showRelatedPosts = true,
}: PostDetailTemplateProps) {
  const siteId = (site as any).id as string;
  const [contentBefore, contentAfter] = splitMarkdown(post.content || '', 4);

  // Fetch full author profile for E-E-A-T rendering
  const supabase = createServerClient();
  let author: {
    name: string;
    slug: string;
    title: string | null;
    credentials: string | null;
    bio: string | null;
    avatar_url: string | null;
    expertise: string[] | null;
    social_links: Record<string, string> | null;
    reviews_count: number | null;
  } | null = null;

  if (post.author_name) {
    const { data } = await supabase
      .from('authors')
      .select('name, slug, title, credentials, bio, avatar_url, expertise, social_links, reviews_count')
      .eq('site_id', siteId)
      .ilike('name', post.author_name)
      .limit(1)
      .single();
    if (data) author = data as typeof author;
  }

  // Article schema with linked author URL when available
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.featured_image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          url: site.domain ? `https://${site.domain}/authors/${author.slug}` : undefined,
          ...(author.credentials && { honorificSuffix: author.credentials }),
          ...(author.expertise?.length && { knowsAbout: author.expertise }),
        }
      : { '@type': 'Person', name: post.author_name || site.name },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.domain,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${site.domain}/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <JsonLd data={articleSchema} />

      <div className="container max-w-4xl mx-auto py-8">
        <article>
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition">Home</Link>
            <ChevronRight className="mx-1 h-4 w-4" />
            <Link href="/blog" className="hover:text-foreground transition">Blog</Link>
            {category && (
              <>
                <ChevronRight className="mx-1 h-4 w-4" />
                <Link href={`/${category.slug}`} className="hover:text-foreground transition">
                  {category.name}
                </Link>
              </>
            )}
          </nav>

          <Card className="overflow-hidden">
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
              <h1 className="mb-4 text-3xl font-bold md:text-4xl">{post.title}</h1>

              {/* Author card + post meta */}
              <div className="mb-6 border-b pb-6">
                {author ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <AuthorCard
                      name={author.name}
                      slug={author.slug}
                      title={author.title}
                      credentials={author.credentials}
                      avatarUrl={author.avatar_url}
                      expertise={author.expertise}
                      publishedAt={post.published_at}
                      updatedAt={post.updated_at}
                    />
                    <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                      {post.reading_time_minutes && (
                        <span>{post.reading_time_minutes} min read</span>
                      )}
                      <ShareButtons
                        url={`${site.domain ? `https://${site.domain}` : ''}/blog/${post.slug}`}
                        title={post.title}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                    {post.reading_time_minutes && <span>{post.reading_time_minutes} min read</span>}
                    {post.author_name && <span>By {post.author_name}</span>}
                    <div className="ml-auto">
                      <ShareButtons
                        url={`${site.domain ? `https://${site.domain}` : ''}/blog/${post.slug}`}
                        title={post.title}
                      />
                    </div>
                  </div>
                )}
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
                <p className="mb-6 text-lg font-medium italic text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              {/* Content — split with inline opt-in after paragraph 4 */}
              <Prose>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={affiliateLinkComponents(post.slug)}
                >
                  {contentBefore}
                </ReactMarkdown>
              </Prose>
              {contentAfter && (
                <>
                  <InlineOptIn siteId={siteId} niche={site.niche} />
                  <Prose>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={affiliateLinkComponents(post.slug)}
                    >
                      {contentAfter}
                    </ReactMarkdown>
                  </Prose>
                </>
              )}

              {/* FAQ Section */}
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

              {/* Author Bio — full E-E-A-T section */}
              {author && (
                <div className="mt-8">
                  <AuthorBio
                    name={author.name}
                    slug={author.slug}
                    title={author.title}
                    bio={author.bio}
                    credentials={author.credentials}
                    avatarUrl={author.avatar_url}
                    expertise={author.expertise}
                    socialLinks={author.social_links}
                    reviewsCount={author.reviews_count}
                  />
                </div>
              )}

              {/* FTC Disclosure */}
              <Callout variant="warning" title="Affiliate Disclosure" className="mt-8">
                This article may contain affiliate links. If you make a purchase through these
                links, we may earn a commission at no additional cost to you.
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

              {/* Share at bottom */}
              <div className="mt-8 pt-6 border-t">
                <ShareButtons
                  url={`${site.domain ? `https://${site.domain}` : ''}/blog/${post.slug}`}
                  title={post.title}
                />
              </div>
            </CardContent>
          </Card>
        </article>

        <LeadMagnetCTA variant="card" />

        <div className="mt-8">
          <NewsletterSignup siteId={siteId} niche={site.niche} variant="default" />
        </div>

        <NewsletterSignup siteId={siteId} niche={site.niche} variant="sticky" />

        {showRelatedPosts && relatedPosts.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-2xl font-bold">More Articles</h2>
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
