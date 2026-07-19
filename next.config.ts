import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep better-sqlite3 as a server-only external — never bundled by Turbopack.
  serverExternalPackages: ['better-sqlite3'],
  // Silence the "no turbopack config" warning.
  turbopack: {},
  // Allow HMR websocket from any local network address (fixes the
  // "Blocked cross-origin request" dev warning).
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '169.254.83.107',
    '*.local',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
