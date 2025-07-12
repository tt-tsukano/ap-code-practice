/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disable to prevent hydration issues
  compress: true,
  swcMinify: true,
  
  // Bundle optimization - Remove experimental features that cause issues
  experimental: {
    gzipSize: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  webpack: (config, { dev, isServer }) => {
    // WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    
    // Ignore pyodide during server-side build
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      child_process: false,
    };

    // Bundle optimization
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        
        // Code splitting optimization
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            
            // Separate vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            
            // Monaco Editor chunk
            monaco: {
              test: /[\\/]node_modules[\\/]@monaco-editor[\\/]/,
              name: 'monaco',
              chunks: 'all',
              priority: 20,
            },
            
            // UI components chunk
            ui: {
              test: /[\\/]components[\\/]ui[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      };
      
      // Minimize bundle size - Remove problematic aliases
    }
    
    return config;
  },
  
  // CDN and caching headers
  headers: async () => [
    // Temporarily disable CORS headers that may cause issues in development
    // {
    //   source: '/(.*)',
    //   headers: [
    //     {
    //       key: 'Cross-Origin-Embedder-Policy',
    //       value: 'require-corp',
    //     },
    //     {
    //       key: 'Cross-Origin-Opener-Policy',
    //       value: 'same-origin',
    //     },
    //   ],
    // },
    {
      source: '/fonts/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/favicon.ico',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400',
        },
      ],
    },
  ],
  
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

export default nextConfig;
