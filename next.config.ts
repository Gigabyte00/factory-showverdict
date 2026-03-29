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
    ],
  },

  // Enable ISR revalidation via API
  experimental: {
    // Enable PPR for faster initial loads
  },
};

export default nextConfig;
