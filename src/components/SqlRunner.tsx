import React, { useState, useEffect, useCallback } from 'react';
import { SqlEditor } from './SqlEditor';
import { ResultTable } from './ResultTable';
import { SchemaBuilder } from './SchemaBuilder';
import { Button } from './ui/button';
import { QueryExecutor, QueryResult, SchemaDefinition } from '@/lib/query-executor';
import { Play, Square, RotateCcw, Database, FileText } from 'lucide-react';

interface SqlRunnerProps {
  initialSql?: string;
  initialSchema?: SchemaDefinition[];
  onQueryComplete?: (result: QueryResult) => void;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_SQL = `-- SQL実行デモ - 学生データの分析クエリ

-- 1. 成績上位者の抽出
SELECT name, score, subject, grade_level
FROM students 
WHERE score >= 80 
ORDER BY score DESC;

-- 2. 学年別の平均点
-- SELECT grade_level, AVG(score) as avg_score, COUNT(*) as student_count
-- FROM students
-- GROUP BY grade_level
-- ORDER BY grade_level;

-- 3. 科目別の統計情報
-- SELECT subject, 
--        AVG(score) as avg_score,
--        MIN(score) as min_score,
--        MAX(score) as max_score,
--        COUNT(*) as student_count
-- FROM students
-- GROUP BY subject
-- ORDER BY avg_score DESC;`;

const DEFAULT_SCHEMA: SchemaDefinition[] = [
  {
    tableName: 'students',
    createStatement: `CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    score INTEGER,
    subject TEXT,
    grade_level INTEGER
);`,
    insertStatements: [
      `INSERT INTO students VALUES (1, '田中太郎', 85, '数学', 3);`,
      `INSERT INTO students VALUES (2, '佐藤花子', 92, '英語', 3);`,
      `INSERT INTO students VALUES (3, '鈴木一郎', 78, '国語', 2);`,
      `INSERT INTO students VALUES (4, '山田美咲', 96, '理科', 3);`,
      `INSERT INTO students VALUES (5, '渡辺健太', 74, '社会', 2);`,
      `INSERT INTO students VALUES (6, '高橋由美', 88, '数学', 3);`,
    ],
  },
];

export function SqlRunner({
  initialSql = DEFAULT_SQL,
  initialSchema = DEFAULT_SCHEMA,
  onQueryComplete,
  disabled = false,
  className = '',
}: SqlRunnerProps) {
  const [sql, setSql] = useState(initialSql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [schemas, setSchemas] = useState<SchemaDefinition[]>(initialSchema);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'query' | 'schema'>('schema');
  const [executor] = useState(() => new QueryExecutor());

  // Initialize SQL.js on component mount
  useEffect(() => {
    const initializeSqlJs = async () => {
      setIsInitializing(true);
      setInitError(null);
      
      try {
        await executor.initialize();
        setIsInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitError(errorMessage);
        console.error('SQL.js initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSqlJs();
  }, [executor]);

  const handleExecuteQuery = useCallback(async () => {
    if (!isInitialized || isExecuting || disabled) {
      return;
    }

    setIsExecuting(true);
    setResult(null);

    try {
      const queryResult = await executor.executeQuery(sql);
      setResult(queryResult);
      onQueryComplete?.(queryResult);
    } catch (error) {
      const errorResult: QueryResult = {
        success: false,
        data: [],
        columns: [],
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: 0,
      };
      setResult(errorResult);
      onQueryComplete?.(errorResult);
    } finally {
      setIsExecuting(false);
    }
  }, [sql, isInitialized, isExecuting, disabled, executor, onQueryComplete]);

  const handleInitializeSchema = useCallback(async () => {
    if (!isInitialized || isExecuting || disabled) {
      return;
    }

    setIsExecuting(true);
    setResult(null);

    try {
      const schemaResult = await executor.initializeSchema(schemas);
      setResult(schemaResult);
      
      if (schemaResult.success) {
        // Automatically switch to query tab after successful schema initialization
        setActiveTab('query');
      }
    } catch (error) {
      const errorResult: QueryResult = {
        success: false,
        data: [],
        columns: [],
        error: error instanceof Error ? error.message : 'Schema initialization error',
        executionTime: 0,
      };
      setResult(errorResult);
    } finally {
      setIsExecuting(false);
    }
  }, [schemas, isInitialized, isExecuting, disabled, executor]);

  const handleStop = useCallback(() => {
    // Note: Actual execution stopping would require more complex implementation
    // For now, we just stop the loading state
    setIsExecuting(false);
  }, []);

  const handleReset = useCallback(() => {
    setSql(initialSql);
    setSchemas(initialSchema);
    setResult(null);
    setActiveTab('schema');
  }, [initialSql, initialSchema]);

  const handleSqlChange = useCallback((newSql: string) => {
    setSql(newSql);
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
              SQL.jsを初期化中...
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

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
            activeTab === 'schema'
              ? 'border-primary text-primary'
              : 'border-transparent hover:border-muted-foreground/50'
          }`}
        >
          <Database className="h-4 w-4" />
          スキーマ設定
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
            activeTab === 'query'
              ? 'border-primary text-primary'
              : 'border-transparent hover:border-muted-foreground/50'
          }`}
        >
          <FileText className="h-4 w-4" />
          クエリ実行
        </button>
      </div>

      {/* Schema Tab */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <SchemaBuilder
            schemas={schemas}
            onSchemasChange={setSchemas}
            onInitializeSchema={handleInitializeSchema}
            isLoading={isExecuting}
          />
        </div>
      )}

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExecuteQuery}
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
                SQL.js準備完了
              </span>
            )}
          </div>

          {/* SQL Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">SQLクエリ</label>
            <SqlEditor
              value={sql}
              onChange={handleSqlChange}
              height="300px"
              readOnly={disabled || isExecuting}
            />
          </div>
        </div>
      )}

      {/* Result Table */}
      <div className="space-y-2">
        <label className="text-sm font-medium">実行結果</label>
        <ResultTable
          result={result}
        />
      </div>
    </div>
  );
}