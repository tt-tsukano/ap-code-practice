import React, { useEffect, useRef } from 'react';
import { BlankItem } from '../types/problem';

export interface BlankItemTooltipProps {
  blank: BlankItem;
  onClose: () => void;
}

export const BlankItemTooltip: React.FC<BlankItemTooltipProps> = ({
  blank,
  onClose
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 外部クリックでツールチップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Escキーでツールチップを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={tooltipRef}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            ヒント: {blank.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="ツールチップを閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 穴埋めの説明 */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">穴埋めの説明</h4>
          <p className="text-gray-600 text-sm">{blank.description}</p>
        </div>

        {/* 種類 */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">種類</h4>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {blank.type === 'expression' && '式'}
            {blank.type === 'statement' && '文'}
            {blank.type === 'condition' && '条件'}
            {blank.type === 'variable' && '変数'}
          </span>
        </div>

        {/* 選択肢の詳細 */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">選択肢の詳細</h4>
          <div className="space-y-2">
            {blank.options.map((option) => (
              <div
                key={option.key}
                className="border rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-center mb-1">
                  <span className="font-mono font-bold text-gray-600 mr-2">
                    {option.key}
                  </span>
                  <span className="font-mono text-sm text-gray-800">
                    {option.value}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 解説 */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">解説</h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {blank.explanation}
            </p>
          </div>
        </div>

        {/* 正解のヒント */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">正解のヒント</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              正解は選択肢 <strong>{blank.correct}</strong> です
            </p>
          </div>
        </div>

        {/* 閉じるボタン */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlankItemTooltip;