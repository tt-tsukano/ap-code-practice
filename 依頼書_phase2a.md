# Phase 2-A 実装依頼書：問題データ作成

## 🎯 実装目標
令和4年春期の応用情報技術者試験問題をデジタル化し、実行可能な問題データを作成する

---

## 📋 依頼1：型定義ファイル作成

### 実装依頼
問題データの型定義を統合したTypeScriptファイルを作成してください。

### 実装要件

#### ファイル配置
```
types/
└── problem.ts
```

#### 実装内容
以下のすべての型定義を統合し、エクスポートしてください。

```typescript
// types/problem.ts
export type ProblemCategory = 'algorithm' | 'database';
export type Difficulty = 'basic' | 'intermediate' | 'advanced';
export type Season = 'spring' | 'autumn';
export type BlankType = 'expression' | 'statement' | 'condition' | 'variable';
export type SqlType = 'INTEGER' | 'TEXT' | 'REAL' | 'DATE' | 'DATETIME';

// 基本問題インターフェース
export interface BaseProblem {
  id: string;
  title: string;
  year: string;
  season: Season;
  number: number;
  category: ProblemCategory;
  difficulty: Difficulty;
  estimatedTime: number; // 想定解答時間（分）
  description: string;   // 問題文
  explanation: string;   // 詳細解説
  hints: string[];      // 段階的ヒント
  relatedTopics: string[]; // 関連する学習項目
}

// 穴埋め項目
export interface BlankItem {
  id: string;           // blank_1, blank_2, etc.
  position: number;     // コード内の位置（行番号）
  type: BlankType;
  description: string;  // 空欄の説明
  options: {
    key: string;        // 'ア', 'イ', 'ウ', 'エ'
    value: string;      // 実際のコード
    description: string; // 選択肢の説明
  }[];
  correct: string;      // 正解のkey ('ア', 'イ', etc.)
  explanation: string;  // 正解の理由
}

// テストケース
export interface TestCase {
  id: string;
  description: string;  // テストケースの説明
  input: {
    variables: Record<string, any>;  // 入力変数
    description: string;
  };
  expected: {
    output: any;        // 期待する出力
    variables?: Record<string, any>; // 期待する変数状態
    description: string;
  };
}

// アルゴリズム問題
export interface AlgorithmProblem extends BaseProblem {
  category: 'algorithm';
  situation: string;    // 設定・背景
  pseudoCode: string;   // IPA擬似言語コード
  blanks: BlankItem[];  // 穴埋め箇所
  testCases: TestCase[]; // テスト・検証
}

// データベース用の型定義
export interface ColumnDefinition {
  name: string;
  type: SqlType;
  nullable: boolean;
  description: string;
}

export interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface SchemaDefinition {
  tableName: string;
  description: string;   // テーブルの説明
  columns: ColumnDefinition[];
  primaryKey: string[];
  foreignKeys: ForeignKey[];
  sampleData: any[][];   // 実際のテストデータ
}

export interface QueryProblem {
  id: string;
  description: string;   // 問いの内容
  queryTemplate: string; // 穴埋めSQL
  blanks: BlankItem[];   // SQL用の穴埋め
  expectedResult: {
    columns: string[];
    data: any[][];
    description: string;
  };
  explanation: string;
}

// データベース問題
export interface DatabaseProblem extends BaseProblem {
  category: 'database';
  scenario: string;      // 業務シナリオ
  erdDiagram?: string;   // E-R図のURL（オプション）
  schema: SchemaDefinition[]; // データベース構造
  queries: QueryProblem[];    // SQL問題
}

// ユニオン型
export type Problem = AlgorithmProblem | DatabaseProblem;

// ユーザーの解答状態
export interface UserAnswer {
  problemId: string;
  blankId: string;
  selectedOption: string; // 'ア', 'イ', 'ウ', 'エ'
  isCorrect: boolean;
  attemptedAt: Date;
}

// 実行結果
export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
}

// 学習進捗
export interface LearningProgress {
  problemId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;        // 0-100
  attempts: number;
  completedAt?: Date;
  timeSpent: number;    // 分
}
```

### 品質要件
- TypeScript strict mode対応
- すべてのプロパティに適切な型定義
- JSDocコメントで各型の説明を追加
- エクスポートの整理

### 追加実装
型定義ファイルと合わせて、型ガード関数も作成してください：

```typescript
// 型ガード関数
export function isAlgorithmProblem(problem: Problem): problem is AlgorithmProblem {
  return problem.category === 'algorithm';
}

export function isDatabaseProblem(problem: Problem): problem is DatabaseProblem {
  return problem.category === 'database';
}

export function validateProblemData(data: any): data is Problem {
  // 基本的なバリデーションロジック
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.category === 'string' &&
    (data.category === 'algorithm' || data.category === 'database')
  );
}
```

