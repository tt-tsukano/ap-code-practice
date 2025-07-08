/**
 * Phase 2-A: 問題操作ユーティリティ
 * 問題データの妥当性検証・操作・分析機能
 */

import { 
  Problem, 
  AlgorithmProblem, 
  DatabaseProblem, 
  BlankItem, 
  TestCase, 
  QueryProblem,
  SchemaDefinition,
  UserAnswer,
  LearningProgress,
  validateProblemData,
  validateBlankItem,
  validateTestCase,
  isAlgorithmProblem,
  isDatabaseProblem
} from '@/types/problem';

/**
 * 問題の概要情報
 */
export interface ProblemSummary {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  year: string;
  season: string;
  description: string;
  blanksCount: number;
  testCasesCount?: number;
  queriesCount?: number;
  relatedTopics: string[];
}

/**
 * 問題分析結果
 */
export interface ProblemAnalysis {
  summary: ProblemSummary;
  complexity: {
    blanksComplexity: 'simple' | 'moderate' | 'complex';
    contentComplexity: 'basic' | 'intermediate' | 'advanced';
    estimatedSolvingTime: number;
  };
  learningObjectives: string[];
  prerequisites: string[];
  strengths: string[];
  suggestions: string[];
}

/**
 * 解答進捗の統計
 */
export interface AnswerStatistics {
  totalBlanks: number;
  answeredBlanks: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyRate: number;
  completionRate: number;
  averageAttempts: number;
  timeSpent: number;
}

/**
 * 問題データの妥当性検証（拡張版）
 * @param problem 検証対象の問題データ
 * @returns 詳細な検証結果
 */
