import { initializePyodide } from './pyodide-loader';

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface ExecutionContext {
  stdout: string[];
  stderr: string[];
  startTime: number;
}

// Type for Pyodide interface
interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
}

export class CodeExecutor {
  private pyodide: PyodideInterface | null = null;
  private executionTimeout = 30000; // 30 seconds

  async initialize(): Promise<void> {
    if (this.pyodide) {
      return;
    }

    try {
      this.pyodide = await initializePyodide() as PyodideInterface;
    } catch (error) {
      throw new Error(`Failed to initialize Pyodide: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeCode(code: string): Promise<ExecutionResult> {
    if (!this.pyodide) {
      throw new Error('Pyodide is not initialized');
    }

    const context: ExecutionContext = {
      stdout: [],
      stderr: [],
      startTime: Date.now(),
    };

    try {
      const result = await this.executeWithTimeout(code, context);
      return result;
    } catch (error) {
      return {
        success: false,
        output: context.stdout.join('\n'),
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: Date.now() - context.startTime,
      };
    }
  }

  private async executeWithTimeout(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Code execution timed out (30 seconds)'));
      }, this.executionTimeout);

      this.executeCodeInternal(code, context)
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

  private async executeCodeInternal(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    if (!this.pyodide) {
      throw new Error('Pyodide is not initialized');
    }

    // Store original stdout/stderr for potential restoration
    // const originalStdout = this.pyodide.runPython('import sys; sys.stdout.write');
    // const originalStderr = this.pyodide.runPython('import sys; sys.stderr.write');

    try {
      // Set up custom stdout/stderr capture
      this.pyodide.runPython(`
import sys
import io

class CustomStdout:
    def __init__(self):
        self.output = []
    
    def write(self, text):
        self.output.append(text)
        return len(text)
    
    def flush(self):
        pass

class CustomStderr:
    def __init__(self):
        self.output = []
    
    def write(self, text):
        self.output.append(text)
        return len(text)
    
    def flush(self):
        pass

custom_stdout = CustomStdout()
custom_stderr = CustomStderr()
sys.stdout = custom_stdout
sys.stderr = custom_stderr
      `);

      // Execute the user code
      await this.pyodide.runPythonAsync(code);

      // Get the captured output
      const stdout = this.pyodide.runPython('custom_stdout.output') as { toJs: () => string[] };
      const stderr = this.pyodide.runPython('custom_stderr.output') as { toJs: () => string[] };

      // Restore original stdout/stderr
      this.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);

      const executionTime = Date.now() - context.startTime;

      return {
        success: true,
        output: stdout.toJs().join(''),
        error: stderr.toJs().length > 0 ? stderr.toJs().join('') : undefined,
        executionTime,
      };
    } catch (error) {
      // Restore original stdout/stderr in case of error
      try {
        this.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
        `);
      } catch {
        // Ignore restore errors
      }

      throw error;
    }
  }

  isInitialized(): boolean {
    return this.pyodide !== null;
  }

  setExecutionTimeout(timeout: number): void {
    this.executionTimeout = timeout;
  }
}