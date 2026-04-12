import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { WebStory, WebStorySlide } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600; // Revalidate every hour

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Generate AMP Web Story HTML
 *
 * Web Stories are AMP-based visual stories optimized for Google Discover.
 * They require specific AMP boilerplate and structure.
 */
function generateAMPStoryHTML(story: WebStory, site: ReturnType<typeof getSiteConfig>): string {
  const slides = story.slides || [];
  const domain = site.domain || `${site.slug}.vercel.app`;
  const storyUrl = `https://${domain}/web-stories/${story.slug}`;
  const publisherLogo = site.theme_config?.logoUrl || `https://${domain}/icon.png`;

  // Generate slide HTML
  const slidesHTML = slides.map((slide: WebStorySlide, index: number) => {
    const textPosition = slide.textPosition || 'bottom';
    const bgColor = slide.backgroundColor || '#000000';
    const textColor = slide.textColor || '#ffffff';

    // First slide is the cover
    if (index === 0) {
      return `
    <amp-story-page id="cover">
      <amp-story-grid-layer template="fill">
        <amp-img src="${slide.image}"
                 width="720" height="1280"
                 layout="responsive"
                 alt="${slide.imageAlt || story.title}">
        </amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical" class="bottom">
        <h1 style="color: ${textColor}; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); padding: 20px;">${story.title}</h1>
      </amp-story-grid-layer>
    </amp-story-page>`;
    }

    // Content slides
    let textHTML = '';
    if (slide.text) {
      const textStyle = `color: ${textColor}; background: rgba(0,0,0,0.7); padding: 16px; border-radius: 8px;`;
      textHTML = `
      <amp-story-grid-layer template="${textPosition === 'center' ? 'vertical' : textPosition}">
        <p style="${textStyle}">${slide.text}</p>
        ${slide.link ? `<a href="${slide.link}" style="color: ${site.theme_config?.primaryColor || '#3B82F6'}; margin-top: 12px;">${slide.linkText || 'Learn More'}</a>` : ''}
      </amp-story-grid-layer>`;
    }

    return `
    <amp-story-page id="page-${index}">
      <amp-story-grid-layer template="fill" style="background-color: ${bgColor};">
        <amp-img src="${slide.image}"
                 width="720" height="1280"
                 layout="responsive"
                 alt="${slide.imageAlt || `Slide ${index + 1}`}">
        </amp-img>
      </amp-story-grid-layer>
      ${textHTML}
    </amp-story-page>`;
  }).join('\n');

  // Structured data for the story
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "mainEntity": {
      "@type": "Article",
      "headline": story.title,
      "image": story.poster_image_url || slides[0]?.image,
      "datePublished": story.published_at,
      "dateModified": story.updated_at,
      "author": {
        "@type": "Organization",
        "name": site.name
      },
      "publisher": {
        "@type": "Organization",
        "name": site.name,
        "logo": {
          "@type": "ImageObject",
          "url": publisherLogo
        }
      }
    }
  };

  return `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <title>${story.title} | ${site.name}</title>
  <link rel="canonical" href="${storyUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

  <!-- AMP Story Runtime -->
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>

  <!-- AMP Boilerplate -->
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

  <!-- Custom Styles -->
  <style amp-custom>
    body { font-family: 'Inter', -apple-system, sans-serif; }
    h1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
    p { font-size: 18px; line-height: 1.5; }
    a { text-decoration: none; font-weight: 600; }
    .bottom { justify-content: flex-end; padding-bottom: 60px; }
    .top { justify-content: flex-start; padding-top: 60px; }
    .center { justify-content: center; }
  </style>

  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body>
  <amp-story standalone
             title="${story.title}"
             publisher="${site.name}"
             publisher-logo-src="${publisherLogo}"
             poster-portrait-src="${story.poster_image_url || slides[0]?.image || ''}"
             poster-square-src="${story.poster_image_url || slides[0]?.image || ''}"
             poster-landscape-src="${story.poster_image_url || slides[0]?.image || ''}">

    ${slidesHTML}

    <!-- Bookend with related links -->
    <amp-story-bookend layout="nodisplay">
      <script type="application/json">
        {
          "bookendVersion": "v1.0",
          "shareProviders": ["twitter", "facebook", "email"],
          "components": [
            {
              "type": "heading",
              "text": "More from ${site.name}"
            },
            {
              "type": "cta-link",
              "links": [
                {
                  "text": "Visit Our Site",
                  "url": "https://${domain}"
                }
              ]
            }
          ]
        }
      </script>
    </amp-story-bookend>

  </amp-story>
</body>
</html>`;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const site = getSiteConfig();
  const supabase = createServerClient();

  // Fetch the web story
  const { data: story, error } = await supabase
    .from('web_stories')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !story) {
    return NextResponse.json(
      { error: 'Story not found' },
      { status: 404 }
    );
  }

  // Track impression (fire and forget)
  supabase
    .from('web_stories')
    .update({ impressions: (story.impressions || 0) + 1 })
    .eq('id', story.id)
    .then(() => {});

  // Generate AMP HTML
  const html = generateAMPStoryHTML(story as unknown as WebStory, site);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'AMP-Cache-Transform': 'google;v="1..100"',
    },
  });
}