---

## 📋 依頼2：アルゴリズム問題データ作成

### 実装依頼
令和4年春期 午後問題 問8のアルゴリズム問題をJSONデータ化してください。

### 問題情報
- **年度**: 令和4年春期（2022年春）
- **問題番号**: 問8
- **分野**: アルゴリズム
- **テーマ**: 配列操作・選択ソート

### 問題内容（要約）
配列の要素を特定の条件に従って並び替える選択ソートアルゴリズムの問題。
擬似言語で書かれたソートプログラムの空欄を埋める形式。

### 実装要件

#### 1. データ構造定義
```typescript
// types/problem.ts に追加
interface AlgorithmProblem {
  id: string;
  title: string;
  year: string;
  season: 'spring' | 'autumn';
  number: number;
  category: 'algorithm';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: number; // 想定解答時間（分）
  
  // 問題内容
  description: string;      // 問題文
  situation: string;        // 設定・背景
  pseudoCode: string;       // IPA擬似言語コード
  
  // 穴埋め問題
  blanks: BlankItem[];
  
  // テスト・検証
  testCases: TestCase[];
  
  // 学習支援
  explanation: string;      // 詳細解説
  hints: string[];         // 段階的ヒント
  relatedTopics: string[]; // 関連する学習項目
}

interface BlankItem {
  id: string;              // blank_1, blank_2, etc.
  position: number;        // コード内の位置（行番号）
  type: 'expression' | 'statement' | 'condition' | 'variable';
  description: string;     // 空欄の説明
  options: {
    key: string;           // 'ア', 'イ', 'ウ', 'エ'
    value: string;         // 実際のコード
    description: string;   // 選択肢の説明
  }[];
  correct: string;         // 正解のkey ('ア', 'イ', etc.)
  explanation: string;     // 正解の理由
}

interface TestCase {
  id: string;
  description: string;     // テストケースの説明
  input: {
    variables: Record<string, any>;  // 入力変数
    description: string;
  };
  expected: {
    output: any;           // 期待する出力
    variables?: Record<string, any>; // 期待する変数状態
    description: string;
  };
}
```

#### 2. ファイル配置
```
data/problems/algorithm/
└── r4s-q8.json
```

#### 3. 実装内容

**問題データの詳細化要件:**
- IPA擬似言語の正確な転記
- 選択肢（ア、イ、ウ、エ）の完全再現
- 最低3つの意味のあるテストケース
- 段階的ヒント（3段階：軽いヒント→詳細ヒント→解法ヒント）
- 初学者にも分かる詳細解説

**品質要件:**
- 実行可能なPythonコードに変換可能な擬似言語
- 多様な入力パターンでの検証可能性
- 学習効果の高い解説・ヒント

### サンプル実装例
```json
{
  "id": "r4s-q8",
  "title": "配列要素の選択ソート",
  "year": "2022",
  "season": "spring", 
  "number": 8,
  "category": "algorithm",
  "difficulty": "intermediate",
  "estimatedTime": 25,
  
  "description": "配列の要素を昇順に並び替える選択ソートアルゴリズムについて...",
  "situation": "n個の整数が格納された配列arrayを昇順に並び替える処理を考える...",
  
  "pseudoCode": "手続き selectionSort(配列:array, 整数:n)\n  整数:i, j, min_idx, temp\n  i を 0 から n-2 まで 1 ずつ増やす\n    min_idx ← i\n    j を ［　ア　］から n-1 まで 1 ずつ増やす\n      もし array[j] < array[min_idx] ならば\n        ［　イ　］\n      もし ［　ウ　］ ならば\n        temp ← array[i]\n        array[i] ← array[min_idx]\n        array[min_idx] ← temp",
  
  "blanks": [
    {
      "id": "blank_a",
      "position": 4,
      "type": "expression",
      "description": "内側ループの開始値",
      "options": [
        {"key": "ア", "value": "i+1", "description": "現在位置の次から検索開始"},
        {"key": "イ", "value": "i", "description": "現在位置から検索開始"},
        {"key": "ウ", "value": "0", "description": "配列の先頭から検索開始"},
        {"key": "エ", "value": "1", "description": "配列の2番目から検索開始"}
      ],
      "correct": "ア",
      "explanation": "選択ソートでは、未ソート部分（i+1以降）から最小値を探すため、i+1から開始する"
    }
  ],
  
  "testCases": [
    {
      "id": "test_1",
      "description": "基本的なケース",
      "input": {
        "variables": {"array": [64, 34, 25, 12, 22, 11, 90], "n": 7},
        "description": "7個の未ソート配列"
      },
      "expected": {
        "output": [11, 12, 22, 25, 34, 64, 90],
        "description": "昇順にソートされた配列"
      }
    }
  ],
  
  "explanation": "選択ソートは...",
  "hints": [
    "選択ソートは未ソート部分から最小値を選んで前に移動させるアルゴリズムです",
    "内側のループでは、現在の位置より後ろの要素から最小値を探します",
    "最小値が見つかったら、現在の位置の要素と交換します"
  ],
  "relatedTopics": ["配列操作", "ソートアルゴリズム", "ループ処理", "変数交換"]
}
```

