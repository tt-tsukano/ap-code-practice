/**
 * 変換ステップ表示コンポーネント
 * 擬似言語→Pythonコードの変換過程を段階的に表示
 */

import React, { useState } from 'react';
import { ConversionStep } from '@/lib/pseudo-converter';
import { cn } from '@/lib/utils';

interface ConversionStepsProps {
  steps: ConversionStep[];
  className?: string;
}

export function ConversionSteps({ steps, className }: ConversionStepsProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [diffView, setDiffView] = useState(false);

  if (steps.length === 0) {
    return (
      <div className={cn("conversion-steps", className)}>
        <div className="text-center py-8 text-slate-500">
          変換ステップがありません
        </div>
      </div>
    );
  }

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  const getTransformationTypeIcon = (type: string) => {
    switch (type) {
      case 'rule-based':
        return '🔧';
      case 'ast-based':
        return '🌳';
      default:
        return '⚡';
    }
  };

  const getTransformationTypeColor = (type: string) => {
    switch (type) {
      case 'rule-based':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ast-based':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn("conversion-steps space-y-4", className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">変換ステップ ({steps.length})</h3>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={diffView}
              onChange={(e) => setDiffView(e.target.checked)}
              className="rounded"
            />
            <span>差分表示</span>
          </label>
        </div>
      </div>

      {/* ステップ一覧 */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.stepNumber}
            className={cn(
              "border rounded-lg overflow-hidden transition-all",
              expandedStep === step.stepNumber
                ? "border-blue-300 shadow-sm"
                : "border-slate-200 dark:border-slate-700"
            )}
          >
            {/* ステップヘッダー */}
            <div
              className={cn(
                "p-4 cursor-pointer transition-colors",
                "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              onClick={() => toggleStep(step.stepNumber)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">
                      ステップ {step.stepNumber}
                    </span>
                    <span className="text-xl">
                      {getTransformationTypeIcon(step.transformationType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded border font-medium",
                        getTransformationTypeColor(step.transformationType)
                      )}
                    >
                      {step.transformationType === 'rule-based' ? 'ルールベース' : 'ASTベース'}
                    </span>
                    
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {step.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-mono">
                    {step.ruleApplied}
                  </span>
                  <svg
                    className={cn(
                      "w-4 h-4 transition-transform",
                      expandedStep === step.stepNumber ? "rotate-180" : ""
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ステップ詳細 */}
            {expandedStep === step.stepNumber && (
              <div className="border-t border-slate-200 dark:border-slate-700">
                {diffView ? (
                  // 差分表示
                  <div className="p-4 space-y-4">
                    <div className="text-sm font-medium mb-2">変更内容:</div>
                    <DiffViewer
                      oldText={step.inputText}
                      newText={step.outputText}
                    />
                  </div>
                ) : (
                  // 通常表示
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                    {/* 入力 */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium">入力</h4>
                        <span className="text-xs text-slate-500">
                          ({step.inputText.split('\n').length} 行)
                        </span>
                      </div>
                      <pre className={cn(
                        "p-3 rounded-lg text-xs font-mono overflow-auto max-h-48",
                        "bg-slate-100 dark:bg-slate-800",
                        "border border-slate-200 dark:border-slate-600"
                      )}>
                        <code>{step.inputText}</code>
                      </pre>
                    </div>

                    {/* 出力 */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium">出力</h4>
                        <span className="text-xs text-slate-500">
                          ({step.outputText.split('\n').length} 行)
                        </span>
                      </div>
                      <pre className={cn(
                        "p-3 rounded-lg text-xs font-mono overflow-auto max-h-48",
                        "bg-green-50 dark:bg-green-950",
                        "border border-green-200 dark:border-green-800"
                      )}>
                        <code>{step.outputText}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* 適用ルール情報 */}
                <div className="px-4 pb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">適用ルール:</span>
                      <span className="ml-2 font-mono text-blue-700 dark:text-blue-300">
                        {step.ruleApplied}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* フッター統計 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-slate-500">総ステップ数</div>
            <div className="font-semibold">{steps.length}</div>
          </div>
          <div>
            <div className="text-slate-500">ルールベース</div>
            <div className="font-semibold">
              {steps.filter(s => s.transformationType === 'rule-based').length}
            </div>
          </div>
          <div>
            <div className="text-slate-500">ASTベース</div>
            <div className="font-semibold">
              {steps.filter(s => s.transformationType === 'ast-based').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 差分表示コンポーネント
 */
function DiffViewer({ oldText, newText }: { oldText: string; newText: string }) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 削除行 */}
      <div className="space-y-1">
        <h5 className="text-xs font-medium text-red-700 dark:text-red-400">削除 (-)</h5>
        <div className="border border-red-200 dark:border-red-800 rounded">
          {oldLines.map((line, index) => (
            <div
              key={index}
              className={cn(
                "px-3 py-1 text-xs font-mono",
                "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100",
                index < oldLines.length - 1 && "border-b border-red-200 dark:border-red-800"
              )}
            >
              <span className="text-red-500 mr-2">-</span>
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      {/* 追加行 */}
      <div className="space-y-1">
        <h5 className="text-xs font-medium text-green-700 dark:text-green-400">追加 (+)</h5>
        <div className="border border-green-200 dark:border-green-800 rounded">
          {newLines.map((line, index) => (
            <div
              key={index}
              className={cn(
                "px-3 py-1 text-xs font-mono",
                "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100",
                index < newLines.length - 1 && "border-b border-green-200 dark:border-green-800"
              )}
            >
              <span className="text-green-500 mr-2">+</span>
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}