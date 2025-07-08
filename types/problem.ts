/**
 * Phase 2-A: 問題データ作成 - TypeScript型定義
 * 令和4年春期 応用情報技術者試験問題のデジタル化用型定義
 */

// =============================================================================
// 基本型定義
// =============================================================================

/**
 * 問題カテゴリ
 */
export type ProblemCategory = 'algorithm' | 'database';

/**
 * 難易度レベル
 */
export type Difficulty = 'basic' | 'intermediate' | 'advanced';

/**
 * 試験実施季節
 */
export type Season = 'spring' | 'autumn';

/**
 * 穴埋め項目の種類
 */
export type BlankType = 'expression' | 'statement' | 'condition' | 'variable';

/**
 * SQL データ型
 */
export type SqlType = 'INTEGER' | 'TEXT' | 'REAL' | 'DATE' | 'DATETIME';

// =============================================================================
// 基本問題インターフェース
// =============================================================================

/**
 * すべての問題タイプの基底インターフェース
 */
export interface BaseProblem {
  /** 問題の一意識別子 (例: "r4s-q8") */
  id: string;
  /** 問題タイトル */
  title: string;
  /** 実施年度 (例: "2022") */
  year: string;
  /** 実施季節 */
  season: Season;
  /** 問題番号 */
  number: number;
  /** 問題カテゴリ */
  category: ProblemCategory;
  /** 難易度レベル */
  difficulty: Difficulty;
  /** 想定解答時間（分） */
  estimatedTime: number;
  /** 問題文 */
  description: string;
  /** 詳細解説 */
  explanation: string;
  /** 段階的ヒント配列 */
  hints: string[];
  /** 関連する学習項目 */
  relatedTopics: string[];
}

// =============================================================================
// 穴埋め・テスト関連インターフェース
// =============================================================================

/**
 * 穴埋め項目の定義
 */
export interface BlankItem {
  /** 穴埋めの識別子 (例: "blank_1", "blank_a") */
  id: string;
  /** コード内の位置（行番号） */
  position: number;
  /** 穴埋めの種類 */
  type: BlankType;
  /** 空欄の説明 */
  description: string;
  /** 選択肢配列 */
  options: {
    /** 選択肢のキー (例: 'ア', 'イ', 'ウ', 'エ') */
    key: string;
    /** 実際のコード内容 */
    value: string;
    /** 選択肢の説明 */
    description: string;
  }[];
  /** 正解のキー */
  correct: string;
  /** 正解の理由・解説 */
  explanation: string;
}

/**
 * テストケースの定義
 */
export interface TestCase {
  /** テストケースの識別子 */
  id: string;
  /** テストケースの説明 */
  description: string;
  /** 入力データ */
  input: {
    /** 入力変数の値 */
    variables: Record<string, any>;
    /** 入力の説明 */
    description: string;
  };
  /** 期待する結果 */
  expected: {
    /** 期待する出力値 */
    output: any;
    /** 期待する変数状態（オプション） */
    variables?: Record<string, any>;
    /** 期待結果の説明 */
    description: string;
  };
}

// =============================================================================
// アルゴリズム問題インターフェース
// =============================================================================

/**
 * アルゴリズム問題の定義
 */
export interface AlgorithmProblem extends BaseProblem {
  category: 'algorithm';
  /** 問題の設定・背景 */
  situation: string;
  /** IPA擬似言語コード */
  pseudoCode: string;
  /** 穴埋め箇所の配列 */
  blanks: BlankItem[];
  /** テスト・検証用のケース */
  testCases: TestCase[];
}

// =============================================================================
// データベース関連インターフェース
// =============================================================================

/**
 * データベースカラムの定義
 */
export interface ColumnDefinition {
  /** カラム名 */
  name: string;
  /** データ型 */
  type: SqlType;
  /** NULL許可フラグ */
  nullable: boolean;
  /** カラムの説明 */
  description: string;
}

/**
 * 外部キー制約の定義
 */
export interface ForeignKey {
  /** 外部キーとなるカラム名 */
  column: string;
  /** 参照先テーブル名 */
  referencedTable: string;
  /** 参照先カラム名 */
  referencedColumn: string;
}

/**
 * データベーススキーマの定義
 */
export interface SchemaDefinition {
  /** テーブル名 */
  tableName: string;
  /** テーブルの説明 */
  description: string;
  /** カラム定義の配列 */
  columns: ColumnDefinition[];
  /** 主キーとなるカラム名の配列 */
  primaryKey: string[];
  /** 外部キー制約の配列 */
  foreignKeys: ForeignKey[];
  /** 実際のテストデータ（2次元配列） */
  sampleData: any[][];
}

/**
 * SQL問題の定義
 */