export function validateProblemDataDetailed(problem: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[]
  };

  // 基本検証
  if (!validateProblemData(problem)) {
    result.isValid = false;
    result.errors.push('Basic problem data validation failed');
    return result;
  }

  try {
    // ID形式の検証
    if (!/^r\d+[sa]-q\d+$/.test(problem.id)) {
      result.warnings.push(`Problem ID format may be incorrect: ${problem.id}`);
    }

    // 年度の妥当性
    const currentYear = new Date().getFullYear();
    const problemYear = parseInt(problem.year);
    if (problemYear < 2020 || problemYear > currentYear + 1) {
      result.warnings.push(`Problem year seems unusual: ${problem.year}`);
    }

    // 想定時間の妥当性
    if (problem.estimatedTime < 5 || problem.estimatedTime > 120) {
      result.warnings.push(`Estimated time seems unusual: ${problem.estimatedTime} minutes`);
    }

    // カテゴリ別の詳細検証
    if (isAlgorithmProblem(problem)) {
      validateAlgorithmProblemSpecific(problem, result);
    } else if (isDatabaseProblem(problem)) {
      validateDatabaseProblemSpecific(problem, result);
    }

    // 関連トピックの妥当性
    if (problem.relatedTopics.length === 0) {
      result.warnings.push('No related topics specified');
    }

    // ヒントの段階性チェック
    if (problem.hints.length < 3) {
      result.warnings.push('Insufficient number of hints for effective learning');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * アルゴリズム問題の特別検証
 */
function validateAlgorithmProblemSpecific(problem: AlgorithmProblem, result: { errors: string[], warnings: string[] }): void {
  // 擬似コードの存在確認
  if (!problem.pseudoCode || problem.pseudoCode.trim().length === 0) {
    result.errors.push('Pseudo code is required for algorithm problems');
  }

  // 穴埋めの妥当性
  if (problem.blanks.length === 0) {
    result.errors.push('Algorithm problems must have at least one blank');
  }

  problem.blanks.forEach((blank, index) => {
    if (!validateBlankItem(blank)) {
      result.errors.push(`Invalid blank item at index ${index}`);
    }
    if (blank.options.length < 3) {
      result.warnings.push(`Blank ${blank.id} has fewer than 3 options`);
    }
  });

  // テストケースの妥当性
  if (problem.testCases.length < 2) {
    result.warnings.push('Algorithm problems should have at least 2 test cases');
  }

  problem.testCases.forEach((testCase, index) => {
    if (!validateTestCase(testCase)) {
      result.errors.push(`Invalid test case at index ${index}`);
    }
  });
}

/**
 * データベース問題の特別検証
 */
function validateDatabaseProblemSpecific(problem: DatabaseProblem, result: { errors: string[], warnings: string[] }): void {
  // スキーマの存在確認
  if (problem.schema.length === 0) {
    result.errors.push('Database problems must have at least one schema table');
  }

  // クエリの存在確認
  if (problem.queries.length === 0) {
    result.errors.push('Database problems must have at least one query');
  }

  // スキーマの妥当性
  problem.schema.forEach((table, index) => {
    if (table.columns.length === 0) {
      result.errors.push(`Table ${table.tableName} has no columns`);
    }
    if (table.primaryKey.length === 0) {
      result.warnings.push(`Table ${table.tableName} has no primary key`);
    }
    if (table.sampleData.length === 0) {
      result.warnings.push(`Table ${table.tableName} has no sample data`);
    }
  });

  // クエリの妥当性
  problem.queries.forEach((query, index) => {
    if (query.blanks.length === 0) {
      result.errors.push(`Query ${query.id} has no blanks`);
    }
    if (!query.expectedResult.columns || query.expectedResult.columns.length === 0) {
      result.errors.push(`Query ${query.id} has no expected result columns`);
    }
  });
}

/**
 * 問題の概要を生成
 * @param problem 問題データ
 * @returns ProblemSummary 問題概要
 */
export function generateProblemSummary(problem: Problem): ProblemSummary {
  const summary: ProblemSummary = {
    id: problem.id,
    title: problem.title,
    category: problem.category,
    difficulty: problem.difficulty,
    estimatedTime: problem.estimatedTime,
    year: problem.year,
    season: problem.season,
    description: problem.description.substring(0, 200) + (problem.description.length > 200 ? '...' : ''),
    blanksCount: 0,
    relatedTopics: problem.relatedTopics
  };

  if (isAlgorithmProblem(problem)) {
    summary.blanksCount = problem.blanks.length;
    summary.testCasesCount = problem.testCases.length;
  } else if (isDatabaseProblem(problem)) {
    summary.blanksCount = problem.queries.reduce((total, query) => total + query.blanks.length, 0);
    summary.queriesCount = problem.queries.length;
  }

  return summary;
}

/**
 * 問題の詳細分析を実行
 * @param problem 問題データ
 * @returns ProblemAnalysis 分析結果
 */
export function analyzeProblem(problem: Problem): ProblemAnalysis {
  const summary = generateProblemSummary(problem);
  
  // 複雑度の分析
  const complexity = analyzeComplexity(problem);
  
  // 学習目標の抽出
  const learningObjectives = extractLearningObjectives(problem);
  
  // 前提知識の推定
  const prerequisites = estimatePrerequisites(problem);
  
  // 強みと改善提案
  const strengths = identifyStrengths(problem);
  const suggestions = generateSuggestions(problem);

  return {
    summary,
    complexity,
    learningObjectives,
    prerequisites,
    strengths,
    suggestions
  };
}

/**
 * 複雑度の分析
 */
function analyzeComplexity(problem: Problem): ProblemAnalysis['complexity'] {
  let blanksComplexity: 'simple' | 'moderate' | 'complex' = 'simple';
  let contentComplexity = problem.difficulty as 'basic' | 'intermediate' | 'advanced';
  let estimatedSolvingTime = problem.estimatedTime;

  if (isAlgorithmProblem(problem)) {
    if (problem.blanks.length > 5) blanksComplexity = 'complex';
    else if (problem.blanks.length > 3) blanksComplexity = 'moderate';
    
    // テストケースの複雑度も考慮
    if (problem.testCases.length > 3) {
      estimatedSolvingTime += 5;
    }
  } else if (isDatabaseProblem(problem)) {
    const totalBlanks = problem.queries.reduce((sum, q) => sum + q.blanks.length, 0);
    if (totalBlanks > 6) blanksComplexity = 'complex';
    else if (totalBlanks > 3) blanksComplexity = 'moderate';
    
    // JOIN の数やテーブル数も考慮
    if (problem.schema.length > 3) {
      estimatedSolvingTime += 10;
    }
  }

  return { blanksComplexity, contentComplexity, estimatedSolvingTime };
}

/**
 * 学習目標の抽出
 */
function extractLearningObjectives(problem: Problem): string[] {
  const objectives: string[] = [];
  
  if (isAlgorithmProblem(problem)) {
    objectives.push('アルゴリズムの理解と実装');
    objectives.push('擬似言語の読解能力');
    objectives.push('論理的思考力の向上');
    
    if (problem.testCases.length > 2) {
      objectives.push('テストケース分析能力');
    }
  } else if (isDatabaseProblem(problem)) {
    objectives.push('SQL文の構築能力');
    objectives.push('データベース設計の理解');
    
    const hasJoin = problem.queries.some(q => 
      q.queryTemplate.toLowerCase().includes('join')
    );
    if (hasJoin) {
      objectives.push('テーブル結合の理解');
    }
    
    const hasAggregate = problem.queries.some(q => 
      /sum|count|avg|max|min/i.test(q.queryTemplate)
    );
    if (hasAggregate) {
      objectives.push('集約関数の活用');
    }
  }
  
  return objectives;
}

/**
 * 前提知識の推定
 */
function estimatePrerequisites(problem: Problem): string[] {
  const prerequisites: string[] = [];
  
  if (isAlgorithmProblem(problem)) {
    prerequisites.push('基本的なプログラミング概念');
    prerequisites.push('変数と制御構造の理解');
    
    if (problem.relatedTopics.includes('ソートアルゴリズム')) {
      prerequisites.push('配列操作の基礎');
    }
  } else if (isDatabaseProblem(problem)) {
    prerequisites.push('データベースの基本概念');
    prerequisites.push('SQL文の基本構文');
    
    if (problem.queries.some(q => q.queryTemplate.includes('JOIN'))) {
      prerequisites.push('テーブル設計の理解');
      prerequisites.push('外部キーの概念');
    }
  }
  
  return prerequisites;
}

/**
 * 問題の強みを特定
 */
function identifyStrengths(problem: Problem): string[] {
  const strengths: string[] = [];
  
  if (problem.hints.length >= 4) {
    strengths.push('段階的なヒント提供');
  }
  
  if (problem.explanation.length > 500) {
    strengths.push('詳細な解説');
  }
  
  if (problem.relatedTopics.length >= 5) {
    strengths.push('包括的な学習項目');
  }
  
  if (isAlgorithmProblem(problem) && problem.testCases.length >= 3) {
    strengths.push('多様なテストケース');
  }
  
  if (isDatabaseProblem(problem) && problem.schema.length >= 3) {
    strengths.push('現実的なデータモデル');
  }
  
  return strengths;
}

/**
 * 改善提案を生成
 */
function generateSuggestions(problem: Problem): string[] {
  const suggestions: string[] = [];
  
  if (problem.hints.length < 3) {
    suggestions.push('ヒントを追加して学習支援を強化');
  }
  
  if (problem.relatedTopics.length < 3) {
    suggestions.push('関連学習項目を追加して知識の体系化を促進');
  }
  
  if (isAlgorithmProblem(problem)) {
    if (problem.testCases.length < 3) {
      suggestions.push('テストケースを追加して検証能力を向上');
    }
    if (problem.blanks.length < 3) {
      suggestions.push('穴埋め箇所を追加して理解度チェックを強化');
    }
  }
  
  if (isDatabaseProblem(problem)) {
    if (problem.queries.length < 2) {
      suggestions.push('複数のクエリ問題で段階的学習を提供');
    }
  }
  
  return suggestions;
}

/**
 * ユーザーの解答統計を計算
 * @param answers ユーザーの解答配列
 * @param problem 対象問題
 * @returns AnswerStatistics 解答統計
 */
export function calculateAnswerStatistics(answers: UserAnswer[], problem: Problem): AnswerStatistics {
  const totalBlanks = isAlgorithmProblem(problem) 
    ? problem.blanks.length 
    : problem.queries.reduce((sum, q) => sum + q.blanks.length, 0);
  
  const answeredBlanks = new Set(answers.map(a => a.blankId)).size;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const incorrectAnswers = answers.length - correctAnswers;
  
  const accuracyRate = answers.length > 0 ? correctAnswers / answers.length : 0;
  const completionRate = totalBlanks > 0 ? answeredBlanks / totalBlanks : 0;
  
  // 平均挑戦回数の計算
  const blankAttempts = new Map<string, number>();
  answers.forEach(answer => {
    blankAttempts.set(answer.blankId, (blankAttempts.get(answer.blankId) || 0) + 1);
  });
  
  const averageAttempts = blankAttempts.size > 0 
    ? Array.from(blankAttempts.values()).reduce((sum, count) => sum + count, 0) / blankAttempts.size
    : 0;

  // 時間計算（簡易版）
  const timeSpent = answers.length > 0 
    ? (answers[answers.length - 1].attemptedAt.getTime() - answers[0].attemptedAt.getTime()) / (1000 * 60)
    : 0;

  return {
    totalBlanks,
    answeredBlanks,
    correctAnswers,
    incorrectAnswers,
    accuracyRate,
    completionRate,
    averageAttempts,
    timeSpent
  };
}

/**
 * 学習進捗の更新
 * @param currentProgress 現在の進捗
 * @param newAnswers 新しい解答
 * @param problem 対象問題
 * @returns LearningProgress 更新された進捗
 */
export function updateLearningProgress(
  currentProgress: LearningProgress,
  newAnswers: UserAnswer[],
  problem: Problem
): LearningProgress {
  const stats = calculateAnswerStatistics(newAnswers, problem);
  
  const updatedProgress: LearningProgress = {
    ...currentProgress,
    status: stats.completionRate >= 1.0 ? 'completed' : 
            stats.completionRate > 0 ? 'in_progress' : 'not_started',
    score: Math.round(stats.accuracyRate * 100),
    attempts: currentProgress.attempts + newAnswers.length,
    timeSpent: currentProgress.timeSpent + stats.timeSpent
  };
  
  if (updatedProgress.status === 'completed' && !updatedProgress.completedAt) {
    updatedProgress.completedAt = new Date();
  }
  
  return updatedProgress;
}

/**
 * 問題の難易度を数値化
 * @param problem 問題データ
 * @returns number 難易度スコア (1-10)
 */
export function calculateDifficultyScore(problem: Problem): number {
  let score = 1;
  
  // 基本難易度
  switch (problem.difficulty) {
    case 'basic': score += 1; break;
    case 'intermediate': score += 3; break;
    case 'advanced': score += 5; break;
  }
  
  // 想定時間による調整
  if (problem.estimatedTime > 30) score += 2;
  else if (problem.estimatedTime > 60) score += 4;
  
  // カテゴリ別の調整
  if (isAlgorithmProblem(problem)) {
    score += problem.blanks.length * 0.5;
    score += problem.testCases.length * 0.3;
  } else if (isDatabaseProblem(problem)) {
    score += problem.queries.length * 0.7;
    score += problem.schema.length * 0.3;
  }
  
  return Math.min(Math.round(score), 10);
}

/**
 * 問題の推奨学習順序を生成
 * @param problems 問題配列
 * @returns Problem[] 学習順序に並べ替えられた問題配列
 */
export function generateLearningOrder(problems: Problem[]): Problem[] {
  return problems.sort((a, b) => {
    // 難易度による並び替え
    const difficultyOrder = { 'basic': 1, 'intermediate': 2, 'advanced': 3 };
    const diffA = difficultyOrder[a.difficulty];
    const diffB = difficultyOrder[b.difficulty];
    
    if (diffA !== diffB) return diffA - diffB;
    
    // 想定時間による並び替え
    if (a.estimatedTime !== b.estimatedTime) return a.estimatedTime - b.estimatedTime;
    
    // カテゴリによる並び替え（アルゴリズム優先）
    if (a.category !== b.category) {
      return a.category === 'algorithm' ? -1 : 1;
    }
    
    // 最後にIDによる並び替え
    return a.id.localeCompare(b.id);
  });
}