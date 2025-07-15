import React from 'react';
import { AlgorithmProblem, DatabaseProblem, ExecutionResult } from '../types/problem';
import { ProblemHeader } from './ProblemHeader';
import { ProblemContent } from './ProblemContent';
import { ProblemActions } from './ProblemActions';
import { BlankFillEditor } from './BlankFillEditor';
import { ProgressIndicator } from './ProgressIndicator';
import { ScoreDisplay } from './ScoreDisplay';
import { CompletionBadge } from './CompletionBadge';

interface ProblemLayoutProps {
  problem: AlgorithmProblem | DatabaseProblem;
  selectedAnswers: Record<string, string>;
  validationResults: Record<string, boolean>;
  showHints: boolean;
  currentStep: 'reading' | 'solving' | 'validation' | 'completed';
  executionResults?: ExecutionResult;
  onAnswerChange: (blankId: string, selectedOption: string) => void;
  onValidationRequest: () => void;
  onExecutionRequest: () => void;
  onHintToggle: () => void;
}

export const ProblemLayout: React.FC<ProblemLayoutProps> = ({
  problem,
  selectedAnswers,
  validationResults,
  showHints,
  currentStep,
  executionResults,
  onAnswerChange,
  onValidationRequest,
  onExecutionRequest,
  onHintToggle
}) => {
  // 進捗計算
  const calculateProgress = () => {
    const blanks = problem.category === 'algorithm' 
      ? (problem as AlgorithmProblem).blanks
      : (problem as DatabaseProblem).queries.flatMap(q => q.blanks);
    
    const totalBlanks = blanks.length;
    const answeredBlanks = Object.keys(selectedAnswers).length;
    const correctBlanks = Object.values(validationResults).filter(Boolean).length;
    const score = totalBlanks > 0 ? Math.round((correctBlanks / totalBlanks) * 100) : 0;
    
    return {
      totalBlanks,
      answeredBlanks,
      correctBlanks,
      score,
      isComplete: answeredBlanks === totalBlanks
    };
  };

  const progress = calculateProgress();

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

            {/* 実行結果 */}
            {executionResults && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">実行結果</h3>
                {executionResults.success ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-800 font-medium">実行成功</span>
                      </div>
                      <pre className="text-sm text-green-700 bg-green-100 p-3 rounded">
                        {executionResults.output}
                      </pre>
                    </div>
                    <div className="text-sm text-gray-600">
                      実行時間: {executionResults.executionTime}ms
                      {executionResults.memoryUsage && (
                        <span className="ml-4">メモリ使用量: {executionResults.memoryUsage}KB</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800 font-medium">実行エラー</span>
                    </div>
                    <pre className="text-sm text-red-700 bg-red-100 p-3 rounded">
                      {executionResults.error}
                    </pre>
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
                score={progress.score}
                showGrade={true}
                showPercentage={true}
                animated={true}
              />
            ) : null}

            {/* 完了バッジ */}
            {currentStep === 'completed' && (
              <CompletionBadge
                isCompleted={true}
                score={progress.score}
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
              onExecutionRequest={onExecutionRequest}
              onHintToggle={onHintToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemLayout;