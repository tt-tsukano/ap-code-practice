import React from 'react';

export interface ScoreDisplayProps {
  score: number; // 0-100
  maxScore?: number;
  showGrade?: boolean;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  maxScore = 100,
  showGrade = true,
  showPercentage = true,
  size = 'medium',
  animated = true
}) => {
  // スコアの正規化（0-100）
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const percentage = (normalizedScore / maxScore) * 100;

  // グレードの計算
  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  // スコアの色
  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // サイズに応じたスタイル
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-2',
          score: 'text-lg',
          label: 'text-xs',
          grade: 'text-sm'
        };
      case 'large':
        return {
          container: 'p-6',
          score: 'text-4xl',
          label: 'text-base',
          grade: 'text-xl'
        };
      default: // medium
        return {
          container: 'p-4',
          score: 'text-2xl',
          label: 'text-sm',
          grade: 'text-lg'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const gradeInfo = getGrade();

  // 円形プログレスバー
  const renderCircularProgress = () => {
    const radius = size === 'large' ? 30 : size === 'small' ? 15 : 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg 
          className={`transform -rotate-90 ${size === 'large' ? 'w-20 h-20' : size === 'small' ? 'w-10 h-10' : 'w-16 h-16'}`}
          viewBox={`0 0 ${(radius + 5) * 2} ${(radius + 5) * 2}`}
        >
          {/* 背景円 */}
          <circle
            cx={radius + 5}
            cy={radius + 5}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          {/* 進捗円 */}
          <circle
            cx={radius + 5}
            cy={radius + 5}
            r={radius}
            fill="none"
            stroke={percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={animated ? 'transition-all duration-1000 ease-out' : ''}
          />
        </svg>
        
        {/* 中央のスコア */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${getScoreColor()} ${sizeClasses.score}`}>
            {Math.round(percentage)}
          </span>
        </div>
      </div>
    );
  };

  // 成績メッセージ
  const getScoreMessage = () => {
    if (percentage >= 90) return '優秀！';
    if (percentage >= 80) return '良好！';
    if (percentage >= 70) return '合格！';
    if (percentage >= 60) return '要復習';
    return '要学習';
  };

  return (
    <div className={`score-display bg-white rounded-lg border shadow-sm ${sizeClasses.container}`}>
      <div className="text-center">
        {/* 円形プログレスバー */}
        <div className="flex justify-center mb-3">
          {renderCircularProgress()}
        </div>

        {/* スコア情報 */}
        <div className="space-y-1">
          {showPercentage && (
            <div className={`font-medium text-gray-900 ${sizeClasses.label}`}>
              {Math.round(percentage)}% ({normalizedScore}/{maxScore})
            </div>
          )}
          
          {showGrade && (
            <div className={`font-bold ${gradeInfo.color} ${sizeClasses.grade}`}>
              {gradeInfo.grade}
            </div>
          )}
          
          <div className={`text-gray-600 ${sizeClasses.label}`}>
            {getScoreMessage()}
          </div>
        </div>

        {/* パフォーマンス詳細 */}
        {size !== 'small' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className={`font-semibold ${getScoreColor()}`}>
                  {normalizedScore}
                </div>
                <div className="text-xs text-gray-600">獲得点数</div>
              </div>
              <div>
                <div className={`font-semibold ${gradeInfo.color}`}>
                  {gradeInfo.grade}
                </div>
                <div className="text-xs text-gray-600">評価</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;