#!/bin/bash

# ミニマルNext.jsプロジェクト作成スクリプト
echo "🚀 ミニマルNext.jsプロジェクトを作成中..."

# 一時ディレクトリに移動
cd /tmp

# 既存のテストプロジェクトを削除
rm -rf nextjs-minimal-test

# 新規Next.jsプロジェクト作成
npx create-next-app@latest nextjs-minimal-test \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm

# プロジェクトディレクトリに移動
cd nextjs-minimal-test

echo "✅ ミニマルNext.jsプロジェクトが作成されました"
echo "📁 場所: /tmp/nextjs-minimal-test"
echo ""
echo "🔧 設定を最小化中..."

# React Strict Mode無効化
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

export default nextConfig;
EOF

# 環境変数設定
cat > .env.local << 'EOF'
FAST_REFRESH=false
SWC_DISABLE=true
NEXT_TELEMETRY_DISABLED=1
HOST=localhost
PORT=3001
EOF

echo "✅ 設定完了"
echo ""
echo "📋 テスト手順:"
echo "1. cd /tmp/nextjs-minimal-test"
echo "2. npm run dev"
echo "3. http://localhost:3001 でテスト"
echo ""
echo "💡 このプロジェクトで無限リロードが発生しない場合、"
echo "   元のプロジェクトに特有の問題があります。"