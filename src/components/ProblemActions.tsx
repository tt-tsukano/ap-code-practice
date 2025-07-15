import React from 'react';

interface ProblemActionsProps {
  currentStep: 'reading' | 'solving' | 'validation' | 'completed';
  progress: {
    totalBlanks: number;
    answeredBlanks: number;
    correctBlanks: number;
    score: number;
    isComplete: boolean;
  };
  showHints: boolean;
  onValidationRequest: () => void;
  onExecutionRequest: () => void;
  onHintToggle: () => void;
}

export const ProblemActions: React.FC<ProblemActionsProps> = ({
  currentStep,
  progress,
  showHints,
  onValidationRequest,
  onExecutionRequest,
  onHintToggle
}) => {
  // 次のステップへの進行可能性
  const canValidate = progress.answeredBlanks > 0;
  const canExecute = progress.isComplete && currentStep === 'validation';
  const isCompleted = currentStep === 'completed';

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">アクション</h3>
      
      <div className="space-y-3">
        {/* ヒント切り替え */}
        <button
          onClick={onHintToggle}
          className="w-full flex items-center justify-center px-4 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showHints ? 'ヒントを隠す' : 'ヒントを表示'}
        </button>

        {/* 回答確認ボタン */}
        {currentStep === 'solving' && (
          <button
            onClick={onValidationRequest}
            disabled={!canValidate}
            className={`
              w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-colors
              ${canValidate 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            回答を確認
          </button>
        )}

        {/* 実行・検証ボタン */}
        {currentStep === 'validation' && (
          <button
            onClick={onExecutionRequest}
            disabled={!canExecute}
            className={`
              w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-colors
              ${canExecute 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-4-8V3a2 2 0 114 0v3.5M18 16.5v2.25A2.25 2.25 0 0115.75 21H8.25A2.25 2.25 0 016 18.75V16.5m12 0h-5.25l-3.75 3.75-3.75-3.75H6" />
            </svg>
            実行・検証
          </button>
        )}

        {/* 完了時のアクション */}
        {isCompleted && (
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              再挑戦
            </button>
            
            <button
              onClick={() => window.open('/', '_blank')}
              className="w-full flex items-center justify-center px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              他の問題を見る
            </button>
          </div>
        )}
      </div>

      {/* 現在の状態表示 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>現在の状態:</span>
            <span className="font-medium">
              {currentStep === 'reading' && '問題読解中'}
              {currentStep === 'solving' && '解答入力中'}
              {currentStep === 'validation' && '回答確認中'}
              {currentStep === 'completed' && '完了'}
            </span>
          </div>
          {progress.answeredBlanks > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span>回答進捗:</span>
              <span className="font-medium">
                {progress.answeredBlanks} / {progress.totalBlanks}
              </span>
            </div>
          )}
          {currentStep === 'validation' || currentStep === 'completed' ? (
            <div className="flex justify-between items-center mt-1">
              <span>正解率:</span>
              <span className={`font-medium ${progress.score >= 80 ? 'text-green-600' : progress.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round((progress.correctBlanks / progress.answeredBlanks) * 100)}%
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* 進捗に応じたメッセージ */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          {currentStep === 'reading' && '問題文をよく読んで、設定を理解しましょう。'}
          {currentStep === 'solving' && '穴埋め箇所を順番に埋めていきましょう。'}
          {currentStep === 'validation' && '回答を確認してから実行・検証に進みましょう。'}
          {currentStep === 'completed' && 'お疲れ様でした！解説を確認して理解を深めましょう。'}
        </p>
      </div>
    </div>
  );
};

export default ProblemActions;