import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
import { AlgorithmProblem, DatabaseProblem, ExecutionResult } from '../../types/problem';
import { ProblemLayout } from '../../components/ProblemLayout';
// import { loadProblem } from '../../lib/problem-loader';

interface ProblemPageProps {
  problem: AlgorithmProblem | DatabaseProblem;
}

interface ProblemPageState {
  selectedAnswers: Record<string, string>;
  validationResults: Record<string, boolean>;
  showHints: boolean;
  currentStep: 'reading' | 'solving' | 'validation' | 'completed';
  executionResults?: ExecutionResult;
}

const ProblemPage: React.FC = () => {
  // const router = useRouter();
  // const { id } = router.query;
  const id = 'r4s-q8'; // 仮のID
  
  const [problem, setProblem] = useState<AlgorithmProblem | DatabaseProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [state, setState] = useState<ProblemPageState>({
    selectedAnswers: {},
    validationResults: {},
    showHints: false,
    currentStep: 'reading'
  });

  // 問題の読み込み
  useEffect(() => {
    const loadProblemData = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        setLoading(true);
        // const problemData = await loadProblem(id);
        // setProblem(problemData);
        // 仮の問題データ
        const mockProblem: AlgorithmProblem = {
          id: 'r4s-q8',
          title: 'サンプル問題',
          year: '2022',
          season: 'spring',
          number: 8,
          category: 'algorithm',
          difficulty: 'intermediate',
          estimatedTime: 30,
          description: 'これはサンプルの問題です。',
          explanation: 'これはサンプルの解説です。',
          hints: ['ヒント1', 'ヒント2'],
          relatedTopics: ['アルゴリズム', '配列'],
          situation: 'サンプルの問題設定です。',
          pseudoCode: 'サンプルの擬似コードです。',
          blanks: [],
          testCases: []
        };
        setProblem(mockProblem);
        setState(prev => ({ ...prev, currentStep: 'reading' }));
      } catch (err) {
        setError(err instanceof Error ? err.message : '問題の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadProblemData();
  }, [id]);

  // 回答の変更処理
  const handleAnswerChange = (blankId: string, selectedOption: string) => {
    setState(prev => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [blankId]: selectedOption
      },
      currentStep: 'solving'
    }));
  };

  // 回答の検証処理
  const handleValidationRequest = () => {
    if (!problem) return;
    
    const blanks = problem.category === 'algorithm' 
      ? (problem as AlgorithmProblem).blanks
      : (problem as DatabaseProblem).queries.flatMap(q => q.blanks);
    
    const results: Record<string, boolean> = {};
    
    blanks.forEach(blank => {
      const selectedAnswer = state.selectedAnswers[blank.id];
      results[blank.id] = selectedAnswer === blank.correct;
    });
    
    setState(prev => ({
      ...prev,
      validationResults: results,
      currentStep: 'validation'
    }));
  };

  // 実行・検証処理
  const handleExecutionRequest = async () => {
    if (!problem) return;
    
    try {
      // Phase 2-B-1 の変換エンジンを使用してPythonコードを生成
      // const pythonCode = await convertPseudoToPython(problem, state.selectedAnswers);
      
      // 実行結果をシミュレート（実際の実装では Pyodide を使用）
      const mockExecutionResult: ExecutionResult = {
        success: true,
        output: "実行結果のサンプル",
        executionTime: 150,
        memoryUsage: 1024
      };
      
      setState(prev => ({
        ...prev,
        executionResults: mockExecutionResult,
        currentStep: 'completed'
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        executionResults: {
          success: false,
          error: err instanceof Error ? err.message : '実行に失敗しました',
          executionTime: 0
        },
        currentStep: 'validation'
      }));
    }
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error || !problem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">問題が見つかりません</h2>
          <p className="text-gray-600 mb-4">{error || '指定された問題が存在しません'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProblemLayout
      problem={problem}
      selectedAnswers={state.selectedAnswers}
      validationResults={state.validationResults}
      showHints={state.showHints}
      currentStep={state.currentStep}
      executionResults={state.executionResults}
      onAnswerChange={handleAnswerChange}
      onValidationRequest={handleValidationRequest}
      onExecutionRequest={handleExecutionRequest}
      onHintToggle={() => setState(prev => ({ ...prev, showHints: !prev.showHints }))}
    />
  );
};

export default ProblemPage;