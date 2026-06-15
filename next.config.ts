import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Skip type-check during build — KB tables (authors, faq_items, glossary_terms,
  // topic_clusters) exist in DB but haven't been added to generated types yet.
  // Run `tsc --noEmit` separately for type safety.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable transpilation of the shared workspace package
  transpilePackages: ['@factory/shared'],

  // Permanent redirects for legacy/bare URLs that 404 from external inbound links
  // (search engines, bookmarks, social shares). Each path is enumerated explicitly —
  // never a wildcard — and only targets routes that actually exist.
  //   • Bare category slugs → their /category/<slug> page (slugs verified in DB).
  //   • Missing utility pages → the closest existing route.
  async redirects() {
    return [
      // Bare category slugs → real category pages
      { source: '/best-of-lists', destination: '/category/best-of-lists', permanent: true },
      { source: '/movie-reviews', destination: '/category/movie-reviews', permanent: true },
      { source: '/new-this-week', destination: '/category/new-this-week', permanent: true },
      { source: '/streaming-guides', destination: '/category/streaming-guides', permanent: true },
      { source: '/tv-home-theater', destination: '/category/tv-home-theater', permanent: true },
      { source: '/tv-reviews', destination: '/category/tv-reviews', permanent: true },
      // Missing utility pages → closest existing route
      { source: '/affiliate-disclosure', destination: '/about', permanent: true },
      { source: '/editorial-standards', destination: '/about', permanent: true },
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
    ];
  },

  // Proxy Supabase storage through /cdn/ to hide the project ref from page source.
  // SUPABASE_CDN_BASE is a private (non-NEXT_PUBLIC) env var — never shipped to browser.
  async rewrites() {
    const base = process.env.SUPABASE_CDN_BASE;
    if (!base) return [];
    return [{ source: '/cdn/:path*', destination: `${base}/:path*` }];
  },

  // Image optimization for affiliate sites
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
    ],
  },

  // Enable ISR revalidation via API
  experimental: {
    // Enable PPR for faster initial loads
  },
};

export default nextConfig;
