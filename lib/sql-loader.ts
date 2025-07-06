import initSqlJs, { Database } from 'sql.js';

let sqlJsInstance: Database | null = null;
let sqlJsPromise: Promise<Database> | null = null;

export interface SqlLoadingState {
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export async function initializeSqlJs(): Promise<Database> {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('SQL.js can only be loaded on the client side');
  }

  if (sqlJsInstance) {
    return sqlJsInstance;
  }

  if (sqlJsPromise) {
    return sqlJsPromise;
  }

  sqlJsPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => {
          // Use CDN for WASM files
          return `https://sql.js.org/dist/${file}`;
        }
      });

      // Create a new database instance
      const db = new SQL.Database();
      sqlJsInstance = db;
      return db;
    } catch (error) {
      sqlJsPromise = null;
      throw new Error(`Failed to initialize SQL.js: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  })();

  return sqlJsPromise;
}

export function getSqlJsInstance(): Database | null {
  return sqlJsInstance;
}

export function resetSqlJsInstance(): void {
  if (sqlJsInstance) {
    sqlJsInstance.close();
  }
  sqlJsInstance = null;
  sqlJsPromise = null;
}

export function createNewDatabase(): Database | null {
  // This function creates a new database instance without affecting the global one
  // Useful for creating isolated databases
  if (typeof window === 'undefined') {
    return null;
  }

  // Note: This would require SQL constructor to be available
  // For now, we'll use the global instance
  return sqlJsInstance;
}