import React, { useMemo } from 'react';
import { BlankItem } from '../types/problem';
import { PseudoCodeHighlight } from './PseudoCodeHighlight';
import { SqlHighlight } from './SqlHighlight';

export interface CodeHighlighterProps {
  code: string;
  language: 'pseudo' | 'sql' | 'python';
  blanks?: BlankItem[];
  selectedAnswers?: Record<string, string>;
  onBlankClick?: (blankId: string) => void;
  showLineNumbers?: boolean;
  highlightBlanks?: boolean;
  theme?: 'light' | 'dark';
}

export interface HighlightRule {
  pattern: RegExp;
  className: string;
  priority: number;
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language,
  blanks = [],
  selectedAnswers = {},
  onBlankClick,
  showLineNumbers = false,
  highlightBlanks = true,
  theme = 'light'
}) => {
  // テーマに応じたスタイル
  const themeClasses = {
    light: {
      container: 'bg-gray-50 text-gray-900 border-gray-200',
      lineNumber: 'text-gray-400',
      keyword: 'text-blue-600',
      string: 'text-green-600',
      comment: 'text-gray-500',
      function: 'text-purple-600',
      operator: 'text-red-600',
      type: 'text-yellow-600',
      bracket: 'text-gray-600'
    },
    dark: {
      container: 'bg-gray-900 text-gray-100 border-gray-700',
      lineNumber: 'text-gray-500',
      keyword: 'text-blue-400',
      string: 'text-green-400',
      comment: 'text-gray-400',
      function: 'text-purple-400',
      operator: 'text-red-400',
      type: 'text-yellow-400',
      bracket: 'text-gray-400'
    }
  };

  const currentTheme = themeClasses[theme];

  // 行番号の表示
  const renderLineNumbers = (lines: string[]) => {
    if (!showLineNumbers) return null;

    return (
      <div className="flex flex-col pr-4 border-r border-gray-300 mr-4 select-none">
        {lines.map((_, index) => (
          <span
            key={index}
            className={`text-right ${currentTheme.lineNumber} text-sm font-mono`}
          >
            {index + 1}
          </span>
        ))}
      </div>
    );
  };

  // 穴埋めを処理したコードを生成
  const processedCode = useMemo(() => {
    if (!highlightBlanks || blanks.length === 0) {
      return code;
    }

    let processedCodeString = code;
    
    // 各穴埋めを処理
    blanks.forEach((blank) => {
      const blankId = blank.id;
      const selectedOption = selectedAnswers[blankId];
      const blankRegex = new RegExp(`\\[${blankId}\\]`, 'g');
      
      // 穴埋めを適切な要素に置換
      const blankContent = selectedOption || '空欄';
      const blankElement = `<span class="blank-item" data-blank-id="${blankId}">${blankContent}</span>`;
      
      processedCodeString = processedCodeString.replace(blankRegex, blankElement);
    });

    return processedCodeString;
  }, [code, blanks, selectedAnswers, highlightBlanks]);

  // 言語別のハイライト処理
  const renderHighlightedCode = () => {
    const lines = processedCode.split('\n');

    switch (language) {
      case 'pseudo':
        return (
          <PseudoCodeHighlight 
            code={processedCode}
            theme={theme}
            onBlankClick={onBlankClick}
          />
        );
      case 'sql':
        return (
          <SqlHighlight 
            code={processedCode}
            theme={theme}
            onBlankClick={onBlankClick}
          />
        );
      case 'python':
        return (
          <div className="font-mono text-sm whitespace-pre-wrap">
            {processedCode}
          </div>
        );
      default:
        return (
          <div className="font-mono text-sm whitespace-pre-wrap">
            {processedCode}
          </div>
        );
    }
  };

  // クリックハンドラー
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const blankId = target.getAttribute('data-blank-id');
    
    if (blankId && onBlankClick) {
      onBlankClick(blankId);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={`
      code-highlighter
      border
      rounded-lg
      p-4
      font-mono
      text-sm
      overflow-x-auto
      ${currentTheme.container}
    `}>
      <div className="flex">
        {/* 行番号 */}
        {renderLineNumbers(lines)}
        
        {/* コード本体 */}
        <div 
          className="flex-1 min-w-0"
          onClick={handleClick}
          style={{ cursor: onBlankClick ? 'pointer' : 'default' }}
        >
          {renderHighlightedCode()}
        </div>
      </div>
      
      {/* 言語表示 */}
      <div className="mt-2 pt-2 border-t border-gray-300">
        <span className={`text-xs ${currentTheme.lineNumber}`}>
          {language === 'pseudo' && '擬似言語'}
          {language === 'sql' && 'SQL'}
          {language === 'python' && 'Python'}
        </span>
      </div>
    </div>
  );
};

export default CodeHighlighter;