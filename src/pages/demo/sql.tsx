import { Link } from 'react-router-dom';
import { QueryResult } from '@/lib/query-executor';
import { useState, useEffect, lazy, Suspense } from 'react';

// Dynamically import SqlRunner for better code splitting
const SqlRunner = lazy(() => import('@/components/SqlRunner').then(mod => ({ default: mod.SqlRunner })));

const LoadingSpinner = () => (
  <div className="bg-card text-card-foreground p-6 rounded-lg border">
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
      <span className="text-sm text-muted-foreground">
        コンポーネントを読み込み中...
      </span>
    </div>
  </div>
);

export default function SqlDemo() {
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleQueryComplete = (result: QueryResult) => {
    setLastResult(result);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← ホームに戻る
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SQL実行デモ</h1>
        <p className="text-muted-foreground">
          sql.jsを使用してブラウザ内でSQLクエリを実行できます。
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Main SqlRunner */}
        {isMounted ? (
          <Suspense fallback={<LoadingSpinner />}>
            <SqlRunner
              onQueryComplete={handleQueryComplete}
            />
          </Suspense>
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
            <li>• SQLiteクエリの実行</li>
            <li>• CREATE, INSERT, SELECT, UPDATE, DELETE</li>
            <li>• JOINとサブクエリ</li>
            <li>• 集約関数とGROUP BY</li>
            <li>• 実行時間の測定</li>
          </ul>
        </div>
        
        {/* Last Query Stats */}
        {lastResult && (
          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">最終クエリ統計:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
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
              {lastResult.success && (
                <div>
                  <span className="text-muted-foreground">取得行数:</span>
                  <span className="ml-2">{lastResult.data?.length || 0}行</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}