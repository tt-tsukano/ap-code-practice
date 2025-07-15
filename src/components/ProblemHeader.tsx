import React from 'react';
// import { useRouter } from 'next/router';
import { AlgorithmProblem, DatabaseProblem } from '../types/problem';

interface ProblemHeaderProps {
  problem: AlgorithmProblem | DatabaseProblem;
  progress: {
    totalBlanks: number;
    answeredBlanks: number;
    correctBlanks: number;
    score: number;
    isComplete: boolean;
  };
  currentStep: 'reading' | 'solving' | 'validation' | 'completed';
}

export const ProblemHeader: React.FC<ProblemHeaderProps> = ({
  problem,
  progress,
  currentStep
}) => {
  // const router = useRouter();

  // ステップのラベル
  const getStepLabel = () => {
    switch (currentStep) {
      case 'reading':
        return '問題読解';
      case 'solving':
        return '問題解答';
      case 'validation':
        return '回答確認';
      case 'completed':
        return '完了';
      default:
        return '';
    }
  };

  // ステップのアイコン
  const getStepIcon = () => {
    switch (currentStep) {
      case 'reading':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'solving':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // 難易度のバッジ
  const getDifficultyBadge = () => {
    const difficultyConfig = {
      basic: { label: '基本', color: 'bg-green-100 text-green-800' },
      intermediate: { label: '中級', color: 'bg-yellow-100 text-yellow-800' },
      advanced: { label: '上級', color: 'bg-red-100 text-red-800' }
    };

    const config = difficultyConfig[problem.difficulty];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // カテゴリのバッジ
  const getCategoryBadge = () => {
    const categoryConfig = {
      algorithm: { label: 'アルゴリズム', color: 'bg-blue-100 text-blue-800' },
      database: { label: 'データベース', color: 'bg-purple-100 text-purple-800' }
    };

    const config = categoryConfig[problem.category];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左側: 戻るボタンと問題情報 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              戻る
            </button>

            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {problem.title}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  {getCategoryBadge()}
                  {getDifficultyBadge()}
                  <span className="text-sm text-gray-500">
                    {problem.year}年{problem.season === 'spring' ? '春' : '秋'}期
                  </span>
                  <span className="text-sm text-gray-500">
                    想定時間: {problem.estimatedTime}分
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: 進捗とステップ */}
          <div className="flex items-center space-x-6">
            {/* 進捗表示 */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {progress.answeredBlanks} / {progress.totalBlanks} 完了
              </div>
              <div className="text-xs text-gray-500">
                {progress.answeredBlanks > 0 && (
                  <>正解率: {Math.round((progress.correctBlanks / progress.answeredBlanks) * 100)}%</>
                )}
              </div>
            </div>

            {/* プログレスバー */}
            <div className="w-24">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.answeredBlanks / progress.totalBlanks) * 100}%` }}
                />
              </div>
            </div>

            {/* 現在のステップ */}
            <div className="flex items-center space-x-2">
              <div className={`
                p-2 rounded-full
                ${currentStep === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
              `}>
                {getStepIcon()}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {getStepLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: 'reading', label: '問題読解' },
              { step: 'solving', label: '問題解答' },
              { step: 'validation', label: '回答確認' },
              { step: 'completed', label: '完了' }
            ].map((stepInfo, index) => {
              const isActive = currentStep === stepInfo.step;
              const isCompleted = ['reading', 'solving', 'validation', 'completed'].indexOf(currentStep) > index;
              
              return (
                <div key={stepInfo.step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-500 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {isCompleted && !isActive ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`
                    ml-2 text-sm
                    ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}
                  `}>
                    {stepInfo.label}
                  </span>
                  {index < 3 && (
                    <div className={`
                      w-12 h-0.5 mx-4
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProblemHeader;