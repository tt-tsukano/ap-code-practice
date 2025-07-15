import React from 'react';

export interface SqlHighlightProps {
  code: string;
  theme?: 'light' | 'dark';
  onBlankClick?: (blankId: string) => void;
}

export interface HighlightRule {
  pattern: RegExp;
  className: string;
  priority: number;
}

// SQL用ハイライトルール
const SQL_HIGHLIGHT_RULES: HighlightRule[] = [
  {
    pattern: /\b(SELECT|FROM|WHERE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|GROUP BY|ORDER BY|HAVING|UNION|DISTINCT|AS|ON|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|ASC|DESC|LIMIT|OFFSET|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DATABASE|SCHEMA)\b/gi,
    className: 'sql-keyword',
    priority: 100
  },
  {
    pattern: /\b(SUM|COUNT|AVG|MAX|MIN|UPPER|LOWER|SUBSTRING|LENGTH|TRIM|COALESCE|CASE|WHEN|THEN|ELSE|END|CAST|CONVERT)\b/gi,
    className: 'sql-function',
    priority: 90
  },
  {
    pattern: /\b(INT|INTEGER|VARCHAR|CHAR|TEXT|DATE|DATETIME|TIMESTAMP|TIME|DECIMAL|NUMERIC|FLOAT|REAL|BOOLEAN|BOOL)\b/gi,
    className: 'sql-type',
    priority: 80
  },
  {
    pattern: /[=<>!]+|<>|!=|<=|>=|\+|\-|\*|\/|%/g,
    className: 'sql-operator',
    priority: 70
  },
  {
    pattern: /\b(\d+(?:\.\d+)?)\b/g,
    className: 'sql-number',
    priority: 60
  },
  {
    pattern: /'[^']*'/g,
    className: 'sql-string',
    priority: 50
  },
  {
    pattern: /--.*$/gm,
    className: 'sql-comment',
    priority: 40
  },
  {
    pattern: /\/\*[\s\S]*?\*\//g,
    className: 'sql-comment',
    priority: 40
  },
  {
    pattern: /\b(TRUE|FALSE|NULL)\b/gi,
    className: 'sql-constant',
    priority: 30
  }
];

export const SqlHighlight: React.FC<SqlHighlightProps> = ({
  code,
  theme = 'light',
  onBlankClick
}) => {
  // テーマに応じたスタイル
  const themeClasses = {
    light: {
      'sql-keyword': 'text-blue-600 font-semibold',
      'sql-function': 'text-purple-600 font-medium',
      'sql-type': 'text-yellow-600 font-medium',
      'sql-operator': 'text-red-600 font-bold',
      'sql-number': 'text-green-600',
      'sql-string': 'text-green-600',
      'sql-comment': 'text-gray-500 italic',
      'sql-constant': 'text-purple-600 font-medium',
      blank: 'bg-blue-100 border border-blue-300 px-2 py-1 rounded cursor-pointer hover:bg-blue-200'
    },
    dark: {
      'sql-keyword': 'text-blue-400 font-semibold',
      'sql-function': 'text-purple-400 font-medium',
      'sql-type': 'text-yellow-400 font-medium',
      'sql-operator': 'text-red-400 font-bold',
      'sql-number': 'text-green-400',
      'sql-string': 'text-green-400',
      'sql-comment': 'text-gray-400 italic',
      'sql-constant': 'text-purple-400 font-medium',
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
    const sortedRules = [...SQL_HIGHLIGHT_RULES].sort((a, b) => b.priority - a.priority);
    
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

  // インデントを保持してフォーマット
  const formatSql = (inputCode: string): string => {
    const lines = inputCode.split('\n');
    const formattedLines = lines.map(line => {
      // 基本的なインデント調整
      const trimmed = line.trim();
      if (trimmed.match(/^(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING)/i)) {
        return trimmed;
      }
      if (trimmed.match(/^(AND|OR)/i)) {
        return `  ${trimmed}`;
      }
      if (trimmed.match(/^(JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN)/i)) {
        return `  ${trimmed}`;
      }
      return line;
    });
    
    return formattedLines.join('\n');
  };

  // コードをフォーマットしてハイライト
  const formattedCode = formatSql(code);
  const highlightedCode = highlightCode(formattedCode);

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
      className="sql-highlight whitespace-pre-wrap"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};

export default SqlHighlight;