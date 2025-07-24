/**
 * Phase 2-A: 問題ローダー
 * 問題データの読み込み・管理ユーティリティ
 */

import { Problem, AlgorithmProblem, DatabaseProblem, ProblemCategory, validateProblemData } from '@/types/problem';

/**
 * 問題ローダーのエラータイプ
 */
export class ProblemLoaderError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ProblemLoaderError';
  }
}

/**
 * 問題読み込み結果の統計情報
 */
export interface LoadingStats {
  totalProblems: number;
  algorithmProblems: number;
  databaseProblems: number;
  loadedSuccessfully: number;
  failedToLoad: number;
  loadingTimeMs: number;
}

/**
 * 問題データの読み込み・管理を行うクラス
 */
export class ProblemLoader {
  private static problemCache = new Map<string, Problem>();
  private static lastCacheUpdate = 0;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5分間

  /**
   * 問題IDから該当するJSONファイルを読み込み
   * @param id 問題ID (例: "r4s-q8", "r4s-q3")
   * @returns Promise<Problem> 問題データ
   * @throws ProblemLoaderError 読み込みエラーの場合
   */
  static async loadProblem(id: string): Promise<Problem> {
    const startTime = performance.now();
    
    try {
      // キャッシュをチェック
      if (this.problemCache.has(id) && this.isCacheValid()) {
        return this.problemCache.get(id)!;
      }

      const problem = await this.loadProblemFromFile(id);
      
      // バリデーション
      if (!validateProblemData(problem)) {
        throw new ProblemLoaderError(`Invalid problem data structure for ID: ${id}`);
      }

      // キャッシュに保存
      this.problemCache.set(id, problem);
      this.lastCacheUpdate = Date.now();

      const loadTime = performance.now() - startTime;
      console.log(`Problem ${id} loaded successfully in ${loadTime.toFixed(2)}ms`);

      return problem;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      console.error(`Failed to load problem ${id} in ${loadTime.toFixed(2)}ms:`, error);
      
      if (error instanceof ProblemLoaderError) {
        throw error;
      }
      throw new ProblemLoaderError(`Failed to load problem: ${id}`, error as Error);
    }
  }

