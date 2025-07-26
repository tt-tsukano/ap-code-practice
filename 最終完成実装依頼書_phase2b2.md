# Phase 2-B-2 最終完成実装依頼書

## 🎯 実装目標
Phase 2-B-2 の最後の未実装部分（エラーバウンダリ）を完成させ、完全に安定した学習プラットフォームを実現する

---

## 📋 現状分析

### ✅ 既に完成している機能
- **疑似言語ハイライト**: prism-react-renderer による高品質実装
- **変換エンジン**: ルールベース変換とデモページ
- **採点システム**: 複数テストケース対応
- **エラー収集**: グローバルエラー監視とAPI送信

### ⚠️ 最後の課題
- **エラーバウンダリ**: React レンダリングエラーのフォールバック未実装

---

## 📋 依頼1：エラーバウンダリコンポーネント作成

### 実装依頼
Reactアプリケーションの安定性を確保するエラーバウンダリを実装してください。

### 実装要件

#### ファイル配置
```
src/components/ErrorBoundary.tsx
```

#### 技術仕様
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { reportError } from '@/lib/error-monitoring';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorId: string, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラー情報をstateに保存
    this.setState({ errorInfo });

    // カスタムエラーハンドラーの実行
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // エラー監視システムに報告
    reportError(error, {
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    // 開発環境では詳細ログ出力
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // カスタムフォールバックUIが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorId!, this.handleRetry);
      }

      // デフォルトのエラーUIを表示
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorId={this.state.errorId!}
          onRetry={this.handleRetry}
          componentStack={this.state.errorInfo?.componentStack}
        />
      );
    }

    return this.props.children;
  }
}

// デフォルトエラーフォールバックコンポーネント
interface DefaultErrorFallbackProps {
  error: Error;
  errorId: string;
  onRetry: () => void;
  componentStack?: string;
}

