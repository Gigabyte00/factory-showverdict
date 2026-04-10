import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Users } from 'lucide-react';
import JsonLd from '@/components/JsonLd';

export const revalidate = 3600;

export async function generateMetadata() {
  const site = getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    title: `Authors`,
    description: `Meet the experts behind ${site.name}.`,
    alternates: baseUrl ? { canonical: `${baseUrl}/authors` } : undefined,
  };
}

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  credentials: string | null;
  expertise: string[] | null;
  avatar_url: string | null;
}

export default async function AuthorsIndexPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();
  const baseUrl = site.domain ? `https://${site.domain}` : '';

  const { data: authors } = await supabase
    .from('authors')
    .select('id, name, slug, bio, credentials, expertise, avatar_url')
    .eq('site_id', site.id)
    .order('name', { ascending: true });

  const items = (authors as Author[]) || [];

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl || '/' },
    { name: 'Authors', url: `${baseUrl}/authors` },
  ];

  return (
    <>
      <JsonLd type="breadcrumb" data={{ items: breadcrumbItems }} />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground">Authors</span>
        </nav>

        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Our Authors</h1>
        </div>
        <p className="text-muted-foreground mb-10 text-lg">
          The experts and enthusiasts who write for {site.name}.
        </p>

        {items.length === 0 ? (
          <p className="text-muted-foreground">No author profiles published yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {items.map((author) => (
              <Link
                key={author.id}
                href={`/authors/${author.slug}`}
                className="flex gap-4 border rounded-xl p-5 hover:bg-muted/50 hover:border-primary/40 transition group items-start"
              >
                {author.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.name}
                    width={56}
                    height={56}
                    className="rounded-full shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary">
                      {author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-semibold group-hover:text-primary transition">{author.name}</h2>
                  {author.credentials && (
                    <p className="text-xs text-muted-foreground mt-0.5">{author.credentials}</p>
                  )}
                  {author.bio && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{author.bio}</p>
                  )}
                  {author.expertise && author.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {author.expertise.slice(0, 3).map((area) => (
                        <span
                          key={area}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
