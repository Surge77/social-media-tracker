import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // All installed Radix packages + heavy libs — enables proper tree-shaking
    optimizePackageImports: [
      '@radix-ui/react-collapsible',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-slot',
      '@radix-ui/primitive',
      '@radix-ui/react-compose-refs',
      '@radix-ui/react-context',
      '@radix-ui/react-id',
      '@radix-ui/react-presence',
      '@radix-ui/react-primitive',
      'lucide-react',
      'framer-motion',
      'recharts',
    ]
  },
  // Optimize bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate vendor chunks for better caching
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separate UI components chunk
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 20,
          },
          // Separate feed components chunk (heavy components)
          feed: {
            test: /[\\/]src[\\/]components[\\/]feed[\\/]/,
            name: 'feed-components',
            chunks: 'all',
            priority: 30,
          },
          // Common utilities
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
