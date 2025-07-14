/**
 * 変換プレビューコンポーネント
 * 擬似言語→Pythonコードの変換をリアルタイムで表示
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PseudoCodeConverter, ConversionResult, ConversionOptions } from '@/lib/pseudo-converter';
import { cn } from '@/lib/utils';

interface ConversionPreviewProps {
  pseudoCode: string;
  showSteps?: boolean;
  autoUpdate?: boolean;
  onConversionComplete?: (result: ConversionResult) => void;
  className?: string;
}

export function ConversionPreview({
  pseudoCode,
  showSteps = false,
  autoUpdate = true,
  onConversionComplete,
  className
}: ConversionPreviewProps) {
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    includeComments: false,
    indentSize: 4,
    includeDebugInfo: showSteps,
    validateOutput: true,
    method: 'hybrid'
  });

  const performConversion = useCallback(async () => {
    if (!pseudoCode.trim()) {
      setConversionResult(null);
      return;
    }

    setIsConverting(true);
    
    try {
      // 少し遅延を入れてリアルタイム変換の負荷を軽減
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = PseudoCodeConverter.convert(pseudoCode, {
        ...options,
        includeDebugInfo: showSteps
      });
      
      setConversionResult(result);
      onConversionComplete?.(result);
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionResult({
        success: false,
        pythonCode: '',
        errors: [{
          line: 0,
          column: 0,
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error'
        }],
        warnings: [],
        steps: [],
        metadata: {
          totalLines: 0,
          conversionTime: 0,
          rulesApplied: 0,
          complexityScore: 0,
          method: 'unknown'
        }
      });
    } finally {
      setIsConverting(false);
    }
  }, [pseudoCode, options, showSteps, onConversionComplete]);

  useEffect(() => {
    if (autoUpdate) {
      const timeoutId = setTimeout(performConversion, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [autoUpdate, performConversion]);

  const handleManualConvert = () => {
    performConversion();
  };

  const handleOptionsChange = (newOptions: Partial<ConversionOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  return (
    <div className={cn("conversion-preview space-y-4", className)}>
      {/* 変換オプション */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">変換方法:</label>
          <select
            value={options.method}
            onChange={(e) => handleOptionsChange({ method: e.target.value as any })}
            className="text-sm border rounded px-2 py-1 bg-white dark:bg-slate-800"
          >
            <option value="hybrid">ハイブリッド</option>
            <option value="rules">ルールベース</option>
            <option value="ast">ASTベース</option>
          </select>
        </div>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={options.includeComments || false}
            onChange={(e) => handleOptionsChange({ includeComments: e.target.checked })}
            className="rounded"
          />
          <span>コメント含む</span>
        </label>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
            className="rounded"
          />
          <span>自動更新</span>
        </label>

        {!autoUpdate && (
          <button
            onClick={handleManualConvert}
            disabled={isConverting}
            className={cn(
              "px-3 py-1 text-sm rounded font-medium",
              "bg-blue-600 text-white hover:bg-blue-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isConverting ? '変換中...' : '変換実行'}
          </button>
        )}
      </div>

      {/* 変換結果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pythonコード */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">変換されたPythonコード</h3>
            {conversionResult && (
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span>{conversionResult.metadata.conversionTime.toFixed(1)}ms</span>
                <span>複雑度: {conversionResult.metadata.complexityScore}</span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "relative min-h-[200px] rounded-lg border",
            "bg-slate-900 text-slate-100",
            "border-slate-200 dark:border-slate-700"
          )}>
            {isConverting && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                <div className="text-sm text-white">変換中...</div>
              </div>
            )}
            
            <pre className="p-4 text-sm font-mono overflow-auto">
              <code>
                {conversionResult?.pythonCode || '# 擬似言語を入力してください'}
              </code>
            </pre>
          </div>
        </div>

        {/* エラー・警告 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">変換結果</h3>
          
          <div className="space-y-2">
            {/* 成功状態 */}
            {conversionResult && (
              <div className={cn(
                "p-3 rounded-lg text-sm",
                conversionResult.success 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              )}>
                {conversionResult.success ? '✓ 変換成功' : '✗ 変換失敗'}
                <div className="text-xs mt-1 opacity-75">
                  {conversionResult.metadata.rulesApplied > 0 && 
                    `${conversionResult.metadata.rulesApplied}個のルールを適用`}
                </div>
              </div>
            )}

            {/* エラー */}
            {conversionResult?.errors.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-red-700">エラー:</h4>
                {conversionResult.errors.map((error, index) => (
                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <div className="font-mono">
                      行 {error.line}: {error.message}
                    </div>
                    {error.suggestion && (
                      <div className="mt-1 text-xs opacity-75">
                        💡 {error.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 警告 */}
            {conversionResult?.warnings.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-yellow-700">警告:</h4>
                {conversionResult.warnings.map((warning, index) => (
                  <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <div className="font-mono">
                      行 {warning.line}: {warning.message}
                    </div>
                    {warning.suggestion && (
                      <div className="mt-1 text-xs opacity-75">
                        💡 {warning.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 変換ステップ */}
      {showSteps && conversionResult?.steps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">変換ステップ</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversionResult.steps.map((step, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    ステップ {step.stepNumber}: {step.description}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {step.transformationType}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium mb-1">入力:</div>
                    <pre className="bg-white dark:bg-slate-800 p-2 rounded border font-mono text-xs overflow-x-auto">
                      {step.inputText}
                    </pre>
                  </div>
                  <div>
                    <div className="font-medium mb-1">出力:</div>
                    <pre className="bg-white dark:bg-slate-800 p-2 rounded border font-mono text-xs overflow-x-auto">
                      {step.outputText}
                    </pre>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-slate-500">
                  適用ルール: {step.ruleApplied}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}