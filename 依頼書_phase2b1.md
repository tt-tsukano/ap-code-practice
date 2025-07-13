# Phase 2-B-1 実装依頼書：擬似言語変換エンジン

## 🎯 実装目標
IPA応用情報技術者試験の擬似言語をPythonコードに高精度で自動変換するエンジンを構築

---

## 📋 依頼1：変換ルール定義作成

### 実装依頼
変換ルールを体系的に管理する仕組みを作成してください。

### 実装要件

#### ファイル配置
```
lib/conversion-rules.ts
```

#### 技術仕様
```typescript
export interface ConversionRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  replacement: string | ((match: RegExpMatchArray) => string);
  priority: number;
  category: RuleCategory;
  enabled: boolean;
  examples: RuleExample[];
}

export type RuleCategory = 
  | 'variable_declaration'
  | 'assignment'
  | 'control_structure'
  | 'function_definition'
  | 'operator'
  | 'expression'
  | 'statement';

export interface RuleExample {
  input: string;
  output: string;
  description: string;
}

export class ConversionRules {
  /**
   * すべての変換ルールを取得
   */
  static getAllRules(): ConversionRule[];
  
  /**
   * カテゴリ別ルール取得
   */
  static getRulesByCategory(category: RuleCategory): ConversionRule[];
  
  /**
   * ルールの優先度順ソート
   */
  static sortByPriority(rules: ConversionRule[]): ConversionRule[];
  
  /**
   * ルールの適用テスト
   */
  static testRule(rule: ConversionRule, input: string): boolean;
}
```

#### 具体的なルール定義
```typescript
export const CONVERSION_RULES: ConversionRule[] = [
  // 変数宣言ルール
  {
    id: 'var_integer',
    name: '整数型変数宣言',
    description: '整数型変数をPython変数に変換',
    pattern: /整数型：(\w+)/g,
    replacement: '$1 = 0',
    priority: 100,
    category: 'variable_declaration',
    enabled: true,
    examples: [
      {
        input: '整数型：count',
        output: 'count = 0',
        description: '整数型変数の初期化'
      }
    ]
  },
  
  // 配列宣言ルール
  {
    id: 'array_declaration',
    name: '配列宣言',
    description: '配列をPythonリストに変換',
    pattern: /配列：(\w+)\((\d+)\)/g,
    replacement: '$1 = [0] * $2',
    priority: 95,
    category: 'variable_declaration',
    enabled: true,
    examples: [
      {
        input: '配列：numbers(10)',
        output: 'numbers = [0] * 10',
        description: '要素数10の配列作成'
      }
    ]
  },
  
  // 代入ルール
  {
    id: 'assignment',
    name: '代入演算',
    description: '代入演算子の変換',
    pattern: /(\w+(?:\[.*?\])?)\s*←\s*(.+)/g,
    replacement: '$1 = $2',
    priority: 90,
    category: 'assignment',
    enabled: true,
    examples: [
      {
        input: 'x ← 10',
        output: 'x = 10',
        description: '単純な代入'
      }
    ]
  },
  
  // 制御構造ルール
  {
    id: 'if_statement',
    name: 'if文',
    description: 'if文の変換',
    pattern: /もし\s+(.+?)\s+ならば/g,
    replacement: 'if $1:',
    priority: 85,
    category: 'control_structure',
    enabled: true,
    examples: [
      {
        input: 'もし x > 0 ならば',
        output: 'if x > 0:',
        description: '条件分岐'
      }
    ]
  },
  
  // ループルール
  {
    id: 'for_loop',
    name: 'forループ',
    description: 'forループの変換',
    pattern: /(\w+)\s*を\s*(\d+)\s*から\s*(\d+)\s*まで\s*(\d+)\s*ずつ増やす/g,
    replacement: (match, variable, start, end, step) => 
      `for ${variable} in range(${start}, ${parseInt(end) + 1}, ${step}):`,
    priority: 80,
    category: 'control_structure',
    enabled: true,
    examples: [
      {
        input: 'i を 0 から 9 まで 1 ずつ増やす',
        output: 'for i in range(0, 10, 1):',
        description: '基本的なforループ'
      }
    ]
  },
  
  // 手続き定義ルール
  {
    id: 'procedure_definition',
    name: '手続き定義',
    description: '手続きをPython関数に変換',
    pattern: /手続き\s+(\w+)\((.*?)\)/g,
    replacement: (match, name, params) => {
      // パラメータの型情報を除去
      const cleanParams = params.replace(/[^,\w\s]/g, '').replace(/\s+/g, ' ').trim();
      return `def ${name}(${cleanParams}):`;
    },
    priority: 75,
    category: 'function_definition',
    enabled: true,
    examples: [
      {
        input: '手続き sort(配列:A, 整数:n)',
        output: 'def sort(A, n):',
        description: '引数付き手続き定義'
      }
    ]
  }
];
```

