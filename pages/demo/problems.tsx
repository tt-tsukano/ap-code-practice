import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Problem, 
  isAlgorithmProblem,
  isDatabaseProblem 
} from '@/types/problem';
import { 
  ProblemLoader, 
  ProblemLoaderError 
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

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

interface ProblemData {
  problem: Problem;
  summary: ProblemSummary;
  analysis: ProblemAnalysis;
  validation: ReturnType<typeof validateProblemDataDetailed>;
}

export default function ProblemsDemo() {
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'json' | 'analysis'>('overview');
  const [jsonViewExpanded, setJsonViewExpanded] = useState(false);

  useEffect(() => {
    loadAllProblemData();
  }, []);

  const loadAllProblemData = async () => {
    setLoadingState({ isLoading: true, error: null });
    
    try {
      console.log('Loading all problems...');
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
      
      setLoadingState({ isLoading: false, error: null });
      console.log(`Successfully loaded ${problemDataArray.length} problems`);
      
    } catch (error) {
      console.error('Failed to load problems:', error);
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof ProblemLoaderError ? error.message : 'Unknown error occurred' 
      });
    }
  };

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

  if (loadingState.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            ← ホームに戻る
          </Link>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">問題データを読み込み中...</h2>
            <p className="text-muted-foreground">問題ローダーがJSONファイルを解析しています</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingState.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            ← ホームに戻る
          </Link>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">読み込みエラー</h2>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{loadingState.error}</p>
          <button 
            onClick={loadAllProblemData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
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

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">詳細説明</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedProblem.problem.explanation}
                  </pre>
                </div>
              </div>
              
              {isAlgorithmProblem(selectedProblem.problem) && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">擬似コード</h3>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm font-mono">
                        {selectedProblem.problem.pseudoCode}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">穴埋め問題 ({selectedProblem.problem.blanks.length}箇所)</h3>
                    <div className="space-y-4">
                      {selectedProblem.problem.blanks.map((blank) => (
                        <div key={blank.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-medium">
                              {blank.id}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              行{blank.position} - {blank.type}
                            </span>
                          </div>
                          <p className="mb-3">{blank.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {blank.options.map((option) => (
                              <div 
                                key={option.key}
                                className={`p-2 border rounded ${
                                  option.key === blank.correct 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{option.key}</span>
                                  <code className="bg-muted px-1 rounded text-sm">{option.value}</code>
                                  {option.key === blank.correct && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-sm"><strong>解説:</strong> {blank.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {isDatabaseProblem(selectedProblem.problem) && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">データベーススキーマ</h3>
                    <div className="space-y-4">
                      {selectedProblem.problem.schema.map((table) => (
                        <div key={table.tableName} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{table.tableName}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{table.description}</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">カラム名</th>
                                  <th className="text-left p-2">型</th>
                                  <th className="text-left p-2">NULL許可</th>
                                  <th className="text-left p-2">説明</th>
                                </tr>
                              </thead>
                              <tbody>
                                {table.columns.map((column, colIndex) => (
                                  <tr key={colIndex} className="border-b">
                                    <td className="p-2 font-mono">{column.name}</td>
                                    <td className="p-2">{column.type}</td>
                                    <td className="p-2">{column.nullable ? 'Yes' : 'No'}</td>
                                    <td className="p-2 text-muted-foreground">{column.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">SQL問題 ({selectedProblem.problem.queries.length}個)</h3>
                    <div className="space-y-4">
                      {selectedProblem.problem.queries.map((query) => (
                        <div key={query.id} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{query.id}</h4>
                          <p className="mb-3">{query.description}</p>
                          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-3">
                            <pre className="text-sm font-mono overflow-x-auto">
                              {query.queryTemplate}
                            </pre>
                          </div>
                          <div className="space-y-2">
                            {query.blanks.map((blank) => (
                              <div key={blank.id} className="p-2 border rounded">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs">
                                    {blank.id}
                                  </span>
                                  <span className="text-sm">{blank.description}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  正解: <code className="bg-muted px-1 rounded">{blank.correct}</code> - {blank.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  学習ヒント
                </h3>
                <div className="space-y-2">
                  {selectedProblem.problem.hints.map((hint, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium min-w-[24px] text-center">
                        {index + 1}
                      </span>
                      <p className="text-sm">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    複雑度分析
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">穴埋め複雑度:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        selectedProblem.analysis.complexity.blanksComplexity === 'simple' ? 'bg-green-100 text-green-700' :
                        selectedProblem.analysis.complexity.blanksComplexity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedProblem.analysis.complexity.blanksComplexity === 'simple' ? 'シンプル' :
                         selectedProblem.analysis.complexity.blanksComplexity === 'moderate' ? '中程度' : '複雑'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">内容複雑度:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        selectedProblem.analysis.complexity.contentComplexity === 'basic' ? 'bg-blue-100 text-blue-700' :
                        selectedProblem.analysis.complexity.contentComplexity === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedProblem.analysis.complexity.contentComplexity === 'basic' ? '基礎' :
                         selectedProblem.analysis.complexity.contentComplexity === 'intermediate' ? '中級' : '上級'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">推定解答時間:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedProblem.analysis.complexity.estimatedSolvingTime}分
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">学習目標</h3>
                  <ul className="space-y-2">
                    {selectedProblem.analysis.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">前提知識</h3>
                  <ul className="space-y-2">
                    {selectedProblem.analysis.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Book className="h-4 w-4 mt-0.5 text-green-500" />
                        <span className="text-sm">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">問題の強み</h3>
                  <ul className="space-y-2">
                    {selectedProblem.analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {selectedProblem.analysis.suggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">改善提案</h3>
                  <ul className="space-y-2">
                    {selectedProblem.analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

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