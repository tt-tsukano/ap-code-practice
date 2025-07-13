/**
 * IPA擬似言語をPythonコードに変換するメインエンジン
 * ルールベース変換とAST変換の統合システム
 */

import { ConversionRules, ConversionRule } from './conversion-rules';
import { SyntaxParser, PseudoAST } from './syntax-parser';
import { PythonGenerator, GenerationOptions, GenerationResult } from './python-generator';

export interface ConversionOptions {
  includeComments?: boolean;     // コメント出力するか
  indentSize?: number;          // インデントサイズ
  includeDebugInfo?: boolean;   // デバッグ情報を含むか
  validateOutput?: boolean;     // 出力を検証するか
  method?: 'rules' | 'ast' | 'hybrid'; // 変換方法
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

export interface ConversionWarning {
  line: number;
  column: number;
  message: string;
  type: 'syntax' | 'semantic' | 'style';
  suggestion?: string;
}

export interface ConversionStep {
  stepNumber: number;
  description: string;
  inputText: string;
  outputText: string;
  ruleApplied: string;
  transformationType: 'rule-based' | 'ast-based';
}

export interface ConversionMetadata {
  totalLines: number;
  conversionTime: number;
  rulesApplied: number;
  complexityScore: number;
  method: string;
  ast?: PseudoAST;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ConversionError[];
  warnings: ConversionWarning[];
  suggestions: string[];
}

export class PseudoCodeConverter {
  /**
   * 擬似言語をPythonコードに変換
   */
  static convert(
    pseudoCode: string, 
    options: ConversionOptions = {}
  ): ConversionResult {
    const startTime = performance.now();
    
    const defaultOptions: ConversionOptions = {
      includeComments: false,
      indentSize: 4,
      includeDebugInfo: false,
      validateOutput: true,
      method: 'hybrid',
      ...options
    };

    try {
      let result: ConversionResult;

      switch (defaultOptions.method) {
        case 'rules':
          result = this.convertWithRules(pseudoCode, defaultOptions);
          break;
        case 'ast':
          result = this.convertWithAST(pseudoCode, defaultOptions);
          break;
        case 'hybrid':
        default:
          result = this.convertHybrid(pseudoCode, defaultOptions);
          break;
      }

      const endTime = performance.now();
      result.metadata.conversionTime = endTime - startTime;

      return result;
    } catch (error) {
      return {
        success: false,
        pythonCode: '',
        errors: [{
          line: 0,
          column: 0,
          message: error instanceof Error ? error.message : 'Unknown conversion error',
          severity: 'error'
        }],
        warnings: [],
        steps: [],
        metadata: {
          totalLines: pseudoCode.split('\n').length,
          conversionTime: performance.now() - startTime,
          rulesApplied: 0,
          complexityScore: 0,
          method: defaultOptions.method || 'unknown'
        }
      };
    }
  }

  /**
   * 段階的変換（デバッグ用）
   */
  static convertWithSteps(
    pseudoCode: string,
    options: ConversionOptions = {}
  ): ConversionResult {
    return this.convert(pseudoCode, { ...options, includeDebugInfo: true });
  }