---

## 📋 依頼2：構文解析器作成

### 実装依頼
変換ルールを体系的に管理する仕組みを作成してください。

### 実装要件

#### ファイル配置
```
lib/conversion-rules.ts
```

#### 技術仕様
```typescript
export interface ConversionRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  replacement: string | ((match: RegExpMatchArray) => string);
  priority: number;
  category: RuleCategory;
  enabled: boolean;
  examples: RuleExample[];
}

export type RuleCategory = 
  | 'variable_declaration'
  | 'assignment'
  | 'control_structure'
  | 'function_definition'
  | 'operator'
  | 'expression'
  | 'statement';

export interface RuleExample {
  input: string;
  output: string;
  description: string;
}

export class ConversionRules {
  /**
   * すべての変換ルールを取得
   */
  static getAllRules(): ConversionRule[];
  
  /**
   * カテゴリ別ルール取得
   */
  static getRulesByCategory(category: RuleCategory): ConversionRule[];
  
  /**
   * ルールの優先度順ソート
   */
  static sortByPriority(rules: ConversionRule[]): ConversionRule[];
  
  /**
   * ルールの適用テスト
   */
  static testRule(rule: ConversionRule, input: string): boolean;
}
```

#### 具体的なルール定義
```typescript
export const CONVERSION_RULES: ConversionRule[] = [
  // 変数宣言ルール
  {
    id: 'var_integer',
    name: '整数型変数宣言',
    description: '整数型変数をPython変数に変換',
    pattern: /整数型：(\w+)/g,
    replacement: '$1 = 0',
    priority: 100,
    category: 'variable_declaration',
    enabled: true,
    examples: [
      {
        input: '整数型：count',
        output: 'count = 0',
        description: '整数型変数の初期化'
      }
    ]
  },
  
  // 配列宣言ルール
  {
    id: 'array_declaration',
    name: '配列宣言',
    description: '配列をPythonリストに変換',
    pattern: /配列：(\w+)\((\d+)\)/g,
    replacement: '$1 = [0] * $2',
    priority: 95,
    category: 'variable_declaration',
    enabled: true,
    examples: [
      {
        input: '配列：numbers(10)',
        output: 'numbers = [0] * 10',
        description: '要素数10の配列作成'
      }
    ]
  },
  
  // 代入ルール
  {
    id: 'assignment',
    name: '代入演算',
    description: '代入演算子の変換',
    pattern: /(\w+(?:\[.*?\])?)\s*←\s*(.+)/g,
    replacement: '$1 = $2',
    priority: 90,
    category: 'assignment',
    enabled: true,
    examples: [
      {
        input: 'x ← 10',
        output: 'x = 10',
        description: '単純な代入'
      }
    ]
  },
  
  // 制御構造ルール
  {
    id: 'if_statement',
    name: 'if文',
    description: 'if文の変換',
    pattern: /もし\s+(.+?)\s+ならば/g,
    replacement: 'if $1:',
    priority: 85,
    category: 'control_structure',
    enabled: true,
    examples: [
      {
        input: 'もし x > 0 ならば',
        output: 'if x > 0:',
        description: '条件分岐'
      }
    ]
  },
  
  // ループルール
  {
    id: 'for_loop',
    name: 'forループ',
    description: 'forループの変換',
    pattern: /(\w+)\s*を\s*(\d+)\s*から\s*(\d+)\s*まで\s*(\d+)\s*ずつ増やす/g,
    replacement: (match, variable, start, end, step) => 
      `for ${variable} in range(${start}, ${parseInt(end) + 1}, ${step}):`,
    priority: 80,
    category: 'control_structure',
    enabled: true,
    examples: [
      {
        input: 'i を 0 から 9 まで 1 ずつ増やす',
        output: 'for i in range(0, 10, 1):',
        description: '基本的なforループ'
      }
    ]
  },
  
  // 手続き定義ルール
  {
    id: 'procedure_definition',
    name: '手続き定義',
    description: '手続きをPython関数に変換',
    pattern: /手続き\s+(\w+)\((.*?)\)/g,
    replacement: (match, name, params) => {
      // パラメータの型情報を除去
      const cleanParams = params.replace(/[^,\w\s]/g, '').replace(/\s+/g, ' ').trim();
      return `def ${name}(${cleanParams}):`;
    },
    priority: 75,
    category: 'function_definition',
    enabled: true,
    examples: [
      {
        input: '手続き sort(配列:A, 整数:n)',
        output: 'def sort(A, n):',
        description: '引数付き手続き定義'
      }
    ]
  }
];
```

