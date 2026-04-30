import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Increase timeout for static generation (ISR/SSG pages)
  staticPageGenerationTimeout: 240,

  // Server Actions config
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    // Tree-shake heavy packages — only import what's used
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'lodash',
      'recharts',
      '@radix-ui/react-icons',
      'framer-motion',
      'motion',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      '@supabase/supabase-js',
      'jose',
    ],
  },

  // Image optimization config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],

    // Optimize image formats — AVIF first (smallest), WebP fallback
    formats: ['image/avif', 'image/webp'],
    // Leaner sizes to reduce Vercel transformations
    deviceSizes: [640, 1080, 1366, 1920, 2560],
    imageSizes: [128, 256, 384, 512, 640],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    // Explicitly allow qualities used in the app
    qualities: [75, 80],
  },



  // Enable gzip compression
  compress: true,

  // Validate trailing slashes
  trailingSlash: false,

  // Strip X-Powered-By header
  poweredByHeader: false,

  // HTTP headers for CDN caching & security
  async headers() {
    return [
      {
        // Cache static assets aggressively (fonts, images, CSS, JS chunks)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // REMOVED: /_next/image cache header to avoid conflict with 'minimumCacheTTL' setting above
      {
        // Public static files
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Security headers for all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
