import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds (Vercel)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Warning: Only use this if you know what you're doing
    // Allows production builds even with TypeScript errors
    ignoreBuildErrors: false, // We keep this false to catch real errors
  },
};

export default nextConfig;
