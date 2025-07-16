# Phase 2-B-2 完成のための追加実装依頼書

## 🎯 実装目標
Phase 2-B-2 で作成された高品質なUIコンポーネントを統合し、完全に動作する学習フローを実現する

---

## 📋 依頼1：問題ページのデータ統合完成

### 実装依頼
pages/problems/[id].tsx の仮実装部分を完成させ、実際の問題データを読み込む機能を実装してください。

### 現状の課題
- データ読み込み部分が仮実装のまま
- problem-loader との連携が未完成
- エラーハンドリングが不十分

### 実装要件

#### 修正対象ファイル
```
src/pages/problems/[id].tsx
```

#### 実装内容
```typescript
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
        problemData.blanks?.forEach(blank => {
          initialAnswers[blank.id] = '';
        });
        
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

    problem.blanks?.forEach(blank => {
      const userAnswer = state.selectedAnswers[blank.id];
      const isCorrect = userAnswer === blank.correct;
      results[blank.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    const score = Math.round((correctCount / (problem.blanks?.length || 1)) * 100);

    setState(prev => ({
      ...prev,
      validationResults: results,
      score,
      currentStep: correctCount === problem.blanks?.length ? 'completed' : 'solving'
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
    problem?.blanks?.forEach(blank => {
      initialAnswers[blank.id] = '';
    });

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
```

### 追加実装が必要なコンポーネント
```typescript
// src/components/ui/loading-spinner.tsx
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  // スピナーのサイズに応じたCSS実装
}

// src/components/ui/error-message.tsx
export interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorMessage({ title, message, onRetry, onBack }: ErrorMessageProps) {
  // エラーメッセージ表示コンポーネント
}
```

---

## 📋 依頼2：アプリケーション統合とルーティング

### 実装依頼
アプリケーションのメインルーティングに問題ページへのナビゲーションを追加してください。

### 現状の課題
- App.tsx に問題ページへのルートが設定されていない
- 問題一覧ページからのナビゲーションが未実装
- URL直接アクセスが動作しない

### 実装要件

#### 修正対象ファイル
```
src/App.tsx
src/pages/problems/index.tsx （新規作成）
```

#### App.tsx の修正
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// 既存ページ
import DemoPage from './pages/demo/index';
import PythonDemo from './pages/demo/python';
import SqlDemo from './pages/demo/sql';
import CombinedDemo from './pages/demo/combined';
import ConverterDemo from './pages/demo/converter';
import ProblemsDemo from './pages/demo/problems';

