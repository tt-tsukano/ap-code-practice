import React from 'react';

export interface ProgressIndicatorProps {
  totalBlanks: number;
  answeredBlanks: number;
  correctBlanks: number;
  currentBlank?: string;
  onBlankClick?: (blankId: string) => void;
  showScore?: boolean;
  animated?: boolean;
}

export interface ProgressState {
  completionRate: number; // 0-1
  accuracyRate: number;   // 0-1
  currentStreak: number;  // 連続正解数
  timeSpent: number;      // 秒
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalBlanks,
  answeredBlanks,
  correctBlanks,
  currentBlank,
  onBlankClick,
  showScore = true,
  animated = true
}) => {
  // 進捗率の計算
  const completionRate = totalBlanks > 0 ? answeredBlanks / totalBlanks : 0;
  const accuracyRate = answeredBlanks > 0 ? correctBlanks / answeredBlanks : 0;
  const score = Math.round(accuracyRate * 100);

  // プログレスバーのクラス
  const getProgressBarClasses = () => {
    const baseClasses = [
      'h-2',
      'rounded-full',
      'bg-gradient-to-r',
      'from-blue-500',
      'to-blue-600'
    ];

    if (animated) {
      baseClasses.push('transition-all', 'duration-500', 'ease-out');
    }

    return baseClasses.join(' ');
  };

  // スコア表示の色
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 個別穴埋めのステータスドット
  const renderBlankDots = () => {
    const dots = [];
    for (let i = 0; i < totalBlanks; i++) {
      const blankId = `blank_${i + 1}`;
      const isCompleted = i < answeredBlanks;
      const isCorrect = i < correctBlanks;
      const isCurrent = currentBlank === blankId;

      let dotClasses = [
        'w-3',
        'h-3',
        'rounded-full',
        'border-2',
        'cursor-pointer',
        'transition-all',
        'duration-200',
        'hover:scale-110'
      ];

      if (isCurrent) {
        dotClasses.push('ring-2', 'ring-blue-500', 'ring-offset-1');
      }

      if (isCompleted) {
        if (isCorrect) {
          dotClasses.push('bg-green-500', 'border-green-500');
        } else {
          dotClasses.push('bg-red-500', 'border-red-500');
        }
      } else {
        dotClasses.push('bg-gray-300', 'border-gray-300');
      }

      dots.push(
        <button
          key={blankId}
          className={dotClasses.join(' ')}
          onClick={() => onBlankClick?.(blankId)}
          aria-label={`穴埋め ${i + 1}${isCompleted ? (isCorrect ? ' (正解)' : ' (不正解)') : ' (未回答)'}`}
          title={`穴埋め ${i + 1}${isCompleted ? (isCorrect ? ' (正解)' : ' (不正解)') : ' (未回答)'}`}
        />
      );
    }

    return dots;
  };

  return (
    <div className="progress-indicator bg-white p-4 rounded-lg border shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">学習進捗</h3>
        {showScore && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">スコア:</span>
            <span className={`text-sm font-bold ${getScoreColor()}`}>
              {score}点
            </span>
          </div>
        )}
      </div>

      {/* メインプログレスバー */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">
            完了率
          </span>
          <span className="text-xs text-gray-600">
            {answeredBlanks} / {totalBlanks}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={getProgressBarClasses()}
            style={{ width: `${completionRate * 100}%` }}
          />
        </div>
      </div>

      {/* 正解率バー */}
      {answeredBlanks > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">
              正解率
            </span>
            <span className="text-xs text-gray-600">
              {correctBlanks} / {answeredBlanks} 正解
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                accuracyRate >= 0.8 
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : accuracyRate >= 0.6
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
              } ${animated ? 'transition-all duration-500 ease-out' : ''}`}
              style={{ width: `${accuracyRate * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 個別穴埋めの状況 */}
      {totalBlanks > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700">
              穴埋め状況
            </span>
            <span className="text-xs text-gray-600">
              クリックで移動
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {renderBlankDots()}
          </div>
        </div>
      )}

      {/* 統計情報 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(completionRate * 100)}%
            </div>
            <div className="text-xs text-gray-600">完了</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {correctBlanks}
            </div>
            <div className="text-xs text-gray-600">正解</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {answeredBlanks - correctBlanks}
            </div>
            <div className="text-xs text-gray-600">不正解</div>
          </div>
        </div>
      </div>

      {/* 完了時の祝福メッセージ */}
      {completionRate === 1 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              すべての穴埋めが完了しました！
            </span>
          </div>
          {score >= 80 && (
            <p className="text-xs text-green-600 mt-1">
              素晴らしい成績です！次のステップに進みましょう。
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;