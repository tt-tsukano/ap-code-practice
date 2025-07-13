import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Problem, 
  isAlgorithmProblem,
  isDatabaseProblem 
} from '@/types/problem';
import { 
  ProblemLoader
} from '@/lib/problem-loader';
import { 
  generateProblemSummary, 
  analyzeProblem, 
  validateProblemDataDetailed,
  ProblemSummary,
  ProblemAnalysis 
} from '@/lib/problem-utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Book,
  Database,
  Code,
  Clock,
  Target,
  Lightbulb,
  FileText,
  BarChart3
} from 'lucide-react';

interface ProblemData {
  problem: Problem;
  summary: ProblemSummary;
  analysis: ProblemAnalysis;
  validation: ReturnType<typeof validateProblemDataDetailed>;
}

export default function ProblemsDemo() {
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'json' | 'analysis'>('overview');
  const [jsonViewExpanded, setJsonViewExpanded] = useState(false);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        const allProblems = await ProblemLoader.loadAllProblems();
        
        const problemDataArray: ProblemData[] = [];
        
        for (const problem of allProblems) {
          try {
            const summary = generateProblemSummary(problem);
            const analysis = analyzeProblem(problem);
            const validation = validateProblemDataDetailed(problem);
            
            problemDataArray.push({
              problem,
              summary,
              analysis,
              validation
            });
          } catch (error) {
            console.error(`Failed to analyze problem ${problem.id}:`, error);
          }
        }
        
        setProblems(problemDataArray);
        if (problemDataArray.length > 0) {
          setSelectedProblem(problemDataArray[0]);
        }
      } catch (error) {
        console.error('Failed to load problems:', error);
        setError('問題データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, []);

  const navigateProblem = (direction: 'prev' | 'next') => {
    if (!selectedProblem) return;
    
    const currentIndex = problems.findIndex(p => p.problem.id === selectedProblem.problem.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : problems.length - 1;
    } else {
      newIndex = currentIndex < problems.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedProblem(problems[newIndex]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            ← ホームに戻る
          </Link>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">問題データを読み込み中...</h2>
          </div>
          <p className="text-blue-700 dark:text-blue-300">しばらくお待ちください。</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            ← ホームに戻る
          </Link>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">エラーが発生しました</h2>
          </div>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            ← ホームに戻る
          </Link>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">問題データが見つかりません</h2>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300">問題データファイルの確認を行ってください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          ← ホームに戻る
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">問題データ確認デモ</h1>
        <p className="text-muted-foreground">
          作成した問題データの詳細確認・JSONデータの可視化・各問題への詳細ナビゲーション
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Book className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">総問題数</p>
              <p className="text-2xl font-semibold">{problems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Code className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">アルゴリズム問題</p>
              <p className="text-2xl font-semibold">
                {problems.filter(p => p.problem.category === 'algorithm').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">データベース問題</p>
              <p className="text-2xl font-semibold">
                {problems.filter(p => p.problem.category === 'database').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Navigation */}
      {selectedProblem && (
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateProblem('prev')}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <h3 className="font-semibold">{selectedProblem.problem.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedProblem.problem.id} | {selectedProblem.problem.year}年{selectedProblem.problem.season === 'spring' ? '春期' : '秋期'}
                </p>
              </div>
              
              <button 
                onClick={() => navigateProblem('next')}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedProblem.problem.category === 'algorithm' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              }`}>
                {selectedProblem.problem.category === 'algorithm' ? 'アルゴリズム' : 'データベース'}
              </span>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedProblem.problem.difficulty === 'basic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                selectedProblem.problem.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {selectedProblem.problem.difficulty === 'basic' ? '基礎' : 
                 selectedProblem.problem.difficulty === 'intermediate' ? '中級' : '上級'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {selectedProblem && (
        <div className="border-b mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '概要', icon: Info },
              { id: 'details', label: '詳細', icon: FileText },
              { id: 'analysis', label: '分析', icon: BarChart3 },
              { id: 'json', label: 'JSONデータ', icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'details' | 'json' | 'analysis')}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      {selectedProblem && (
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    基本情報
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">問題ID:</span>
                      <span className="font-mono">{selectedProblem.summary.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">カテゴリ:</span>
                      <span>{selectedProblem.summary.category === 'algorithm' ? 'アルゴリズム' : 'データベース'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">難易度:</span>
                      <span>{selectedProblem.summary.difficulty === 'basic' ? '基礎' : 
                             selectedProblem.summary.difficulty === 'intermediate' ? '中級' : '上級'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">想定時間:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedProblem.summary.estimatedTime}分
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">穴埋め数:</span>
                      <span>{selectedProblem.summary.blanksCount}箇所</span>
                    </div>
                    {selectedProblem.summary.testCasesCount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">テストケース:</span>
                        <span>{selectedProblem.summary.testCasesCount}個</span>
                      </div>
                    )}
                    {selectedProblem.summary.queriesCount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">クエリ数:</span>
                        <span>{selectedProblem.summary.queriesCount}個</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    データ検証結果
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {selectedProblem.validation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={selectedProblem.validation.isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                        {selectedProblem.validation.isValid ? 'データ構造正常' : 'データ構造エラー'}
                      </span>
                    </div>
                    
                    {selectedProblem.validation.errors.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <p className="font-medium text-red-800 dark:text-red-200 mb-2">エラー:</p>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                          {selectedProblem.validation.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedProblem.validation.warnings.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">警告:</p>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                          {selectedProblem.validation.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">問題概要</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedProblem.summary.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  関連学習項目
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProblem.summary.relatedTopics.map((topic, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 他のタブの内容も同様に実装... */}
          {/* JSON Tab */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">JSONデータ</h3>
                <button
                  onClick={() => setJsonViewExpanded(!jsonViewExpanded)}
                  className="flex items-center gap-2 px-3 py-1 border rounded-md hover:bg-muted transition-colors"
                >
                  {jsonViewExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {jsonViewExpanded ? '折りたたむ' : '展開'}
                </button>
              </div>
              
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                <pre className={`text-sm font-mono ${jsonViewExpanded ? '' : 'max-h-96 overflow-y-auto'}`}>
                  {JSON.stringify(selectedProblem.problem, null, 2)}
                </pre>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>ファイルサイズ: {Math.round(JSON.stringify(selectedProblem.problem).length / 1024 * 100) / 100} KB</p>
                <p>最終更新: {new Date().toLocaleString('ja-JP')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}