import type { NextConfig } from "next";

// Detect if we're building for Electron
const isElectron = process.env.BUILD_TARGET === 'electron';

const nextConfig: NextConfig = {
  // Electron-specific configuration
  output: isElectron ? 'standalone' : undefined,

  // Externalize tiktok-live-connector to prevent bundling issues (needed for both Electron and Vercel)
  // This library uses native Node.js Buffer APIs and WebSocket implementations that break when bundled
  serverExternalPackages: ['tiktok-live-connector'],

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

// Log build mode for debugging
if (isElectron) {
  console.log('🔧 Building for Electron (standalone mode)');
} else {
  console.log('🌐 Building for Web');
}

export default nextConfig;