---

## 📋 依頼3：構文解析器作成

### 実装依頼
擬似言語の構文を解析してASTを生成する構文解析器を作成してください。

### 実装要件

#### ファイル配置
```
lib/syntax-parser.ts
```

#### 技術仕様
```typescript
export interface PseudoAST {
  type: 'Program';
  body: Statement[];
  metadata: {
    totalLines: number;
    complexity: number;
    procedures: string[];
    variables: VariableInfo[];
  };
}

export type Statement = 
  | VariableDeclaration
  | Assignment
  | IfStatement
  | ForStatement
  | WhileStatement
  | ProcedureDeclaration
  | ExpressionStatement;

export interface VariableDeclaration {
  type: 'VariableDeclaration';
  dataType: 'integer' | 'string' | 'array';
  name: string;
  size?: number;
  line: number;
}

export interface Assignment {
  type: 'Assignment';
  left: Expression;
  right: Expression;
  line: number;
}

export interface IfStatement {
  type: 'IfStatement';
  condition: Expression;
  consequent: Statement[];
  alternate?: Statement[];
  line: number;
}

export interface ForStatement {
  type: 'ForStatement';
  variable: string;
  start: Expression;
  end: Expression;
  step: Expression;
  body: Statement[];
  line: number;
}

export interface ProcedureDeclaration {
  type: 'ProcedureDeclaration';
  name: string;
  parameters: Parameter[];
  body: Statement[];
  line: number;
}

export class SyntaxParser {
  /**
   * 擬似言語をASTに解析
   */
  static parse(pseudoCode: string): PseudoAST;
  
  /**
   * 構文エラーの検出
   */
  static validateSyntax(pseudoCode: string): SyntaxError[];
  
  /**
   * ASTの可視化（デバッグ用）
   */
  static printAST(ast: PseudoAST): string;
}
```

---

## 📋 依頼3：Pythonコード生成器作成

### 実装依頼
ASTからPythonコードを生成する生成器を作成してください。

### 実装要件

#### ファイル配置
```
lib/python-generator.ts
```

#### 技術仕様
```typescript
export interface GenerationOptions {
  indentSize: number;
  includeComments: boolean;
  includeTypeHints: boolean;
  optimizeCode: boolean;
}

export interface GenerationResult {
  code: string;
  imports: string[];
  functions: string[];
  variables: string[];
  complexity: number;
}

export class PythonGenerator {
  /**
   * ASTからPythonコードを生成
   */
  static generate(
    ast: PseudoAST, 
    options: GenerationOptions = {}
  ): GenerationResult;
  
  /**
   * コードの最適化
   */
  static optimize(code: string): string;
  
  /**
   * コードの妥当性検証
   */
  static validatePython(code: string): ValidationResult;
}
```

---

## 📋 依頼4：メイン変換エンジン作成

