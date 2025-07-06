import Link from 'next/link';
import { ExecutionResult } from '@/lib/code-executor';
import { QueryResult } from '@/lib/query-executor';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const PyodideRunner = dynamic(() => import('@/components/PyodideRunner').then(mod => ({ default: mod.PyodideRunner })), {
  ssr: false,
  loading: () => (
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        <span className="text-sm text-muted-foreground">
          Pythonコンポーネントを読み込み中...
        </span>
      </div>
    </div>
  ),
});

const SqlRunner = dynamic(() => import('@/components/SqlRunner').then(mod => ({ default: mod.SqlRunner })), {
  ssr: false,
  loading: () => (
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        <span className="text-sm text-muted-foreground">
          SQLコンポーネントを読み込み中...
        </span>
      </div>
    </div>
  ),
});

export default function CombinedDemo() {
  const [pythonResult, setPythonResult] = useState<ExecutionResult | null>(null);
  const [sqlResult, setSqlResult] = useState<QueryResult | null>(null);

  const handlePythonComplete = (result: ExecutionResult) => {
    setPythonResult(result);
  };

  const handleSqlComplete = (result: QueryResult) => {
    setSqlResult(result);
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
        <h1 className="text-3xl font-bold mb-2">統合デモ</h1>
        <p className="text-muted-foreground">
          PythonとSQLの両方の実行環境を同時に利用できます。
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Python Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Python実行環境</h2>
            {pythonResult && (
              <span className={`text-xs px-2 py-1 rounded ${
                pythonResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {pythonResult.success ? '成功' : '失敗'}
              </span>
            )}
          </div>
          <PyodideRunner
            onExecutionComplete={handlePythonComplete}
          />
        </div>

        {/* SQL Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">SQL実行環境</h2>
            {sqlResult && (
              <span className={`text-xs px-2 py-1 rounded ${
                sqlResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {sqlResult.success ? '成功' : '失敗'}
              </span>
            )}
          </div>
          <SqlRunner
            onQueryComplete={handleSqlComplete}
          />
        </div>

        {/* Combined Stats */}
        {(pythonResult || sqlResult) && (
          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">実行統計サマリー</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pythonResult && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Python実行</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">状態:</span>
                      <span className={pythonResult.success ? 'text-green-600' : 'text-red-600'}>
                        {pythonResult.success ? '成功' : '失敗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">実行時間:</span>
                      <span>{pythonResult.executionTime}ms</span>
                    </div>
                  </div>
                </div>
              )}
              {sqlResult && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">SQL実行</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">状態:</span>
                      <span className={sqlResult.success ? 'text-green-600' : 'text-red-600'}>
                        {sqlResult.success ? '成功' : '失敗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">実行時間:</span>
                      <span>{sqlResult.executionTime}ms</span>
                    </div>
                    {sqlResult.success && sqlResult.data && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">結果件数:</span>
                        <span>{sqlResult.data.length}件</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}