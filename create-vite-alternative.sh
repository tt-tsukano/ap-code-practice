#!/bin/bash

# Vite + React代替プロジェクト作成スクリプト
echo "⚡ Vite + React代替プロジェクトを作成中..."

# 一時ディレクトリに移動
cd /tmp

# 既存のテストプロジェクトを削除
rm -rf vite-react-test

# 新規Viteプロジェクト作成
npm create vite@latest vite-react-test -- --template react-ts

# プロジェクトディレクトリに移動
cd vite-react-test

# 依存関係をインストール
npm install

# TailwindCSSを追加
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Tailwind設定
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# TailwindをCSSに追加
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}
EOF

# 基本的なApp.tsxを作成
cat > src/App.tsx << 'EOF'
import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Vite + React代替プロジェクト
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Next.jsの代替として、ViteとReactを使用したプロジェクトです。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
              <h2 className="text-xl font-semibold mb-3">Python実行環境</h2>
              <p className="text-gray-600 mb-4">
                Pyodideを使用してブラウザ内でPythonコードを実行。
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Python デモ（準備中）
              </button>
            </div>
            
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
              <h2 className="text-xl font-semibold mb-3">SQL実行環境</h2>
              <p className="text-gray-600 mb-4">
                Sql.jsを使用してブラウザ内でSQLクエリを実行。
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                SQL デモ（準備中）
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">テスト結果</h3>
            <p className="text-gray-700">
              現在時刻: {new Date().toLocaleString('ja-JP')}
            </p>
            <p className="text-gray-700 mt-2">
              このページが無限リロードしない場合、Viteでの開発が有効な代替手段です。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
EOF

echo "✅ Vite + React代替プロジェクトが作成されました"
echo "📁 場所: /tmp/vite-react-test"
echo ""
echo "📋 テスト手順:"
echo "1. cd /tmp/vite-react-test"
echo "2. npm run dev"
echo "3. http://localhost:5173 でテスト"
echo ""
echo "💡 Viteは一般的により高速で安定した開発体験を提供します。"