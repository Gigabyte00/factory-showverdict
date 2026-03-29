/**
 * Magazine Variant - Blog List Template
 *
 * Editorial mixed layout with prominent featured post.
 * Best for: 30-50 posts, editorial/news-style sites
 */

import type { BlogListTemplateProps } from '@/lib/templates/config';
import { ArticleCard } from '@/components/home/ArticleCard';
import { HeroSection } from '@/components/home/HeroSection';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export default function MagazineVariant({
  posts,
  categories,
  currentPage,
  totalPages,
  site,
  theme,
  copy,
  showExcerpts = true,
  featuredCardStyle = 'vertical',
}: BlogListTemplateProps) {
  const [featuredPost, ...gridPosts] = posts;
  const hasFeaturedPost = posts.length > 0 && currentPage === 1;

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy.heroTitle || `${site.name} - Expert Reviews`,
    description: copy.heroSubtitle || `Read our latest ${site.niche} reviews`,
    url: `${site.domain}/blog`,
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.domain,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${site.domain}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd data={structuredData} />

      {/* Hero Section */}
      <HeroSection
        site={site}
        categoryCount={categories.length}
        postCount={posts.length}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured Post (First page only) */}
        {hasFeaturedPost && (
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              {copy.sectionHeading || 'Featured Story'}
            </h2>
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <ArticleCard
                post={featuredPost}
                category={
                  categories.find((cat) => cat.id === featuredPost.category_id) ||
                  null
                }
                variant="featured"
              />
            </div>
          </section>
        )}

        {/* Grid of Posts */}
        {gridPosts.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              {hasFeaturedPost
                ? 'Latest Stories'
                : copy.sectionHeading || 'Latest Reviews'}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  category={
                    categories.find((cat) => cat.id === post.category_id) ||
                    null
                  }
                  variant="default"
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-lg text-muted-foreground">
              {copy.emptyStateMessage || 'No articles yet. Check back soon!'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-16 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {/* Previous Button */}
            {currentPage > 1 ? (
              <Link
                href={`/blog?page=${currentPage - 1}`}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                Previous
              </span>
            )}

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  // Show first, last, current, and adjacent pages
                  const shouldShow =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1;

                  if (!shouldShow) {
                    // Show ellipsis
                    if (
                      pageNum === 2 ||
                      pageNum === totalPages - 1
                    ) {
                      return (
                        <span
                          key={pageNum}
                          className="px-2 py-2 text-sm text-muted-foreground"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  const isActive = pageNum === currentPage;

                  return (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}`}
                      className={
                        isActive
                          ? 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                          : 'rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
                      }
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {pageNum}
                    </Link>
                  );
                }
              )}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Next
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                Next
              </span>
            )}
          </nav>
        )}

        {/* Newsletter Signup CTA */}
        <section className="mt-20 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 text-center md:p-12">
          <h2 className="mb-3 text-3xl font-bold text-foreground">
            Never Miss a Review
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
            Get our latest {site.niche} reviews and buying guides delivered to
            your inbox weekly.
          </p>
          <form className="mx-auto flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </section>
      </div>
    </div>
  );
}
