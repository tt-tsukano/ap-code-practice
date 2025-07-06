// Load pyodide from CDN to avoid build issues
let pyodideInstance: unknown | null = null;
let pyodidePromise: Promise<unknown> | null = null;

export interface PyodideLoadingState {
  isLoading: boolean;
  error: string | null;
  progress: number;
}

// Declare global pyodide type for window
declare global {
  interface Window {
    loadPyodide: (config: PyodideConfig) => Promise<PyodideInterface>;
  }
}

interface PyodideConfig {
  indexURL: string;
  stdout?: (text: string) => void;
  stderr?: (text: string) => void;
}

interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
}

export async function initializePyodide(): Promise<PyodideInterface> {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('Pyodide can only be loaded on the client side');
  }

  if (pyodideInstance) {
    return pyodideInstance as PyodideInterface;
  }

  if (pyodidePromise) {
    return pyodidePromise as Promise<PyodideInterface>;
  }

  pyodidePromise = (async () => {
    // Load pyodide.js script if not already loaded
    if (!window.loadPyodide) {
      await loadPyodideScript();
    }
    
    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/',
      stdout: (text: string) => {
        console.log('[Pyodide stdout]:', text);
      },
      stderr: (text: string) => {
        console.error('[Pyodide stderr]:', text);
      },
    });

    pyodideInstance = pyodide;
    return pyodide;
  })();

  try {
    return await pyodidePromise as PyodideInterface;
  } catch (error) {
    pyodidePromise = null;
    throw error;
  }
}

async function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(script);
  });
}

export function getPyodideInstance(): unknown | null {
  return pyodideInstance;
}

export function resetPyodideInstance(): void {
  pyodideInstance = null;
  pyodidePromise = null;
}