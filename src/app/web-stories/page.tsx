import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { WebStory } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();

  return {
    title: `Web Stories | ${site.name}`,
    description: `Visual stories and guides from ${site.name}. Swipe through our bite-sized content on ${site.niche?.toLowerCase() || 'trending topics'}.`,
    openGraph: {
      title: `Web Stories | ${site.name}`,
      description: `Visual stories and guides from ${site.name}`,
      type: 'website',
    },
  };
}

// Separate component for JSON-LD to keep it clean
function WebStoriesJsonLd({
  stories,
  siteName,
  siteNiche,
  domain
}: {
  stories: Pick<WebStory, 'slug' | 'title'>[];
  siteName: string;
  siteNiche: string | null;
  domain: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Web Stories from ${siteName}`,
    "description": `Visual stories about ${siteNiche || 'various topics'}`,
    "itemListElement": stories.map((story, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://${domain}/web-stories/${story.slug}`,
      "name": story.title,
    })),
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
    >
      {JSON.stringify(jsonLd)}
    </script>
  );
}

export default async function WebStoriesPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();

  // Fetch published web stories
  const { data: stories, error } = await supabase
    .from('web_stories')
    .select('id, slug, title, poster_image_url, impressions, published_at')
    .eq('site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching web stories:', error);
  }

  const webStories = (stories || []) as Pick<WebStory, 'id' | 'slug' | 'title' | 'poster_image_url' | 'impressions' | 'published_at'>[];
  const domain = site.domain || `${site.slug}.vercel.app`;

  return (
    <main className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <WebStoriesJsonLd
        stories={webStories}
        siteName={site.name}
        siteNiche={site.niche}
        domain={domain}
      />

      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">
            Web Stories
          </h1>
          <p className="mt-2 text-muted-foreground">
            Swipe through our visual guides and stories on {site.niche?.toLowerCase() || 'trending topics'}.
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {webStories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 text-primary">◆</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Stories Yet
            </h2>
            <p className="text-muted-foreground">
              Check back soon for visual stories and guides!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {webStories.map((story) => (
              <Link
                key={story.id}
                href={`/web-stories/${story.slug}`}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Poster Image */}
                {story.poster_image_url ? (
                  <Image
                    src={story.poster_image_url}
                    alt={story.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/20" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-white/80 transition-colors">
                    {story.title}
                  </h3>
                  {story.impressions > 0 && (
                    <p className="text-white/60 text-xs mt-1">
                      {story.impressions.toLocaleString()} views
                    </p>
                  )}
                </div>

                {/* Story Indicator Ring */}
                <div className="absolute top-2 left-2 right-2 flex gap-1">
                  <div
                    className="h-0.5 flex-1 rounded-full opacity-80"
                    style={{ backgroundColor: site.theme_config?.primaryColor || '#3B82F6' }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
