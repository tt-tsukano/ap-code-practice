import React, { useState, useCallback } from 'react';
import { AlgorithmProblem, DatabaseProblem, ExecutionResult } from '../types/problem';
import { ProblemHeader } from './ProblemHeader';
import { ProblemContent } from './ProblemContent';
import { ProblemActions } from './ProblemActions';
import { BlankFillEditor } from './BlankFillEditor';
import { ProgressIndicator } from './ProgressIndicator';
import { ScoreDisplay } from './ScoreDisplay';
import { CompletionBadge } from './CompletionBadge';
import { PseudoCodeConverter, ConversionResult, ConversionOptions } from '@/lib/pseudo-converter';
import { ConversionPreview } from './ConversionPreview';
import { PyodideRunner } from './PyodideRunner';

interface ProblemLayoutProps {
  problem: AlgorithmProblem | DatabaseProblem;
  selectedAnswers: Record<string, string>;
  validationResults: Record<string, boolean>;
  showHints: boolean;
  currentStep: 'reading' | 'solving' | 'validation' | 'completed';
  score: number;
  onAnswerChange: (blankId: string, selectedOption: string) => void;
  onValidationRequest: () => void;
  onToggleHints: () => void;
  onReset: () => void;
}

export const ProblemLayout: React.FC<ProblemLayoutProps> = ({
  problem,
  selectedAnswers,
  validationResults,
  showHints,
  currentStep,
  score,
  onAnswerChange,
  onValidationRequest,
  onToggleHints,
  onReset
}) => {
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [showConverter, setShowConverter] = useState(false);
  const [pythonCode, setPythonCode] = useState('');
  // 進捗計算
  const calculateProgress = () => {
    const blanks = problem.category === 'algorithm' 
      ? (problem as AlgorithmProblem).blanks
      : (problem as DatabaseProblem).queries.flatMap(q => q.blanks);
    
    const totalBlanks = blanks.length;
    const answeredBlanks = Object.keys(selectedAnswers).length;
    const correctBlanks = Object.values(validationResults).filter(Boolean).length;
    
    return {
      totalBlanks,
      answeredBlanks,
      correctBlanks,
      score,
      isComplete: answeredBlanks === totalBlanks
    };
  };

  const progress = calculateProgress();

  // 擬似コード変換処理
  const handleConversionPreview = useCallback(async () => {
    if (!problem || problem.category !== 'algorithm') return;

    try {
      const algorithmProblem = problem as AlgorithmProblem;
      
      // 穴埋め回答を反映したコードを生成
      let codeWithAnswers = algorithmProblem.pseudoCode;
      Object.entries(selectedAnswers).forEach(([blankId, answer]) => {
        const blank = algorithmProblem.blanks.find(b => b.id === blankId);
        if (blank && answer) {
          const option = blank.options.find(opt => opt.key === answer);
          if (option) {
            codeWithAnswers = codeWithAnswers.replace(
              `【${blankId.replace('blank_', '').toUpperCase()}】`, 
              option.value
            );
          }
        }
      });

      // Python変換実行
      const options: ConversionOptions = {
        includeComments: true,
        validateOutput: true,
        method: 'hybrid'
      };

      const result = PseudoCodeConverter.convert(codeWithAnswers, options);
      setConversionResult(result);
      
      if (result.success) {
        setPythonCode(result.pythonCode);
        setShowConverter(true);
      }
    } catch (error) {
      console.error('Conversion error:', error);
    }
  }, [problem, selectedAnswers]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <ProblemHeader
        problem={problem}
        progress={progress}
        currentStep={currentStep}
      />

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左パネル - 問題文とコードエディタ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 問題コンテンツ */}
            <ProblemContent
              problem={problem}
              currentStep={currentStep}
            />

            {/* 穴埋めエディタ */}
            <div className="bg-white rounded-lg shadow-sm">
              <BlankFillEditor
                problem={problem}
                selectedAnswers={selectedAnswers}
                onAnswerChange={onAnswerChange}
                onValidationRequest={onValidationRequest}
                validationResults={validationResults}
                showHints={showHints}
                disabled={currentStep === 'completed'}
              />
            </div>

            {/* Python変換・実行セクション */}
            {showConverter && conversionResult && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Python変換・実行</h3>
                
                <ConversionPreview
                  pseudoCode={problem.category === 'algorithm' ? (problem as AlgorithmProblem).pseudoCode : ''}
                  showSteps={false}
                  autoUpdate={false}
                  onConversionComplete={setConversionResult}
                />
                
                {conversionResult.success && (
                  <div className="mt-4">
                    <PyodideRunner
                      initialCode={conversionResult.pythonCode}
                      onExecutionComplete={(result) => {
                        console.log('Python execution result:', result);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右パネル - 進捗・ヒント・アクション */}
          <div className="space-y-6">
            {/* 進捗インジケーター */}
            <ProgressIndicator
              totalBlanks={progress.totalBlanks}
              answeredBlanks={progress.answeredBlanks}
              correctBlanks={progress.correctBlanks}
              showScore={true}
              animated={true}
            />

            {/* スコア表示 */}
            {currentStep === 'validation' || currentStep === 'completed' ? (
              <ScoreDisplay
                score={score}
                showGrade={true}
                showPercentage={true}
                animated={true}
              />
            ) : null}

            {/* 完了バッジ */}
            {currentStep === 'completed' && (
              <CompletionBadge
                isCompleted={true}
                score={score}
                timestamp={new Date()}
                showAnimation={true}
              />
            )}

            {/* ヒント表示 */}
            {showHints && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-3">ヒント</h3>
                <div className="space-y-2">
                  {problem.hints.map((hint, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          {index + 1}
                        </span>
                        <p className="text-sm text-yellow-800">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <ProblemActions
              currentStep={currentStep}
              progress={progress}
              showHints={showHints}
              onValidationRequest={onValidationRequest}
              onExecutionRequest={handleConversionPreview}
              onHintToggle={onToggleHints}
              onReset={onReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemLayout;