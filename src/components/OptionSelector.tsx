import React from 'react';
import { BlankItem } from '../types/problem';
import { OptionButton } from './OptionButton';

export interface OptionSelectorProps {
  options: BlankItem['options'];
  selectedOption?: string;
  correctOption?: string;
  onSelect: (option: string) => void;
  showCorrectness?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedOption,
  correctOption,
  onSelect,
  showCorrectness = false,
  disabled = false,
  layout = 'grid'
}) => {
  // レイアウトに応じたコンテナクラス
  const getContainerClasses = () => {
    const baseClasses = ['option-selector'];
    
    switch (layout) {
      case 'horizontal':
        return [...baseClasses, 'flex', 'flex-wrap', 'gap-2'];
      case 'vertical':
        return [...baseClasses, 'flex', 'flex-col', 'gap-2'];
      case 'grid':
        return [...baseClasses, 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-2'];
      default:
        return [...baseClasses, 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-2'];
    }
  };

  return (
    <div className={getContainerClasses().join(' ')}>
      {options.map((option) => (
        <OptionButton
          key={option.key}
          option={option}
          isSelected={selectedOption === option.key}
          isCorrect={
            showCorrectness && correctOption
              ? option.key === correctOption
              : undefined
          }
          onSelect={() => onSelect(option.key)}
          disabled={disabled}
          showFeedback={showCorrectness}
        />
      ))}
    </div>
  );
};

export default OptionSelector;