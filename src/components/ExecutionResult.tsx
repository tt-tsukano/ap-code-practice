import React from 'react';
import { ExecutionResult as ExecutionResultType } from '@/lib/code-executor';

interface ExecutionResultProps {
  result: ExecutionResultType | null;
  isLoading?: boolean;
  className?: string;
}

export function ExecutionResult({ result, isLoading = false, className = '' }: ExecutionResultProps) {
  if (isLoading) {
    return (
      <div className={`bg-muted/50 border rounded-md p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">実行中...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`bg-muted/50 border rounded-md p-4 ${className}`}>
        <p className="text-sm text-muted-foreground">実行結果がここに表示されます</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Header with execution status and time */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              result.success ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium">
            {result.success ? '実行成功' : '実行失敗'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          実行時間: {result.executionTime}ms
        </span>
      </div>

      {/* Output section */}
      {result.output && (
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              出力 (stdout)
            </span>
          </div>
          <pre className="text-sm bg-background border rounded p-2 overflow-x-auto whitespace-pre-wrap">
            {result.output}
          </pre>
        </div>
      )}

      {/* Error section */}
      {result.error && (
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              エラー (stderr)
            </span>
          </div>
          <pre className="text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 overflow-x-auto whitespace-pre-wrap text-red-700 dark:text-red-300">
            {result.error}
          </pre>
        </div>
      )}

      {/* Empty result message */}
      {!result.output && !result.error && result.success && (
        <div className="p-3">
          <p className="text-sm text-muted-foreground">
            実行が完了しました。出力はありません。
          </p>
        </div>
      )}
    </div>
  );
}