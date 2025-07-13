/**
 * ASTからPythonコードを生成する生成器
 * 擬似言語AST → 実行可能なPythonコード
 */

import { PseudoAST, Statement, Expression, VariableDeclaration, Assignment, IfStatement, ForStatement, WhileStatement, ProcedureDeclaration, ReturnStatement, ExpressionStatement } from './syntax-parser';

export interface GenerationOptions {
  indentSize?: number;
  includeComments?: boolean;
  includeTypeHints?: boolean;
  optimizeCode?: boolean;
}

export interface GenerationResult {
  code: string;
  imports: string[];
  functions: string[];
  variables: string[];
  complexity: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  line: number;
  message: string;
  type: 'syntax' | 'semantic' | 'runtime';
}

export interface ValidationWarning {
  line: number;
  message: string;
  type: 'style' | 'performance' | 'best_practice';
}

export class PythonGenerator {
  private static indentLevel = 0;
  private static options: GenerationOptions = {};

  /**
   * ASTからPythonコードを生成
   */
  static generate(
    ast: PseudoAST, 
    options: GenerationOptions = {}
  ): GenerationResult {
    this.options = {
      indentSize: 4,
      includeComments: false,
      includeTypeHints: false,
      optimizeCode: false,
      ...options
    };

    this.indentLevel = 0;
    const lines: string[] = [];
    const imports: string[] = [];
    const functions: string[] = [];
    const variables: string[] = [];

    // コード生成のヘッダーコメント
    if (this.options.includeComments) {
      lines.push('# Generated from IPA pseudo code');
      lines.push('# Auto-converted by PseudoCodeConverter');
      lines.push('');
    }

    // 各文を処理
    for (const statement of ast.body) {
      try {
        const generatedLines = this.generateStatement(statement);
        if (generatedLines.length > 0) {
          lines.push(...generatedLines);
        }

        // メタデータ収集
        this.collectMetadata(statement, functions, variables);
      } catch (error) {
        if (this.options.includeComments) {
          lines.push(`# ERROR: Could not generate code for statement at line ${statement.line}`);
          lines.push(`# ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        console.warn('Code generation error:', error);
      }
    }

    const code = lines.join('\n');
    const optimizedCode = this.options.optimizeCode ? this.optimize(code) : code;

    return {
      code: optimizedCode,
      imports,
      functions,
      variables,
      complexity: ast.metadata.complexity
    };
  }

  /**
   * コードの最適化
   */
  static optimize(code: string): string {
    let optimized = code;

    // 空行の整理
    optimized = optimized.replace(/\n\s*\n\s*\n/g, '\n\n');

    // 不要なスペースの除去
    optimized = optimized.replace(/[ \t]+$/gm, '');

    // 連続する同じ変数初期化の最適化
    optimized = optimized.replace(/(\w+)\s*=\s*0\n(\s*)\1\s*=\s*0/g, '$2$1 = 0');

    return optimized;
  }

  /**
   * コードの妥当性検証
   */
  static validatePython(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // 基本的な構文チェック
      if (line.trim().endsWith(':') && !line.match(/^\s*(if|elif|else|for|while|def|class|try|except|finally|with).*:$/)) {
        warnings.push({
          line: lineNumber,
          message: 'Unexpected colon in statement',
          type: 'syntax'
        });
      }

      // インデントチェック
      if (line.length > 0 && !line.startsWith(' ') && !line.startsWith('\t') && i > 0) {
        const prevLine = lines[i - 1];
        if (prevLine.trim().endsWith(':')) {
          errors.push({
            line: lineNumber,
            message: 'Expected indented block',
            type: 'syntax'
          });
        }
      }

      // 変数名チェック
      const varMatch = line.match(/(\w+)\s*=/);
      if (varMatch && varMatch[1].match(/^\d/)) {
        errors.push({
          line: lineNumber,
          message: `Invalid variable name: ${varMatch[1]}`,
          type: 'syntax'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 文の生成
   */
  private static generateStatement(statement: Statement): string[] {
    switch (statement.type) {
      case 'VariableDeclaration':
        return this.generateVariableDeclaration(statement);
      case 'Assignment':
        return this.generateAssignment(statement);
      case 'IfStatement':
        return this.generateIfStatement(statement);
      case 'ForStatement':
        return this.generateForStatement(statement);
      case 'WhileStatement':
        return this.generateWhileStatement(statement);
      case 'ProcedureDeclaration':
        return this.generateProcedureDeclaration(statement);
      case 'ReturnStatement':
        return this.generateReturnStatement(statement);
      case 'ExpressionStatement':
        return this.generateExpressionStatement(statement);
      default:
        return [];
    }
  }

  /**
   * 変数宣言の生成
   */
  private static generateVariableDeclaration(statement: VariableDeclaration): string[] {
    const indent = this.getIndent();
    
    switch (statement.dataType) {
      case 'integer':
        return [`${indent}${statement.name} = 0`];
      case 'string':
        return [`${indent}${statement.name} = ""`];
      case 'array':
        const size = statement.size || 10;
        return [`${indent}${statement.name} = [0] * ${size}`];
      default:
        return [`${indent}${statement.name} = None`];
    }
  }

  /**
   * 代入文の生成
   */
  private static generateAssignment(statement: Assignment): string[] {
    const indent = this.getIndent();
    const left = this.generateExpression(statement.left);
    const right = this.generateExpression(statement.right);
    return [`${indent}${left} = ${right}`];
  }

  /**
   * If文の生成
   */
  private static generateIfStatement(statement: IfStatement): string[] {
    const indent = this.getIndent();
    const condition = this.generateExpression(statement.condition);
    const lines = [`${indent}if ${condition}:`];
    
    this.indentLevel++;
    for (const stmt of statement.consequent) {
      lines.push(...this.generateStatement(stmt));
    }
    this.indentLevel--;

    if (statement.alternate) {
      lines.push(`${indent}else:`);
      this.indentLevel++;
      for (const stmt of statement.alternate) {
        lines.push(...this.generateStatement(stmt));
      }
      this.indentLevel--;
    }

    return lines;
  }

  /**
   * For文の生成
   */
  private static generateForStatement(statement: ForStatement): string[] {
    const indent = this.getIndent();
    const start = this.generateExpression(statement.start);
    const end = this.generateExpression(statement.end);
    const step = this.generateExpression(statement.step);
    
    // 終了条件の調整（擬似言語は inclusive range）
    const endExpr = this.adjustRangeEnd(end);
    const stepExpr = step === '1' ? '' : `, ${step}`;
    
    const lines = [`${indent}for ${statement.variable} in range(${start}, ${endExpr}${stepExpr}):`];
    
    this.indentLevel++;
    for (const stmt of statement.body) {
      lines.push(...this.generateStatement(stmt));
    }
    this.indentLevel--;

    return lines;
  }

  /**
   * While文の生成
   */
  private static generateWhileStatement(statement: WhileStatement): string[] {
    const indent = this.getIndent();
    const condition = this.generateExpression(statement.condition);
    const lines = [`${indent}while ${condition}:`];
    
    this.indentLevel++;
    for (const stmt of statement.body) {
      lines.push(...this.generateStatement(stmt));
    }
    this.indentLevel--;

    return lines;
  }

  /**
   * 手続き定義の生成
   */
  private static generateProcedureDeclaration(statement: ProcedureDeclaration): string[] {
    const indent = this.getIndent();
    const params = statement.parameters.map(p => p.name).join(', ');
    const typeHints = this.options.includeTypeHints ? this.generateTypeHints(statement.parameters) : '';
    
    const lines = [`${indent}def ${statement.name}(${params})${typeHints}:`];
    
    if (this.options.includeComments) {
      lines.push(`${this.getIndent(1)}"""Generated procedure from pseudo code"""`);
    }

    this.indentLevel++;
    if (statement.body.length === 0) {
      lines.push(`${this.getIndent()}pass`);
    } else {
      for (const stmt of statement.body) {
        lines.push(...this.generateStatement(stmt));
      }
    }
    this.indentLevel--;

    return lines;
  }

  /**
   * Return文の生成
   */
  private static generateReturnStatement(statement: ReturnStatement): string[] {
    const indent = this.getIndent();
    const argument = this.generateExpression(statement.argument);
    return [`${indent}return ${argument}`];
  }

  /**
   * 式文の生成
   */
  private static generateExpressionStatement(statement: ExpressionStatement): string[] {
    const indent = this.getIndent();
    const expr = this.generateExpression(statement.expression);
    
    // 特別な式（else:など）はそのまま出力
    if (expr === 'else:' || expr.endsWith(':')) {
      return [`${indent}${expr}`];
    }
    
    return [`${indent}${expr}`];
  }

  /**
   * 式の生成
   */
  private static generateExpression(expression: Expression): string {
    switch (expression.type) {
      case 'Identifier':
        return expression.name;
      case 'Literal':
        return typeof expression.value === 'string' ? `"${expression.value}"` : String(expression.value);
      case 'BinaryExpression':
        const left = this.generateExpression(expression.left);
        const right = this.generateExpression(expression.right);
        const operator = this.convertOperator(expression.operator);
        return `${left} ${operator} ${right}`;
      case 'ArrayAccess':
        const object = this.generateExpression(expression.object);
        const property = this.generateExpression(expression.property);
        return `${object}[${property}]`;
      case 'FunctionCall':
        const callee = this.generateExpression(expression.callee);
        const args = expression.arguments.map(arg => this.generateExpression(arg)).join(', ');
        return `${callee}(${args})`;
      default:
        return 'None';
    }
  }

  /**
   * 演算子の変換
   */
  private static convertOperator(operator: string): string {
    const operatorMap: { [key: string]: string } = {
      '≠': '!=',
      '≤': '<=',
      '≥': '>=',
      '←': '='
    };
    return operatorMap[operator] || operator;
  }

  /**
   * Range終了値の調整
   */
  private static adjustRangeEnd(end: string): string {
    // n-1 のような表現の場合はそのまま、数値の場合は+1
    if (end.includes('-') || end.includes('+') || isNaN(Number(end))) {
      return end;
    }
    return String(Number(end) + 1);
  }

  /**
   * インデントの生成
   */
  private static getIndent(additionalLevel = 0): string {
    const level = this.indentLevel + additionalLevel;
    return ' '.repeat((this.options.indentSize || 4) * level);
  }

  /**
   * 型ヒントの生成
   */
  private static generateTypeHints(parameters: any[]): string {
    if (!this.options.includeTypeHints || parameters.length === 0) {
      return '';
    }
    // 簡易的な型ヒント実装
    return ' -> None';
  }

  /**
   * メタデータの収集
   */
  private static collectMetadata(statement: Statement, functions: string[], variables: string[]): void {
    switch (statement.type) {
      case 'VariableDeclaration':
        variables.push(statement.name);
        break;
      case 'ProcedureDeclaration':
        functions.push(statement.name);
        break;
    }
  }
}