  /**
   * 変換結果の検証
   */
  static validateConversion(
    pseudoCode: string,
    pythonCode: string
  ): ValidationResult {
    const errors: ConversionError[] = [];
    const warnings: ConversionWarning[] = [];
    const suggestions: string[] = [];

    // 基本的な検証
    const pythonValidation = PythonGenerator.validatePython(pythonCode);
    
    for (const error of pythonValidation.errors) {
      errors.push({
        line: error.line,
        column: 0,
        message: error.message,
        severity: 'error'
      });
    }

    for (const warning of pythonValidation.warnings) {
      warnings.push({
        line: warning.line,
        column: 0,
        message: warning.message,
        type: warning.type as 'syntax' | 'semantic' | 'style'
      });
    }

    // 擬似言語との対応チェック
    const pseudoLines = pseudoCode.split('\n').filter(line => line.trim());
    const pythonLines = pythonCode.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

    if (pythonLines.length < pseudoLines.length * 0.5) {
      warnings.push({
        line: 0,
        column: 0,
        message: 'Generated Python code seems too short compared to pseudo code',
        type: 'semantic'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * ルールベース変換
   */
  private static convertWithRules(pseudoCode: string, options: ConversionOptions): ConversionResult {
    const lines = pseudoCode.split('\n');
    const steps: ConversionStep[] = [];
    const errors: ConversionError[] = [];
    const warnings: ConversionWarning[] = [];
    let rulesApplied = 0;
    let currentCode = pseudoCode;

    // 優先度順にルールを取得
    const rules = ConversionRules.sortByPriority(ConversionRules.getAllRules());

    for (const rule of rules) {
      const beforeTransform = currentCode;
      let hasMatches = false;

      if (typeof rule.replacement === 'string') {
        const newCode = currentCode.replace(rule.pattern, rule.replacement);
        if (newCode !== currentCode) {
          hasMatches = true;
          currentCode = newCode;
        }
      } else {
        // 関数型replacement
        currentCode = currentCode.replace(rule.pattern, rule.replacement);
        hasMatches = currentCode !== beforeTransform;
      }

      if (hasMatches) {
        rulesApplied++;
        
        if (options.includeDebugInfo) {
          steps.push({
            stepNumber: steps.length + 1,
            description: rule.description,
            inputText: beforeTransform,
            outputText: currentCode,
            ruleApplied: rule.id,
            transformationType: 'rule-based'
          });
        }
      }
    }

    // インデント調整
    const formattedCode = this.formatPythonCode(currentCode, options.indentSize || 4);

    return {
      success: true,
      pythonCode: formattedCode,
      errors,
      warnings,
      steps,
      metadata: {
        totalLines: lines.length,
        conversionTime: 0, // 呼び出し元で設定
        rulesApplied,
        complexityScore: this.calculateComplexity(formattedCode),
        method: 'rules'
      }
    };
  }

  /**
   * ASTベース変換
   */
  private static convertWithAST(pseudoCode: string, options: ConversionOptions): ConversionResult {
    const errors: ConversionError[] = [];
    const warnings: ConversionWarning[] = [];
    const steps: ConversionStep[] = [];

    try {
      // 構文解析
      const ast = SyntaxParser.parse(pseudoCode);
      
      if (options.includeDebugInfo) {
        steps.push({
          stepNumber: 1,
          description: 'Parse pseudo code to AST',
          inputText: pseudoCode,
          outputText: JSON.stringify(ast, null, 2),
          ruleApplied: 'syntax-parser',
          transformationType: 'ast-based'
        });
      }

      // 構文エラーチェック
      const syntaxErrors = SyntaxParser.validateSyntax(pseudoCode);
      for (const error of syntaxErrors) {
        if (error.severity === 'error') {
          errors.push({
            line: error.line,
            column: error.column,
            message: error.message,
            severity: 'error'
          });
        } else {
          warnings.push({
            line: error.line,
            column: error.column,
            message: error.message,
            type: 'syntax'
          });
        }
      }

      // Pythonコード生成
      const generationOptions: GenerationOptions = {
        indentSize: options.indentSize,
        includeComments: options.includeComments,
        includeTypeHints: false,
        optimizeCode: true
      };

      const generationResult = PythonGenerator.generate(ast, generationOptions);

      if (options.includeDebugInfo) {
        steps.push({
          stepNumber: 2,
          description: 'Generate Python code from AST',
          inputText: JSON.stringify(ast, null, 2),
          outputText: generationResult.code,
          ruleApplied: 'python-generator',
          transformationType: 'ast-based'
        });
      }

      return {
        success: errors.length === 0,
        pythonCode: generationResult.code,
        errors,
        warnings,
        steps,
        metadata: {
          totalLines: pseudoCode.split('\n').length,
          conversionTime: 0,
          rulesApplied: 0,
          complexityScore: generationResult.complexity,
          method: 'ast',
          ast
        }
      };
    } catch (error) {
      errors.push({
        line: 0,
        column: 0,
        message: error instanceof Error ? error.message : 'AST conversion failed',
        severity: 'error'
      });

      return {
        success: false,
        pythonCode: '',
        errors,
        warnings,
        steps,
        metadata: {
          totalLines: pseudoCode.split('\n').length,
          conversionTime: 0,
          rulesApplied: 0,
          complexityScore: 0,
          method: 'ast'
        }
      };
    }
  }

  /**
   * ハイブリッド変換（ルール + AST）
   */
  private static convertHybrid(pseudoCode: string, options: ConversionOptions): ConversionResult {
    // まずルールベースで前処理
    const ruleResult = this.convertWithRules(pseudoCode, {
      ...options,
      includeDebugInfo: false
    });

    if (!ruleResult.success) {
      return ruleResult;
    }

    // 次にASTベースで構造化変換
    const astResult = this.convertWithAST(ruleResult.pythonCode, {
      ...options,
      includeDebugInfo: false
    });

    // 結果をマージ
    const steps: ConversionStep[] = [];
    
    if (options.includeDebugInfo) {
      steps.push({
        stepNumber: 1,
        description: 'Rule-based preprocessing',
        inputText: pseudoCode,
        outputText: ruleResult.pythonCode,
        ruleApplied: 'conversion-rules',
        transformationType: 'rule-based'
      });

      steps.push({
        stepNumber: 2,
        description: 'AST-based structure conversion',
        inputText: ruleResult.pythonCode,
        outputText: astResult.pythonCode,
        ruleApplied: 'syntax-parser + python-generator',
        transformationType: 'ast-based'
      });
    }

    return {
      success: astResult.success,
      pythonCode: astResult.pythonCode,
      errors: [...ruleResult.errors, ...astResult.errors],
      warnings: [...ruleResult.warnings, ...astResult.warnings],
      steps,
      metadata: {
        totalLines: pseudoCode.split('\n').length,
        conversionTime: 0,
        rulesApplied: ruleResult.metadata.rulesApplied,
        complexityScore: astResult.metadata.complexityScore,
        method: 'hybrid',
        ast: astResult.metadata.ast
      }
    };
  }

  /**
   * Pythonコードの整形
   */
  private static formatPythonCode(code: string, indentSize: number): string {
    const lines = code.split('\n');
    const formattedLines: string[] = [];
    let currentIndent = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedLines.push('');
        continue;
      }

      // インデント調整
      if (trimmedLine.endsWith(':')) {
        formattedLines.push(' '.repeat(currentIndent * indentSize) + trimmedLine);
        currentIndent++;
      } else if (trimmedLine === 'else:' || trimmedLine.startsWith('elif ')) {
        currentIndent = Math.max(0, currentIndent - 1);
        formattedLines.push(' '.repeat(currentIndent * indentSize) + trimmedLine);
        currentIndent++;
      } else {
        // 通常の文
        formattedLines.push(' '.repeat(currentIndent * indentSize) + trimmedLine);
      }
    }

    return formattedLines.join('\n');
  }

  /**
   * コードの複雑度計算
   */
  private static calculateComplexity(code: string): number {
    let complexity = 1; // 基本複雑度

    // 制御構造による複雑度追加
    const controlPatterns = [
      /\bif\b/g,
      /\belif\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\btry\b/g,
      /\bexcept\b/g
    ];

    for (const pattern of controlPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }
}