// 新規追加ページ
import ProblemsListPage from './pages/problems/index';
import ProblemPage from './pages/problems/[id]';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          {/* ホームページ */}
          <Route path="/" element={<Navigate to="/demo" replace />} />
          
          {/* デモページ群 */}
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/demo/python" element={<PythonDemo />} />
          <Route path="/demo/sql" element={<SqlDemo />} />
          <Route path="/demo/combined" element={<CombinedDemo />} />
          <Route path="/demo/converter" element={<ConverterDemo />} />
          <Route path="/demo/problems" element={<ProblemsDemo />} />
          
          {/* 学習ページ群 */}
          <Route path="/problems" element={<ProblemsListPage />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          
          {/* 404ページ */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">404 - ページが見つかりません</h1>
                <p className="text-gray-600 mt-2">
                  <a href="/demo" className="text-blue-600 hover:underline">
                    デモページに戻る
                  </a>
                </p>
              </div>
            </div>
          } />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
```

#### 問題一覧ページの作成
```typescript
// src/pages/problems/index.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemLoader } from '@/lib/problem-loader';
import { Problem, isAlgorithmProblem, isDatabaseProblem } from '@/types/problem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Brain, Database, ChevronRight } from 'lucide-react';

export default function ProblemsListPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProblems() {
      try {
        const allProblems = await ProblemLoader.loadAllProblems();
        setProblems(allProblems);
      } catch (error) {
        console.error('Failed to load problems:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProblems();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">問題を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">応用情報技術者試験 問題一覧</h1>
        <p className="text-gray-600 mt-2">
          実際にコードを実行して学習できる過去問題です。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <Card key={problem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={problem.category === 'algorithm' ? 'default' : 'secondary'}
                  className="mb-2"
                >
                  {problem.category === 'algorithm' ? (
                    <><Brain className="w-3 h-3 mr-1" /> アルゴリズム</>
                  ) : (
                    <><Database className="w-3 h-3 mr-1" /> データベース</>
                  )}
                </Badge>
                <Badge variant="outline">
                  {problem.difficulty === 'basic' ? '基礎' : 
                   problem.difficulty === 'intermediate' ? '中級' : '上級'}
                </Badge>
              </div>
              <CardTitle className="text-lg">{problem.title}</CardTitle>
              <CardDescription>
                {problem.year}年{problem.season === 'spring' ? '春期' : '秋期'} 問{problem.number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Clock className="w-4 h-4 mr-1" />
                想定時間: {problem.estimatedTime}分
              </div>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {problem.description.slice(0, 100)}...
              </p>
              <Button asChild className="w-full">
                <Link to={`/problems/${problem.id}`}>
                  学習を開始 <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {problems.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">問題が見つかりませんでした。</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 依頼3：ナビゲーション統合

### 実装依頼
デモページから学習ページへのナビゲーションを追加してください。

### 実装要件

#### 修正対象ファイル
```
src/pages/demo/index.tsx
src/pages/demo/problems.tsx
```

#### デモページの修正
```typescript
// src/pages/demo/index.tsx に追加
import { Link } from 'react-router-dom';

// デモカード配列に追加
const demoCards = [
  // 既存のデモカード...
  
  {
    title: "実際の学習体験",
    description: "完全な穴埋め問題による学習フローを体験",
    href: "/problems",
    icon: "🎓",
    status: "new" as const
  }
];

// レンダリング部分で
<Card className="group hover:shadow-lg transition-all duration-200">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="text-2xl">{card.icon}</div>
      {card.status === 'new' && (
        <Badge className="bg-green-100 text-green-800">NEW</Badge>
      )}
    </div>
    <CardTitle className="group-hover:text-blue-600 transition-colors">
      {card.title}
    </CardTitle>
    <CardDescription>{card.description}</CardDescription>
  </CardHeader>
  <CardContent>
    <Button asChild className="w-full">
      <Link to={card.href}>
        体験する <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </Button>
  </CardContent>
</Card>
```

---

## 📋 依頼4：Phase 2-B-1 変換エンジン統合

### 実装依頼
穴埋め問題UIとPhase 2-B-1の変換エンジンを完全統合してください。

### 実装要件

#### 統合ポイント
```typescript
// ProblemLayout.tsx に変換エンジン統合
import { PseudoCodeConverter } from '@/lib/pseudo-converter';

// 変換プレビュー機能の追加
const handleConversionPreview = useCallback(async () => {
  if (!problem || !isAlgorithmProblem(problem)) return;

  try {
    // 穴埋め回答を反映したコードを生成
    let codeWithAnswers = problem.pseudoCode;
    Object.entries(selectedAnswers).forEach(([blankId, answer]) => {
      const blank = problem.blanks.find(b => b.id === blankId);
      if (blank && answer) {
        const option = blank.options.find(opt => opt.key === answer);
        if (option) {
          codeWithAnswers = codeWithAnswers.replace(
            `［${blankId.replace('blank_', '').toUpperCase()}］`, 
            option.value
          );
        }
      }
    });

    // Python変換実行
    const result = PseudoCodeConverter.convert(codeWithAnswers, {
      includeComments: true,
      validateOutput: true
    });

    setConversionResult(result);
  } catch (error) {
    console.error('Conversion error:', error);
  }
}, [problem, selectedAnswers]);
```

---

## 📋 依頼5：最終統合テスト・調整

### 実装依頼
完全統合後の動作テストと最終調整を行ってください。

### テスト項目
- [ ] URL直接アクセス (`/problems/r4s-q8`)
- [ ] 問題一覧からの遷移
- [ ] 穴埋め回答の状態管理
- [ ] 変換エンジンとの連携
- [ ] Pyodide実行との統合
- [ ] エラーハンドリング
- [ ] レスポンシブデザイン
- [ ] アクセシビリティ

### 調整が必要な箇所
1. **状態管理の最適化**: useReducer への移行検討
2. **パフォーマンス最適化**: useMemo、useCallback の活用
3. **エラーバウンダリ**: React Error Boundary の実装
4. **ローディング状態**: より詳細なローディング表示

---

## 🎯 完成後の期待する動作

### 学習フロー
1. `/problems` → 問題一覧表示
2. 問題選択 → `/problems/r4s-q8` に遷移  
3. 問題読解 → 穴埋め回答
4. リアルタイム変換 → Python/SQLコード表示
5. 実行・検証 → Pyodide/sql.js での実行
6. 結果確認 → 正解判定・フィードバック

### 完成基準
- [ ] エンドツーエンドの学習フローが完全動作
- [ ] 問題データ（r4s-q8, r4s-q3）で正常動作
- [ ] Phase 2-B-1 変換エンジンとシームレス連携
- [ ] エラーなしでの安定動作
- [ ] モバイル・デスクトップ両対応

---

## 🚀 実装優先順位

1. **依頼1**: 問題ページのデータ統合（最重要）
2. **依頼2**: ルーティング設定（基盤）
3. **依頼3**: ナビゲーション追加（UX）
4. **依頼4**: 変換エンジン統合（学習効果）
5. **依頼5**: 最終テスト・調整（品質保証）

どの依頼から開始しますか？**依頼1**から順次進めることを推奨します。