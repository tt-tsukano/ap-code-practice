import { initializeSqlJs } from './sql-loader';
import { Database, QueryExecResult } from 'sql.js';

export interface QueryResult {
  success: boolean;
  data: unknown[][];
  columns: string[];
  error?: string;
  executionTime: number;
}

export interface SchemaDefinition {
  tableName: string;
  createStatement: string;
  insertStatements: string[];
}

export interface QueryExecutionContext {
  startTime: number;
  database: Database;
}

export class QueryExecutor {
  private database: Database | null = null;
  private executionTimeout = 10000; // 10 seconds for SQL queries

  async initialize(): Promise<void> {
    if (this.database) {
      return;
    }

    try {
      this.database = await initializeSqlJs();
    } catch (error) {
      throw new Error(`Failed to initialize SQL.js: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    if (!this.database) {
      throw new Error('SQL.js is not initialized');
    }

    const context: QueryExecutionContext = {
      startTime: Date.now(),
      database: this.database,
    };

    try {
      const result = await this.executeWithTimeout(sql, context);
      return result;
    } catch (error) {
      return {
        success: false,
        data: [],
        columns: [],
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: Date.now() - context.startTime,
      };
    }
  }

  private async executeWithTimeout(sql: string, context: QueryExecutionContext): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Query execution timed out (10 seconds)'));
      }, this.executionTimeout);

      this.executeQueryInternal(sql, context)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private async executeQueryInternal(sql: string, context: QueryExecutionContext): Promise<QueryResult> {
    const { database, startTime } = context;

    try {
      // Split multiple statements if needed
      const statements = sql.split(';').filter(stmt => stmt.trim());
      let lastResult: QueryExecResult[] = [];

      for (const statement of statements) {
        const trimmedStatement = statement.trim();
        if (!trimmedStatement) continue;

        const results = database.exec(trimmedStatement);
        if (results.length > 0) {
          lastResult = results;
        }
      }

      const executionTime = Date.now() - startTime;

      // If we have results from a SELECT query, return them
      if (lastResult.length > 0) {
        const result = lastResult[0];
        return {
          success: true,
          data: result.values,
          columns: result.columns,
          executionTime,
        };
      }

      // For non-SELECT queries (INSERT, UPDATE, DELETE, CREATE, etc.)
      return {
        success: true,
        data: [],
        columns: [],
        executionTime,
      };
    } catch (error) {
      throw new Error(`SQL execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeSchema(schemas: SchemaDefinition[]): Promise<QueryResult> {
    if (!this.database) {
      throw new Error('SQL.js is not initialized');
    }

    const startTime = Date.now();

    try {
      // Clear existing tables first
      await this.clearAllTables();

      // Execute schema definitions
      for (const schema of schemas) {
        // Create table
        this.database.exec(schema.createStatement);

        // Insert data
        for (const insertStatement of schema.insertStatements) {
          this.database.exec(insertStatement);
        }
      }

      return {
        success: true,
        data: [],
        columns: [],
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        columns: [],
        error: error instanceof Error ? error.message : 'Schema initialization error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  async clearAllTables(): Promise<void> {
    if (!this.database) {
      return;
    }

    try {
      // Get all table names
      const result = this.database.exec(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      if (result.length > 0) {
        const tableNames = result[0].values.map(row => row[0] as string);
        
        // Drop all tables
        for (const tableName of tableNames) {
          this.database.exec(`DROP TABLE IF EXISTS "${tableName}"`);
        }
      }
    } catch (error) {
      console.error('Error clearing tables:', error);
    }
  }

  async getTableInfo(): Promise<{ tables: string[], tableSchemas: Record<string, unknown[]> }> {
    if (!this.database) {
      return { tables: [], tableSchemas: {} };
    }

    try {
      // Get all table names
      const tablesResult = this.database.exec(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      const tables = tablesResult.length > 0 
        ? tablesResult[0].values.map(row => row[0] as string)
        : [];

      // Get schema info for each table
      const tableSchemas: Record<string, unknown[]> = {};
      for (const tableName of tables) {
        const schemaResult = this.database.exec(`PRAGMA table_info("${tableName}")`);
        if (schemaResult.length > 0) {
          tableSchemas[tableName] = schemaResult[0].values.map((row: unknown[]) => ({
            cid: row[0],
            name: row[1],
            type: row[2],
            notnull: row[3],
            dflt_value: row[4],
            pk: row[5],
          }));
        }
      }

      return { tables, tableSchemas };
    } catch (error) {
      console.error('Error getting table info:', error);
      return { tables: [], tableSchemas: {} };
    }
  }

  isInitialized(): boolean {
    return this.database !== null;
  }

  setExecutionTimeout(timeout: number): void {
    this.executionTimeout = timeout;
  }

  closeDatabase(): void {
    if (this.database) {
      this.database.close();
      this.database = null;
    }
  }
}