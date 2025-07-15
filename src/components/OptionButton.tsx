import React from 'react';
import { BlankItem } from '../types/problem';

export interface OptionButtonProps {
  option: BlankItem['options'][0];
  isSelected: boolean;
  isCorrect?: boolean;
  onSelect: () => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  isSelected,
  isCorrect,
  onSelect,
  disabled = false,
  showFeedback = false
}) => {
  // ボタンのスタイルクラスを取得
  const getButtonClasses = () => {
    const baseClasses = [
      'w-full',
      'p-3',
      'text-left',
      'border',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2'
    ];

    if (disabled) {
      baseClasses.push('opacity-50', 'cursor-not-allowed');
    } else {
      baseClasses.push('cursor-pointer');
    }

    // フィードバック表示時の色分け
    if (showFeedback && isCorrect !== undefined) {
      if (isCorrect) {
        // 正解の場合
        baseClasses.push(
          'bg-green-50',
          'border-green-300',
          'text-green-800',
          'hover:bg-green-100'
        );
      } else if (isSelected) {
        // 選択したが不正解の場合
        baseClasses.push(
          'bg-red-50',
          'border-red-300',
          'text-red-800',
          'hover:bg-red-100'
        );
      } else {
        // 選択していない不正解の場合
        baseClasses.push(
          'bg-gray-50',
          'border-gray-300',
          'text-gray-600',
          'hover:bg-gray-100'
        );
      }
    } else {
      // 通常の状態分け
      if (isSelected) {
        baseClasses.push(
          'bg-blue-50',
          'border-blue-300',
          'text-blue-800',
          'hover:bg-blue-100'
        );
      } else {
        baseClasses.push(
          'bg-white',
          'border-gray-300',
          'text-gray-700',
          'hover:bg-gray-50',
          'hover:border-blue-300'
        );
      }
    }

    return baseClasses.join(' ');
  };

  // アイコンのレンダリング
  const renderIcon = () => {
    if (!showFeedback || isCorrect === undefined) {
      return null;
    }

    if (isCorrect) {
      return (
        <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else if (isSelected) {
      return (
        <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <button
      className={getButtonClasses()}
      onClick={onSelect}
      disabled={disabled}
      aria-label={`選択肢 ${option.key}: ${option.value}`}
      aria-pressed={isSelected}
    >
      <div className="flex items-center">
        {/* 選択肢キー */}
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          <span className="font-mono font-bold text-gray-600 text-sm">
            {option.key}
          </span>
        </div>

        {/* 選択肢内容 */}
        <div className="flex-1">
          <div className="font-mono text-sm mb-1">
            {option.value}
          </div>
          <div className="text-xs text-gray-500">
            {option.description}
          </div>
        </div>

        {/* フィードバックアイコン */}
        {renderIcon()}
      </div>

      {/* 選択状態のインジケーター */}
      {isSelected && !showFeedback && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </button>
  );
};

export default OptionButton;