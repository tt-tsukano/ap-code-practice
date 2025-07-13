/**
 * 擬似言語の構文解析器
 * IPA応用情報技術者試験の擬似言語をASTに変換
 */

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
  | ExpressionStatement
  | ReturnStatement;

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

export interface WhileStatement {
  type: 'WhileStatement';
  condition: Expression;
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

export interface ExpressionStatement {
  type: 'ExpressionStatement';
  expression: Expression;
  line: number;
}

export interface ReturnStatement {
  type: 'ReturnStatement';
  argument: Expression;
  line: number;
}

export type Expression = 
  | Identifier
  | Literal
  | BinaryExpression
  | ArrayAccess
  | FunctionCall;

export interface Identifier {
  type: 'Identifier';
  name: string;
}

export interface Literal {
  type: 'Literal';
  value: string | number;
  raw: string;
}

export interface BinaryExpression {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface ArrayAccess {
  type: 'ArrayAccess';
  object: Expression;
  property: Expression;
}

export interface FunctionCall {
  type: 'FunctionCall';
  callee: Expression;
  arguments: Expression[];
}

export interface Parameter {
  type: string;
  name: string;
}

export interface VariableInfo {
  name: string;
  type: 'integer' | 'string' | 'array';
  size?: number;
  line: number;
}

export interface SyntaxError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export class SyntaxParser {
  private static currentLine = 0;
  private static lines: string[] = [];

  /**
   * 擬似言語をASTに解析
   */
  static parse(pseudoCode: string): PseudoAST {
    this.lines = pseudoCode.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    this.currentLine = 0;

    const body: Statement[] = [];
    const variables: VariableInfo[] = [];
    const procedures: string[] = [];
    let complexity = 0;

    for (let i = 0; i < this.lines.length; i++) {
      this.currentLine = i + 1;
      const line = this.lines[i];
      
      if (!line) continue;

      try {
        const statement = this.parseStatement(line, i + 1);
        if (statement) {
          body.push(statement);

          // メタデータ収集
          if (statement.type === 'VariableDeclaration') {
            variables.push({
              name: statement.name,
              type: statement.dataType,
              size: statement.size,
              line: i + 1
            });
          } else if (statement.type === 'ProcedureDeclaration') {
            procedures.push(statement.name);
            complexity += 2; // 手続き定義は複雑度+2
          } else if (statement.type === 'IfStatement' || statement.type === 'ForStatement' || statement.type === 'WhileStatement') {
            complexity += 1; // 制御構造は複雑度+1
          }
        }
      } catch (error) {
        console.warn(`Parse error at line ${i + 1}: ${line}`, error);
      }
    }

    return {
      type: 'Program',
      body,
      metadata: {
        totalLines: this.lines.length,
        complexity,
        procedures,
        variables
      }
    };
  }

  /**
   * 構文エラーの検出
   */
  static validateSyntax(pseudoCode: string): SyntaxError[] {
    const errors: SyntaxError[] = [];
    const lines = pseudoCode.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 基本的な構文チェック
      if (line.includes('手続き') && !line.includes('(') && !line.includes(')')) {
        errors.push({
          line: i + 1,
          column: 0,
          message: '手続き定義に括弧がありません',
          severity: 'error'
        });
      }

      if (line.includes('もし') && !line.includes('ならば')) {
        errors.push({
          line: i + 1,
          column: 0,
          message: 'if文に"ならば"がありません',
          severity: 'error'
        });
      }

      if (line.includes('を') && line.includes('から') && line.includes('まで') && !line.includes('ずつ増やす')) {
        errors.push({
          line: i + 1,
          column: 0,
          message: 'forループに"ずつ増やす"がありません',
          severity: 'warning'
        });
      }
    }

    return errors;
  }

  /**
   * ASTの可視化（デバッグ用）
   */
  static printAST(ast: PseudoAST): string {
    return JSON.stringify(ast, null, 2);
  }

