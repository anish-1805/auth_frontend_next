/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to reduce dev network requests
  
  // Disable webpack HMR polling (reduces network requests)
  webpack: (config, { dev, isServer }) => {
    // Disable HMR in development if you want
    if (dev && !isServer) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
      };
    }
    
    // Suppress source map warnings
    if (!isServer) {
      config.ignoreWarnings = [
        { module: /react-toastify/ },
      ];
    }
    
    // Path alias
    const path = require('path');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },
  
  // API proxy configuration
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL is not set, skipping API rewrites');
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: apiUrl + '/api/:path*',
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true, // Disable optimization for user avatars
  },
};

module.exports = nextConfig;
