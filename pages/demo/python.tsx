import Link from 'next/link';
import { ExecutionResult } from '@/lib/code-executor';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PyodideRunner to avoid SSR issues
const PyodideRunner = dynamic(() => import('@/components/PyodideRunner').then(mod => ({ default: mod.PyodideRunner })), {
  ssr: false,
  loading: () => (
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        <span className="text-sm text-muted-foreground">
          コンポーネントを読み込み中...
        </span>
      </div>
    </div>
  ),
});

export default function PythonDemo() {
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleExecutionComplete = (result: ExecutionResult) => {
    setLastResult(result);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← ホームに戻る
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Python実行デモ</h1>
        <p className="text-muted-foreground">
          Pyodideを使用してブラウザ内でPythonコードを実行できます。
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Main PyodideRunner */}
        {isMounted ? (
          <PyodideRunner
            onExecutionComplete={handleExecutionComplete}
          />
        ) : (
          <div className="bg-card text-card-foreground p-6 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground">
                コンポーネントを準備中...
              </span>
            </div>
          </div>
        )}
        
        {/* Additional Information */}
        <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-sm">利用可能な機能:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 標準的なPython構文とビルトイン関数</li>
            <li>• ループ、条件分岐、関数定義</li>
            <li>• 基本的な数値計算とデータ処理</li>
            <li>• print()による出力表示</li>
            <li>• 実行時間の測定 (30秒タイムアウト)</li>
          </ul>
        </div>
        
        {/* Last Execution Stats */}
        {lastResult && (
          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">最終実行統計:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">状態:</span>
                <span className={`ml-2 ${lastResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {lastResult.success ? '成功' : '失敗'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">実行時間:</span>
                <span className="ml-2">{lastResult.executionTime}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}