### 実装依頼
IPA擬似言語をPythonコードに変換するメインエンジンを作成してください。

### 実装要件

#### ファイル配置
```
lib/pseudo-converter.ts      # メイン変換エンジン
```

#### 技術仕様
```typescript
// lib/pseudo-converter.ts

export interface ConversionOptions {
  includeComments?: boolean;     // コメント出力するか
  indentSize?: number;          // インデントサイズ
  includeDebugInfo?: boolean;   // デバッグ情報を含むか
  validateOutput?: boolean;     // 出力を検証するか
}

export interface ConversionResult {
  success: boolean;
  pythonCode: string;
  errors: ConversionError[];
  warnings: ConversionWarning[];
  steps: ConversionStep[];
  metadata: ConversionMetadata;
}

export interface ConversionError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ConversionStep {
  stepNumber: number;
  description: string;
  inputText: string;
  outputText: string;
  ruleApplied: string;
}

export interface ConversionMetadata {
  totalLines: number;
  conversionTime: number;
  rulesApplied: number;
  complexityScore: number;
}

export class PseudoCodeConverter {
  /**
   * 擬似言語をPythonコードに変換
   */
  static convert(
    pseudoCode: string, 
    options: ConversionOptions = {}
  ): ConversionResult;
  
  /**
   * 段階的変換（デバッグ用）
   */
  static convertWithSteps(
    pseudoCode: string,
    options: ConversionOptions = {}
  ): ConversionResult;
  
  /**
   * 変換結果の検証
   */
  static validateConversion(
    pseudoCode: string,
    pythonCode: string
  ): ValidationResult;
}
```

### 対応する擬似言語構文

#### 1. 変数宣言
```
IPA擬似言語 → Python
整数型：N → N = 0
文字列型：S → S = ""
配列：A(10) → A = [0] * 10
配列：B(整数型, 5) → B = [0] * 5
```

#### 2. 代入演算
```
N ← 10 → N = 10
A[i] ← value → A[i] = value
result ← function(param) → result = function(param)
```

#### 3. 制御構造
```
もし 条件式 ならば → if 条件式:
そうでなければ → else:
条件式の間，繰り返す → while 条件式:
i を 1 から 10 まで 1 ずつ増やす → for i in range(1, 11):
```

#### 4. 手続き定義
```
手続き sort(配列:A, 整数:n) → def sort(A, n):
戻り値 result → return result
```

#### 5. 演算子
```
// → //  (整数除算)
% → %   (剰余)
≠ → !=  (不等号)
≤ → <=  (以下)
≥ → >=  (以上)
```

### 実装例
```typescript
// 使用例
const converter = new PseudoCodeConverter();
const result = converter.convert(`
手続き selectionSort(配列:array, 整数:n)
  整数:i, j, min_idx, temp
  i を 0 から n-2 まで 1 ずつ増やす
    min_idx ← i
    j を i+1 から n-1 まで 1 ずつ増やす
      もし array[j] < array[min_idx] ならば
        min_idx ← j
    もし i ≠ min_idx ならば
      temp ← array[i]
      array[i] ← array[min_idx] 
      array[min_idx] ← temp
`);

// 期待する出力
/*
def selectionSort(array, n):
    i = 0
    j = 0
    min_idx = 0
    temp = 0
    
    for i in range(0, n-1):
        min_idx = i
        for j in range(i+1, n):
            if array[j] < array[min_idx]:
                min_idx = j
        if i != min_idx:
            temp = array[i]
            array[i] = array[min_idx]
            array[min_idx] = temp
*/
```

---

## 📋 依頼5：統合コンポーネント作成

### 実装依頼
変換エンジンを使用するReactコンポーネントを作成してください。

### 実装要件

#### ファイル配置
```
components/
├── PseudoCodeViewer.tsx     # 擬似言語表示
├── ConversionPreview.tsx    # 変換プレビュー
├── ConversionDemo.tsx       # 変換デモ
└── ConversionSteps.tsx      # 変換ステップ表示
```

