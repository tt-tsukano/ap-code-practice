import React from 'react';
import { BlankItem } from '../types/problem';

export interface OptionDescriptionProps {
  option: BlankItem['options'][0];
  isSelected?: boolean;
  isCorrect?: boolean;
  showDetailedExplanation?: boolean;
}

export const OptionDescription: React.FC<OptionDescriptionProps> = ({
  option,
  isSelected = false,
  isCorrect,
  showDetailedExplanation = false
}) => {
  // 状態に応じたスタイルクラス
  const getContainerClasses = () => {
    const baseClasses = [
      'option-description',
      'p-4',
      'rounded-lg',
      'border',
      'transition-all',
      'duration-200'
    ];

    if (isCorrect === true) {
      baseClasses.push('bg-green-50', 'border-green-200');
    } else if (isCorrect === false && isSelected) {
      baseClasses.push('bg-red-50', 'border-red-200');
    } else if (isSelected) {
      baseClasses.push('bg-blue-50', 'border-blue-200');
    } else {
      baseClasses.push('bg-gray-50', 'border-gray-200');
    }

    return baseClasses.join(' ');
  };

  // ステータスバッジのレンダリング
  const renderStatusBadge = () => {
    if (isCorrect === undefined) return null;

    if (isCorrect) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          正解
        </span>
      );
    } else if (isSelected) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          不正解
        </span>
      );
    }

    return null;
  };

  // 詳細説明のレンダリング
  const renderDetailedExplanation = () => {
    if (!showDetailedExplanation) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">詳細説明</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {option.description}
        </p>
      </div>
    );
  };

  return (
    <div className={getContainerClasses()}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-mono font-bold text-sm mr-2">
            {option.key}
          </span>
          <span className="text-sm font-medium text-gray-900">
            選択肢 {option.key}
          </span>
        </div>
        {renderStatusBadge()}
      </div>

      {/* 選択肢の値 */}
      <div className="mb-2">
        <div className="font-mono text-sm bg-white p-2 rounded border">
          {option.value}
        </div>
      </div>

      {/* 基本説明 */}
      <div className="text-sm text-gray-600 mb-2">
        {option.description}
      </div>

      {/* 詳細説明 */}
      {renderDetailedExplanation()}

      {/* 選択状態のインジケーター */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            選択中
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionDescription;