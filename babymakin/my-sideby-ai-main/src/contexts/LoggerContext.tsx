
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { logger, type LoggerConfig } from '@/lib/logger';

interface LoggerContextType {
  config: Partial<LoggerConfig>;
  updateConfig: (newConfig: Partial<LoggerConfig>) => void;
  enableDebugMode: () => void;
  disableDebugMode: () => void;
  isDebugMode: boolean;
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

interface LoggerProviderProps {
  children: ReactNode;
  initialConfig?: Partial<LoggerConfig>;
}

export const LoggerProvider = ({ children, initialConfig }: LoggerProviderProps) => {
  const [config, setConfig] = useState<Partial<LoggerConfig>>(initialConfig || {});
  const [isDebugMode, setIsDebugMode] = useState(false);

  const updateConfig = useCallback((newConfig: Partial<LoggerConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      logger.updateConfig(updated);
      return updated;
    });
  }, []);

  const enableDebugMode = useCallback(() => {
    setIsDebugMode(true);
    updateConfig({
      enabledLevels: ['error', 'warn', 'info', 'debug'],
      enableConsoleLogging: true
    });
  }, [updateConfig]);

  const disableDebugMode = useCallback(() => {
    setIsDebugMode(false);
    const isDevelopment = import.meta.env.DEV;
    updateConfig({
      enabledLevels: isDevelopment ? ['error', 'warn', 'info'] : ['error', 'warn'],
      enableConsoleLogging: true
    });
  }, [updateConfig]);

  const value: LoggerContextType = {
    config,
    updateConfig,
    enableDebugMode,
    disableDebugMode,
    isDebugMode
  };

  return (
    <LoggerContext.Provider value={value}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLoggerContext = (): LoggerContextType => {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error('useLoggerContext must be used within a LoggerProvider');
  }
  return context;
};
