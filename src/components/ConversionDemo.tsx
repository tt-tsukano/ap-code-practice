/**
 * 変換デモコンポーネント
 * 擬似言語変換の統合デモンストレーション
 */

import React, { useState, useEffect } from 'react';
import { PseudoCodeViewer } from './PseudoCodeViewer';
import { ConversionPreview } from './ConversionPreview';
import { ConversionResult } from '@/lib/pseudo-converter';
import { cn } from '@/lib/utils';

interface ConversionDemoProps {
  initialPseudoCode?: string;
  showRules?: boolean;
  editable?: boolean;
  className?: string;
  onConversionComplete?: (result: ConversionResult) => void;
}

// デモ用のサンプルコード
const DEMO_SAMPLES = [
  {
    name: '選択ソート（簡易版）',
    code: `手続き simpleSort(配列:arr, 整数:n)
  整数:i, j, temp
  i を 0 から n-2 まで 1 ずつ増やす
    j を i+1 から n-1 まで 1 ずつ増やす
      もし arr[i] > arr[j] ならば
        temp ← arr[i]
        arr[i] ← arr[j]
        arr[j] ← temp`
  },
  {
    name: 'バブルソート',
    code: `手続き bubbleSort(配列:data, 整数:n)
  整数:i, j, temp
  i を 0 から n-2 まで 1 ずつ増やす
    j を 0 から n-2-i まで 1 ずつ増やす
      もし data[j] > data[j+1] ならば
        temp ← data[j]
        data[j] ← data[j+1]
        data[j+1] ← temp`
  },
  {
    name: '線形探索',
    code: `手続き linearSearch(配列:arr, 整数:n, 整数:target)
  整数:i
  i を 0 から n-1 まで 1 ずつ増やす
    もし arr[i] = target ならば
      戻り値 i
  戻り値 -1`
  },
  {
    name: '空欄付きアルゴリズム',
    code: `手続き algorithm(配列:A, 整数:n)
  整数:i, j, min
  i を 0 から ［ア］ まで 1 ずつ増やす
    min ← ［イ］
    j を i+1 から n-1 まで 1 ずつ増やす
      もし A[j] ［ウ］ A[min] ならば
        min ← ［エ］
    もし i ≠ min ならば
      ［オ］`
  }
];

export function ConversionDemo({
  initialPseudoCode = DEMO_SAMPLES[0].code,
  showRules = false,
  editable = true,
  className,
  onConversionComplete
}: ConversionDemoProps) {
  const [pseudoCode, setPseudoCode] = useState(initialPseudoCode);
  const [selectedSample, setSelectedSample] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    setPseudoCode(DEMO_SAMPLES[selectedSample].code);
  }, [selectedSample]);

  const handleSampleChange = (index: number) => {
    setSelectedSample(index);
  };

  const handlePseudoCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPseudoCode(event.target.value);
  };

  const handleConversionComplete = (result: ConversionResult) => {
    setConversionResult(result);
    onConversionComplete?.(result);
  };

  const handleBlankClick = (blankId: string) => {
    console.log('Blank clicked:', blankId);
    // 実際の実装では、空欄選択UI を表示
  };

  const handleExecutePython = async () => {
    if (!conversionResult?.success || !conversionResult.pythonCode) {
      return;
    }

    setIsExecuting(true);
    try {
      // PyodideRunnerを使用してPythonコードを実行
      // 実際の実装では、Pyodideの初期化と実行を行う
      console.log('Executing Python code:', conversionResult.pythonCode);
      
      // デモ用の遅延
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Execution completed');
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={cn("conversion-demo space-y-6", className)}>
      {/* ヘッダー */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold">擬似言語変換デモ</h2>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="rounded"
              />
              <span>変換ステップ表示</span>
            </label>
          </div>
        </div>

        {/* サンプル選択 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">サンプルを選択:</label>
          <div className="flex flex-wrap gap-2">
            {DEMO_SAMPLES.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSampleChange(index)}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg border transition-colors",
                  selectedSample === index
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 左側: 擬似言語入力・表示 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">擬似言語</h3>
          
          {editable ? (
            <textarea
              value={pseudoCode}
              onChange={handlePseudoCodeChange}
              placeholder="擬似言語を入力してください..."
              className={cn(
                "w-full h-96 p-4 font-mono text-sm rounded-lg border resize-y",
                "bg-white dark:bg-slate-900",
                "border-slate-300 dark:border-slate-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
          ) : (
            <PseudoCodeViewer
              pseudoCode={pseudoCode}
              highlightBlanks={pseudoCode.includes('［')}
              onBlankClick={handleBlankClick}
              readOnly={false}
              className="h-96"
            />
          )}
        </div>

        {/* 右側: 変換結果 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">変換結果</h3>
            
            {conversionResult?.success && (
              <button
                onClick={handleExecutePython}
                disabled={isExecuting}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg font-medium transition-colors",
                  "bg-green-600 text-white hover:bg-green-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isExecuting ? '実行中...' : 'Python実行'}
              </button>
            )}
          </div>
          
          <ConversionPreview
            pseudoCode={pseudoCode}
            showSteps={showSteps}
            autoUpdate={true}
            onConversionComplete={handleConversionComplete}
          />
        </div>
      </div>

      {/* 変換統計・情報 */}
      {conversionResult && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">変換情報</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-500">変換時間</div>
              <div className="font-mono">{conversionResult.metadata.conversionTime.toFixed(1)}ms</div>
            </div>
            <div>
              <div className="text-slate-500">適用ルール数</div>
              <div className="font-mono">{conversionResult.metadata.rulesApplied}</div>
            </div>
            <div>
              <div className="text-slate-500">複雑度</div>
              <div className="font-mono">{conversionResult.metadata.complexityScore}</div>
            </div>
            <div>
              <div className="text-slate-500">変換方法</div>
              <div className="font-mono">{conversionResult.metadata.method}</div>
            </div>
          </div>
        </div>
      )}

      {/* ルール表示 */}
      {showRules && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">変換ルール一覧</h3>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            ※ 実装予定: 適用可能な変換ルールの一覧表示
          </div>
        </div>
      )}
    </div>
  );
}