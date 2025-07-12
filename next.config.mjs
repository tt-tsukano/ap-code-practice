/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // 開発サーバー最適化
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  
  // Fast Refresh無効化
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
};

export default nextConfig;
