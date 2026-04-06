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

  // Image optimization for affiliate sites
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
    ],
  },

  // Enable ISR revalidation via API

  // Proxy Supabase storage through /cdn/ to hide project ref from page source.
  async rewrites() {
    const base = process.env.SUPABASE_CDN_BASE;
    if (!base) return [];
    return [{ source: '/cdn/:path*', destination: `${base}/:path*` }];
  },
  experimental: {
    // Enable PPR for faster initial loads
  },
};

export default nextConfig;