  /**
   * 単一文の解析
   */
  private static parseStatement(line: string, lineNumber: number): Statement | null {
    // 変数宣言
    if (line.match(/^(整数型|文字列型|整数)：?/)) {
      return this.parseVariableDeclaration(line, lineNumber);
    }

    // 配列宣言
    if (line.match(/^配列：/)) {
      return this.parseArrayDeclaration(line, lineNumber);
    }

    // 手続き定義
    if (line.match(/^手続き\s+/)) {
      return this.parseProcedureDeclaration(line, lineNumber);
    }

    // 制御構造
    if (line.match(/^もし\s+/)) {
      return this.parseIfStatement(line, lineNumber);
    }

    if (line.match(/^そうでなければ/)) {
      return {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'else:', raw: 'else:' },
        line: lineNumber
      };
    }

    if (line.match(/を\s*\d+\s*から\s*.+\s*まで.*ずつ増やす/)) {
      return this.parseForStatement(line, lineNumber);
    }

    if (line.match(/の間，繰り返す$/)) {
      return this.parseWhileStatement(line, lineNumber);
    }

    // 戻り値
    if (line.match(/^戻り値\s+/)) {
      return this.parseReturnStatement(line, lineNumber);
    }

    // 代入文
    if (line.includes('←')) {
      return this.parseAssignment(line, lineNumber);
    }

    // その他の式文
    return {
      type: 'ExpressionStatement',
      expression: { type: 'Literal', value: line, raw: line },
      line: lineNumber
    };
  }

  /**
   * 変数宣言の解析
   */
  private static parseVariableDeclaration(line: string, lineNumber: number): VariableDeclaration {
    let match = line.match(/^整数型：(\w+)/);
    if (match) {
      return {
        type: 'VariableDeclaration',
        dataType: 'integer',
        name: match[1],
        line: lineNumber
      };
    }

    match = line.match(/^文字列型：(\w+)/);
    if (match) {
      return {
        type: 'VariableDeclaration',
        dataType: 'string',
        name: match[1],
        line: lineNumber
      };
    }

    // 複数変数宣言の場合（整数:i, j, temp）
    match = line.match(/^整数:(.+)/);
    if (match) {
      const variables = match[1].split(',').map(v => v.trim());
      // 最初の変数のみ返す（実際の実装では複数の宣言文を生成すべき）
      return {
        type: 'VariableDeclaration',
        dataType: 'integer',
        name: variables[0],
        line: lineNumber
      };
    }

    throw new Error(`Unknown variable declaration: ${line}`);
  }

  /**
   * 配列宣言の解析
   */
  private static parseArrayDeclaration(line: string, lineNumber: number): VariableDeclaration {
    let match = line.match(/^配列：(\w+)\((\d+)\)/);
    if (match) {
      return {
        type: 'VariableDeclaration',
        dataType: 'array',
        name: match[1],
        size: parseInt(match[2]),
        line: lineNumber
      };
    }

    match = line.match(/^配列：(\w+)\(.*?,\s*(\d+)\)/);
    if (match) {
      return {
        type: 'VariableDeclaration',
        dataType: 'array',
        name: match[1],
        size: parseInt(match[2]),
        line: lineNumber
      };
    }

    throw new Error(`Unknown array declaration: ${line}`);
  }

  /**
   * 手続き定義の解析
   */
  private static parseProcedureDeclaration(line: string, lineNumber: number): ProcedureDeclaration {
    const match = line.match(/^手続き\s+(\w+)\((.*?)\)/);
    if (!match) {
      throw new Error(`Invalid procedure declaration: ${line}`);
    }

    const name = match[1];
    const paramString = match[2];
    const parameters: Parameter[] = [];

    if (paramString.trim()) {
      const params = paramString.split(',');
      for (const param of params) {
        const paramMatch = param.trim().match(/([^:]+):(\w+)/);
        if (paramMatch) {
          parameters.push({
            type: paramMatch[1].trim(),
            name: paramMatch[2].trim()
          });
        }
      }
    }

    return {
      type: 'ProcedureDeclaration',
      name,
      parameters,
      body: [], // 実際の実装では後続行を解析して埋める
      line: lineNumber
    };
  }

