# Phase 2-B-2 実装依頼書：穴埋め問題UI

## 🎯 実装目標
Phase 2-A で作成した問題データと Phase 2-B-1 の変換エンジンを活用し、直感的で学習効果の高い穴埋め問題インターフェースを構築

---

## 📋 依頼1：穴埋めメインエディタ作成

### 実装依頼
穴埋め問題の中核となるインタラクティブエディタを作成してください。

### 実装要件

#### ファイル配置
```
components/
├── BlankFillEditor.tsx      # 穴埋めメインエディタ
└── BlankFillEditor.module.css # スタイル（必要に応じて）
```

#### 技術仕様
```typescript
export interface BlankFillEditorProps {
  problem: AlgorithmProblem | DatabaseProblem;
  selectedAnswers: Record<string, string>;
  onAnswerChange: (blankId: string, selectedOption: string) => void;
  onValidationRequest: () => void;
  validationResults?: Record<string, boolean>;
  showHints?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface BlankFillState {
  selectedAnswers: Record<string, string>; // blankId -> selectedOption ('ア', 'イ', etc.)
  validationResults: Record<string, boolean>; // blankId -> isCorrect
  currentBlank: string | null; // 現在選択中の穴埋め
  showAllHints: boolean;
  isComplete: boolean;
  score: number; // 0-100
}
```

#### 機能要件
- **問題文表示**: マークダウン対応の問題文レンダリング
- **擬似言語/SQL表示**: 構文ハイライト付きコード表示
- **穴埋めハイライト**: 空欄箇所の視覚的強調表示
- **選択肢UI**: 直感的な選択肢インターフェース
- **リアルタイム反映**: 選択変更の即座反映
- **進捗表示**: 回答状況の可視化

#### UI/UX仕様
- **カラーコーディング**:
  - 未回答: グレー系
  - 回答済み: 青系
  - 正解: 緑系
  - 不正解: 赤系（優しい表現）
- **アニメーション**: 選択時のスムーズな状態遷移
- **レスポンシブ**: モバイル・デスクトップ対応

---

## 📋 依頼2：個別穴埋めアイテム作成

### 実装依頼
個々の穴埋め箇所を表現するコンポーネントを作成してください。

### 実装要件

#### ファイル配置
```
components/
├── BlankItem.tsx            # 個別穴埋めアイテム
└── BlankItemTooltip.tsx     # ツールチップ（ヒント表示）
```

#### 技術仕様
```typescript
export interface BlankItemProps {
  blank: BlankItem;
  selectedOption?: string;
  isCorrect?: boolean;
  showHint?: boolean;
  onSelect: (option: string) => void;
  onHintRequest: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface BlankItemState {
  isOpen: boolean; // 選択肢展開状態
  hoveredOption: string | null;
  showTooltip: boolean;
}
```

#### 機能要件
- **選択肢ドロップダウン**: ア、イ、ウ、エの選択UI
- **状態表示**: 未選択・選択済み・正解・不正解の視覚化
- **ヒント表示**: オンデマンドでのヒント表示
- **キーボード対応**: Enter、矢印キー等での操作
- **アクセシビリティ**: スクリーンリーダー対応

#### インタラクション仕様
```typescript
// 選択肢の状態管理
interface OptionState {
  key: string; // 'ア', 'イ', 'ウ', 'エ'
  value: string; // 実際のコード
  description: string;
  isSelected: boolean;
  isCorrect?: boolean;
  confidence?: number; // 0-1 (将来の機能)
}
```

---

## 📋 依頼3：選択肢UI作成

### 実装依頼
選択肢を表示・選択するためのUIコンポーネントを作成してください。

### 実装要件

#### ファイル配置
```
components/
├── OptionSelector.tsx       # 選択肢セレクター
├── OptionButton.tsx         # 個別選択肢ボタン
└── OptionDescription.tsx    # 選択肢説明
```

#### 技術仕様
```typescript
export interface OptionSelectorProps {
  options: BlankItem['options'];
  selectedOption?: string;
  correctOption?: string;
  onSelect: (option: string) => void;
  showCorrectness?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export interface OptionButtonProps {
  option: BlankItem['options'][0];
  isSelected: boolean;
  isCorrect?: boolean;
  onSelect: () => void;
  disabled?: boolean;
  showFeedback?: boolean;
}
```

