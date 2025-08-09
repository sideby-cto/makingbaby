
import { useCallback } from 'react';
import { logger, type LogLevel } from '@/lib/logger';

interface UseLoggerReturn {
  log: (level: LogLevel, message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
  devOnly: (callback: () => void) => void;
}

export const useLogger = (component?: string): UseLoggerReturn => {
  const createLogMethod = useCallback((level: LogLevel) => {
    return (message: string, ...args: any[]) => {
      const prefixedMessage = component ? `[${component}] ${message}` : message;
      logger[level](prefixedMessage, ...args);
    };
  }, [component]);

  const log = useCallback((level: LogLevel, message: string, ...args: any[]) => {
    const prefixedMessage = component ? `[${component}] ${message}` : message;
    logger.log(level, prefixedMessage, ...args);
  }, [component]);

  const devOnly = useCallback((callback: () => void) => {
    logger.devOnly(callback);
  }, []);

  return {
    log,
    error: createLogMethod('error'),
    warn: createLogMethod('warn'),
    info: createLogMethod('info'),
    debug: createLogMethod('debug'),
    devOnly
  };
};

// Convenience hook for component-specific logging
export const useComponentLogger = (componentName: string) => {
  return useLogger(componentName);
};
