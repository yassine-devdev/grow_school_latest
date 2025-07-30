/**
 * Test-safe logging utility
 * Prevents console noise during test execution while maintaining logs in development/production
 */

export interface Logger {
  log: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

class TestSafeLogger implements Logger {
  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  private shouldLog(): boolean {
    // Allow logging in test environment only if explicitly enabled
    if (this.isTestEnvironment()) {
      return process.env.ENABLE_TEST_LOGS === 'true';
    }
    return true;
  }

  log(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.log(message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.info(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.warn(message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.error(message, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.debug(message, ...args);
    }
  }
}

// Create singleton logger instance
export const logger = new TestSafeLogger();

// Export individual logging functions for convenience
export const log = logger.log.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const debug = logger.debug.bind(logger);

// Context-specific loggers for different parts of the application
export const createContextLogger = (context: string) => ({
  log: (message: string, ...args: any[]) => logger.log(`[${context}] ${message}`, ...args),
  info: (message: string, ...args: any[]) => logger.info(`[${context}] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(`[${context}] ${message}`, ...args),
  error: (message: string, ...args: any[]) => logger.error(`[${context}] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => logger.debug(`[${context}] ${message}`, ...args),
});

// Pre-configured context loggers for common use cases
export const authLogger = createContextLogger('AUTH');
export const apiLogger = createContextLogger('API');
export const dbLogger = createContextLogger('DB');
export const aiLogger = createContextLogger('AI');
export const conflictLogger = createContextLogger('CONFLICT');
export const enrollmentLogger = createContextLogger('ENROLLMENT');

export default logger;
