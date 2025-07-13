# 環境変数設定ファイル (.env.local)

無限リロード問題解決のため、以下の環境変数を.env.localに設定してください：

```bash
# Next.js環境変数 - 無限リロード問題解決用設定

# Fast Refresh無効化
FAST_REFRESH=false

# TypeScriptエラー無視
NEXT_IGNORE_TYPESCRIPT_ERRORS=true

# ESLintエラー無視
NEXT_IGNORE_ESLINT_ERRORS=true

# 詳細ログ無効化
NEXT_TELEMETRY_DISABLED=1

# SWC無効化（Babelフォールバック）
SWC_DISABLE=true

# 開発サーバー設定
HOST=localhost
PORT=3000
```

## 設定手順

1. プロジェクトルートに`.env.local`ファイルを作成
2. 上記の内容をコピー&ペースト
3. `npm run dev`で開発サーバーを起動

この設定により、Fast RefreshとSWCが無効化され、無限リロード問題が解決されます。