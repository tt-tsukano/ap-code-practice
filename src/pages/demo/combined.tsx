import { Link } from 'react-router-dom';
import { ExecutionResult } from '@/lib/code-executor';
import { QueryResult } from '@/lib/query-executor';
import { useState, useEffect, lazy, Suspense } from 'react';

// Dynamically import components for better code splitting
const PyodideRunner = lazy(() => import('@/components/PyodideRunner').then(mod => ({ default: mod.PyodideRunner })));
const SqlRunner = lazy(() => import('@/components/SqlRunner').then(mod => ({ default: mod.SqlRunner })));

const LoadingSpinner = ({ label }: { label: string }) => (
  <div className="bg-card text-card-foreground p-6 rounded-lg border">
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
      <span className="text-sm text-muted-foreground">
        {label}を読み込み中...
      </span>
    </div>
  </div>
);

export default function CombinedDemo() {
  const [pythonResult, setPythonResult] = useState<ExecutionResult | null>(null);
  const [sqlResult, setSqlResult] = useState<QueryResult | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← ホームに戻る
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">統合デモ</h1>
        <p className="text-muted-foreground">
          PythonとSQLを組み合わせたデモンストレーション。両方の実行環境を同時に利用できます。
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Python Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Python実行環境</h2>
          {isMounted ? (
            <Suspense fallback={<LoadingSpinner label="Python実行環境" />}>
              <PyodideRunner
                onExecutionComplete={handlePythonComplete}
              />
            </Suspense>
          ) : (
            <LoadingSpinner label="Python実行環境" />
          )}
          
          {pythonResult && (
            <div className="bg-muted/50 border rounded-lg p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Python状態:</span>
                <span className={`ml-2 ${pythonResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {pythonResult.success ? '成功' : '失敗'}
                </span>
                <span className="ml-4 text-muted-foreground">
                  {pythonResult.executionTime}ms
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* SQL Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">SQL実行環境</h2>
          {isMounted ? (
            <Suspense fallback={<LoadingSpinner label="SQL実行環境" />}>
              <SqlRunner
                onQueryComplete={handleSqlComplete}
              />
            </Suspense>
          ) : (
            <LoadingSpinner label="SQL実行環境" />
          )}
          
          {sqlResult && (
            <div className="bg-muted/50 border rounded-lg p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">SQL状態:</span>
                <span className={`ml-2 ${sqlResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {sqlResult.success ? '成功' : '失敗'}
                </span>
                <span className="ml-4 text-muted-foreground">
                  {sqlResult.executionTime}ms
                </span>
                {sqlResult.success && (
                  <span className="ml-4 text-muted-foreground">
                    {sqlResult.data?.length || 0}行
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Integration Tips */}
      <div className="mt-8 bg-muted/50 border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-2">統合利用のヒント:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Pythonでデータを生成し、SQLで分析</li>
          <li>• SQLクエリ結果をPythonで可視化</li>
          <li>• 両方の実行環境を同時に利用可能</li>
          <li>• それぞれ独立したメモリ空間で動作</li>
        </ul>
      </div>
    </div>
  );
}