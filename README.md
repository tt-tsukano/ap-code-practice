# ブラウザ内 Python・SQL 実行環境

PyodideとSql.jsを使用して、ブラウザ内でPythonコードとSQLクエリを実行できるデモアプリケーションです。

## 🚀 セットアップ手順

### 前提条件

以下がインストールされていることを確認してください：

- **Node.js** 18.17.0 以上
- **npm** または **yarn**

### 1. プロジェクトのダウンロード

```bash
# GitHubからクローン（リポジトリがある場合）
git clone <repository-url>
cd ap-code-practice

# または、ZIPファイルをダウンロードして展開
# ダウンロード後、フォルダ内に移動
cd ap-code-practice
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスして動作確認してください。

## 📋 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番用ビルド
npm run build

# 本番サーバー起動（ビルド後）
npm start

# コードのリント
npm run lint

# リントエラーの自動修正
npm run lint:fix

# コードフォーマット
npm run format

# TypeScript型チェック
npm run type-check
```

## 🌐 デプロイ

### Vercel でのデプロイ

1. [Vercel](https://vercel.com) にアカウントを作成
2. プロジェクトをGitHubにプッシュ
3. Vercelダッシュボードで「New Project」をクリック
4. GitHubリポジトリを選択してインポート
5. 自動でビルド・デプロイが実行されます

## 🏗️ プロジェクト構造

```
/
├── pages/              # Next.js ページ（Pages Router）
│   ├── _app.tsx       # アプリケーションラッパー
│   ├── _document.tsx  # HTMLドキュメント設定
│   ├── index.tsx      # ホームページ
│   └── demo/          # デモページ
├── components/        # Reactコンポーネント
│   ├── ui/           # Shadcn/ui コンポーネント
│   └── ...           # カスタムコンポーネント
├── lib/              # ユーティリティ関数
├── styles/           # CSSファイル
└── public/           # 静的ファイル
```

## 🎨 機能

- **Python実行環境**: Pyodideを使用したブラウザ内Python実行
- **SQL実行環境**: Sql.jsを使用したブラウザ内SQL実行
- **統合デモ**: PythonとSQLの組み合わせデモ
- **ダークモード**: システム設定に応じた自動切り替え
- **レスポンシブデザイン**: モバイル・デスクトップ対応

## 🔧 技術スタック

- **Framework**: Next.js 14 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Code Quality**: ESLint + Prettier
- **Deployment**: Vercel対応

## ⚠️ 注意事項

### ブラウザ要件
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

### セキュリティ
- Pyodide実行には30秒のタイムアウト制限があります
- ブラウザ内実行のため、ファイルシステムアクセスは制限されています

### パフォーマンス
- 初回のPyodide読み込みには数秒かかる場合があります
- WASM（WebAssembly）ファイルのサイズが大きいため、初期読み込みに時間がかかることがあります

## 🐛 トラブルシューティング

### 依存関係エラーが発生した場合

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### ビルドエラーが発生した場合

```bash
# 型チェックでエラーの詳細を確認
npm run type-check

# リントでコードの問題を確認
npm run lint
```

### 開発サーバーが起動しない場合

```bash
# ポート3000が使用されている場合、別のポートで起動
npm run dev -- -p 3001
```

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. Node.jsのバージョンが18.17.0以上であること
2. 依存関係が正しくインストールされていること
3. ブラウザがWebAssembly（WASM）をサポートしていること

---

🎯 **次の実装予定**: Pyodide統合、Sql.js統合、Monaco Editor統合
