import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Output ──────────────────────────────────────────────────────────────────
  output: 'standalone', // Required for Docker — copies only necessary files
  compress: true,       // Gzip compression at Next.js level

  // ── Images ──────────────────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // ── Production Flags ─────────────────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false,  // Don't leak "X-Powered-By: Next.js"
  devIndicators: false,

  // ── Compiler ─────────────────────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Tree-shaking: only import used components from large packages ────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@hello-pangea/dnd',
      '@reduxjs/toolkit',
    ],
  },

  // ── HTTP Response Headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Aggressive caching for immutable static assets
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Public assets (icons, images)
        source: '/:path*.(png|jpg|jpeg|webp|avif|svg|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
      {
        // Security headers on ALL routes
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control',    value: 'on' },
        ],
      },
    ];
  },

  // ── API Proxy Rewrites ────────────────────────────────────────────────────────
  // In Docker: INTERNAL_BACKEND_URL=http://backend:5000
  // Local dev: defaults to http://localhost:5000
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000';
    return {
      beforeFiles: [
        {
          // Socket.IO WebSocket upgrade
          source: '/socket.io/:path*',
          destination: `${backendUrl}/socket.io/:path*`,
        },
      ],
      fallback: [
        {
          // API proxy: /api/* → backend
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          // Health check proxy
          source: '/health',
          destination: `${backendUrl}/health`,
        },
      ],
    };
  },
};

export default nextConfig;
