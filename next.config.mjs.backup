/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // 開発サーバー最適化
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  
  // Fast Refresh完全無効化
  fastRefresh: false,
  
  // TypeScriptとESLintエラー無視
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 実験的機能無効化
  experimental: {},
  
  // SWC無効化
  swcMinify: false,
  
  // webpack設定でファイルウォッチャー無効化
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // ファイルウォッチャー無効化
      config.watchOptions = {
        ignored: /node_modules/,
        poll: false, // ポーリングを無効化
        aggregateTimeout: 5000, // 5秒の遅延
      };
      
      // Hot Module Replacement無効化
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name !== 'HotModuleReplacementPlugin'
      );
    }
    
    return config;
  },
};

export default nextConfig;
