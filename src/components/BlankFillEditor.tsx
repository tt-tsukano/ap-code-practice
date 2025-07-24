import React, { useState } from 'react';
import { AlgorithmProblem, DatabaseProblem, BlankItem } from '../types/problem';

export interface BlankFillEditorProps {
  problem: AlgorithmProblem | DatabaseProblem;
  selectedAnswers: Record<string, string>;
  onAnswerChange: (blankId: string, selectedOption: string) => void;
  onValidationRequest: () => void;
  validationResults?: Record<string, boolean>;
  showHints?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface BlankFillState {
  selectedAnswers: Record<string, string>; // blankId -> selectedOption ('ア', 'イ', etc.)
  validationResults: Record<string, boolean>; // blankId -> isCorrect
  currentBlank: string | null; // 現在選択中の穴埋め
  showAllHints: boolean;
  isComplete: boolean;
  score: number; // 0-100
}

export const BlankFillEditor: React.FC<BlankFillEditorProps> = ({
  problem,
  selectedAnswers,
  onAnswerChange,
  onValidationRequest,
  validationResults = {},
  showHints = false,
  disabled = false,
  className = ''
}) => {
  const [currentBlank, setCurrentBlank] = useState<string | null>(null);
  const [showAllHints, setShowAllHints] = useState(false);

  // 問題の種類に応じて適切なblanksを取得
  const getBlanks = (): BlankItem[] => {
    if (problem.category === 'algorithm') {
      return (problem as AlgorithmProblem).blanks;
    } else if (problem.category === 'database') {
      // データベース問題の場合、すべてのクエリのblanksを結合
      return (problem as DatabaseProblem).queries.flatMap(query => query.blanks);
    }
    return [];
  };

  const blanks = getBlanks();

  // 進捗計算
  const calculateProgress = () => {
    const totalBlanks = blanks.length;
    const answeredBlanks = Object.keys(selectedAnswers).length;
    const correctBlanks = Object.values(validationResults).filter(Boolean).length;
    const score = totalBlanks > 0 ? Math.round((correctBlanks / totalBlanks) * 100) : 0;
    const isComplete = answeredBlanks === totalBlanks;

    return {
      totalBlanks,
      answeredBlanks,
      correctBlanks,
      score,
      isComplete
    };
  };

  const progress = calculateProgress();

  // コードの表示（穴埋め箇所をハイライト）
  const renderCodeWithBlanks = () => {
    if (problem.category === 'algorithm') {
      const algorithmProblem = problem as AlgorithmProblem;
      let codeWithBlanks = algorithmProblem.pseudoCode;
      
      // 各穴埋めを置換
      blanks.forEach((blank) => {
        const blankId = blank.id;
        const selectedOption = selectedAnswers[blankId];
        const isCorrect = validationResults[blankId];
        const isCurrentBlank = currentBlank === blankId;
        
        // 穴埋め表示のスタイル（視覚的に分かりやすく改善）
        const blankClasses = [
          'inline-block',
          'px-3',
          'py-2',
          'rounded',
          'border-2',
          'cursor-pointer',
          'transition-all',
          'duration-200',
          'min-w-16',
          'text-center',
          'font-bold',
          'hover:shadow-lg',
          'hover:scale-105',
          'relative',
          isCurrentBlank && 'ring-2 ring-blue-500 shadow-lg',
          selectedOption && !isCorrect && 'bg-blue-100 border-blue-400 text-blue-800',
          isCorrect === true && 'bg-green-100 border-green-400 text-green-800',
          isCorrect === false && 'bg-red-100 border-red-400 text-red-800',
          !selectedOption && 'bg-yellow-50 border-yellow-400 text-yellow-700 shadow-md animate-pulse'
        ].filter(Boolean).join(' ');

        // 全角隅付き括弧と全角スペースのパターンに対応（日本語カタカナ）
        const blankKey = blankId.replace('blank_', '');
        const katakanaMap: { [key: string]: string } = {
          'a': 'ア', 'b': 'イ', 'c': 'ウ', 'd': 'エ', 'e': 'オ',
          'f': 'カ', 'g': 'キ', 'h': 'ク', 'i': 'ケ', 'j': 'コ'
        };
        const katakana = katakanaMap[blankKey.toLowerCase()] || blankKey.toUpperCase();
        const blankElement = `<span class="${blankClasses}" data-blank-id="${blankId}">${selectedOption || `【${katakana}】`}</span>`;
        const blankPattern = new RegExp(`［　${katakana}　］`, 'g');
        
        // デバッグ用ログ
        const beforeReplace = codeWithBlanks;
        codeWithBlanks = codeWithBlanks.replace(blankPattern, blankElement);
        const wasReplaced = beforeReplace !== codeWithBlanks;
        
        console.log(`Blank replacement for ${blankId}:`, {
          blankKey,
          katakana,
          pattern: `［　${katakana}　］`,
          wasReplaced,
          blankElement: blankElement.substring(0, 100) + '...'
        });
      });

      return (
        <div 
          className="bg-gray-50 p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: codeWithBlanks }}
          onClick={handleCodeClick}
        />
      );
    } else {
      // データベース問題の場合
      const databaseProblem = problem as DatabaseProblem;
      return (
        <div className="space-y-4">
          {databaseProblem.queries.map((query, index) => {
            let queryWithBlanks = query.queryTemplate;
            
            query.blanks.forEach((blank) => {
              const blankId = blank.id;
              const selectedOption = selectedAnswers[blankId];
              const isCorrect = validationResults[blankId];
              const isCurrentBlank = currentBlank === blankId;
              
              const blankClasses = [
                'inline-block',
                'px-3',
                'py-2',
                'rounded',
                'border-2',
                'cursor-pointer',
                'transition-all',
                'duration-200',
                'min-w-16',
                'text-center',
                'font-bold',
                'hover:shadow-lg',
                'hover:scale-105',
                'relative',
                isCurrentBlank && 'ring-2 ring-blue-500 shadow-lg',
                selectedOption && !isCorrect && 'bg-blue-100 border-blue-400 text-blue-800',
                isCorrect === true && 'bg-green-100 border-green-400 text-green-800',
                isCorrect === false && 'bg-red-100 border-red-400 text-red-800',
                !selectedOption && 'bg-yellow-50 border-yellow-400 text-yellow-700 shadow-md animate-pulse'
              ].filter(Boolean).join(' ');

              // 全角隅付き括弧と全角スペースのパターンに対応（日本語カタカナ）
              const blankKey = blankId.replace('blank_', '');
              const katakanaMap: { [key: string]: string } = {
                'a': 'ア', 'b': 'イ', 'c': 'ウ', 'd': 'エ', 'e': 'オ',
                'f': 'カ', 'g': 'キ', 'h': 'ク', 'i': 'ケ', 'j': 'コ'
              };
              const katakana = katakanaMap[blankKey.toLowerCase()] || blankKey.toUpperCase();
              const blankElement = `<span class="${blankClasses}" data-blank-id="${blankId}">${selectedOption || `【${katakana}】`}</span>`;
              const blankPattern = new RegExp(`［　${katakana}　］`, 'g');
              
              // デバッグ用ログ
              const beforeReplace = queryWithBlanks;
              queryWithBlanks = queryWithBlanks.replace(blankPattern, blankElement);
              const wasReplaced = beforeReplace !== queryWithBlanks;
              
              console.log(`Query blank replacement for ${blankId}:`, {
                blankKey,
                katakana,
                pattern: `［　${katakana}　］`,
                wasReplaced,
                blankElement: blankElement.substring(0, 100) + '...'
              });
            });

            return (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">クエリ {index + 1}</h4>
                <p className="text-sm text-gray-600 mb-3">{query.description}</p>
                <div 
                  className="bg-gray-50 p-3 rounded border font-mono text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: queryWithBlanks }}
                  onClick={handleCodeClick}
                />
              </div>
            );
          })}
        </div>
      );
    }
  };

  // コードクリック時の処理
  const handleCodeClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const blankId = target.getAttribute('data-blank-id');
    
    // デバッグ用ログ
    console.log('Code clicked:', {
      target: target,
      tagName: target.tagName,
      className: target.className,
      blankId: blankId,
      innerHTML: target.innerHTML
    });
    
    if (blankId) {
      console.log(`Setting current blank to: ${blankId}`);
      setCurrentBlank(blankId);
    } else {
      // blankIdが見つからない場合、親要素も確認
      let parentElement = target.parentElement;
      while (parentElement && !parentElement.getAttribute('data-blank-id')) {
        parentElement = parentElement.parentElement;
      }
      if (parentElement) {
        const parentBlankId = parentElement.getAttribute('data-blank-id');
        if (parentBlankId) {
          console.log(`Found blank ID in parent element: ${parentBlankId}`);
          setCurrentBlank(parentBlankId);
        }
      }
    }
  };

