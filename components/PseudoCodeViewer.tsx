/**
 * 擬似言語表示コンポーネント
 * 擬似言語のシンタックスハイライトと空欄強調表示
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PseudoCodeViewerProps {
  pseudoCode: string;
  highlightBlanks?: boolean;
  onBlankClick?: (blankId: string) => void;
  readOnly?: boolean;
  className?: string;
}

interface BlankInfo {
  id: string;
  line: number;
  text: string;
  startIndex: number;
  endIndex: number;
}

export function PseudoCodeViewer({
  pseudoCode,
  highlightBlanks = false,
  onBlankClick,
  readOnly = true,
  className
}: PseudoCodeViewerProps) {
  const [processedCode, setProcessedCode] = useState<string>('');
  const [blanks, setBlanks] = useState<BlankInfo[]>([]);

  useEffect(() => {
    processPseudoCode();
  }, [pseudoCode, highlightBlanks]);

  const processPseudoCode = () => {
    if (!highlightBlanks) {
      setProcessedCode(pseudoCode);
      return;
    }

    const lines = pseudoCode.split('\n');
    const foundBlanks: BlankInfo[] = [];
    let processed = '';

    lines.forEach((line, lineIndex) => {
      // 空欄パターンを検索 (例: ［ア］, ［イ］など)
      const blankPattern = /［([ア-ン])］/g;
      let match;
      let lastIndex = 0;
      let processedLine = '';

      while ((match = blankPattern.exec(line)) !== null) {
        const blankId = match[1];
        const blankText = match[0];
        
        // 空欄情報を記録
        foundBlanks.push({
          id: blankId,
          line: lineIndex + 1,
          text: blankText,
          startIndex: match.index,
          endIndex: match.index + blankText.length
        });

        // 空欄をクリック可能な要素に置換
        processedLine += line.substring(lastIndex, match.index);
        processedLine += `<span class="pseudo-blank" data-blank-id="${blankId}" data-line="${lineIndex + 1}">${blankText}</span>`;
        lastIndex = match.index + blankText.length;
      }

      processedLine += line.substring(lastIndex);
      processed += processedLine + '\n';
    });

    setBlanks(foundBlanks);
    setProcessedCode(processed);
  };

  const handleBlankClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onBlankClick || readOnly) return;

    const target = event.target as HTMLElement;
    if (target.classList.contains('pseudo-blank')) {
      const blankId = target.getAttribute('data-blank-id');
      if (blankId) {
        onBlankClick(blankId);
      }
    }
  };

  const getHighlightedCode = () => {
    if (!highlightBlanks) {
      return highlightSyntax(pseudoCode);
    }

    return highlightSyntax(processedCode);
  };

  return (
    <div className={cn("pseudo-code-viewer", className)}>
      <div 
        className={cn(
          "font-mono text-sm leading-relaxed p-4 rounded-lg border",
          "bg-slate-50 dark:bg-slate-900",
          "border-slate-200 dark:border-slate-700",
          !readOnly && "cursor-pointer"
        )}
        onClick={handleBlankClick}
        dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
      />
      
      {highlightBlanks && blanks.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            空欄一覧
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {blanks.map((blank) => (
              <div
                key={`${blank.line}-${blank.id}`}
                className={cn(
                  "text-xs px-2 py-1 rounded border",
                  "bg-white dark:bg-slate-800",
                  "border-blue-200 dark:border-blue-700",
                  !readOnly && "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
                )}
                onClick={() => !readOnly && onBlankClick && onBlankClick(blank.id)}
              >
                <span className="font-medium">{blank.text}</span>
                <span className="text-slate-500 ml-1">(L{blank.line})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .pseudo-code-viewer :global(.pseudo-blank) {
          background-color: #fef3c7;
          color: #92400e;
          padding: 2px 4px;
          border-radius: 4px;
          border: 1px solid #f59e0b;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pseudo-code-viewer :global(.pseudo-blank:hover) {
          background-color: #fde68a;
          border-color: #d97706;
        }
        
        .dark .pseudo-code-viewer :global(.pseudo-blank) {
          background-color: #451a03;
          color: #fbbf24;
          border-color: #92400e;
        }
        
        .dark .pseudo-code-viewer :global(.pseudo-blank:hover) {
          background-color: #78350f;
          border-color: #b45309;
        }

        .pseudo-code-viewer :global(.keyword) {
          color: #7c3aed;
          font-weight: 600;
        }
        
        .pseudo-code-viewer :global(.type) {
          color: #059669;
          font-weight: 500;
        }
        
        .pseudo-code-viewer :global(.operator) {
          color: #dc2626;
          font-weight: 500;
        }
        
        .pseudo-code-viewer :global(.comment) {
          color: #6b7280;
          font-style: italic;
        }

        .dark .pseudo-code-viewer :global(.keyword) {
          color: #a78bfa;
        }
        
        .dark .pseudo-code-viewer :global(.type) {
          color: #34d399;
        }
        
        .dark .pseudo-code-viewer :global(.operator) {
          color: #f87171;
        }
        
        .dark .pseudo-code-viewer :global(.comment) {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

/**
 * 擬似言語のシンタックスハイライト
 */
function highlightSyntax(code: string): string {
  // キーワードのハイライト
  const keywords = [
    '手続き', 'もし', 'ならば', 'そうでなければ', '戻り値',
    'を', 'から', 'まで', 'ずつ増やす', 'の間，繰り返す'
  ];
  
  const types = ['整数型', '文字列型', '配列', '整数'];
  const operators = ['←', '≠', '≤', '≥', '<', '>', '=', '+', '-', '*', '/', '%'];

  let highlighted = code;

  // キーワードをハイライト
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
  });

  // 型をハイライト
  types.forEach(type => {
    const regex = new RegExp(`\\b${escapeRegex(type)}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span class="type">${type}</span>`);
  });

  // 演算子をハイライト
  operators.forEach(operator => {
    const regex = new RegExp(escapeRegex(operator), 'g');
    highlighted = highlighted.replace(regex, `<span class="operator">${operator}</span>`);
  });

  // コメント（// で始まる行）をハイライト
  highlighted = highlighted.replace(/^(\s*)\/\/(.*)$/gm, '$1<span class="comment">//$2</span>');

  // 改行を<br>に変換
  highlighted = highlighted.replace(/\n/g, '<br>');

  return highlighted;
}

/**
 * 正規表現用の文字列エスケープ
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}