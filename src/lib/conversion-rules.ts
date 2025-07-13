/**
 * 擬似言語からPythonコードへの変換ルール定義
 * IPA応用情報技術者試験の擬似言語に対応
 */

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
  static getAllRules(): ConversionRule[] {
    return CONVERSION_RULES.filter(rule => rule.enabled);
  }
  
  /**
   * カテゴリ別ルール取得
   */
  static getRulesByCategory(category: RuleCategory): ConversionRule[] {
    return CONVERSION_RULES.filter(rule => rule.category === category && rule.enabled);
  }
  
  /**
   * ルールの優先度順ソート
   */
  static sortByPriority(rules: ConversionRule[]): ConversionRule[] {
    return [...rules].sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * ルールの適用テスト
   */
  static testRule(rule: ConversionRule, input: string): boolean {
    return rule.pattern.test(input);
  }

  /**
   * IDによるルール取得
   */
  static getRuleById(id: string): ConversionRule | undefined {
    return CONVERSION_RULES.find(rule => rule.id === id);
  }

  /**
   * 有効なルールのみ取得
   */
  static getEnabledRules(): ConversionRule[] {
    return CONVERSION_RULES.filter(rule => rule.enabled);
  }
}

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
  
  {
    id: 'var_string',
    name: '文字列型変数宣言',
    description: '文字列型変数をPython変数に変換',
    pattern: /文字列型：(\w+)/g,
    replacement: '$1 = ""',
    priority: 100,
    category: 'variable_declaration',
    enabled: true,
    examples: [
      {
        input: '文字列型：name',
        output: 'name = ""',
        description: '文字列型変数の初期化'
      }
    ]
  },

  {
    id: 'var_multiple_integers',
    name: '複数整数型変数宣言',
    description: 'カンマ区切りの複数整数型変数をPython変数に変換',
    pattern: /整数:([^,\n]+(?:,\s*[^,\n]+)*)/g,
    replacement: (match, variables) => {
      const vars = variables.split(',').map((v: string) => v.trim());
      return vars.map((v: string) => `${v} = 0`).join('\n    ');
    },
    priority: 105,
    category: 'variable_declaration',
    enabled: true,
    examples: [
      {
        input: '整数:i, j, min_idx, temp',
        output: 'i = 0\n    j = 0\n    min_idx = 0\n    temp = 0',
        description: '複数の整数型変数の初期化'
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

  {
    id: 'array_declaration_with_type',
    name: '型付き配列宣言',
    description: '型情報付き配列をPythonリストに変換',
    pattern: /配列：(\w+)\(.*?,\s*(\d+)\)/g,
    replacement: '$1 = [0] * $2',
    priority: 96,
    category: 'variable_declaration',
    enabled: true,
    examples: [
      {
        input: '配列：B(整数型, 5)',
        output: 'B = [0] * 5',
        description: '型情報付き配列作成'
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
      },
      {
        input: 'array[i] ← value',
        output: 'array[i] = value',
        description: '配列要素への代入'
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

  {
    id: 'else_statement',
    name: 'else文',
    description: 'else文の変換',
    pattern: /そうでなければ/g,
    replacement: 'else:',
    priority: 84,
    category: 'control_structure',
    enabled: true,
    examples: [
      {
        input: 'そうでなければ',
        output: 'else:',
        description: 'else節'
      }
    ]
  },

  {
    id: 'while_statement',
    name: 'while文',
    description: 'while文の変換',
    pattern: /(.+?)の間，繰り返す/g,
    replacement: 'while $1:',
    priority: 83,
    category: 'control_structure',
    enabled: true,
    examples: [
      {
        input: 'i < n の間，繰り返す',
        output: 'while i < n:',
        description: 'while ループ'
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

  {
    id: 'for_loop_expression',
    name: 'forループ（式付き）',
    description: '式を含むforループの変換',
    pattern: /(\w+)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(\d+)\s*ずつ増やす/g,
    replacement: (match, variable, start, end, step) => {
      // 終了条件を適切に処理
      const endExpr = end.includes('-') ? `${end} + 1` : `${end}`;
      return `for ${variable} in range(${start}, ${endExpr}):`;
    },
    priority: 81,
    category: 'control_structure',
    enabled: true,
    examples: [
      {
        input: 'i を 0 から n-2 まで 1 ずつ増やす',
        output: 'for i in range(0, n-1):',
        description: '式を含むforループ'
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
      if (!params.trim()) {
        return `def ${name}():`;
      }
      // パラメータの型情報を除去して変数名のみ抽出
      const cleanParams = params
        .split(',')
        .map(param => {
          // "配列:A" や "整数:n" から変数名のみ抽出
          const match = param.trim().match(/[^:]+:(\w+)/) || param.trim().match(/(\w+)/);
          return match ? match[1] : param.trim();
        })
        .join(', ');
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
  },

  {
    id: 'return_statement',
    name: '戻り値文',
    description: '戻り値をreturn文に変換',
    pattern: /戻り値\s+(.+)/g,
    replacement: 'return $1',
    priority: 70,
    category: 'statement',
    enabled: true,
    examples: [
      {
        input: '戻り値 result',
        output: 'return result',
        description: '値の返却'
      }
    ]
  },

  // 演算子ルール
  {
    id: 'operator_not_equal',
    name: '不等号演算子',
    description: '不等号をPython演算子に変換',
    pattern: /≠/g,
    replacement: '!=',
    priority: 65,
    category: 'operator',
    enabled: true,
    examples: [
      {
        input: 'x ≠ y',
        output: 'x != y',
        description: '不等号の変換'
      }
    ]
  },

  {
    id: 'operator_less_equal',
    name: '以下演算子',
    description: '以下をPython演算子に変換',
    pattern: /≤/g,
    replacement: '<=',
    priority: 65,
    category: 'operator',
    enabled: true,
    examples: [
      {
        input: 'x ≤ y',
        output: 'x <= y',
        description: '以下演算子の変換'
      }
    ]
  },

  {
    id: 'operator_greater_equal',
    name: '以上演算子',
    description: '以上をPython演算子に変換',
    pattern: /≥/g,
    replacement: '>=',
    priority: 65,
    category: 'operator',
    enabled: true,
    examples: [
      {
        input: 'x ≥ y',
        output: 'x >= y',
        description: '以上演算子の変換'
      }
    ]
  },

  {
    id: 'operator_integer_division',
    name: '整数除算演算子',
    description: '整数除算演算子の変換',
    pattern: /\/\//g,
    replacement: '//',
    priority: 64,
    category: 'operator',
    enabled: true,
    examples: [
      {
        input: 'x // y',
        output: 'x // y',
        description: '整数除算（既にPython形式）'
      }
    ]
  },

  {
    id: 'operator_modulo',
    name: '剰余演算子',
    description: '剰余演算子の変換',
    pattern: /%/g,
    replacement: '%',
    priority: 64,
    category: 'operator',
    enabled: true,
    examples: [
      {
        input: 'x % y',
        output: 'x % y',
        description: '剰余演算（既にPython形式）'
      }
    ]
  }
];