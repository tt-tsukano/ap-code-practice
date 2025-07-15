import React from 'react';

export interface PseudoCodeHighlightProps {
  code: string;
  theme?: 'light' | 'dark';
  onBlankClick?: (blankId: string) => void;
}

export interface HighlightRule {
  pattern: RegExp;
  className: string;
  priority: number;
}

// 擬似言語用ハイライトルール
const PSEUDO_HIGHLIGHT_RULES: HighlightRule[] = [
  {
    pattern: /\b(手続き|もし|ならば|そうでなければ|を|から|まで|ずつ増やす|繰り返す|の間|実行する|戻る|終了)\b/g,
    className: 'keyword',
    priority: 100
  },
  {
    pattern: /\b(整数型|文字列型|配列|実数型|論理型)[:：]/g,
    className: 'type',
    priority: 90
  },
  {
    pattern: /[←]/g,
    className: 'operator',
    priority: 80
  },
  {
    pattern: /\[.*?\]/g,
    className: 'bracket',
    priority: 70
  },
  {
    pattern: /\b(\d+)\b/g,
    className: 'number',
    priority: 60
  },
  {
    pattern: /"[^"]*"/g,
    className: 'string',
    priority: 50
  },
  {
    pattern: /\/\/.*$/gm,
    className: 'comment',
    priority: 40
  },
  {
    pattern: /\b(true|false|真|偽)\b/g,
    className: 'boolean',
    priority: 30
  }
];

export const PseudoCodeHighlight: React.FC<PseudoCodeHighlightProps> = ({
  code,
  theme = 'light',
  onBlankClick
}) => {
  // テーマに応じたスタイル
  const themeClasses = {
    light: {
      keyword: 'text-blue-600 font-semibold',
      type: 'text-yellow-600 font-medium',
      operator: 'text-red-600 font-bold',
      bracket: 'text-gray-600',
      number: 'text-green-600',
      string: 'text-green-600',
      comment: 'text-gray-500 italic',
      boolean: 'text-purple-600 font-medium',
      blank: 'bg-blue-100 border border-blue-300 px-2 py-1 rounded cursor-pointer hover:bg-blue-200'
    },
    dark: {
      keyword: 'text-blue-400 font-semibold',
      type: 'text-yellow-400 font-medium',
      operator: 'text-red-400 font-bold',
      bracket: 'text-gray-400',
      number: 'text-green-400',
      string: 'text-green-400',
      comment: 'text-gray-400 italic',
      boolean: 'text-purple-400 font-medium',
      blank: 'bg-blue-900 border border-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-800'
    }
  };

  const currentTheme = themeClasses[theme];

  // ハイライト処理
  const highlightCode = (inputCode: string): string => {
    let highlightedCode = inputCode;
    
    // 穴埋めを先に処理
    highlightedCode = highlightedCode.replace(
      /<span class="blank-item" data-blank-id="([^"]*)">(.*?)<\/span>/g,
      `<span class="${currentTheme.blank}" data-blank-id="$1">$2</span>`
    );

    // 優先度順にルールを適用
    const sortedRules = [...PSEUDO_HIGHLIGHT_RULES].sort((a, b) => b.priority - a.priority);
    
    sortedRules.forEach((rule) => {
      const className = currentTheme[rule.className as keyof typeof currentTheme] || '';
      
      // 既にハイライトされている部分を避けるため、HTMLタグ外のテキストのみ処理
      highlightedCode = highlightedCode.replace(
        rule.pattern,
        (match) => `<span class="${className}">${match}</span>`
      );
    });

    return highlightedCode;
  };

  // コードをハイライト
  const highlightedCode = highlightCode(code);

  // クリックハンドラー
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const blankId = target.getAttribute('data-blank-id');
    
    if (blankId && onBlankClick) {
      onBlankClick(blankId);
    }
  };

  return (
    <div 
      className="pseudo-code-highlight whitespace-pre-wrap"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};

export default PseudoCodeHighlight;