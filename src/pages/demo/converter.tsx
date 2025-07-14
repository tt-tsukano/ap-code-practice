/**
 * 擬似言語変換エンジンのデモページ
 * IPA応用情報技術者試験の擬似言語をPythonコードに変換するデモ
 */

import React, { useState, useEffect } from 'react';
import { ConversionDemo } from '@/components/ConversionDemo';
import { ConversionSteps } from '@/components/ConversionSteps';
import { PseudoCodeConverter, ConversionResult } from '@/lib/pseudo-converter';
import { PyodideRunner } from '@/components/PyodideRunner';
import { cn } from '@/lib/utils';

// r4s-q8.jsonからロードする実際の問題のサンプル
const ACTUAL_PROBLEM_SAMPLE = `手続き selectionSort(配列:array, 整数:n)
  整数:i, j, min_idx, temp
  i を 0 から ［ア］ まで 1 ずつ増やす
    min_idx ← ［イ］
    j を ［ウ］ から n-1 まで 1 ずつ増やす
      もし array[j] ［エ］ array[min_idx] ならば
        min_idx ← ［オ］
    もし i ≠ min_idx ならば
      temp ← array[i]
      array[i] ← array[min_idx]
      array[min_idx] ← temp`;

export default function ConverterPage() {
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [showExecutor, setShowExecutor] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'steps' | 'execute'>('demo');

  const handleConversionComplete = (result: ConversionResult) => {
    setConversionResult(result);
  };

  const handleExecuteCode = () => {
    if (conversionResult?.success) {
      setActiveTab('execute');
      setShowExecutor(true);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              擬似言語変換エンジン
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              IPA応用情報技術者試験の擬似言語を実行可能なPythonコードに自動変換します。
              ルールベース変換とAST解析を組み合わせた高精度変換エンジンです。
            </p>
          </div>

          {/* 機能説明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-blue-600 dark:text-blue-400 text-2xl mb-3">🔧</div>
              <h3 className="font-semibold mb-2">ルールベース変換</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                IPA擬似言語の文法パターンを網羅した変換ルールによる高精度変換
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-green-600 dark:text-green-400 text-2xl mb-3">🌳</div>
              <h3 className="font-semibold mb-2">AST解析</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                構文解析によるAST生成とコード構造の最適化
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-purple-600 dark:text-purple-400 text-2xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">リアルタイム実行</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                変換されたPythonコードをブラウザ上で即座に実行・検証
              </p>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('demo')}
                className={cn(
                  "px-6 py-4 text-sm font-medium transition-colors",
                  activeTab === 'demo'
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                変換デモ
              </button>
              
              <button
                onClick={() => setActiveTab('steps')}
                disabled={!conversionResult}
                className={cn(
                  "px-6 py-4 text-sm font-medium transition-colors",
                  activeTab === 'steps'
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
                  !conversionResult && "opacity-50 cursor-not-allowed"
                )}
              >
                変換ステップ
                {conversionResult?.steps.length ? ` (${conversionResult.steps.length})` : ''}
              </button>
              
              <button
                onClick={() => setActiveTab('execute')}
                disabled={!conversionResult?.success}
                className={cn(
                  "px-6 py-4 text-sm font-medium transition-colors",
                  activeTab === 'execute'
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
                  !conversionResult?.success && "opacity-50 cursor-not-allowed"
                )}
              >
                Python実行
              </button>
            </div>

            {/* タブコンテンツ */}
            <div className="p-6">
              {activeTab === 'demo' && (
                <ConversionDemo
                  initialPseudoCode={ACTUAL_PROBLEM_SAMPLE}
                  showRules={false}
                  editable={true}
                  onConversionComplete={handleConversionComplete}
                />
              )}

              {activeTab === 'steps' && conversionResult && (
                <ConversionSteps steps={conversionResult.steps} />
              )}

              {activeTab === 'execute' && conversionResult?.success && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Pythonコード実行</h3>
                    <div className="text-sm text-slate-500">
                      Pyodideによるブラウザ内Python実行
                    </div>
                  </div>
                  
                  <PyodideRunner
                    initialCode={conversionResult.pythonCode}
                    onExecutionComplete={(result) => {
                      console.log('Execution result:', result);
                    }}
                  />
                </div>
              )}

              {activeTab === 'steps' && !conversionResult && (
                <div className="text-center py-12 text-slate-500">
                  まず「変換デモ」タブで擬似言語を変換してください
                </div>
              )}

              {activeTab === 'execute' && !conversionResult?.success && (
                <div className="text-center py-12 text-slate-500">
                  実行可能なPythonコードが生成されていません
                </div>
              )}
            </div>
          </div>

          {/* 使用例・ヒント */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold mb-4">使用方法・ヒント</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-700 dark:text-blue-300">対応する擬似言語構文</h4>
                <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• 変数宣言: <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">整数型：N</code></li>
                  <li>• 配列宣言: <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">配列：A(10)</code></li>
                  <li>• 代入演算: <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">x ← 10</code></li>
                  <li>• 条件分岐: <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">もし x &gt; 0 ならば</code></li>
                  <li>• ループ: <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">i を 0 から 9 まで 1 ずつ増やす</code></li>
                  <li>• 手続き: <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">手続き sort(配列:A, 整数:n)</code></li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-green-700 dark:text-green-300">変換の特徴</h4>
                <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• ハイブリッド変換（ルール + AST）で高精度</li>
                  <li>• 変換ステップの詳細表示でデバッグ可能</li>
                  <li>• 生成コードの妥当性を自動検証</li>
                  <li>• 実際の試験問題の空欄パターンにも対応</li>
                  <li>• エラー・警告の詳細なフィードバック</li>
                  <li>• ブラウザ内でのPython実行によるテスト</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 変換統計（結果がある場合のみ） */}
          {conversionResult && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
                変換結果サマリー
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {conversionResult.metadata.conversionTime.toFixed(1)}ms
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">変換時間</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {conversionResult.metadata.rulesApplied}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">適用ルール</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {conversionResult.metadata.complexityScore}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">複雑度</div>
                </div>
                
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    conversionResult.success 
                      ? "text-green-700 dark:text-green-300" 
                      : "text-red-700 dark:text-red-300"
                  )}>
                    {conversionResult.success ? '✓' : '✗'}
                  </div>
                  <div className={cn(
                    "text-sm",
                    conversionResult.success
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {conversionResult.success ? '変換成功' : '変換失敗'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}