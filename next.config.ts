import type { NextConfig } from 'next';

/**
 * Set API_ORIGIN (e.g. https://ds-b-production.up.railway.app) together with
 * NEXT_PUBLIC_API_URL=/api and the browser only ever talks to this site: calls
 * to /api are proxied to the API from the server.
 *
 * That makes the session cookie first-party, so it survives Safari's tracking
 * prevention and any browser set to block third-party cookies — which would
 * otherwise drop it and bounce people back to the sign-in page.
 */
const apiOrigin = process.env.API_ORIGIN?.replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiOrigin) return [];
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
