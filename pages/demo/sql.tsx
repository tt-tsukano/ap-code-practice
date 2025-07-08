import Link from 'next/link';
import { QueryResult } from '@/lib/query-executor';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SqlRunner to avoid SSR issues
const SqlRunner = dynamic(() => import('@/components/SqlRunner').then(mod => ({ default: mod.SqlRunner })), {
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

export default function SqlDemo() {
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);

  const handleQueryComplete = (result: QueryResult) => {
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
        <h1 className="text-3xl font-bold mb-2">SQL実行デモ</h1>
        <p className="text-muted-foreground">
          sql.jsを使用してブラウザ内でSQLクエリを実行できます。
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Main SqlRunner */}
        <SqlRunner
          onQueryComplete={handleQueryComplete}
        />
        
        {/* Additional Information */}
        <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-sm">利用可能な機能:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• SQLiteデータベースの作成・操作</li>
            <li>• CREATE TABLE、INSERT、SELECT、UPDATE、DELETE</li>
            <li>• JOIN、GROUP BY、ORDER BY等の高度なクエリ</li>
            <li>• 結果のソート・フィルタ・CSV出力</li>
            <li>• 複数テーブルの管理</li>
          </ul>
        </div>
        
        {/* Last Query Stats */}
        {lastResult && (
          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">最終クエリ統計:</h3>
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
              {lastResult.success && lastResult.data && (
                <div>
                  <span className="text-muted-foreground">結果件数:</span>
                  <span className="ml-2">{lastResult.data.length}件</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}