---

## 📋 依頼3：データベース問題データ作成

### 実装依頼
令和4年春期 午後問題 問3のデータベース問題をJSONデータ化してください。

### 問題情報
- **年度**: 令和4年春期（2022年春）
- **問題番号**: 問3
- **分野**: データベース
- **テーマ**: JOIN演算・集約関数

### 実装要件

#### 1. データ構造定義
```typescript
// types/problem.ts に追加
interface DatabaseProblem {
  id: string;
  title: string;
  year: string;
  season: 'spring' | 'autumn';
  number: number;
  category: 'database';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: number;
  
  // 問題内容
  description: string;
  scenario: string;         // 業務シナリオ
  erdDiagram?: string;      // E-R図のURL（今回は省略可）
  
  // データベース構造
  schema: SchemaDefinition[];
  
  // SQL問題
  queries: QueryProblem[];
  
  // 学習支援  
  explanation: string;
  hints: string[];
  relatedTopics: string[];
}

interface SchemaDefinition {
  tableName: string;
  description: string;      // テーブルの説明
  columns: ColumnDefinition[];
  primaryKey: string[];
  foreignKeys: ForeignKey[];
  sampleData: any[][];      // 実際のテストデータ
}

interface ColumnDefinition {
  name: string;
  type: 'INTEGER' | 'TEXT' | 'REAL' | 'DATE' | 'DATETIME';
  nullable: boolean;
  description: string;
}

interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

interface QueryProblem {
  id: string;
  description: string;      // 問いの内容
  queryTemplate: string;    // 穴埋めSQL
  blanks: BlankItem[];      // SQL用の穴埋め
  expectedResult: {
    columns: string[];
    data: any[][];
    description: string;
  };
  explanation: string;
}
```

#### 2. ファイル配置
```
data/problems/database/
└── r4s-q3.json
```

#### 3. 実装内容

**データベース問題の詳細化要件:**
- 完全なテーブルスキーマ定義
- 実際に実行可能なサンプルデータ
- SQL穴埋め問題の正確な再現
- 期待する実行結果の明記

**品質要件:**
- SQLiteで実行可能なスキーマ・データ
- 実際の業務を想定したリアルなデータ
- 初学者でも理解しやすい問題設定

### サンプル実装例
```json
{
  "id": "r4s-q3",
  "title": "販売管理システムのデータ分析",
  "year": "2022",
  "season": "spring",
  "number": 3,
  "category": "database", 
  "difficulty": "intermediate",
  "estimatedTime": 30,
  
  "description": "ある企業の販売管理システムについて...",
  "scenario": "商品の売上データを分析するため、以下のテーブルから必要な情報を抽出する...",
  
  "schema": [
    {
      "tableName": "商品",
      "description": "商品マスタ",
      "columns": [
        {"name": "商品ID", "type": "TEXT", "nullable": false, "description": "商品の一意識別子"},
        {"name": "商品名", "type": "TEXT", "nullable": false, "description": "商品の名称"},
        {"name": "単価", "type": "INTEGER", "nullable": false, "description": "商品の単価（円）"},
        {"name": "カテゴリID", "type": "TEXT", "nullable": false, "description": "商品カテゴリの識別子"}
      ],
      "primaryKey": ["商品ID"],
      "foreignKeys": [
        {"column": "カテゴリID", "referencedTable": "カテゴリ", "referencedColumn": "カテゴリID"}
      ],
      "sampleData": [
        ["P001", "ノートPC", 80000, "C001"],
        ["P002", "マウス", 2000, "C002"],
        ["P003", "キーボード", 5000, "C002"]
      ]
    }
  ],
  
  "queries": [
    {
      "id": "query_1",
      "description": "各カテゴリの売上合計を求める",
      "queryTemplate": "SELECT c.カテゴリ名, ［　ア　］\nFROM カテゴリ c\nJOIN 商品 p ON c.カテゴリID = p.カテゴリID\nJOIN 売上 s ON p.商品ID = s.商品ID\n［　イ　］\nORDER BY 売上合計 DESC",
      "blanks": [
        {
          "id": "blank_a", 
          "position": 1,
          "type": "expression",
          "description": "売上合計を計算するSELECT句",
          "options": [
            {"key": "ア", "value": "SUM(s.単価 * s.数量) AS 売上合計", "description": "単価×数量の合計"},
            {"key": "イ", "value": "COUNT(*) AS 売上合計", "description": "レコード数の合計"},
            {"key": "ウ", "value": "AVG(s.数量) AS 売上合計", "description": "数量の平均"},
            {"key": "エ", "value": "MAX(s.単価) AS 売上合計", "description": "単価の最大値"}
          ],
          "correct": "ア",
          "explanation": "売上合計は単価×数量の総和で計算する"
        }
      ],
      "expectedResult": {
        "columns": ["カテゴリ名", "売上合計"],
        "data": [["PC関連", 180000], ["周辺機器", 14000]],
        "description": "カテゴリ別売上合計（降順）"
      }
    }
  ]
}
```

