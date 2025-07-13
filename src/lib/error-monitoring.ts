// Error monitoring and reporting utilities for production
export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
  userId?: string;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceMetrics {
  initTime: number;
  executionTime: number;
  memoryUsage?: number;
  timestamp: number;
}

class ErrorMonitor {
  private isProduction = process.env.NODE_ENV === 'production';
  private errorBuffer: ErrorReport[] = [];
  private performanceBuffer: PerformanceMetrics[] = [];
  private maxBufferSize = 100;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  private setupGlobalErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        severity: 'high',
        context: {
          line: event.lineno,
          column: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        severity: 'critical',
        context: {
          type: 'unhandledrejection',
          reason: event.reason,
        },
      });
    });

    // Performance observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.capturePerformance({
                initTime: entry.duration,
                executionTime: entry.duration,
                timestamp: entry.startTime,
              });
            }
          }
        });
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  captureError(error: Omit<ErrorReport, 'timestamp' | 'userAgent' | 'url'> & Partial<Pick<ErrorReport, 'timestamp' | 'userAgent' | 'url'>>) {
    const errorReport: ErrorReport = {
      ...error,
      timestamp: error.timestamp || Date.now(),
      userAgent: error.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'),
      url: error.url || (typeof window !== 'undefined' ? window.location.href : 'unknown'),
    };

    this.errorBuffer.push(errorReport);

    // Log in development
    if (!this.isProduction) {
      console.error('Error captured:', errorReport);
    }

    // Maintain buffer size
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift();
    }

    // Send critical errors immediately
    if (error.severity === 'critical') {
      this.sendErrorReport(errorReport);
    }
  }

  capturePerformance(metrics: PerformanceMetrics) {
    this.performanceBuffer.push(metrics);

    if (!this.isProduction) {
      console.log('Performance metrics:', metrics);
    }

    // Maintain buffer size
    if (this.performanceBuffer.length > this.maxBufferSize) {
      this.performanceBuffer.shift();
    }
  }

  // Capture specific errors for Pyodide and SQL.js
  capturePyodideError(error: Error, context?: Record<string, unknown>) {
    this.captureError({
      message: `Pyodide Error: ${error.message}`,
      stack: error.stack,
      severity: 'high',
      context: {
        ...context,
        component: 'pyodide',
      },
    });
  }

  captureSqlError(error: Error, context?: Record<string, unknown>) {
    this.captureError({
      message: `SQL.js Error: ${error.message}`,
      stack: error.stack,
      severity: 'medium',
      context: {
        ...context,
        component: 'sql.js',
      },
    });
  }

  captureExecutionTimeout(component: 'pyodide' | 'sql', timeout: number) {
    this.captureError({
      message: `${component} execution timeout after ${timeout}ms`,
      severity: 'medium',
      context: {
        component,
        timeout,
        type: 'timeout',
      },
    });
  }

  private async sendErrorReport(error: ErrorReport) {
    if (!this.isProduction) {
      return;
    }

    try {
      // In a real application, you would send this to your error tracking service
      // For now, we'll just use a simple beacon or fetch request
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/errors', JSON.stringify(error));
      } else {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error),
          keepalive: true,
        }).catch(() => {
          // Silently fail to avoid infinite error loops
        });
      }
    } catch {
      // Silently fail to avoid infinite error loops
    }
  }

  // Get error statistics for debugging
  getErrorStats() {
    const severityCount = this.errorBuffer.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorBuffer.length,
      severityBreakdown: severityCount,
      recentErrors: this.errorBuffer.slice(-5),
    };
  }

  // Get performance statistics
  getPerformanceStats() {
    if (this.performanceBuffer.length === 0) {
      return null;
    }

    const initTimes = this.performanceBuffer.map(m => m.initTime);
    const executionTimes = this.performanceBuffer.map(m => m.executionTime);

    return {
      averageInitTime: initTimes.reduce((a, b) => a + b, 0) / initTimes.length,
      averageExecutionTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
      maxInitTime: Math.max(...initTimes),
      maxExecutionTime: Math.max(...executionTimes),
      totalMeasurements: this.performanceBuffer.length,
    };
  }

  // Flush all buffered errors (useful for page unload)
  flush() {
    if (this.errorBuffer.length > 0) {
      this.errorBuffer.forEach(error => this.sendErrorReport(error));
      this.errorBuffer = [];
    }
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();

// Utility functions for easier usage
export const captureError = (error: Error, context?: Record<string, unknown>, severity: ErrorReport['severity'] = 'medium') => {
  errorMonitor.captureError({
    message: error.message,
    stack: error.stack,
    severity,
    context,
  });
};

export const capturePerformance = (metrics: PerformanceMetrics) => {
  errorMonitor.capturePerformance(metrics);
};

// Setup page unload handler to flush errors
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    errorMonitor.flush();
  });
}