  /**
   * すべての問題を読み込み
   * @returns Promise<Problem[]> 全問題データの配列
   */
  static async loadAllProblems(): Promise<Problem[]> {
    const startTime = performance.now();
    const problems: Problem[] = [];
    const stats: LoadingStats = {
      totalProblems: 0,
      algorithmProblems: 0,
      databaseProblems: 0,
      loadedSuccessfully: 0,
      failedToLoad: 0,
      loadingTimeMs: 0
    };

    try {
      // 既知の問題IDリスト（実際の実装では動的にファイルリストを取得）
      const knownProblemIds = ['r4s-q8', 'r4s-q3'];
      stats.totalProblems = knownProblemIds.length;

      // 並列読み込みでパフォーマンス向上
      const loadPromises = knownProblemIds.map(async (id) => {
        try {
          const problem = await this.loadProblem(id);
          stats.loadedSuccessfully++;
          
          if (problem.category === 'algorithm') {
            stats.algorithmProblems++;
          } else if (problem.category === 'database') {
            stats.databaseProblems++;
          }
          
          return problem;
        } catch (error) {
          stats.failedToLoad++;
          console.error(`Failed to load problem ${id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(loadPromises);
      
      // null値（読み込み失敗）を除外
      for (const problem of results) {
        if (problem !== null) {
          problems.push(problem);
        }
      }

      stats.loadingTimeMs = performance.now() - startTime;
      
      console.log('All problems loading stats:', stats);
      return problems;
      
    } catch (error) {
      stats.loadingTimeMs = performance.now() - startTime;
      throw new ProblemLoaderError('Failed to load all problems', error as Error);
    }
  }

  /**
   * カテゴリ別問題読み込み
   * @param category 問題カテゴリ ('algorithm' | 'database')
   * @returns Promise<Problem[]> 指定カテゴリの問題データ配列
   */
  static async loadProblemsByCategory(category: ProblemCategory): Promise<Problem[]> {
    const startTime = performance.now();
    
    try {
      const allProblems = await this.loadAllProblems();
      const filteredProblems = allProblems.filter(problem => problem.category === category);
      
      const loadTime = performance.now() - startTime;
      console.log(`Loaded ${filteredProblems.length} ${category} problems in ${loadTime.toFixed(2)}ms`);
      
      return filteredProblems;
    } catch (error) {
      throw new ProblemLoaderError(`Failed to load ${category} problems`, error as Error);
    }
  }

  /**
   * 年度・季節による問題検索
   * @param year 年度 (例: "2022")
   * @param season 季節 ('spring' | 'autumn')
   * @returns Promise<Problem[]> 条件に一致する問題データ配列
   */
  static async loadProblemsByYearAndSeason(year: string, season: 'spring' | 'autumn'): Promise<Problem[]> {
    const startTime = performance.now();
    
    try {
      const allProblems = await this.loadAllProblems();
      const filteredProblems = allProblems.filter(
        problem => problem.year === year && problem.season === season
      );
      
      const loadTime = performance.now() - startTime;
      console.log(`Loaded ${filteredProblems.length} problems for ${year} ${season} in ${loadTime.toFixed(2)}ms`);
      
      return filteredProblems;
    } catch (error) {
      throw new ProblemLoaderError(`Failed to load problems for ${year} ${season}`, error as Error);
    }
  }

  /**
   * 難易度による問題検索
   * @param difficulty 難易度 ('basic' | 'intermediate' | 'advanced')
   * @returns Promise<Problem[]> 指定難易度の問題データ配列
   */
  static async loadProblemsByDifficulty(difficulty: 'basic' | 'intermediate' | 'advanced'): Promise<Problem[]> {
    const startTime = performance.now();
    
    try {
      const allProblems = await this.loadAllProblems();
      const filteredProblems = allProblems.filter(problem => problem.difficulty === difficulty);
      
      const loadTime = performance.now() - startTime;
      console.log(`Loaded ${filteredProblems.length} ${difficulty} problems in ${loadTime.toFixed(2)}ms`);
      
      return filteredProblems;
    } catch (error) {
      throw new ProblemLoaderError(`Failed to load ${difficulty} problems`, error as Error);
    }
  }

  /**
   * 問題のプリロード（バックグラウンドでキャッシュ構築）
   * @returns Promise<void>
   */
  static async preloadProblems(): Promise<void> {
    const startTime = performance.now();
    
    try {
      console.log('Starting problem preload...');
      await this.loadAllProblems();
      
      const loadTime = performance.now() - startTime;
      console.log(`Problem preload completed in ${loadTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('Problem preload failed:', error);
      throw new ProblemLoaderError('Failed to preload problems', error as Error);
    }
  }

  /**
   * キャッシュをクリア
   */
  static clearCache(): void {
    this.problemCache.clear();
    this.lastCacheUpdate = 0;
    console.log('Problem cache cleared');
  }

  /**
   * キャッシュ統計情報を取得
   * @returns キャッシュの統計情報
   */
  static getCacheStats(): { size: number; lastUpdate: number; isValid: boolean } {
    return {
      size: this.problemCache.size,
      lastUpdate: this.lastCacheUpdate,
      isValid: this.isCacheValid()
    };
  }

  /**
   * 実際のファイルから問題データを読み込み（プライベートメソッド）
   * @param id 問題ID
   * @returns Promise<Problem> 問題データ
   */
  private static async loadProblemFromFile(id: string): Promise<Problem> {
    // 問題IDから適切なファイルパスを生成
    const category = this.inferCategoryFromId(id);
    const filePath = `/data/problems/${category}/${id}.json`;

    try {
      // Vite環境では動的インポートを使用
      const problemData = await import(/* @vite-ignore */ filePath);
      return problemData.default || problemData;
    } catch (importError) {
      // フォールバック: fetch APIを使用（静的ファイルとして配信されている場合）
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (fetchError) {
        throw new ProblemLoaderError(
          `Failed to load problem file: ${filePath}`,
          fetchError as Error
        );
      }
    }
  }

  /**
   * 問題IDからカテゴリを推測
   * @param id 問題ID
   * @returns ProblemCategory
   */
  private static inferCategoryFromId(id: string): ProblemCategory {
    // 問題IDの命名規則に基づいてカテゴリを推測
    // r4s-q8 (アルゴリズム), r4s-q3 (データベース) など
    const algorithmQuestions = ['q8', 'q9', 'q10'];
    const databaseQuestions = ['q3', 'q4'];
    
    const questionNumber = id.split('-')[1]?.toLowerCase();
    
    if (algorithmQuestions.includes(questionNumber)) {
      return 'algorithm';
    } else if (databaseQuestions.includes(questionNumber)) {
      return 'database';
    }
    
    // デフォルトではアルゴリズム問題として扱う
    return 'algorithm';
  }

  /**
   * キャッシュが有効かどうかをチェック
   * @returns boolean キャッシュの有効性
   */
  private static isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.CACHE_TTL;
  }
}

/**
 * 便利な関数エクスポート（シンプルなAPI）
 */

/**
 * アルゴリズム問題のみを読み込み
 * @returns Promise<AlgorithmProblem[]>
 */
export async function loadAlgorithmProblems(): Promise<AlgorithmProblem[]> {
  const problems = await ProblemLoader.loadProblemsByCategory('algorithm');
  return problems as AlgorithmProblem[];
}

/**
 * データベース問題のみを読み込み
 * @returns Promise<DatabaseProblem[]>
 */
export async function loadDatabaseProblems(): Promise<DatabaseProblem[]> {
  const problems = await ProblemLoader.loadProblemsByCategory('database');
  return problems as DatabaseProblem[];
}

/**
 * 令和4年春期の問題を読み込み
 * @returns Promise<Problem[]>
 */
export async function loadR4SpringProblems(): Promise<Problem[]> {
  return await ProblemLoader.loadProblemsByYearAndSeason('2022', 'spring');
}

/**
 * 特定の問題を読み込み（エラーハンドリング付き）
 * @param id 問題ID
 * @returns Promise<Problem | null> 問題データまたはnull（エラーの場合）
 */
export async function loadProblemSafely(id: string): Promise<Problem | null> {
  try {
    return await ProblemLoader.loadProblem(id);
  } catch (error) {
    console.error(`Safe load failed for problem ${id}:`, error);
    return null;
  }
}