import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    domains: [
      'blob.vercelusercontent.com',
      'img.clerk.com',
      'images.clerk.dev',
      'cdn.clerk.com',
      'utfs.io',
      'api.screenshotone.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  redirects: async () => [
    { source: '/sign-in', destination: '/login', permanent: false },
    { source: '/sign-in/:path*', destination: '/login/:path*', permanent: false },
    { source: '/sign-up', destination: '/signup', permanent: false },
    { source: '/sign-up/:path*', destination: '/signup/:path*', permanent: false },
    { source: '/competitor-pulse', destination: '/competitors', permanent: true },
    { source: '/competitor-pulse/:path*', destination: '/competitors/:path*', permanent: true },
    // Canonical redirect: known production Vercel aliases → custom domain
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'cws-client-portal.vercel.app' }],
      destination: 'https://portal.caliberwebstudio.com/:path*',
      permanent: true,
    },
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'cws-client-portal-darrin-singers-projects.vercel.app' }],
      destination: 'https://portal.caliberwebstudio.com/:path*',
      permanent: true,
    },
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'cws-client-portal-git-master-darrin-singers-projects.vercel.app' }],
      destination: 'https://portal.caliberwebstudio.com/:path*',
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
    {
      source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