function DefaultErrorFallback({ error, errorId, onRetry, componentStack }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-medium text-gray-900">
              予期しないエラーが発生しました
            </h1>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            申し訳ございません。アプリケーションでエラーが発生しました。
            下記のボタンから再試行するか、ページを再読み込みしてください。
          </p>
        </div>

        {isDevelopment && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <h3 className="text-sm font-medium text-red-800 mb-2">開発者情報:</h3>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {componentStack && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer">
                  コンポーネントスタック
                </summary>
                <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap">
                  {componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="text-xs text-gray-500">
            エラーID: <code className="font-mono">{errorId}</code>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            このIDをお問い合わせ時にお伝えください。
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onRetry}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ページを再読み込み
          </button>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/demo"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            デモページに戻る
          </a>
        </div>
      </div>
    </div>
  );
}

// より簡潔なエラーバウンダリのエクスポート
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: (error: Error, errorId: string, retry: () => void) => ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

---

## 📋 依頼2：アプリケーション全体への統合

### 実装依頼
作成したエラーバウンダリをアプリケーション全体に統合してください。

### 実装要件

#### 修正対象ファイル
```
src/App.tsx
```

#### 実装内容
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// 既存ページインポート
import DemoPage from './pages/demo/index';
import PythonDemo from './pages/demo/python';
import SqlDemo from './pages/demo/sql';
import CombinedDemo from './pages/demo/combined';
import ConverterDemo from './pages/demo/converter';
import ProblemsDemo from './pages/demo/problems';
import ProblemsListPage from './pages/problems/index';
import ProblemPage from './pages/problems/[id]';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 追加のエラーハンドリングロジック
        console.warn('App-level error caught:', error);
      }}
    >
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
            {/* ホームページ */}
            <Route path="/" element={<Navigate to="/demo" replace />} />
            
            {/* デモページ群 - 個別にエラーバウンダリでラップ */}
            <Route path="/demo" element={
              <ErrorBoundary>
                <DemoPage />
              </ErrorBoundary>
            } />
            <Route path="/demo/python" element={
              <ErrorBoundary>
                <PythonDemo />
              </ErrorBoundary>
            } />
            <Route path="/demo/sql" element={
              <ErrorBoundary>
                <SqlDemo />
              </ErrorBoundary>
            } />
            <Route path="/demo/combined" element={
              <ErrorBoundary>
                <CombinedDemo />
              </ErrorBoundary>
            } />
            <Route path="/demo/converter" element={
              <ErrorBoundary>
                <ConverterDemo />
              </ErrorBoundary>
            } />
            <Route path="/demo/problems" element={
              <ErrorBoundary>
                <ProblemsDemo />
              </ErrorBoundary>
            } />
            
            {/* 学習ページ群 - より詳細なエラーハンドリング */}
            <Route path="/problems" element={
              <ErrorBoundary
                fallback={(error, errorId, retry) => (
                  <ProblemErrorFallback 
                    error={error} 
                    errorId={errorId} 
                    onRetry={retry}
                    context="problems-list"
                  />
                )}
              >
                <ProblemsListPage />
              </ErrorBoundary>
            } />
            <Route path="/problems/:id" element={
              <ErrorBoundary
                fallback={(error, errorId, retry) => (
                  <ProblemErrorFallback 
                    error={error} 
                    errorId={errorId} 
                    onRetry={retry}
                    context="problem-page"
                  />
                )}
              >
                <ProblemPage />
              </ErrorBoundary>
            } />
            
            {/* 404ページ */}
            <Route path="*" element={
              <ErrorBoundary>
                <NotFoundPage />
              </ErrorBoundary>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

// 学習ページ専用エラーフォールバック
function ProblemErrorFallback({ 
  error, 
  errorId, 
  onRetry, 
  context 
}: {
  error: Error;
  errorId: string;
  onRetry: () => void;
  context: 'problems-list' | 'problem-page';
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {context === 'problems-list' ? '問題一覧の読み込みエラー' : '問題の読み込みエラー'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {context === 'problems-list' 
              ? '問題一覧の読み込み中にエラーが発生しました。'
              : '選択された問題の読み込み中にエラーが発生しました。'
            }
          </p>
          
          <div className="space-y-2">
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
            <button
              onClick={() => window.location.href = '/problems'}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              問題一覧に戻る
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            エラーID: {errorId}
          </p>
        </div>
      </div>
    </div>
  );
}

// 404ページコンポーネント
function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">ページが見つかりません</h2>
        <p className="text-gray-600 mb-6">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <div className="space-x-4">
          <a 
            href="/demo" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            デモページに戻る
          </a>
          <a 
            href="/problems" 
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            問題一覧を見る
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## 📋 依頼3：エラー監視システムの強化

### 実装依頼
既存のエラー監視システムとエラーバウンダリの連携を強化してください。

### 実装要件

#### 修正対象ファイル
```
src/lib/error-monitoring.ts
```

#### 追加実装内容
```typescript
// 既存コードに追加

/**
 * エラーバウンダリ専用のエラー報告関数
 */
export function reportBoundaryError(
  error: Error, 
  errorInfo: any, 
  errorId: string,
  additionalContext?: Record<string, any>
) {
  const errorData = {
    type: 'boundary-error',
    message: error.message,
    stack: error.stack,
    errorId,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: null, // 将来の実装用
    ...additionalContext
  };

  // 即座にローカルストレージに保存（API送信失敗時のバックアップ）
  try {
    const savedErrors = localStorage.getItem('pending-errors');
    const errors = savedErrors ? JSON.parse(savedErrors) : [];
    errors.push(errorData);
    localStorage.setItem('pending-errors', JSON.stringify(errors.slice(-10))); // 最新10件のみ保持
  } catch (e) {
    console.warn('Failed to save error to localStorage:', e);
  }

  // API送信
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  }).catch(apiError => {
    console.warn('Failed to send error to API:', apiError);
  });
}

/**
 * アプリケーション開始時の未送信エラーの再送信
 */
export function retryPendingErrors() {
  try {
    const savedErrors = localStorage.getItem('pending-errors');
    if (savedErrors) {
      const errors = JSON.parse(savedErrors);
      errors.forEach((errorData: any) => {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...errorData, isRetry: true })
        }).catch(() => {
          // リトライも失敗した場合は諦める
        });
      });
      localStorage.removeItem('pending-errors');
    }
  } catch (e) {
    console.warn('Failed to retry pending errors:', e);
  }
}

// 既存のinitializeErrorMonitoring関数に追加
export function initializeErrorMonitoring() {
  // 既存のコード...
  
  // 未送信エラーの再送信
  retryPendingErrors();
  
  // 既存のwindow.onerror, window.onunhandledrejection...
}
```

---

## 📋 依頼4：エラーバウンダリのテスト実装

### 実装依頼
エラーバウンダリが正常に動作することを確認するテスト機能を実装してください。

### 実装要件

#### ファイル配置
```
src/components/ErrorTestComponent.tsx
src/pages/demo/error-test.tsx
```

#### 実装内容
```typescript
// src/components/ErrorTestComponent.tsx
import React, { useState } from 'react';

export function ErrorTestComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('テスト用エラー: エラーバウンダリの動作確認');
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">エラーバウンダリテスト</h3>
      <p className="text-gray-600 mb-4">
        このボタンを押すと意図的にエラーを発生させ、エラーバウンダリの動作を確認できます。
      </p>
      <button
        onClick={() => setShouldThrow(true)}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
      >
        エラーを発生させる
      </button>
    </div>
  );
}

// src/pages/demo/error-test.tsx
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorTestComponent } from '@/components/ErrorTestComponent';

export default function ErrorTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">エラーハンドリングテスト</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">1. エラーバウンダリテスト</h2>
          <ErrorBoundary>
            <ErrorTestComponent />
          </ErrorBoundary>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">2. 非同期エラーテスト</h2>
          <button
            onClick={() => {
              setTimeout(() => {
                throw new Error('非同期テストエラー');
              }, 1000);
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          >
            非同期エラーを発生させる
          </button>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">3. Promise拒否テスト</h2>
          <button
            onClick={() => {
              Promise.reject(new Error('Promise拒否テストエラー'));
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Promise拒否エラーを発生させる
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### App.tsx にテストページのルートを追加
```typescript
// App.tsx のRoutes内に追加
<Route path="/demo/error-test" element={
  <ErrorBoundary>
    <ErrorTestPage />
  </ErrorBoundary>
} />
```

---

## 📋 依頼5：最終検証とドキュメント

### 実装依頼
エラーハンドリングシステムの最終検証を行い、ドキュメントを作成してください。

### 検証項目
- [ ] コンポーネントレンダリングエラーの適切な処理
- [ ] エラーバウンダリのフォールバックUI表示
- [ ] エラー報告APIへの正常送信
- [ ] 未送信エラーの再送信機能
- [ ] 異なるページでのエラーハンドリング
- [ ] 開発環境と本番環境での動作差異

### ドキュメント作成
```markdown
# エラーハンドリングシステム仕様書

## 概要
本アプリケーションは多層的なエラーハンドリングシステムを実装しています。

## エラーキャッチの仕組み
1. **Reactエラーバウンダリ**: コンポーネントレンダリングエラー
2. **グローバルエラーハンドラー**: 未処理のJavaScriptエラー
3. **Promise拒否ハンドラー**: 未処理のPromise拒否

## エラー報告フロー
1. エラー発生 → 2. ローカル保存 → 3. API送信 → 4. 再送信(失敗時)

## 使用方法
### 個別コンポーネントのラップ
\`\`\`tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
\`\`\`

### カスタムフォールバックUI
\`\`\`tsx
<ErrorBoundary fallback={(error, errorId, retry) => (
  <CustomErrorUI error={error} onRetry={retry} />
)}>
  <YourComponent />
</ErrorBoundary>
\`\`\`
```

---

## 🎯 完成後の期待する動作

### エラーハンドリングフロー
1. **エラー発生** → 適切なフォールバックUI表示
2. **エラー報告** → サーバーサイドに自動送信
3. **ユーザー操作** → 再試行またはページ遷移
4. **ログ記録** → 開発者向け詳細情報

### 安定性向上
- **部分的エラー**: アプリ全体の停止を防止
- **ユーザー体験**: エラー時でも適切な案内
- **開発効率**: 詳細なエラー情報で迅速なデバッグ

---

## 🚀 実装優先順位

1. **依頼1**: エラーバウンダリコンポーネント作成（必須）
2. **依頼2**: アプリケーション統合（必須）
3. **依頼3**: エラー監視強化（推奨）
4. **依頼4**: テスト実装（推奨）
5. **依頼5**: 最終検証（品質保証）

どの依頼から開始しますか？**依頼1**から順次進めることを推奨します。