#### デザイン仕様
- **選択肢ボタン**: 
  - 基本: 白背景、グレー枠線
  - 選択済み: 青背景、白文字
  - 正解: 緑背景、白文字
  - 不正解: 赤背景（薄め）、白文字
- **ホバー効果**: 微細なアニメーション
- **フォーカス**: アクセシビリティ対応の明確な表示

---

## 📋 依頼4：進捗インジケーター作成

### 実装依頼
学習進捗を可視化するインジケーターを作成してください。

### 実装要件

#### ファイル配置
```
components/
├── ProgressIndicator.tsx    # 進捗インジケーター
├── ScoreDisplay.tsx         # スコア表示
└── CompletionBadge.tsx      # 完了バッジ
```

#### 技術仕様
```typescript
export interface ProgressIndicatorProps {
  totalBlanks: number;
  answeredBlanks: number;
  correctBlanks: number;
  currentBlank?: string;
  onBlankClick?: (blankId: string) => void;
  showScore?: boolean;
  animated?: boolean;
}

export interface ProgressState {
  completionRate: number; // 0-1
  accuracyRate: number;   // 0-1
  currentStreak: number;  // 連続正解数
  timeSpent: number;      // 秒
}
```

#### 機能要件
- **プログレスバー**: 回答進捗の可視化
- **正解率表示**: リアルタイム正解率
- **個別進捗**: 各穴埋めの状況表示
- **ナビゲーション**: 穴埋め間の移動
- **達成感演出**: 完了時のアニメーション

---

## 📋 依頼5：コードハイライター作成

### 実装依頼
擬似言語とSQLのシンタックスハイライトを提供するコンポーネントを作成してください。

### 実装要件

#### ファイル配置
```
components/
├── CodeHighlighter.tsx      # コードハイライター
├── PseudoCodeHighlight.tsx  # 擬似言語ハイライト
└── SqlHighlight.tsx         # SQLハイライト
```

#### 技術仕様
```typescript
export interface CodeHighlighterProps {
  code: string;
  language: 'pseudo' | 'sql' | 'python';
  blanks?: BlankItem[];
  selectedAnswers?: Record<string, string>;
  onBlankClick?: (blankId: string) => void;
  showLineNumbers?: boolean;
  highlightBlanks?: boolean;
  theme?: 'light' | 'dark';
}

export interface HighlightRule {
  pattern: RegExp;
  className: string;
  priority: number;
}
```

#### ハイライト仕様
```typescript
// 擬似言語用ハイライトルール
const PSEUDO_HIGHLIGHT_RULES: HighlightRule[] = [
  {
    pattern: /\b(手続き|もし|ならば|そうでなければ|を|から|まで|ずつ増やす)\b/g,
    className: 'keyword',
    priority: 100
  },
  {
    pattern: /\b(整数型|文字列型|配列)[:：]/g,
    className: 'type',
    priority: 90
  },
  {
    pattern: /[←]/g,
    className: 'operator',
    priority: 80
  },
  {
    pattern: /\[.*?\]/g,
    className: 'bracket',
    priority: 70
  }
];

// SQL用ハイライトルール
const SQL_HIGHLIGHT_RULES: HighlightRule[] = [
  {
    pattern: /\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)\b/gi,
    className: 'sql-keyword',
    priority: 100
  },
  {
    pattern: /\b(SUM|COUNT|AVG|MAX|MIN)\b/gi,
    className: 'sql-function',
    priority: 90
  }
];
```

---

## 📋 依頼6：学習フロー統合ページ作成

### 実装依頼
すべてのコンポーネントを統合した完全な学習体験ページを作成してください。

### 実装要件

#### ファイル配置
```
pages/
└── problems/
    └── [id].tsx            # 動的問題ページ

components/
├── ProblemLayout.tsx       # 問題ページレイアウト
├── ProblemHeader.tsx       # 問題ヘッダー
├── ProblemContent.tsx      # 問題コンテンツ
└── ProblemActions.tsx      # アクションボタン群
```

#### ページ構成
```typescript
// pages/problems/[id].tsx の構造
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
```

#### レイアウト仕様
```
┌─────────────────────────────────────┐
│ Header (問題情報・進捗・ナビゲーション)   │
├─────────────────────────────────────┤
│ 左パネル                 │ 右パネル    │
│ ・問題文                │ ・進捗表示   │
│ ・設定・背景             │ ・ヒント     │
│ ・穴埋めコードエディタ     │ ・アクション  │
│                        │           │
├─────────────────────────────────────┤
│ 下パネル（実行結果・フィードバック）       │
└─────────────────────────────────────┘
```

