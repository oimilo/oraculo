const LOG_START_TIME = performance.now();

export interface DebugLogger {
  log: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

export function createLogger(namespace: string): DebugLogger {
  return {
    log: (message: string, ...args: unknown[]) => {
      const elapsed = (performance.now() - LOG_START_TIME).toFixed(2);
      console.log(`[${elapsed}ms] [${namespace}] ${message}`, ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      const elapsed = (performance.now() - LOG_START_TIME).toFixed(2);
      console.error(`[${elapsed}ms] [${namespace}] ${message}`, ...args);
    },
  };
}