---

## 📋 依頼3：型定義ファイル作成

### 実装依頼
問題データの型定義を統合したTypeScriptファイルを作成してください。

### 実装要件

#### ファイル配置
```
types/
└── problem.ts
```

#### 実装内容
上記で定義したすべての型定義を統合し、エクスポートしてください。

```typescript
// types/problem.ts
export type ProblemCategory = 'algorithm' | 'database';
export type Difficulty = 'basic' | 'intermediate' | 'advanced';
export type Season = 'spring' | 'autumn';

// 基本問題インターフェース
export interface BaseProblem {
  id: string;
  title: string;
  year: string;
  season: Season;
  number: number;
  category: ProblemCategory;
  difficulty: Difficulty;
  estimatedTime: number;
  description: string;
  explanation: string;
  hints: string[];
  relatedTopics: string[];
}

// アルゴリズム問題
export interface AlgorithmProblem extends BaseProblem {
  category: 'algorithm';
  situation: string;
  pseudoCode: string;
  blanks: BlankItem[];
  testCases: TestCase[];
}

// データベース問題
export interface DatabaseProblem extends BaseProblem {
  category: 'database';
  scenario: string;
  erdDiagram?: string;
  schema: SchemaDefinition[];
  queries: QueryProblem[];
}

// ユニオン型
export type Problem = AlgorithmProblem | DatabaseProblem;

// その他の型定義...
```

---

## 📋 依頼4：問題ローダー作成

### 実装依頼
作成した問題データを読み込み・管理するユーティリティを作成してください。

### 実装要件

#### ファイル配置
```
lib/
├── problem-loader.ts     # 問題データ読み込み
└── problem-utils.ts      # 問題操作ユーティリティ
```

#### 実装内容
```typescript
// lib/problem-loader.ts
import { Problem, AlgorithmProblem, DatabaseProblem } from '@/types/problem';

export class ProblemLoader {
  static async loadProblem(id: string): Promise<Problem> {
    // 問題IDから該当するJSONファイルを読み込み
  }
  
  static async loadAllProblems(): Promise<Problem[]> {
    // すべての問題を読み込み
  }
  
  static async loadProblemsByCategory(category: 'algorithm' | 'database'): Promise<Problem[]> {
    // カテゴリ別問題読み込み
  }
}

// lib/problem-utils.ts
export function validateProblemData(problem: any): problem is Problem {
  // 問題データの妥当性検証
}

export function generateProblemSummary(problem: Problem): string {
  // 問題の概要生成
}
```

---

## 📋 依頼5：デモページ作成

### 実装依頼
作成した問題データを表示・確認できるデモページを作成してください。

### 実装要件

#### ファイル配置
```
pages/demo/
└── problems.tsx          # 問題データ確認ページ
```

#### 機能要件
- 作成した2問の表示
- 問題データの詳細確認
- JSONデータの可視化
- 各問題へのナビゲーション

---

## 🔧 実装の進め方

### 実装順序（正しい順序）
1. **依頼1**: 型定義ファイル作成（基盤）
2. **依頼2**: アルゴリズム問題データ作成
3. **依頼3**: データベース問題データ作成
4. **依頼4**: 問題ローダー作成
5. **依頼5**: デモページ作成

### 品質チェックポイント
- [ ] TypeScript型エラーなし
- [ ] JSONデータの構文正確性
- [ ] 問題内容の正確性（原文との照合）
- [ ] テストデータの妥当性
- [ ] 実行可能性（Python/SQLとして）

---

## 📊 成功基準

### データ品質
- [ ] 原問題の完全再現
- [ ] 実行可能なコード・SQL
- [ ] 適切なテストケース
- [ ] 分かりやすい解説・ヒント

### 技術品質
- [ ] TypeScript型安全性
- [ ] JSONデータの妥当性
- [ ] ファイル構造の整理
- [ ] エラーハンドリング

### 学習効果
- [ ] 段階的な学習支援
- [ ] 適切な難易度設定
- [ ] 実践的な問題設定

どの依頼から開始しますか？**依頼3（型定義）**から始めることを推奨します！