#### コンポーネント仕様
```typescript
// components/PseudoCodeViewer.tsx
interface PseudoCodeViewerProps {
  pseudoCode: string;
  highlightBlanks?: boolean;
  onBlankClick?: (blankId: string) => void;
  readOnly?: boolean;
}

// components/ConversionPreview.tsx
interface ConversionPreviewProps {
  pseudoCode: string;
  showSteps?: boolean;
  autoUpdate?: boolean;
  onConversionComplete?: (result: ConversionResult) => void;
}

// components/ConversionDemo.tsx
interface ConversionDemoProps {
  initialPseudoCode?: string;
  showRules?: boolean;
  editable?: boolean;
}
```

#### UI要件
- **擬似言語エディタ**: シンタックスハイライト付き
- **リアルタイム変換**: 入力変更時の自動変換
- **ステップ表示**: 変換過程の可視化
- **エラー表示**: 変換エラーの分かりやすい表示
- **ルール表示**: 適用されたルールの説明

---

## 📋 依頼6：デモページ作成

### 実装依頼
変換エンジンの動作を確認できるデモページを作成してください。

### 実装要件

#### ファイル配置
```
pages/demo/
└── converter.tsx           # 変換エンジンデモページ
```

#### 機能要件
- **実際の問題での変換テスト**: r4s-q8.jsonの擬似言語を使用
- **インタラクティブエディタ**: リアルタイム変換プレビュー
- **変換ステップ表示**: 段階的変換過程の可視化
- **エラー・警告表示**: 変換時の問題点表示
- **コード実行テスト**: 生成されたPythonコードの実行確認

#### デモコンテンツ
```typescript
// デモ用サンプルコード
const DEMO_PSEUDO_CODES = [
  {
    name: '選択ソート（簡易版）',
    code: `手続き simpleSort(配列:arr, 整数:n)
  整数:i, j, temp
  i を 0 から n-2 まで 1 ずつ増やす
    j を i+1 から n-1 まで 1 ずつ増やす
      もし arr[i] > arr[j] ならば
        temp ← arr[i]
        arr[i] ← arr[j]
        arr[j] ← temp`
  },
  {
    name: '実際の試験問題（r4s-q8）',
    code: '// r4s-q8.jsonからロードした擬似言語'
  }
];
```

---

## 🔧 実装の進め方

### 推奨実装順序
1. **依頼1**: 変換ルール定義（基盤となるルール）
2. **依頼2**: 構文解析器（AST生成）
3. **依頼3**: Pythonコード生成器（コード出力）
4. **依頼4**: メイン変換エンジン（全体統合）
5. **依頼5**: Reactコンポーネント（UI）
6. **依頼6**: デモページ（統合テスト）

### 品質チェックポイント
- [ ] TypeScript型エラーなし
- [ ] r4s-q8.jsonの擬似言語で変換成功
- [ ] 生成されたPythonコードが実行可能
- [ ] エラーハンドリングが適切
- [ ] UIが直感的で使いやすい

---

## 📊 成功基準

### 変換精度
- [ ] 基本構文の変換精度 100%
- [ ] 複雑な制御構造の変換精度 95%以上
- [ ] 実際の試験問題での変換成功率 95%以上

### パフォーマンス
- [ ] 変換時間 1秒以内（100行以下のコード）
- [ ] メモリ使用量 10MB以下
- [ ] リアルタイム変換の遅延 100ms以下

### ユーザビリティ
- [ ] エラーメッセージが分かりやすい
- [ ] 変換ステップが理解しやすい
- [ ] UIが直感的で操作しやすい

---

## 🎯 期待する成果

### 技術的成果
- **高精度変換エンジン**: IPA擬似言語→Python変換
- **教育価値**: 変換過程の可視化による学習効果
- **拡張性**: 新しい構文・ルールの追加容易性

### 学習効果
- **理解促進**: 擬似言語とPythonの対応関係の明確化
- **実行確認**: 変換されたコードによる動作確認
- **段階的学習**: 変換ステップによる理解深化

Phase 2-A の成果を活用し、Phase 2-B-1 を完成させましょう！

どの依頼から開始しますか？**依頼2（変換ルール定義）**から始めることを推奨します。