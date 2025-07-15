import React, { useState, useRef, useEffect } from 'react';
import { BlankItem as BlankItemType } from '../types/problem';
import { BlankItemTooltip } from './BlankItemTooltip';

export interface BlankItemProps {
  blank: BlankItemType;
  selectedOption?: string;
  isCorrect?: boolean;
  showHint?: boolean;
  onSelect: (option: string) => void;
  onHintRequest: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface BlankItemState {
  isOpen: boolean; // 選択肢展開状態
  hoveredOption: string | null;
  showTooltip: boolean;
}

export const BlankItem: React.FC<BlankItemProps> = ({
  blank,
  selectedOption,
  isCorrect,
  showHint = false,
  onSelect,
  onHintRequest,
  disabled = false,
  size = 'medium'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // キーボードイベントハンドラー
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // 次の選択肢にフォーカス
          const currentIndex = blank.options.findIndex(opt => opt.key === hoveredOption);
          const nextIndex = currentIndex < blank.options.length - 1 ? currentIndex + 1 : 0;
          setHoveredOption(blank.options[nextIndex].key);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          // 前の選択肢にフォーカス
          const currentIndex = blank.options.findIndex(opt => opt.key === hoveredOption);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : blank.options.length - 1;
          setHoveredOption(blank.options[prevIndex].key);
        }
        break;
    }
  };

  // 選択肢の選択処理
  const handleOptionSelect = (optionKey: string) => {
    if (disabled) return;
    onSelect(optionKey);
    setIsOpen(false);
  };

  // サイズに応じたスタイル
  const sizeClasses = {
    small: 'text-xs px-2 py-1 min-w-8',
    medium: 'text-sm px-3 py-2 min-w-12',
    large: 'text-base px-4 py-3 min-w-16'
  };

  const dropdownSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // 状態に応じたスタイル
  const getBlankItemClasses = () => {
    const baseClasses = [
      'relative',
      'inline-block',
      'border',
      'rounded',
      'cursor-pointer',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      sizeClasses[size]
    ];

    if (disabled) {
      baseClasses.push('opacity-50', 'cursor-not-allowed');
    } else {
      baseClasses.push('hover:border-blue-300');
    }

    // 状態に応じた色分け
    if (isCorrect === true) {
      baseClasses.push('bg-green-100', 'border-green-300', 'text-green-800');
    } else if (isCorrect === false) {
      baseClasses.push('bg-red-100', 'border-red-300', 'text-red-800');
    } else if (selectedOption) {
      baseClasses.push('bg-blue-100', 'border-blue-300', 'text-blue-800');
    } else {
      baseClasses.push('bg-gray-100', 'border-gray-300', 'text-gray-500');
    }

    if (isOpen) {
      baseClasses.push('ring-2', 'ring-blue-500');
    }

    return baseClasses.join(' ');
  };

  // 選択肢のレンダリング
  const renderOptions = () => {
    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
        {blank.options.map((option) => {
          const isSelected = selectedOption === option.key;
          const isHovered = hoveredOption === option.key;
          
          const optionClasses = [
            'block',
            'w-full',
            'px-3',
            'py-2',
            'text-left',
            'border-b',
            'border-gray-100',
            'last:border-b-0',
            'transition-colors',
            'duration-150',
            dropdownSizeClasses[size]
          ];

          if (isSelected) {
            optionClasses.push('bg-blue-50', 'text-blue-800');
          } else if (isHovered) {
            optionClasses.push('bg-gray-50');
          }

          optionClasses.push('hover:bg-gray-50');

          return (
            <button
              key={option.key}
              className={optionClasses.join(' ')}
              onClick={() => handleOptionSelect(option.key)}
              onMouseEnter={() => setHoveredOption(option.key)}
              onMouseLeave={() => setHoveredOption(null)}
              disabled={disabled}
            >
              <div className="flex items-center">
                <span className="font-mono font-bold mr-2 text-gray-600">
                  {option.key}
                </span>
                <span className="flex-1 text-gray-900">
                  {option.value}
                </span>
              </div>
              {showHint && (
                <div className="text-xs text-gray-500 mt-1">
                  {option.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className={getBlankItemClasses()}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={`穴埋め ${blank.id}: ${blank.description}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
      >
        <div className="flex items-center">
          <span className="font-mono">
            {selectedOption || '空欄'}
          </span>
          {!disabled && (
            <svg
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        
        {/* 状態インジケーター */}
        {isCorrect !== undefined && (
          <div className="absolute -top-1 -right-1">
            {isCorrect ? (
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
        )}
      </button>

      {/* ドロップダウン */}
      {renderOptions()}

      {/* ヒントボタン */}
      {showHint && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white hover:bg-yellow-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onHintRequest();
            setShowTooltip(true);
          }}
          aria-label="ヒントを表示"
        >
          ?
        </button>
      )}

      {/* ツールチップ */}
      {showTooltip && (
        <BlankItemTooltip
          blank={blank}
          onClose={() => setShowTooltip(false)}
        />
      )}
    </div>
  );
};

export default BlankItem;