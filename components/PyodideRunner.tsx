import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from './CodeEditor';
import { ExecutionResult } from './ExecutionResult';
import { Button } from './ui/button';
import { CodeExecutor, ExecutionResult as ExecutionResultType } from '@/lib/code-executor';
import { Play, Square, RotateCcw } from 'lucide-react';

interface PyodideRunnerProps {
  initialCode?: string;
  onExecutionComplete?: (result: ExecutionResultType) => void;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PYTHON_CODE = `# Python実行デモ
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# フィボナッチ数列を計算
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")

# 基本的な計算
numbers = [1, 2, 3, 4, 5]
print(f"合計: {sum(numbers)}")
print(f"平均: {sum(numbers) / len(numbers)}")
`;

export function PyodideRunner({
  initialCode = DEFAULT_PYTHON_CODE,
  onExecutionComplete,
  disabled = false,
  className = '',
}: PyodideRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ExecutionResultType | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [executor] = useState(() => new CodeExecutor());

  // Initialize Pyodide on component mount
  useEffect(() => {
    const initializePyodide = async () => {
      setIsInitializing(true);
      setInitError(null);
      
      try {
        await executor.initialize();
        setIsInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitError(errorMessage);
        console.error('Pyodide initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializePyodide();
  }, [executor]);

  const handleExecute = useCallback(async () => {
    if (!isInitialized || isExecuting || disabled) {
      return;
    }

    setIsExecuting(true);
    setResult(null);

    try {
      const executionResult = await executor.executeCode(code);
      setResult(executionResult);
      onExecutionComplete?.(executionResult);
    } catch (error) {
      const errorResult: ExecutionResultType = {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: 0,
      };
      setResult(errorResult);
      onExecutionComplete?.(errorResult);
    } finally {
      setIsExecuting(false);
    }
  }, [code, isInitialized, isExecuting, disabled, executor, onExecutionComplete]);

  const handleStop = useCallback(() => {
    // Note: Actual execution stopping would require more complex implementation
    // For now, we just stop the loading state
    setIsExecuting(false);
  }, []);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setResult(null);
  }, [initialCode]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const canExecute = isInitialized && !isExecuting && !disabled;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Initialization Status */}
      {isInitializing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Pyodideを初期化中... (初回は数秒かかる場合があります)
            </span>
          </div>
        </div>
      )}

      {/* Initialization Error */}
      {initError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-700 dark:text-red-300">
              <strong>初期化エラー:</strong> {initError}
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleExecute}
          disabled={!canExecute}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          実行
        </Button>
        
        <Button
          onClick={handleStop}
          disabled={!isExecuting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          停止
        </Button>
        
        <Button
          onClick={handleReset}
          disabled={isExecuting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          リセット
        </Button>
        
        {isInitialized && (
          <span className="text-xs text-muted-foreground ml-auto">
            Pyodide準備完了
          </span>
        )}
      </div>

      {/* Code Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Pythonコード</label>
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language="python"
          height="400px"
          readOnly={disabled || isExecuting}
        />
      </div>

      {/* Execution Result */}
      <div className="space-y-2">
        <label className="text-sm font-medium">実行結果</label>
        <ExecutionResult
          result={result}
          isLoading={isExecuting}
        />
      </div>
    </div>
  );
}