  /**
   * If文の解析
   */
  private static parseIfStatement(line: string, lineNumber: number): IfStatement {
    const match = line.match(/^もし\s+(.+?)\s+ならば/);
    if (!match) {
      throw new Error(`Invalid if statement: ${line}`);
    }

    return {
      type: 'IfStatement',
      condition: this.parseExpression(match[1]),
      consequent: [],
      line: lineNumber
    };
  }

  /**
   * For文の解析
   */
  private static parseForStatement(line: string, lineNumber: number): ForStatement {
    const match = line.match(/(\w+)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(\d+)\s*ずつ増やす/);
    if (!match) {
      throw new Error(`Invalid for statement: ${line}`);
    }

    return {
      type: 'ForStatement',
      variable: match[1],
      start: this.parseExpression(match[2]),
      end: this.parseExpression(match[3]),
      step: this.parseExpression(match[4]),
      body: [],
      line: lineNumber
    };
  }

  /**
   * While文の解析
   */
  private static parseWhileStatement(line: string, lineNumber: number): WhileStatement {
    const match = line.match(/(.+?)の間，繰り返す/);
    if (!match) {
      throw new Error(`Invalid while statement: ${line}`);
    }

    return {
      type: 'WhileStatement',
      condition: this.parseExpression(match[1]),
      body: [],
      line: lineNumber
    };
  }

  /**
   * Return文の解析
   */
  private static parseReturnStatement(line: string, lineNumber: number): ReturnStatement {
    const match = line.match(/^戻り値\s+(.+)/);
    if (!match) {
      throw new Error(`Invalid return statement: ${line}`);
    }

    return {
      type: 'ReturnStatement',
      argument: this.parseExpression(match[1]),
      line: lineNumber
    };
  }

  /**
   * 代入文の解析
   */
  private static parseAssignment(line: string, lineNumber: number): Assignment {
    const match = line.match(/(.+?)\s*←\s*(.+)/);
    if (!match) {
      throw new Error(`Invalid assignment: ${line}`);
    }

    return {
      type: 'Assignment',
      left: this.parseExpression(match[1]),
      right: this.parseExpression(match[2]),
      line: lineNumber
    };
  }

  /**
   * 式の解析
   */
  private static parseExpression(expr: string): Expression {
    expr = expr.trim();

    // 数値リテラル
    if (/^\d+$/.test(expr)) {
      return {
        type: 'Literal',
        value: parseInt(expr),
        raw: expr
      };
    }

    // 文字列リテラル（簡易）
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return {
        type: 'Literal',
        value: expr.slice(1, -1),
        raw: expr
      };
    }

    // 配列アクセス
    const arrayMatch = expr.match(/(\w+)\[(.+)\]/);
    if (arrayMatch) {
      return {
        type: 'ArrayAccess',
        object: { type: 'Identifier', name: arrayMatch[1] },
        property: this.parseExpression(arrayMatch[2])
      };
    }

    // 二項演算
    const operators = ['≠', '!=', '≤', '<=', '≥', '>=', '<', '>', '==', '+', '-', '*', '/', '%'];
    for (const op of operators) {
      const opIndex = expr.indexOf(op);
      if (opIndex > 0) {
        return {
          type: 'BinaryExpression',
          operator: op,
          left: this.parseExpression(expr.substring(0, opIndex).trim()),
          right: this.parseExpression(expr.substring(opIndex + op.length).trim())
        };
      }
    }

    // 関数呼び出し
    const funcMatch = expr.match(/(\w+)\((.+)\)/);
    if (funcMatch) {
      const args = funcMatch[2] ? funcMatch[2].split(',').map(arg => this.parseExpression(arg.trim())) : [];
      return {
        type: 'FunctionCall',
        callee: { type: 'Identifier', name: funcMatch[1] },
        arguments: args
      };
    }

    // 識別子
    return {
      type: 'Identifier',
      name: expr
    };
  }
}