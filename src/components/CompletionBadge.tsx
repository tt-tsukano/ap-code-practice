import React from 'react';

export interface CompletionBadgeProps {
  isCompleted: boolean;
  score?: number;
  timestamp?: Date;
  size?: 'small' | 'medium' | 'large';
  showAnimation?: boolean;
}

export const CompletionBadge: React.FC<CompletionBadgeProps> = ({
  isCompleted,
  score,
  timestamp,
  size = 'medium',
  showAnimation = true
}) => {
  // 完了していない場合は表示しない
  if (!isCompleted) return null;

  // スコアに基づく評価とスタイル
  const getPerformanceInfo = () => {
    if (!score) return { level: 'completed', color: 'blue', label: '完了' };
    
    if (score >= 90) return { level: 'excellent', color: 'green', label: '優秀' };
    if (score >= 80) return { level: 'good', color: 'blue', label: '良好' };
    if (score >= 70) return { level: 'fair', color: 'yellow', label: '合格' };
    return { level: 'poor', color: 'red', label: '要復習' };
  };

  const performanceInfo = getPerformanceInfo();

  // サイズに応じたスタイル
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          badge: 'w-6 h-6 text-xs'
        };
      case 'large':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-6 h-6',
          badge: 'w-12 h-12 text-lg'
        };
      default: // medium
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'w-4 h-4',
          badge: 'w-8 h-8 text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // 色のスタイル
  const getColorClasses = () => {
    switch (performanceInfo.color) {
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          badge: 'bg-green-500'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          badge: 'bg-blue-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          badge: 'bg-yellow-500'
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          badge: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          badge: 'bg-gray-500'
        };
    }
  };

  const colorClasses = getColorClasses();

  // アニメーションクラス
  const getAnimationClasses = () => {
    if (!showAnimation) return '';
    
    return 'animate-pulse-once transform transition-all duration-500 hover:scale-105';
  };

  // 完了アイコン
  const renderCompletionIcon = () => {
    if (performanceInfo.level === 'excellent') {
      return (
        <svg className={`${sizeClasses.icon} text-yellow-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    
    return (
      <svg className={`${sizeClasses.icon} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  // 時間表示
  const renderTimestamp = () => {
    if (!timestamp) return null;
    
    const formatDate = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}日前`;
      if (hours > 0) return `${hours}時間前`;
      if (minutes > 0) return `${minutes}分前`;
      return '今完了';
    };

    return (
      <div className="text-xs text-gray-500 mt-1">
        {formatDate(timestamp)}
      </div>
    );
  };

  return (
    <div className={`completion-badge ${getAnimationClasses()}`}>
      {/* メインバッジ */}
      <div className={`
        inline-flex items-center rounded-full border
        ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}
        ${sizeClasses.container}
      `}>
        {/* 完了アイコン */}
        <div className={`
          flex items-center justify-center rounded-full
          ${colorClasses.badge} ${sizeClasses.badge}
          mr-2
        `}>
          {renderCompletionIcon()}
        </div>

        {/* テキスト情報 */}
        <div className="flex flex-col">
          <span className="font-medium">
            {performanceInfo.label}
          </span>
          {score && (
            <span className="text-xs opacity-75">
              {score}点
            </span>
          )}
        </div>

        {/* 優秀な成績の場合の特別エフェクト */}
        {performanceInfo.level === 'excellent' && showAnimation && (
          <div className="ml-2">
            <div className="flex">
              <span className="text-yellow-400 animate-bounce">⭐</span>
              <span className="text-yellow-400 animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
              <span className="text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
            </div>
          </div>
        )}
      </div>

      {/* タイムスタンプ */}
      {size !== 'small' && renderTimestamp()}
    </div>
  );
};

// CSS アニメーション用の追加スタイル（必要に応じて）
const completionBadgeStyles = `
  @keyframes animate-pulse-once {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-pulse-once {
    animation: animate-pulse-once 0.6s ease-in-out;
  }
`;

export default CompletionBadge;