  // 選択肢の表示
  const renderBlankOptions = () => {
    if (!currentBlank) return null;

    const blank = blanks.find(b => b.id === currentBlank);
    if (!blank) return null;

    const selectedOption = selectedAnswers[currentBlank];
    const isCorrect = validationResults[currentBlank];

    return (
      <div className="mt-4 p-4 bg-white border rounded-lg">
        <h4 className="font-semibold mb-2">
          {blank.description}
          {showHints && (
            <span className="ml-2 text-sm text-gray-600">
              ({blank.explanation})
            </span>
          )}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {blank.options.map((option) => {
            const isSelected = selectedOption === option.key;
            const isCorrectOption = isCorrect === true && isSelected;
            const isIncorrectOption = isCorrect === false && isSelected;

            const buttonClasses = [
              'p-3',
              'text-left',
              'border',
              'rounded',
              'transition-all',
              'duration-200',
              'hover:border-blue-300',
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-blue-500',
              'disabled:opacity-50',
              'disabled:cursor-not-allowed',
              isSelected && !isCorrectOption && !isIncorrectOption && 'bg-blue-50 border-blue-300',
              isCorrectOption && 'bg-green-50 border-green-300',
              isIncorrectOption && 'bg-red-50 border-red-300',
              !isSelected && 'bg-white border-gray-300'
            ].filter(Boolean).join(' ');

            return (
              <button
                key={option.key}
                className={buttonClasses}
                onClick={() => onAnswerChange(currentBlank, option.key)}
                disabled={disabled}
              >
                <div className="flex items-center">
                  <span className="font-mono font-bold mr-2">{option.key}</span>
                  <span className="flex-1">{option.value}</span>
                </div>
                {showHints && (
                  <div className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 進捗インジケーター
  const renderProgressIndicator = () => {
    const progressPercentage = progress.totalBlanks > 0 ? (progress.answeredBlanks / progress.totalBlanks) * 100 : 0;
    const accuracyPercentage = progress.answeredBlanks > 0 ? (progress.correctBlanks / progress.answeredBlanks) * 100 : 0;

    return (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">進捗状況</span>
          <span className="text-sm text-gray-600">
            {progress.answeredBlanks} / {progress.totalBlanks} 完了
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {progress.answeredBlanks > 0 && (
          <div className="flex justify-between text-xs text-gray-600">
            <span>正解率: {Math.round(accuracyPercentage)}%</span>
            <span>スコア: {progress.score}点</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`blank-fill-editor ${className}`}>
      {/* 問題文 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{problem.title}</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
        </div>
      </div>

      {/* 進捗インジケーター */}
      {renderProgressIndicator()}

      {/* 問題設定・背景 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">問題設定</h4>
        <div className="bg-blue-50 p-4 rounded-lg border">
          <p className="text-sm">
            {problem.category === 'algorithm' 
              ? (problem as AlgorithmProblem).situation 
              : (problem as DatabaseProblem).scenario}
          </p>
        </div>
      </div>

      {/* コードエディタ */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">
            {problem.category === 'algorithm' ? '擬似言語' : 'SQLクエリ'}
          </h4>
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            💡 黄色の空欄【ア】【イ】【ウ】をクリックして回答してください
          </div>
        </div>
        {renderCodeWithBlanks()}
      </div>

      {/* 選択肢 */}
      {renderBlankOptions()}

      {/* アクションボタン */}
      <div className="mt-6 flex justify-between">
        <button
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          onClick={() => setShowAllHints(!showAllHints)}
        >
          {showAllHints ? 'ヒントを隠す' : 'ヒントを表示'}
        </button>
        
        <div className="space-x-2">
          <button
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
            onClick={onValidationRequest}
            disabled={disabled || progress.answeredBlanks === 0}
          >
            回答を確認
          </button>
          
          {progress.isComplete && (
            <button
              className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              onClick={() => {
                // 実行・検証画面への遷移など
                console.log('実行・検証画面へ');
              }}
            >
              実行・検証
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlankFillEditor;