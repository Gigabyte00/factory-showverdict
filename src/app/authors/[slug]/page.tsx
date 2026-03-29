import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Script from 'next/script';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  credentials: string | null;
  expertise: string[] | null;
  avatar_url: string | null;
  social_links: Record<string, string> | null;
}

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  featured_image_url: string | null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data } = await supabase
    .from('authors')
    .select('name, bio, avatar_url')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'Author Not Found' };

  return {
    title: `${data.name} | ${site.name}`,
    description: data.bio ? data.bio.slice(0, 155) : `Articles by ${data.name} on ${site.name}.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/authors/${slug}` } : undefined,
    openGraph: {
      title: data.name,
      description: data.bio ? data.bio.slice(0, 155) : undefined,
      images: data.avatar_url ? [data.avatar_url] : undefined,
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: authorData, error } = await supabase
    .from('authors')
    .select('id, name, slug, bio, credentials, expertise, avatar_url, social_links')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .single();

  if (error || !authorData) notFound();

  const author = authorData as Author;

  // Fetch their published posts
  const { data: postsData } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, published_at, featured_image_url')
    .eq('site_id', site.id)
    .eq('author_id', author.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12);

  const posts = (postsData as Post[]) || [];

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Authors', url: `${baseUrl}/authors` },
    { name: author.name, url: `${baseUrl}/authors/${slug}` },
  ];

  // Build social profile links array for sameAs
  const socialLinks = author.social_links ?? {};
  const sameAsUrls = Object.values(socialLinks).filter(Boolean) as string[];

  // Person schema for E-E-A-T
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${baseUrl}/authors/${slug}`,
    ...(author.avatar_url && { image: author.avatar_url }),
    ...(author.bio && { description: author.bio }),
    ...(author.credentials && { honorificSuffix: author.credentials }),
    ...(author.expertise?.length && { knowsAbout: author.expertise }),
    ...(sameAsUrls.length && { sameAs: sameAsUrls }),
    worksFor: { '@type': 'Organization', name: site.name, url: baseUrl || undefined },
  };

  const SOCIAL_LABELS: Record<string, string> = {
    twitter: 'Twitter / X',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    youtube: 'YouTube',
    facebook: 'Facebook',
    website: 'Website',
  };

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />
      <Script id="jsonld-author" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(personSchema)}
      </Script>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/authors" className="hover:text-foreground transition">Authors</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground">{author.name}</span>
        </nav>

        {/* Author header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
          {author.avatar_url ? (
            <Image
              src={author.avatar_url}
              alt={author.name}
              width={96}
              height={96}
              className="rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-primary">
                {author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-1">{author.name}</h1>
            {author.credentials && (
              <p className="text-sm text-muted-foreground mb-3">{author.credentials}</p>
            )}
            {author.bio && (
              <p className="text-muted-foreground leading-relaxed mb-4">{author.bio}</p>
            )}

            {/* Expertise tags */}
            {author.expertise && author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {author.expertise.map((area) => (
                  <span
                    key={area}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}

            {/* Social links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex flex-wrap gap-3">
                {Object.entries(socialLinks).map(([platform, url]) =>
                  url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition"
                    >
                      {SOCIAL_LABELS[platform] ?? platform}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        {/* Posts by this author */}
        {posts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-5">
              Articles by {author.name}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({posts.length})
              </span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="border rounded-xl p-4 hover:bg-muted/50 transition group"
                >
                  <h3 className="font-medium group-hover:text-primary transition line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
