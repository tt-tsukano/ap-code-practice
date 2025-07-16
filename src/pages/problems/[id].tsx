import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProblemLoader } from '@/lib/problem-loader';
import { Problem, isAlgorithmProblem, isDatabaseProblem } from '@/types/problem';
import { ProblemLayout } from '@/components/ProblemLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

interface ProblemPageState {
  selectedAnswers: Record<string, string>;
  validationResults: Record<string, boolean>;
  showHints: boolean;
  currentStep: 'reading' | 'solving' | 'validation' | 'completed';
  executionResults?: any;
  score: number;
}

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ProblemPageState>({
    selectedAnswers: {},
    validationResults: {},
    showHints: false,
    currentStep: 'reading',
    score: 0
  });

  // 問題データの読み込み
  useEffect(() => {
    async function loadProblem() {
      if (!id) {
        setError('問題IDが指定されていません');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const problemData = await ProblemLoader.loadProblem(id);
        setProblem(problemData);
        
        // 初期状態の設定
        const initialAnswers: Record<string, string> = {};
        if (problemData.category === 'algorithm') {
          problemData.blanks?.forEach((blank: any) => {
            initialAnswers[blank.id] = '';
          });
        } else if (problemData.category === 'database') {
          problemData.queries?.forEach((query: any) => {
            query.blanks?.forEach((blank: any) => {
              initialAnswers[blank.id] = '';
            });
          });
        }
        
        setState(prev => ({
          ...prev,
          selectedAnswers: initialAnswers
        }));
        
      } catch (err) {
        console.error('Problem loading error:', err);
        setError(`問題の読み込みに失敗しました: ${id}`);
      } finally {
        setLoading(false);
      }
    }

    loadProblem();
  }, [id]);

  // 解答変更ハンドラー
  const handleAnswerChange = (blankId: string, selectedOption: string) => {
    setState(prev => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [blankId]: selectedOption
      }
    }));
  };

  // 検証要求ハンドラー
  const handleValidationRequest = () => {
    if (!problem) return;

    const results: Record<string, boolean> = {};
    let correctCount = 0;
    let totalBlanks = 0;

    if (problem.category === 'algorithm') {
      const algorithmProblem = problem as any;
      algorithmProblem.blanks?.forEach((blank: any) => {
        const userAnswer = state.selectedAnswers[blank.id];
        const isCorrect = userAnswer === blank.correct;
        results[blank.id] = isCorrect;
        if (isCorrect) correctCount++;
        totalBlanks++;
      });
    } else if (problem.category === 'database') {
      const databaseProblem = problem as any;
      databaseProblem.queries?.forEach((query: any) => {
        query.blanks?.forEach((blank: any) => {
          const userAnswer = state.selectedAnswers[blank.id];
          const isCorrect = userAnswer === blank.correct;
          results[blank.id] = isCorrect;
          if (isCorrect) correctCount++;
          totalBlanks++;
        });
      });
    }

    const score = Math.round((correctCount / (totalBlanks || 1)) * 100);

    setState(prev => ({
      ...prev,
      validationResults: results,
      score,
      currentStep: correctCount === totalBlanks ? 'completed' : 'solving'
    }));
  };

  // ヒント表示切り替え
  const toggleHints = () => {
    setState(prev => ({
      ...prev,
      showHints: !prev.showHints
    }));
  };

  // リセット
  const handleReset = () => {
    const initialAnswers: Record<string, string> = {};
    if (problem?.category === 'algorithm') {
      const algorithmProblem = problem as any;
      algorithmProblem.blanks?.forEach((blank: any) => {
        initialAnswers[blank.id] = '';
      });
    } else if (problem?.category === 'database') {
      const databaseProblem = problem as any;
      databaseProblem.queries?.forEach((query: any) => {
        query.blanks?.forEach((blank: any) => {
          initialAnswers[blank.id] = '';
        });
      });
    }

    setState({
      selectedAnswers: initialAnswers,
      validationResults: {},
      showHints: false,
      currentStep: 'reading',
      score: 0
    });
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">問題を読み込んでいます...</span>
      </div>
    );
  }

  // エラー状態
  if (error || !problem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage 
          title="問題の読み込みエラー"
          message={error || '問題が見つかりませんでした'}
          onRetry={() => window.location.reload()}
          onBack={() => navigate('/problems')}
        />
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
      score={state.score}
      onAnswerChange={handleAnswerChange}
      onValidationRequest={handleValidationRequest}
      onToggleHints={toggleHints}
      onReset={handleReset}
    />
  );
}