#### 学習フロー
1. **問題読解**: 問題文・設定の理解
2. **穴埋め回答**: インタラクティブな回答入力
3. **リアルタイム変換**: 擬似言語→Python変換表示
4. **実行・検証**: Pyodide/sql.jsでの実行
5. **結果確認**: 正解判定・フィードバック表示
6. **解説・復習**: 詳細解説・関連学習

---

## 🎨 デザインシステム

### カラーパレット
```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  
  /* Success Colors */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  /* Warning Colors */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  /* Error Colors */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

### アニメーション仕様
```css
/* 状態遷移アニメーション */
.blank-item {
  transition: all 0.2s ease-in-out;
}

.blank-item--selected {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.blank-item--correct {
  animation: success-pulse 0.6s ease-out;
}

@keyframes success-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

---

## 📱 レスポンシブデザイン

### ブレークポイント
```typescript
const breakpoints = {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px'   // Large Desktop
};
```

### レイアウト適応
- **Mobile (< 768px)**: 縦積みレイアウト、フルスクリーン表示
- **Tablet (768px - 1024px)**: 2カラムレイアウト
- **Desktop (> 1024px)**: 3カラムレイアウト、サイドパネル活用

---

## 🔧 実装の進め方

### 推奨実装順序
1. **依頼1**: 穴埋めメインエディタ（基盤コンポーネント）
2. **依頼2**: 個別穴埋めアイテム（コア機能）
3. **依頼3**: 選択肢UI（ユーザーインタラクション）
4. **依頼4**: 進捗インジケーター（UX向上）
5. **依頼5**: コードハイライター（視覚的品質）
6. **依頼6**: 学習フロー統合（完全な体験）

### 段階的テスト
- **依頼1-2完了時**: 基本的な穴埋め機能の動作確認
- **依頼3-4完了時**: ユーザビリティの検証
- **依頼5-6完了時**: 完全な学習フローの統合テスト

---

## 📊 成功基準

### 機能基準
- [ ] すべての穴埋めタイプ（アルゴリズム・データベース）で動作
- [ ] 選択肢の状態管理が正確
- [ ] リアルタイム更新が安定動作
- [ ] Phase 2-B-1 の変換エンジンとシームレス連携

### UX基準
- [ ] 初見ユーザーでも直感的に操作可能
- [ ] 回答変更・修正が容易
- [ ] 進捗状況が明確に把握できる
- [ ] エラー・成功状態が分かりやすい

### パフォーマンス基準
- [ ] 選択肢変更のレスポンス < 100ms
- [ ] ページ読み込み時間 < 2秒
- [ ] モバイル端末での快適な操作
- [ ] メモリリークなし

### アクセシビリティ基準
- [ ] キーボード操作完全対応
- [ ] スクリーンリーダー対応
- [ ] 色覚多様性への配慮
- [ ] WCAG 2.1 AA準拠

---

## 🎯 期待する成果

### 短期成果（Phase 2-B-2完了時）
- **完全な穴埋めUI**: 直感的で学習効果の高いインターフェース
- **変換エンジン統合**: Phase 2-B-1 との完全連携
- **モバイル対応**: 全デバイスでの快適な学習体験

### 中期成果（Phase 2-B完了時）
- **実行・判定統合**: 完全な学習フローの実現
- **教育効果実証**: 実際の学習での効果測定基盤
- **拡張基盤確立**: 新問題追加の容易性確保

### 長期ビジョン
- **学習プラットフォーム**: 応用情報技術者試験の包括的学習支援
- **UI/UXの標準化**: 他の学習分野への展開可能性
- **アクセシビリティ推進**: 誰もが学習できる環境の実現

---

## 🚀 Phase 2-B-2 開始準備

Phase 2-B-1 の擬似言語変換エンジンを基盤として、Phase 2-B-2 の実装準備が整いました。

### 連携ポイント
- **変換エンジン活用**: 穴埋め回答→Python変換→実行プレビュー
- **問題データ活用**: Phase 2-A のr4s-q8.json、r4s-q3.json
- **型定義継承**: types/problem.ts の完全活用

どの依頼から開始しますか？**依頼1（穴埋めメインエディタ）**から始めることを推奨します。