export interface QueryProblem {
  /** 問いの識別子 */
  id: string;
  /** 問いの内容・説明 */
  description: string;
  /** 穴埋めSQL文のテンプレート */
  queryTemplate: string;
  /** SQL用の穴埋め箇所 */
  blanks: BlankItem[];
  /** 期待する実行結果 */
  expectedResult: {
    /** 結果のカラム名配列 */
    columns: string[];
    /** 結果データ（2次元配列） */
    data: any[][];
    /** 結果の説明 */
    description: string;
  };
  /** SQL問題の解説 */
  explanation: string;
}

// =============================================================================
// データベース問題インターフェース
// =============================================================================

/**
 * データベース問題の定義
 */
export interface DatabaseProblem extends BaseProblem {
  category: 'database';
  /** 業務シナリオ・背景 */
  scenario: string;
  /** E-R図のURL（オプション） */
  erdDiagram?: string;
  /** データベース構造の配列 */
  schema: SchemaDefinition[];
  /** SQL問題の配列 */
  queries: QueryProblem[];
}

// =============================================================================
// ユニオン型・ユーティリティ型
// =============================================================================

/**
 * 問題データのユニオン型
 */
export type Problem = AlgorithmProblem | DatabaseProblem;

// =============================================================================
// ユーザー関連インターフェース
// =============================================================================

/**
 * ユーザーの解答状態
 */
export interface UserAnswer {
  /** 問題の識別子 */
  problemId: string;
  /** 穴埋めの識別子 */
  blankId: string;
  /** 選択した選択肢 */
  selectedOption: string;
  /** 正解判定フラグ */
  isCorrect: boolean;
  /** 解答日時 */
  attemptedAt: Date;
}

/**
 * 実行結果の定義
 */
export interface ExecutionResult {
  /** 実行成功フラグ */
  success: boolean;
  /** 出力結果（オプション） */
  output?: any;
  /** エラーメッセージ（オプション） */
  error?: string;
  /** 実行時間（ミリ秒） */
  executionTime: number;
  /** メモリ使用量（オプション） */
  memoryUsage?: number;
}

/**
 * 学習進捗の管理
 */
export interface LearningProgress {
  /** 問題の識別子 */
  problemId: string;
  /** 学習状態 */
  status: 'not_started' | 'in_progress' | 'completed';
  /** スコア（0-100） */
  score: number;
  /** 挑戦回数 */
  attempts: number;
  /** 完了日時（オプション） */
  completedAt?: Date;
  /** 学習時間（分） */
  timeSpent: number;
}

// =============================================================================
// 型ガード関数
// =============================================================================

/**
 * アルゴリズム問題かどうかを判定する型ガード
 * @param problem - 判定対象の問題データ
 * @returns アルゴリズム問題の場合true
 */
export function isAlgorithmProblem(problem: Problem): problem is AlgorithmProblem {
  return problem.category === 'algorithm';
}

/**
 * データベース問題かどうかを判定する型ガード
 * @param problem - 判定対象の問題データ
 * @returns データベース問題の場合true
 */
export function isDatabaseProblem(problem: Problem): problem is DatabaseProblem {
  return problem.category === 'database';
}

/**
 * 問題データの基本的なバリデーション
 * @param data - 検証対象のデータ
 * @returns 有効な問題データの場合true
 */
export function validateProblemData(data: any): data is Problem {
  // 基本的なバリデーションロジック
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.year === 'string' &&
    typeof data.category === 'string' &&
    (data.category === 'algorithm' || data.category === 'database') &&
    typeof data.difficulty === 'string' &&
    (data.difficulty === 'basic' || data.difficulty === 'intermediate' || data.difficulty === 'advanced') &&
    typeof data.estimatedTime === 'number' &&
    typeof data.description === 'string' &&
    typeof data.explanation === 'string' &&
    Array.isArray(data.hints) &&
    Array.isArray(data.relatedTopics)
  );
}

/**
 * 穴埋め項目の妥当性を検証
 * @param blank - 検証対象の穴埋めデータ
 * @returns 有効な穴埋めデータの場合true
 */
export function validateBlankItem(blank: any): blank is BlankItem {
  return (
    typeof blank === 'object' &&
    blank !== null &&
    typeof blank.id === 'string' &&
    typeof blank.position === 'number' &&
    typeof blank.type === 'string' &&
    typeof blank.description === 'string' &&
    Array.isArray(blank.options) &&
    blank.options.length > 0 &&
    typeof blank.correct === 'string' &&
    typeof blank.explanation === 'string' &&
    blank.options.every((option: any) => 
      typeof option.key === 'string' &&
      typeof option.value === 'string' &&
      typeof option.description === 'string'
    )
  );
}

/**
 * テストケースの妥当性を検証
 * @param testCase - 検証対象のテストケースデータ
 * @returns 有効なテストケースの場合true
 */
export function validateTestCase(testCase: any): testCase is TestCase {
  return (
    typeof testCase === 'object' &&
    testCase !== null &&
    typeof testCase.id === 'string' &&
    typeof testCase.description === 'string' &&
    typeof testCase.input === 'object' &&
    typeof testCase.input.description === 'string' &&
    typeof testCase.expected === 'object' &&
    typeof testCase.expected.description === 'string'
  );
}